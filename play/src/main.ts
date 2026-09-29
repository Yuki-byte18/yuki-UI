import { createApp } from 'vue'
import App from './App.vue'

// 引入组件库的全部样式(里面已经汇总了每个组件的 scss)
import '@yuki-byte/theme-chalk/src/index.scss'

// 组件库是按需引入的：每个组件都是一个独立的插件 用哪个引哪个
import yukiIcon from '@yuki-byte/components/icon'
import yukiButton from '@yuki-byte/components/button'
import yukiTag from '@yuki-byte/components/tag'
import yukiTree from '@yuki-byte/components/tree'
import yukiMessage from '@yuki-byte/components/message'
import yukiMessageBox from '@yuki-byte/components/message-box'
import yukiVirtualList from '@yuki-byte/components/virtual-list'

const app = createApp(App)

// 把要用的组件插件放进数组 统一 use 注册
const plugins = [
  yukiIcon,
  yukiButton,
  yukiTag,
  yukiTree,
  // message / message-box 是函数式组件 注册后可以用 this.$message / this.$messageBox
  // (同时 message-box 会顺手把 <yuki-message-box> 组件也全局注册掉)
  yukiMessage,
  yukiMessageBox,
  yukiVirtualList
]

plugins.forEach(plugin => {
  app.use(plugin)
})

app.mount('#app')
