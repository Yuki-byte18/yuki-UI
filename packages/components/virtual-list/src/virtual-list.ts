import { type ExtractPropTypes, type PropType } from 'vue'

//每一项的key的生成方式：可以是数据里的字段名 也可以自己写一个函数
export type VirtualListItemKey =
  | string
  | ((item: any, index: number) => string | number)

//数据项：虚拟列表不关心数据长什么样 什么类型都能放
export type VirtualListItem = any

export const virtualListProps = {
  //要渲染的全部数据(可以很大 上万条都行)
  data: {
    type: Array as PropType<VirtualListItem[]>,
    default: () => []
  },
  //列表容器的高度 数字(px)或者字符串(比如 '60vh')
  height: {
    type: [String, Number] as PropType<string | number>,
    default: 400
  },
  //每一项的高度(px) 固定高度模式下必须准确 动态高度模式下它只是"预估高度"
  itemHeight: {
    type: Number,
    default: 40
  },
  //动态高度模式：每一项高度不一样 边渲染边测量真实高度
  estimated: Boolean,
  //上下各多渲染几条(缓冲) 这样快速滚动的时候不会看到白屏
  buffer: {
    type: Number,
    default: 4
  },
  //每一项的key怎么取：传字段名 或者传一个函数
  itemKey: {
    type: [String, Function] as PropType<VirtualListItemKey>,
    default: ''
  },
  //没有数据时显示的文字
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  //距离底部多少px算"触底"(用来触发上拉加载更多)
  bottomThreshold: {
    type: Number,
    default: 20
  }
} as const

export type VirtualListProps = ExtractPropTypes<typeof virtualListProps>

//渲染中的每一项
export interface VirtualVisibleItem {
  index: number
  data: VirtualListItem
  key: string | number
}
