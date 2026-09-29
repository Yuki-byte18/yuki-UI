# 安装

YUKI-UI 是一个 pnpm monorepo：组件、样式、工具函数、演示项目和文档都放在同一个仓库里管理，用 pnpm workspace 互相引用。

## 目录结构

`pnpm-workspace.yaml` 里声明了三个工作区：

| 工作区 | 说明 |
| --- | --- |
| `play` | 用来测试组件库的演示项目，改完组件直接在这里看效果 |
| `docs` | 组件库文档（就是你现在看的这个站，用 VitePress 写的） |
| `packages/**` | 组件库本体，匹配所有包 |

`packages` 下面目前有三个包：

| 包名 | 说明 |
| --- | --- |
| `@yuki/components` | 所有组件，每个组件一个目录，`index.ts` 里加上 `install` 后就能当插件全局注册 |
| `@yuki/theme-chalk` | 所有样式，SCSS 变量 + 各组件样式 |
| `@yuki/utils` | 小工具，比如 `createNamespace`（BEM 类名）、`withInstall`（给组件加 install） |

## 安装依赖

在**根目录**执行一次就够了，pnpm 会按 workspace 把所有子包的依赖一起装好：

```bash
pnpm install
```

仓库用的包管理器是 `pnpm@10.33.1`（写在根 `package.json` 的 `packageManager` 字段里），用其他包管理器可能会装出不一样的结果。

## 启动开发环境

```bash
# 启动 play 演示项目（等价于 pnpm -C play dev）
pnpm dev

# 启动文档站（等价于 pnpm -C docs dev）
pnpm doc:dev
```

## 按需引入组件

组件库是**按需引入**的：每个组件都是一个独立的插件，用哪个引哪个，打包时不会把没用到的组件带进去。以按钮为例：

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import '@yuki/theme-chalk/src/index.scss'

import yukiButton from '@yuki/components/button'

const app = createApp(App)

// app.use 会自动执行组件的 install，install 里调用 app.component 完成全局注册
app.use(yukiButton)

app.mount('#app')
```

`app.use(yukiButton)` 之后，模板里就能直接写 `<yuki-button>` 了（组件内部定义的 name 就是 `yukiButton`，模板里用 kebab-case 写法）。

想一次注册多个组件，放进数组统一 `use` 就行：

```ts
import yukiIcon from '@yuki/components/icon'
import yukiButton from '@yuki/components/button'
import yukiTag from '@yuki/components/tag'
import yukiTree from '@yuki/components/tree'
import yukiMessage from '@yuki/components/message'
import yukiMessageBox from '@yuki/components/message-box'
import yukiVirtualList from '@yuki/components/virtual-list'

const plugins = [
  yukiIcon,
  yukiButton,
  yukiTag,
  yukiTree,
  yukiMessage,
  yukiMessageBox,
  yukiVirtualList
]

plugins.forEach(plugin => {
  app.use(plugin)
})
```

组件清单：

| 组件 | 引入路径 | 全局标签 |
| --- | --- | --- |
| Icon 图标 | `@yuki/components/icon` | `<yuki-icon>` |
| Button 按钮 | `@yuki/components/button` | `<yuki-button>` |
| Tag 标签 | `@yuki/components/tag` | `<yuki-tag>` |
| Tree 树形控件 | `@yuki/components/tree` | `<yuki-tree>` |
| VirtualList 虚拟列表 | `@yuki/components/virtual-list` | `<yuki-virtual-list>` |
| Message 消息提示 | `@yuki/components/message` | 函数式调用 `yukiMessage.success('xx')` |
| MessageBox 消息弹窗 | `@yuki/components/message-box` | 函数式调用 + `<yuki-message-box>` |

Message 和 MessageBox 是函数式组件，`app.use` 之后会挂在全局属性上（`this.$message` / `this.$messageBox`），组件式用法看各自的文档。

如果不想全局注册，也可以直接在单文件组件的 `<script setup>` 里 import，模板里同样能用：

```vue
<script setup lang="ts">
import yukiButton from '@yuki/components/button'
</script>

<template>
  <yuki-button type="primary">主要按钮</yuki-button>
</template>
```

## 引入样式

所有组件的样式由 `packages/theme-chalk/src/index.scss` 汇总，它先引入设计变量（`var.scss`），再逐个 `@use` 各个组件的 scss：

```ts
// main.ts 里引一次就够了
import '@yuki/theme-chalk/src/index.scss'
```

## 自定义主题

主题相关的变量都集中在 `@yuki/theme-chalk` 里：

- `packages/theme-chalk/src/mixins/config.scss`：SCSS 变量（设计令牌），编译期决定最终样式
- `packages/theme-chalk/src/var.scss`：把上面的变量输出成 `:root` 上的 CSS 变量，样式里写 `var(--yuki-xxx)` 的地方都能在运行时被覆盖

两种改法的用法见[快速开始](/guide/quieStart)。
