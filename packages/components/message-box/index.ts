import type { App } from 'vue'
import MessageBox from './src/message-box.vue'
import { withInstallFunction } from '@yuki-byte/utils/with-install'
import {
  alertMessageBox,
  closeAll,
  confirmMessageBox,
  createMessageBox,
  promptMessageBox
} from './src/method'
import type {
  MessageBoxContent,
  MessageBoxData,
  MessageBoxOptions
} from './src/message-box'

//函数式调用的类型：本身是个函数 另外带着 alert / confirm / prompt
export type MessageBoxService = ((
  options?: MessageBoxOptions
) => Promise<MessageBoxData>) & {
  alert: (
    message: MessageBoxContent,
    title?: string | MessageBoxOptions,
    options?: MessageBoxOptions
  ) => Promise<MessageBoxData>
  confirm: (
    message: MessageBoxContent,
    title?: string | MessageBoxOptions,
    options?: MessageBoxOptions
  ) => Promise<MessageBoxData>
  prompt: (
    message: MessageBoxContent,
    title?: string | MessageBoxOptions,
    options?: MessageBoxOptions
  ) => Promise<MessageBoxData>
  closeAll: () => void
}

const messageBoxService = ((options?: MessageBoxOptions) =>
  createMessageBox(options)) as MessageBoxService

messageBoxService.alert = alertMessageBox
messageBoxService.confirm = confirmMessageBox
messageBoxService.prompt = promptMessageBox
messageBoxService.closeAll = closeAll

//给函数式组件加install
const yukiMessageBox = withInstallFunction(messageBoxService, 'messageBox')

//弹窗既能函数式调用 也能当普通组件写在模板里
//所以这里在原来的install上再包一层 顺便把组件本体也全局注册掉
//这样 app.use(yukiMessageBox) 之后：
//1,this.$messageBox.confirm('xxx')
//2,模板里直接 <yuki-message-box v-model="show" title="提示">内容</yuki-message-box>
const installFunction = yukiMessageBox.install!
yukiMessageBox.install = (app: App) => {
  installFunction(app)
  app.component('yukiMessageBox', MessageBox)
}

export default yukiMessageBox

//组件本体也单独导出(想自己局部注册的时候用)
export { MessageBox as YukiMessageBox }
export * from './src/message-box'

declare module 'vue' {
  export interface GlobalComponents {
    yukiMessageBox: typeof MessageBox
  }
  export interface ComponentCustomProperties {
    $messageBox: MessageBoxService
  }
}
