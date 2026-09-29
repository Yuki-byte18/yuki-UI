//每一个组件都有着一个文件
//用来把写好的组件作为组件对象导入 添加install后 变成可全局注册的插件导出
//导出带有install方法的组件对象
import Icon from "./src/icon.vue"
import { withInstall } from "@yuki-byte/utils/with-install"

const yukiIcon = withInstall(Icon)
export default yukiIcon
export * from "./src/icon"

//自己的理解：全局注册怎么实现？ 
//实际上 在main.ts中调用use方法 app.use(组件) 他会自动执行组件的install方法
//然后在install方法中 调用app.component方法 传参格式：app.component(组件名,组件对象）
//所以说实际上全局注册组件就是app.component(组件名,组件对象) 这是底层注册

//流程：1，自己项目main.ts中引入 带有install方法的插件（组件）
//流程：2，app.use(插件)  函数自动找并且执行插件的install方法
//流程：3，install方法调用 app.component(组件名,组件对象) 完成注册

//最后在自己的项目任何位置 就可以直接使用了 


//告诉volar插件这个组件是全局注册了的 要有代码高亮 智能提示 类型校验
declare module 'vue' {
  export interface GlobalComponents {
    yukiIcon: typeof Icon
  }
}
