import { isVNode } from 'vue'
import Message from './src/message.vue'
import { withInstallFunction } from '@yuki-byte/utils/with-install'
import { closeAll, createMessage } from './src/method'
import type {
  MessageHandler,
  MessageOptions,
  MessageParams,
  MessageType
} from './src/message'

//message 是"函数式组件"：用法是 yukiMessage.success('xxx')
//所以它的类型是一个"函数 + 几个快捷方法的对象"
export type MessageService = ((options?: MessageParams) => MessageHandler) & {
  success: (options?: MessageParams) => MessageHandler
  warning: (options?: MessageParams) => MessageHandler
  info: (options?: MessageParams) => MessageHandler
  error: (options?: MessageParams) => MessageHandler
  closeAll: (type?: MessageType) => void
}

const messageService = ((options?: MessageParams) =>
  createMessage(options)) as MessageService

//循环挂上 success / warning / info / error 四个快捷方法
//等价于手写 yukiMessage.success = options => createMessage({ ...options, type: 'success' })
const TYPES: MessageType[] = ['success', 'warning', 'info', 'error']

TYPES.forEach(type => {
  messageService[type] = (options: MessageParams = {}) => {
    const opts: MessageOptions =
      typeof options === 'string' || isVNode(options)
        ? { message: options }
        : (options as MessageOptions)
    return createMessage({ ...opts, type })
  }
})

messageService.closeAll = closeAll

//给函数式组件加上install
//这样 app.use(yukiMessage) 之后：
//1,选项式api里可以 this.$message.success('xxx')
//2,组合式api里可以 inject('yuki-message') 拿到它
const yukiMessage = withInstallFunction(messageService, 'message')

export default yukiMessage

//组件本体也导出 想用标签方式 <YukiMessage> 或者二次封装的时候能用
export { Message as YukiMessage }
export * from './src/message'

//告诉volar 全局属性上有个 $message
declare module 'vue' {
  export interface ComponentCustomProperties {
    $message: MessageService
  }
}
