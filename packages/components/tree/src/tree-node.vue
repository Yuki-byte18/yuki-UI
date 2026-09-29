<template>
  <div :class="nodeClass" role="treeitem" :aria-expanded="isLeaf ? undefined : expanded">
    <div :class="contentClass" :style="contentStyle" @click="onClick" @contextmenu="onContextMenu">
      <!-- 展开箭头：叶子节点隐藏 展开时旋转90度 -->
      <span :class="expandIconClass" @click.stop="onExpandIconClick">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M320 192l384 320-384 320z" />
        </svg>
      </span>

      <!-- 复选框 -->
      <span v-if="showCheckbox" :class="checkboxClass" @click.stop="onCheckboxClick">
        <span :class="bem.e('checkbox-inner')"></span>
      </span>

      <!-- 节点文字：优先用使用者传的插槽 没传就显示 label 字段 -->
      <span :class="bem.e('label')">
        <LabelRender />
      </span>
    </div>

    <!-- 子节点：递归渲染自己 -->
    <div v-if="!isLeaf" v-show="expanded" :class="bem.e('children')" role="group">
      <yuki-tree-node
        v-for="(child, index) in children"
        :key="context.getKey(child, childPath(index))"
        :data="child"
        :level="level + 1"
        :path="childPath(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type PropType } from 'vue'
import { createNamespace } from '@yuki/utils/create'
import { TREE_INJECTION_KEY, type TreeNodeData } from './tree'

//递归组件：组件自己渲染自己
//好处：不管树有几层 只需要写一次节点模板 剩下的交给递归
//原理：<yuki-tree-node> 这个名字和组件自己的 name(yukiTreeNode)对得上
//      所以 vue 在解析组件名的时候 会直接解析成自己
defineOptions({
  name: 'yukiTreeNode'
})

const bem = createNamespace('tree')

const props = defineProps({
  //这一层节点对应的原始数据
  data: {
    type: Object as PropType<TreeNodeData>,
    required: true
  },
  //层级 从1开始
  level: {
    type: Number,
    default: 1
  },
  //节点在树里的路径 比如 "0-1" 数据里没有id的时候用它当key
  path: {
    type: String,
    default: '0'
  }
})

//注入树组件提供的状态和方法(跨层级传递 不用一层层props往下传)
const context = inject(TREE_INJECTION_KEY)!

//本节点的key
const key = computed(() => context.getKey(props.data, props.path))

const label = computed(() => context.getLabel(props.data))
const children = computed(() => context.getChildren(props.data))
const isLeaf = computed(() => context.isLeaf(props.data))
const disabled = computed(() => context.getDisabled(props.data))
const expanded = computed(() => context.expandedKeys.value.has(key.value))
const checked = computed(() => context.checkedKeys.value.has(key.value))
const indeterminate = computed(() => context.indeterminateKeys.value.has(key.value))
const current = computed(() => context.currentKey.value === key.value)
const showCheckbox = computed(() => context.props.showCheckbox)

//使用者传的 default 插槽 用它来渲染节点文字
//插槽本身就是一个函数 所以这里直接用渲染函数组件的方式调用它
//参数 { node, data } 就是使用者写 <template #default="{ node, data }"> 能拿到的东西
const LabelRender = () => {
  const slot = context.slots.default
  return slot ? slot({ node: props.data, data: props.data }) : label.value
}

//每一层的缩进 = 层级 * 缩进距离 + 基础内边距
const contentStyle = computed(() => ({
  paddingLeft: `${(props.level - 1) * context.props.indent + 6}px`
}))

const nodeClass = computed(() => [
  bem.e('node'),
  bem.is('expanded', expanded.value),
  bem.is('checked', checked.value),
  bem.is('indeterminate', indeterminate.value),
  bem.is('disabled', disabled.value)
])

const contentClass = computed(() => [
  bem.e('node-content'),
  bem.is('current', current.value && context.props.highlightCurrent),
  bem.is('disabled', disabled.value)
])

const expandIconClass = computed(() => [
  bem.e('expand-icon'),
  bem.is('expanded', expanded.value),
  bem.is('leaf', isLeaf.value)
])

const checkboxClass = computed(() => [
  bem.e('checkbox'),
  bem.is('checked', checked.value),
  bem.is('indeterminate', indeterminate.value),
  bem.is('disabled', disabled.value)
])

//子节点的路径：父路径 + "-" + 自己的下标
function childPath(index: number) {
  return `${props.path}-${index}`
}

function onClick(evt: MouseEvent) {
  context.handleNodeClick(key.value, props.data, evt)
}

function onContextMenu(evt: MouseEvent) {
  context.handleNodeContextMenu(key.value, props.data, evt)
}

function onExpandIconClick() {
  if (disabled.value) return
  context.toggleExpand(key.value)
}

function onCheckboxClick() {
  if (disabled.value) return
  context.handleCheckboxClick(key.value)
}
</script>
