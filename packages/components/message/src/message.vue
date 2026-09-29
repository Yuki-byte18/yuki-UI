<template>
  <transition name="yuki-message-fade" @after-leave="handleAfterLeave">
    <div
      v-show="visible"
      ref="rootRef"
      :class="classes"
      :style="style"
      role="alert"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <!-- 类型图标：直接用渲染函数画svg 不用依赖图标库 -->
      <TypeIcon />

      <span :class="bem.e('content')">
        <slot>
          <span v-if="dangerouslyUseHTMLString" v-html="message"></span>
          <template v-else>{{ message }}</template>
        </slot>
      </span>

      <!-- 分组模式下显示重复次数 -->
      <span v-if="repeatNum > 1" :class="bem.e('badge')">{{ repeatNum }}</span>

      <!-- 关闭按钮 -->
      <svg
        v-if="showClose"
        :class="bem.e('close')"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        @click="close"
      >
        <path
          fill="currentColor"
          d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.224 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"
        />
      </svg>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref, watch } from 'vue'
import { createNamespace } from '@yuki/utils/create'
import { messageProps, type MessageType } from './message'

defineOptions({
  name: 'yukiMessage'
})

const bem = createNamespace('message')

const props = defineProps(messageProps)

const emit = defineEmits(['destroy'])

//四种类型的图标路径(都是从element-plus那套图标里来的 形状稳定好看)
//info 是"圆圈里一个i" 所以是两个path叠起来
interface IconPath {
  d: string
  evenodd?: boolean
}

const ICON_PATHS: Record<MessageType, IconPath[]> = {
  success: [
    {
      d: 'M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336L456.192 600.384z'
    }
  ],
  warning: [
    {
      d: 'M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 192a58.432 58.432 0 0 0-58.24 63.744l23.36 256.384a35.072 35.072 0 0 0 69.76 0l23.296-256.384A58.432 58.432 0 0 0 512 256zm0 512a51.2 51.2 0 1 0 0-102.4 51.2 51.2 0 0 0 0 102.4z'
    }
  ],
  error: [
    {
      d: 'M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336L512 457.664z'
    }
  ],
  info: [
    {
      d: 'M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 64a384 384 0 1 0 0 768 384 384 0 0 0 0-768z',
      evenodd: true
    },
    {
      d: 'M544 416v256h-64V416h64zM512 288a48 48 0 1 1 0 96 48 48 0 0 1 0-96z'
    }
  ]
}

//用渲染函数组件的方式画图标(比在模板里写一堆svg分支清爽)
const TypeIcon = () => {
  const paths = ICON_PATHS[props.type] || ICON_PATHS.info
  return h(
    'svg',
    {
      viewBox: '0 0 1024 1024',
      xmlns: 'http://www.w3.org/2000/svg',
      class: bem.e('icon')
    },
    paths.map(path =>
      h('path', {
        d: path.d,
        fill: 'currentColor',
        'fill-rule': path.evenodd ? 'evenodd' : undefined
      })
    )
  )
}

//=====================================================================
//状态
//=====================================================================
const rootRef = ref<HTMLElement>()
//控制显示隐藏(配合 transition 做淡入淡出)
const visible = ref(false)
//距离顶部的距离 由 method.ts 里的"堆叠算法"动态设置
const topOffset = ref(props.offset)
//重复次数(分组模式)
const repeatNum = ref(props.repeatNum)
//自动关闭的定时器
let timer: ReturnType<typeof setTimeout> | undefined
//防止 onClose 被调用两次
let closed = false

const classes = computed(() => [
  bem.b(),
  bem.m(props.type),
  bem.is('center', props.center),
  bem.is('plain', props.plain),
  bem.is('closable', props.showClose)
])

const style = computed(() => ({
  top: `${topOffset.value}px`,
  zIndex: props.zIndex
}))

//=====================================================================
//自动关闭的定时器
//=====================================================================
function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = undefined
  }
}

function startTimer() {
  clearTimer()
  //duration <= 0 表示不自动关闭
  if (props.duration <= 0 || !visible.value) return
  timer = setTimeout(() => close(), props.duration)
}

//=====================================================================
//关闭
//=====================================================================
function close() {
  if (!closed) {
    closed = true
    props.onClose?.()
  }
  visible.value = false
}

//过渡动画播完 dom 已经要移除了 通知外面(method.ts)去卸载组件
function handleAfterLeave() {
  emit('destroy')
}

onMounted(() => {
  //挂载后再显示 这样才有淡入动画
  visible.value = true
  startTimer()
})

onUnmounted(clearTimer)

//外部(比如使用者直接写 <yuki-message>)改了 offset / repeatNum 也跟着变
watch(
  () => props.offset,
  val => (topOffset.value = val)
)

watch(
  () => props.repeatNum,
  val => (repeatNum.value = val)
)

//暴露给 method.ts 用的内部方法
defineExpose({
  close,
  //设置距离顶部的距离
  setTop: (top: number) => (topOffset.value = top),
  //重新计时(分组模式下 又来了一条一样的消息 时间要重新算)
  resetTimer: () => startTimer(),
  //重复次数 +1
  incRepeatNum: () => (repeatNum.value += 1),
  //拿到根元素 用来测量高度 计算堆叠位置
  getEl: () => rootRef.value,
  visible
})
</script>
