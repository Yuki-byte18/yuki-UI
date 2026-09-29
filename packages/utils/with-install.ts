//导出withInstall工具函数
//这个工具函数：传入一个组件对象，返回一个带有install方法的组件对象
//作用：给每个组件对象添加install方法，让组件变成可被人全局注册的插件



import type { Plugin, App } from "vue"
export type compPluginType<T> = T & Plugin
export function withInstall<T>(component: T) {
  (component as compPluginType<T>).install = function (app: App) {
    const { name } = component as unknown as { name: string }
    app.component(name, component as any)
  }
  return component as compPluginType<T>
}


//=====================================================================
//withInstallFunction：给"函数式调用"的组件(比如 message / messageBox)添加install方法
//为什么需要它？
//withInstall 注册的是普通组件(用 app.component 注册 模板里写 <yuki-xxx />)
//但 message 这种是"函数式组件" 用法是 yukiMessage.success("xxx") 不需要写在模板里
//所以他没法用 app.component 注册 只能挂在全局属性上 让 options api 里能用 this.$message
//=====================================================================
export function withInstallFunction<T extends (...args: any[]) => any>(fn: T, name: string) {
  (fn as compPluginType<T>).install = function (app: App) {
    //1,挂到全局属性上 选项式api里可以直接 this.$message.xxx()
    app.config.globalProperties[`$${name}`] = fn
    //2,同时用 provide 传下去 组合式api里可以 inject 拿到
    app.provide(`yuki-${name}`, fn)
  }
  return fn as compPluginType<T>
}
