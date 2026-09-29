import {
  type ExtractPropTypes,
  type InjectionKey,
  type PropType,
  type Ref,
  type Slots
} from 'vue'

//=====================================================================
//类型定义
//=====================================================================

//树的数据 每一项都可以通过 children 字段嵌套(字段名可以用 props 配置改)
//用索引签名 [key: string]: any 是因为树的数据字段名是不确定的 由使用者决定
export interface TreeNodeData {
  [key: string]: any
}

//字段映射：告诉组件 label/children/disabled/isLeaf 分别在数据的哪个字段上
export interface TreeOptionProps {
  label?: string
  children?: string
  disabled?: string
  isLeaf?: string
}

//节点的唯一标识类型
export type TreeKey = string | number

//内部节点模型：把使用者传进来的普通数据 包装成"有父子关系 有层级"的对象
//为什么要包一层？因为勾选联动(勾父选子、勾子选父)必须知道 谁是我的爸爸 谁是我的儿子
export interface TreeNodeModel {
  key: TreeKey
  data: TreeNodeData
  parent: TreeNodeModel | null
  level: number
  children: TreeNodeModel[]
  disabled: boolean
}

//组件需要的传入的参数
export const treeProps = {
  //树的原始数据
  data: {
    type: Array as PropType<TreeNodeData[]>,
    default: () => []
  },
  //字段映射 不传就用默认的 label/children/disabled/isLeaf
  props: {
    type: Object as PropType<TreeOptionProps>,
    default: () => ({})
  },
  //用数据里的哪个字段当作节点的唯一标识
  nodeKey: {
    type: String,
    default: 'id'
  },
  //没有数据时显示的文字
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  //是否默认展开全部节点
  expandAll: Boolean,
  //默认展开哪些节点(传key数组)
  defaultExpandedKeys: {
    type: Array as PropType<TreeKey[]>,
    default: () => []
  },
  //默认勾选哪些节点(传key数组)
  defaultCheckedKeys: {
    type: Array as PropType<TreeKey[]>,
    default: () => []
  },
  //是否显示复选框
  showCheckbox: Boolean,
  //严格模式：父子勾选不联动 各管各的
  checkStrictly: Boolean,
  //手风琴模式：同一层级同时只能展开一个节点
  accordion: Boolean,
  //节点是否可选中(不可选中就只有展开功能)
  selectable: {
    type: Boolean,
    default: true
  },
  //是否高亮当前选中的节点
  highlightCurrent: Boolean,
  //点击节点文字是否也展开/收起节点
  expandOnClickNode: {
    type: Boolean,
    default: true
  },
  //是否显示连接线
  showLine: Boolean,
  //每一层的缩进距离(px)
  indent: {
    type: Number,
    default: 18
  }
} as const

export type TreeProps = ExtractPropTypes<typeof treeProps>

//=====================================================================
//provide / inject
//=====================================================================

//树把下面这些东西 provide 下去 让每一层的 tree-node 都能拿到
//(递归组件如果靠 props 一层层往下传 会非常麻烦 provide/inject 可以"跨层级"传)
export interface TreeContext {
  props: TreeProps
  slots: Slots
  //key => 节点模型 用来快速查节点(比如根据key找到它的父节点)
  nodeMap: Map<TreeKey, TreeNodeModel>
  //展开的节点key集合
  expandedKeys: Ref<Set<TreeKey>>
  //勾选的节点key集合
  checkedKeys: Ref<Set<TreeKey>>
  //半选(部分子节点被勾选)的节点key集合
  indeterminateKeys: Ref<Set<TreeKey>>
  //当前选中的节点key
  currentKey: Ref<TreeKey | null>
  //下面是几个"从数据里取字段"的工具方法 字段名可能被使用者改过 所以统一走这里
  getKey: (data: TreeNodeData, fallback: string) => TreeKey
  getLabel: (data: TreeNodeData) => string
  getChildren: (data: TreeNodeData) => TreeNodeData[]
  getDisabled: (data: TreeNodeData) => boolean
  isLeaf: (data: TreeNodeData) => boolean
  //下面是各种交互 统一交给树组件处理 子节点只负责"报告发生了什么"
  handleNodeClick: (key: TreeKey, data: TreeNodeData, evt: MouseEvent) => void
  handleNodeContextMenu: (key: TreeKey, data: TreeNodeData, evt: MouseEvent) => void
  handleCheckboxClick: (key: TreeKey) => void
  toggleExpand: (key: TreeKey) => void
}

//用 Symbol 当key 保证唯一 不会和其他组件重名
export const TREE_INJECTION_KEY: InjectionKey<TreeContext> = Symbol('yukiTree')
