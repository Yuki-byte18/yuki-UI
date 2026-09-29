//每一个组件都有着一个文件
//用来把写好的组件作为组件对象导入 添加install后 变成可全局注册的插件导出
import Button from './src/button.vue'
import { withInstall } from '@yuki-byte/utils/with-install'

const yukiButton = withInstall(Button)
export default yukiButton
//把props类型也导出 使用者可以拿到 ButtonProps 做二次封装
export * from './src/button'

//告诉volar插件这个组件是全局注册了的 要有代码高亮 智能提示 类型校验
declare module 'vue' {
  export interface GlobalComponents {
    yukiButton: typeof yukiButton
  }
}
