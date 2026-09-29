import { type ExtractPropTypes, type PropType, type VNode } from 'vue'

//消息的类型(四种语义)
export type MessageType = 'success' | 'warning' | 'info' | 'error'

//消息的内容：可以传字符串 也可以传虚拟节点(想塞组件进去的时候用)
export type MessageContent = string | VNode | (() => VNode)

//组件的入参配置对象
export const messageProps = {
  //消息文字
  message: {
    type: [String, Object, Function] as PropType<MessageContent>,
    default: ''
  },
  //类型
  type: {
    type: String as PropType<MessageType>,
    default: 'info'
  },
  //多久后自动关闭(毫秒) 传 0 表示不自动关闭
  duration: {
    type: Number,
    default: 3000
  },
  //是否显示关闭按钮
  showClose: {
    type: Boolean,
    default: false
  },
  //文字是否居中
  center: Boolean,
  //朴素模式：白底 + 主题色描边和文字
  plain: Boolean,
  //把 message 当 html 字符串渲染(有xss风险 只有内容是可信的才开)
  dangerouslyUseHTMLString: Boolean,
  //距离页面顶部的距离(px) 多条消息会自动堆叠 这个值由组件内部动态改
  offset: {
    type: Number,
    default: 20
  },
  //层级 后创建的消息盖住前面的
  zIndex: {
    type: Number,
    default: 0
  },
  //分组：内容相同的消息合并成一条 右上角显示重复次数
  grouping: Boolean,
  //重复次数(分组模式下内部会加)
  repeatNum: {
    type: Number,
    default: 1
  },
  //关闭时的回调
  onClose: {
    type: Function as PropType<() => void>,
    default: undefined
  }
} as const

export type MessageProps = ExtractPropTypes<typeof messageProps>

//函数式调用的入参：可以直接传字符串 也可以传配置对象
export type MessageOptions = Partial<MessageProps>
export type MessageParams = MessageOptions | string | VNode

//函数式调用返回的东西：拿到它可以手动关闭这条消息
export interface MessageHandler {
  close: () => void
}

//一条消息实例的上下文
export interface MessageContext {
  id: string
  vnode: VNode
  vm: any
  props: MessageProps
  handler: MessageHandler
  container: HTMLDivElement
}
