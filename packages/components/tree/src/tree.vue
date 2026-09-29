<template>
  <div :class="[bem.b(), bem.is('show-line', showLine)]" role="tree">
    <!-- 没有数据的时候显示空状态 -->
    <div v-if="!data || data.length === 0" :class="bem.e('empty')">
      <slot name="empty">{{ emptyText }}</slot>
    </div>
    <!-- 有数据：把第一层节点循环渲染出来 每层节点再用 tree-node 递归渲染自己的子节点 -->
    <yuki-tree-node
      v-for="(item, index) in data"
      :key="getKey(item, String(index))"
      :data="item"
      :level="1"
      :path="String(index)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, provide, ref, useSlots, watch } from 'vue'
import { createNamespace } from '@yuki/utils/create'
import {
  TREE_INJECTION_KEY,
  treeProps,
  type TreeContext,
  type TreeKey,
  type TreeNodeData,
  type TreeNodeModel
} from './tree'
import YukiTreeNode from './tree-node.vue'

//给组件定义名字
defineOptions({
  name: 'yukiTree'
})

const bem = createNamespace('tree')

const props = defineProps(treeProps)

const slots = useSlots()

const emit = defineEmits([
  'node-click',
  'node-contextmenu',
  'check-change',
  'check',
  'current-change',
  'expand-change'
])

//=====================================================================
//1,从数据里取字段的工具方法
//使用者可以通过 props 属性改字段名(比如把 children 改成 childs)
//所以不能写死 data.children 要统一走这里
//=====================================================================
function getKey(data: TreeNodeData, fallback: string): TreeKey {
  const key = data?.[props.nodeKey]
  //数据里没有 nodeKey 指定的字段时 用它在树里的路径当key(比如 "0-1")
  return key === undefined || key === null ? fallback : key
}

function getLabel(data: TreeNodeData): string {
  const label = data?.[props.props?.label || 'label']
  return label === undefined || label === null ? '' : String(label)
}

function getChildren(data: TreeNodeData): TreeNodeData[] {
  const children = data?.[props.props?.children || 'children']
  return Array.isArray(children) ? children : []
}

function getDisabled(data: TreeNodeData): boolean {
  return Boolean(data?.[props.props?.disabled || 'disabled'])
}

//是不是叶子节点：数据里明确写了就用数据里的 没写就看有没有子节点
function isLeaf(data: TreeNodeData): boolean {
  const field = props.props?.isLeaf
  if (field && data?.[field] !== undefined) return Boolean(data[field])
  return getChildren(data).length === 0
}

//=====================================================================
//2,组件状态
//=====================================================================
//展开/勾选/半选 都用 Set 存key 查找是 O(1) 比数组快
//用 ref 包一层 里面的 Set 就是响应式的 add/delete 会自动触发视图更新
const expandedKeys = ref<Set<TreeKey>>(new Set())
const checkedKeys = ref<Set<TreeKey>>(new Set())
const indeterminateKeys = ref<Set<TreeKey>>(new Set())
const currentKey = ref<TreeKey | null>(null)

//key => 节点模型
//这个不需要响应式(只在事件处理里查节点用 不参与渲染) 所以用普通 Map
const nodeMap = new Map<TreeKey, TreeNodeModel>()

//=====================================================================
//3,把使用者的数据 编译成节点模型树(建立父子关系)
//=====================================================================
function buildNodes(
  list: TreeNodeData[],
  parent: TreeNodeModel | null,
  level: number,
  parentPath: string
): TreeNodeModel[] {
  return list.map((item, index) => {
    //路径规则要和 tree-node 里算key的规则保持一致 否则找不到节点
    const path = parentPath === '' ? String(index) : `${parentPath}-${index}`
    const model: TreeNodeModel = {
      key: getKey(item, path),
      data: item,
      parent,
      level,
      children: [],
      disabled: getDisabled(item)
    }
    nodeMap.set(model.key, model)
    //递归往后建子节点
    model.children = buildNodes(getChildren(item), model, level + 1, path)
    return model
  })
}

function rebuild() {
  nodeMap.clear()
  buildNodes(props.data || [], null, 1, '')
}

//=====================================================================
//4,展开相关
//=====================================================================
function toggleExpand(key: TreeKey) {
  const node = nodeMap.get(key)
  if (!node || node.children.length === 0) return

  const next = new Set(expandedKeys.value)
  const willExpand = !next.has(key)

  if (willExpand) {
    //手风琴模式：展开一个节点前 先把它同一层的兄弟节点收起来
    if (props.accordion && node.parent) {
      node.parent.children.forEach(sibling => {
        if (sibling.key !== key) next.delete(sibling.key)
      })
    }
    next.add(key)
  } else {
    next.delete(key)
  }

  //整体替换 保证是响应式的新Set
  expandedKeys.value = next
  emit('expand-change', node.data, willExpand, node)
}

//展开全部节点(有子节点的)
function expandAllNodes() {
  const next = new Set<TreeKey>()
  nodeMap.forEach(node => {
    if (node.children.length > 0) next.add(node.key)
  })
  expandedKeys.value = next
}

//收起全部节点
function collapseAllNodes() {
  expandedKeys.value = new Set()
}

//传入true展开全部 传入false收起全部
function setExpandAll(flag: boolean) {
  flag ? expandAllNodes() : collapseAllNodes()
}

//=====================================================================
//5,勾选相关
//=====================================================================
function setNodeChecked(key: TreeKey, checked: boolean) {
  if (checked) {
    checkedKeys.value.add(key)
  } else {
    checkedKeys.value.delete(key)
  }
}

//把某个节点(以及它的子孙)勾选状态改掉
//deep=false 表示只改自己(严格模式 或者只改单个节点的时候用)
function applyChecked(node: TreeNodeModel, checked: boolean, deep: boolean) {
  //禁用的节点不允许被勾选
  if (node.disabled) return

  setNodeChecked(node.key, checked)
  indeterminateKeys.value.delete(node.key)

  if (deep) {
    node.children.forEach(child => applyChecked(child, checked, true))
  }
}

//向上联动：子节点的勾选状态变了 祖先节点的状态要跟着重算
//规则：所有子节点都选中 => 父节点选中
//      所有子节点都没选中 => 父节点没选中
//      其他情况 => 父节点半选
function updateAncestors(node: TreeNodeModel) {
  let parent = node.parent
  while (parent) {
    const children = parent.children
    const allChecked = children.every(child => checkedKeys.value.has(child.key))
    const noneChecked = children.every(
      child => !checkedKeys.value.has(child.key) && !indeterminateKeys.value.has(child.key)
    )

    if (allChecked) {
      checkedKeys.value.add(parent.key)
      indeterminateKeys.value.delete(parent.key)
    } else if (noneChecked) {
      checkedKeys.value.delete(parent.key)
      indeterminateKeys.value.delete(parent.key)
    } else {
      checkedKeys.value.delete(parent.key)
      indeterminateKeys.value.add(parent.key)
    }

    parent = parent.parent
  }
}

//批量操作之后 从下往上把所有祖先的状态重算一遍
function recomputeAncestors() {
  const all = [...nodeMap.values()].sort((a, b) => b.level - a.level)
  all.forEach(node => {
    if (node.parent) updateAncestors(node)
  })
}

//点击复选框
function handleCheckboxClick(key: TreeKey) {
  const node = nodeMap.get(key)
  if (!node || node.disabled) return

  const checked = !checkedKeys.value.has(key)

  if (props.checkStrictly) {
    //严格模式：只改自己 不联动
    applyChecked(node, checked, false)
    emit('check-change', node.data, checked, false)
  } else {
    //联动模式：自己 + 子孙一起改 再往上重算祖先
    applyChecked(node, checked, true)
    updateAncestors(node)
    //第三个参数是"是否半选" 点中的这个节点自己不会是半选 所以固定给false
    emit('check-change', node.data, checked, false)
  }

  emitCheck()
}

//把勾选结果整体抛出去 使用者可以拿到选中的节点/半选的节点
function emitCheck() {
  emit('check', getCheckedNodes(), {
    checkedKeys: getCheckedKeys(),
    checkedNodes: getCheckedNodes(),
    halfCheckedKeys: getHalfCheckedKeys(),
    halfCheckedNodes: getHalfCheckedNodes()
  })
}

function getCheckedKeys(leafOnly = false): TreeKey[] {
  const keys = [...checkedKeys.value]
  if (!leafOnly) return keys
  //只要叶子节点
  return keys.filter(key => (nodeMap.get(key)?.children.length ?? 0) === 0)
}

function getCheckedNodes(leafOnly = false): TreeNodeData[] {
  return getCheckedKeys(leafOnly).map(key => nodeMap.get(key)!.data)
}

function getHalfCheckedKeys(): TreeKey[] {
  return [...indeterminateKeys.value]
}

function getHalfCheckedNodes(): TreeNodeData[] {
  return getHalfCheckedKeys().map(key => nodeMap.get(key)!.data)
}

//外部主动设置某几个节点被勾选
function setCheckedKeys(keys: TreeKey[]) {
  checkedKeys.value = new Set()
  indeterminateKeys.value = new Set()
  keys.forEach(key => {
    const node = nodeMap.get(key)
    if (node) applyChecked(node, true, !props.checkStrictly)
  })
  recomputeAncestors()
}

//设置单个节点的勾选状态 deep=true 时子孙也跟着变
function setChecked(key: TreeKey, checked: boolean, deep = true) {
  const node = nodeMap.get(key)
  if (!node) return
  applyChecked(node, checked, deep && !props.checkStrictly)
  updateAncestors(node)
  emitCheck()
}

//=====================================================================
//6,点击/选中相关
//=====================================================================
function handleNodeClick(key: TreeKey, data: TreeNodeData, evt: MouseEvent) {
  const node = nodeMap.get(key)
  if (!node || node.disabled) return

  if (props.selectable) {
    if (currentKey.value !== key) {
      currentKey.value = key
      emit('current-change', data, node)
    }
    //点击节点文字顺便展开/收起
    if (props.expandOnClickNode && node.children.length > 0) toggleExpand(key)
  }

  emit('node-click', data, node, evt)
}

function handleNodeContextMenu(key: TreeKey, data: TreeNodeData, evt: MouseEvent) {
  const node = nodeMap.get(key)
  if (!node) return
  emit('node-contextmenu', evt, data, node)
}

function getCurrentKey(): TreeKey | null {
  return currentKey.value
}

function getCurrentNode(): TreeNodeData | null {
  const key = currentKey.value
  return key === null ? null : nodeMap.get(key)?.data ?? null
}

function setCurrentKey(key: TreeKey | null) {
  currentKey.value = key
}

function setCurrentNode(data: TreeNodeData) {
  const key = getKey(data, '')
  currentKey.value = nodeMap.has(key) ? key : null
}

//根据key拿到节点模型(里面能拿到父节点/子节点/层级)
function getNode(key: TreeKey): TreeNodeModel | undefined {
  return nodeMap.get(key)
}

//=====================================================================
//7,初始化
//=====================================================================
function initState() {
  rebuild()

  //展开状态
  expandedKeys.value = new Set()
  if (props.expandAll) {
    expandAllNodes()
  } else {
    props.defaultExpandedKeys.forEach(key => expandedKeys.value.add(key))
  }

  //勾选状态
  checkedKeys.value = new Set()
  indeterminateKeys.value = new Set()
  props.defaultCheckedKeys.forEach(key => {
    const node = nodeMap.get(key)
    if (node) applyChecked(node, true, !props.checkStrictly)
  })
  recomputeAncestors()
}

onMounted(initState)

//数据变了 重新编译节点模型(已经展开/勾选的状态保留)
watch(
  () => props.data,
  () => rebuild(),
  { deep: true }
)

//expandAll 属性被外部改成 true/false 时 跟着全部展开/收起
watch(
  () => props.expandAll,
  flag => setExpandAll(Boolean(flag))
)

//=====================================================================
//8,provide：把状态和交互方法交给每一层的 tree-node
//=====================================================================
const context: TreeContext = {
  props,
  slots,
  nodeMap,
  expandedKeys,
  checkedKeys,
  indeterminateKeys,
  currentKey,
  getKey,
  getLabel,
  getChildren,
  getDisabled,
  isLeaf,
  handleNodeClick,
  handleNodeContextMenu,
  handleCheckboxClick,
  toggleExpand
}

provide(TREE_INJECTION_KEY, context)

//把方法暴露出去 使用者通过 ref 拿到组件实例就能调用
//eg: treeRef.value.getCheckedKeys()
defineExpose({
  getCheckedKeys,
  getCheckedNodes,
  getHalfCheckedKeys,
  getHalfCheckedNodes,
  setCheckedKeys,
  setChecked,
  getCurrentKey,
  getCurrentNode,
  setCurrentKey,
  setCurrentNode,
  getNode,
  expandAllNodes,
  collapseAllNodes,
  setExpandAll
})
</script>
