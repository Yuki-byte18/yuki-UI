<template>
  <div
    ref="containerRef"
    :class="bem.b()"
    :style="containerStyle"
    @scroll="handleScroll"
  >
    <!-- 没有数据 -->
    <div v-if="!data || data.length === 0" :class="bem.e('empty')">
      <slot name="empty">{{ emptyText }}</slot>
    </div>

    <template v-else>
      <!-- 撑开滚动条的"影子"元素：它的高度 = 所有数据的总高度 -->
      <div :class="bem.e('phantom')" :style="phantomStyle">
        <!-- 真正渲染出来的那几条：整体往上平移 让它落在正确的滚动位置上 -->
        <div ref="contentRef" :class="bem.e('content')" :style="contentStyle">
          <div
            v-for="item in visibleItems"
            :key="item.key"
            :ref="el => setItemRef(el)"
            :class="bem.e('item')"
            :data-index="item.index"
            :style="itemStyle"
          >
            <slot :item="item.data" :index="item.index">{{ item.data }}</slot>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance
} from 'vue'
import { createNamespace } from '@yuki-byte/utils/create'
import {
  virtualListProps,
  type VirtualListItem,
  type VirtualVisibleItem
} from './virtual-list'

defineOptions({
  name: 'yukiVirtualList'
})

const bem = createNamespace('virtual-list')

const props = defineProps(virtualListProps)

const emit = defineEmits(['scroll', 'reach-bottom'])

//=====================================================================
//核心思路(虚拟列表为什么快)：
//1,数据有一万条 但屏幕就那么大 只渲染看得见的那十几条
//2,用一个"影子元素"占位 高度等于所有数据的总高度 滚动条才是对的
//3,渲染出来的那几条 用一个 transform 平移到当前滚动的位置
//=====================================================================

const containerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()

//当前滚动位置
const scrollTop = ref(0)
//容器实际高度(挂载后量出来的)
const containerHeight = ref(0)
//动态高度模式下 每一项实测出来的高度
const heights = ref<number[]>([])

//=====================================================================
//位置计算
//=====================================================================

//第 index 项的高度
function getHeight(index: number): number {
  if (!props.estimated) return props.itemHeight
  const measured = heights.value[index]
  return measured && measured > 0 ? measured : props.itemHeight
}

//前缀和：positions[i] = 第 i 项的顶部偏移量
//动态高度模式下 高度变了 这里会自动重算
const positions = computed<number[]>(() => {
  const list = props.data || []
  const result: number[] = new Array(list.length)
  let acc = 0
  for (let i = 0; i < list.length; i++) {
    result[i] = acc
    acc += getHeight(i)
  }
  return result
})

//所有数据的总高度 = 影子元素的高度
const totalHeight = computed(() => {
  const list = props.data || []
  if (list.length === 0) return 0
  const last = list.length - 1
  return positions.value[last] + getHeight(last)
})

//可见区域的起始下标：用二分查找(比从头遍历快得多)
const startIndex = computed(() => {
  const pos = positions.value
  if (pos.length === 0) return 0

  let low = 0
  let high = pos.length - 1
  let found = 0

  while (low <= high) {
    const mid = (low + high) >> 1
    if (pos[mid] <= scrollTop.value) {
      found = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  //往上多渲染 buffer 条
  return Math.max(0, found - props.buffer)
})

//可见区域的结束下标
const endIndex = computed(() => {
  const list = props.data || []
  if (list.length === 0) return -1

  const pos = positions.value
  const bottom = scrollTop.value + containerHeight.value
  const max = list.length - 1

  let index = startIndex.value
  while (index < max && pos[index] < bottom) index++

  //往下多渲染 buffer 条
  return Math.min(max, index + props.buffer)
})

//真正要渲染的那几条
const visibleItems = computed<VirtualVisibleItem[]>(() => {
  const list = props.data || []
  const items: VirtualVisibleItem[] = []
  for (let i = startIndex.value; i <= endIndex.value; i++) {
    if (i < 0 || i >= list.length) break
    items.push({
      index: i,
      data: list[i],
      key: getItemKey(list[i], i)
    })
  }
  return items
})

//取key：可以用字段名 也可以用函数 都没有就用下标
function getItemKey(item: VirtualListItem, index: number): string | number {
  const key = props.itemKey
  if (typeof key === 'function') return key(item, index)
  if (typeof key === 'string' && key) return item?.[key] ?? index
  return index
}

//=====================================================================
//样式
//=====================================================================
const containerStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

const phantomStyle = computed(() => ({ height: `${totalHeight.value}px` }))

const contentStyle = computed(() => ({
  //整体平移到第一条可见数据的顶部
  transform: `translateY(${positions.value[startIndex.value] ?? 0}px)`
}))

const itemStyle = computed(() =>
  props.estimated ? {} : { height: `${props.itemHeight}px` }
)

//=====================================================================
//动态高度模式：测量每一项的真实高度
//=====================================================================
let resizeObserver: ResizeObserver | null = null

function setItemRef(el: Element | ComponentPublicInstance | null) {
  if (!props.estimated || !resizeObserver) return
  if (el instanceof HTMLElement) resizeObserver.observe(el)
}

//每次渲染完之后 重新观察当前渲染出来的那几条
//(先 disconnect 再 observe 免得观察已经销毁的dom 造成内存泄漏)
async function observeItems() {
  if (!props.estimated || !resizeObserver) return
  await nextTick()
  resizeObserver.disconnect()
  const nodes = contentRef.value?.children
  if (!nodes) return
  Array.from(nodes).forEach(node => resizeObserver!.observe(node as HTMLElement))
}

function createResizeObserver() {
  if (typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(entries => {
    let changed = false
    entries.forEach(entry => {
      const el = entry.target as HTMLElement
      const index = Number(el.dataset.index)
      if (Number.isNaN(index)) return

      const height = el.offsetHeight
      //只记录真的变了的高度(容差0.5px) 免得反复触发导致死循环
      if (height > 0 && Math.abs(getHeight(index) - height) > 0.5) {
        heights.value[index] = height
        changed = true
      }
    })
    //高度变了 位置自然会重算(positions是computed) 这里不用做别的
    if (changed) {
      //位置变了以后 可见范围可能也变了 再观察一次新渲染出来的项
      observeItems()
    }
  })
}

//=====================================================================
//滚动
//=====================================================================
function handleScroll() {
  const el = containerRef.value
  if (!el) return

  scrollTop.value = el.scrollTop
  emit('scroll', { scrollTop: el.scrollTop, scrollLeft: el.scrollLeft })

  //触底判断：用来做上拉加载更多
  const distance = el.scrollHeight - el.clientHeight - el.scrollTop
  if (distance <= props.bottomThreshold) {
    emit('reach-bottom')
  }
}

//滚到指定偏移量
function scrollToOffset(offset: number, smooth = false) {
  containerRef.value?.scrollTo({
    top: offset,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

//滚到某一条：
//align 决定这一条出现在顶部(start) / 中间(center) / 底部(end)
function scrollToIndex(index: number, align: 'start' | 'center' | 'end' = 'start') {
  const list = props.data || []
  if (list.length === 0) return

  const target = Math.max(0, Math.min(index, list.length - 1))
  let top = positions.value[target] ?? 0

  if (align === 'center') {
    top -= (containerHeight.value - getHeight(target)) / 2
  } else if (align === 'end') {
    top -= containerHeight.value - getHeight(target)
  }

  scrollToOffset(Math.max(0, top))
}

function scrollToTop() {
  scrollToOffset(0)
}

function scrollToBottom() {
  scrollToOffset(totalHeight.value)
}

//拿到当前滚动距离
function getOffset() {
  return scrollTop.value
}

//拿到总高度
function getTotalHeight() {
  return totalHeight.value
}

//手动触发一次重新测量(比如项里的图片加载完了 高度变了)
function update() {
  observeItems()
}

//=====================================================================
//生命周期
//=====================================================================
let containerResizeObserver: ResizeObserver | null = null

onMounted(() => {
  const el = containerRef.value
  if (el) containerHeight.value = el.clientHeight

  createResizeObserver()
  observeItems()

  //容器尺寸变了(比如窗口缩放) 可见数量要跟着变
  if (typeof ResizeObserver !== 'undefined' && el) {
    containerResizeObserver = new ResizeObserver(() => {
      containerHeight.value = el.clientHeight
      observeItems()
    })
    containerResizeObserver.observe(el)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  containerResizeObserver?.disconnect()
  containerResizeObserver = null
})

//可见项变了 重新观察新渲染出来的项
watch(visibleItems, () => {
  observeItems()
})

//数据变了 清掉旧的高度记录
watch(
  () => props.data,
  () => {
    if (props.estimated) heights.value = []
    observeItems()
  }
)

//动态高度模式下 切换回固定高度要清掉测量记录
watch(
  () => props.estimated,
  val => {
    if (!val) heights.value = []
    else observeItems()
  }
)

defineExpose({
  scrollToOffset,
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  getOffset,
  getTotalHeight,
  update
})
</script>
