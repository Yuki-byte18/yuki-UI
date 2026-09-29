# @yuki-byte/components

[YUKI-UI](https://github.com/Yuki-byte18/yuki-UI) 组件库的组件包，基于 Vue 3 + TypeScript。

## 安装

```bash
pnpm add @yuki-byte/components @yuki-byte/theme-chalk
```

> `vue` 是 peerDependency，你的项目里需要有 vue 3.3+。

## 使用

样式引一次，组件按需注册（每个组件都是独立的插件）：

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

import '@yuki-byte/theme-chalk/src/index.scss'

import yukiButton from '@yuki-byte/components/button'
import yukiTree from '@yuki-byte/components/tree'

const app = createApp(App)
app.use(yukiButton)
app.use(yukiTree)
app.mount('#app')
```

```vue
<template>
  <yuki-button type="primary">主要按钮</yuki-button>
  <yuki-tree :data="treeData" show-checkbox highlight-current />
</template>
```

函数式组件（消息提示 / 消息弹窗）不写在模板里：

```ts
import yukiMessage from '@yuki-byte/components/message'
import yukiMessageBox from '@yuki-byte/components/message-box'

yukiMessage.success('保存成功')

const res = await yukiMessageBox.confirm('确定要删除吗？', '删除确认')
if (res.action === 'confirm') yukiMessage.success('已删除')
```

## 组件

| 子路径 | 组件 |
| --- | --- |
| `@yuki-byte/components/icon` | Icon 图标 |
| `@yuki-byte/components/button` | Button 按钮 |
| `@yuki-byte/components/tag` | Tag 标签 |
| `@yuki-byte/components/tree` | Tree 树形控件 |
| `@yuki-byte/components/message` | Message 消息提示（函数式） |
| `@yuki-byte/components/message-box` | MessageBox 消息弹窗（函数式 + 组件） |
| `@yuki-byte/components/virtual-list` | VirtualList 虚拟列表 |

完整文档见[仓库](https://github.com/Yuki-byte18/yuki-UI)。

## License

MIT
