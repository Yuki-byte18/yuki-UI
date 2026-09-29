# YUKI-UI

基于 Vue 3 + TypeScript + SCSS 手写的组件库，pnpm monorepo 结构，边写边学的那一种。

![license](https://img.shields.io/github/license/Yuki-byte18/yuki-UI)
![stars](https://img.shields.io/github/stars/Yuki-byte18/yuki-UI?style=flat)
![vue](https://img.shields.io/badge/vue-3.x-42b883.svg)
![typescript](https://img.shields.io/badge/typescript-5.x-3178c6.svg)
![pnpm](https://img.shields.io/badge/pnpm-workspace-f69220.svg)

## 特性

- **7 个组件**：Icon / Button / Tag / Tree / Message / MessageBox / VirtualList
- **Monorepo 拆包**：组件、样式、工具函数拆成三个包，用哪个引哪个（按需引入）
- **BEM 命名规范**：`yuki-button`、`yuki-tree__node-content`、`yuki-button--primary`、`is-checked` 这套规则由 TS 工具函数 `createNamespace` 统一生成，样式侧用 SCSS mixin 对齐
- **Tree 树形控件**：递归组件实现，支持复选框父子联动、半选状态、手风琴、字段映射、自定义节点插槽
- **VirtualList 虚拟列表**：一万条数据只渲染可见的十几条，支持固定高度与动态高度（`estimated`）两种模式
- **函数式组件**：`yukiMessage.success('xxx')`、`await yukiMessageBox.confirm('xxx')`，弹窗和消息用 Promise 返回结果
- **两层主题定制**：SCSS 变量（编译期）+ CSS 变量（运行时）

## 文档

- 在线文档：（Vercel 部署完成后把地址填到这里，比如 `https://yuki-ui.vercel.app`）
- 源码仓库：[github.com/Yuki-byte18/yuki-UI](https://github.com/Yuki-byte18/yuki-UI)
- 本地启动文档：

```bash
pnpm doc:dev        # 默认 http://localhost:5173/
```

## 安装

> 组件库目前是工作区内部使用（还没发布到 npm）。在当前仓库里：

```bash
pnpm install        # 安装依赖
pnpm dev            # 启动 play 演示项目，默认 http://localhost:5173/
```

发布到 npm 之后，使用者的安装方式会是：

```bash
pnpm add @yuki/components @yuki/theme-chalk
```

## 快速上手

引样式 + 用插件的方式按需注册组件：

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

import '@yuki/theme-chalk/src/index.scss'

import yukiButton from '@yuki/components/button'
import yukiTree from '@yuki/components/tree'

const app = createApp(App)

const plugins = [yukiButton, yukiTree]
plugins.forEach(plugin => app.use(plugin))

app.mount('#app')
```

注册之后模板里直接用标签（每个组件都带 `declare module 'vue'` 的类型提示）：

```vue
<template>
  <yuki-button type="primary" @click="hello">主要按钮</yuki-button>
  <yuki-tree :data="treeData" show-checkbox highlight-current />
</template>
```

函数式组件不写在模板里，直接调用：

```ts
import yukiMessage from '@yuki/components/message'
import yukiMessageBox from '@yuki/components/message-box'

yukiMessage.success('保存成功')

const res = await yukiMessageBox.confirm('确定要删除吗？', '删除确认')
if (res.action === 'confirm') {
  yukiMessage.success('已删除')
}
```

想看全部用法和每个组件的完整 props / 事件 / 方法表格，跑 `pnpm doc:dev` 打开文档，或直接看 `play/src/App.vue`（那里所有组件都在跑）。

## 组件

| 组件 | 标签名 | 说明 |
| --- | --- | --- |
| Icon | `<yuki-icon>` | 图标容器，支持 `color` / `size` / `spin` |
| Button | `<yuki-button>` | 5 种主题色、3 种尺寸、朴素/圆角/圆形/文字、加载与禁用 |
| Tag | `<yuki-tag>` | light / dark / plain 三种风格、可关闭、圆角 |
| Tree | `<yuki-tree>` | 复选框父子联动与半选、默认展开/勾选、手风琴、连接线、空状态 |
| Message | `yukiMessage` | 消息提示，自动堆叠、自动关闭、分组合并 |
| MessageBox | `yukiMessageBox` / `<yuki-message-box>` | alert / confirm / prompt，Promise 返回结果 |
| VirtualList | `<yuki-virtual-list>` | 虚拟列表，固定高度与动态高度、触底加载 |

## 目录结构

```
packages/
  components/          # 组件包 @yuki/components
    [组件名]/
      index.ts         # withInstall 导出 + 全局组件类型声明
      src/[组件名].ts  # props 配置对象 + ExtractPropTypes 类型
      src/[组件名].vue # 组件实现（defineOptions 命名 + createNamespace 生成 BEM）
  theme-chalk/         # 样式包 @yuki/theme-chalk
    src/index.scss     # 汇总所有组件样式
    src/var.scss       # 设计变量输出成 :root 上的 CSS 变量
    src/mixins/        # SCSS 变量与 mixin（b / e / m / when ...）
  utils/               # 工具包 @yuki/utils
    create.ts          # createNamespace：生成 BEM 类名
    with-install.ts    # withInstall / withInstallFunction：给组件加 install
play/                  # 本地演示项目（vite）
docs/                  # VitePress 中文文档
```

## 主题定制

**方式一：CSS 变量（运行时改，最省事）**。变量定义在 `packages/theme-chalk/src/var.scss` 里，挂在 `:root` 上：

```css
:root {
  --yuki-color-primary: #0ea5e9;
  --yuki-border-radius-base: 8px;
  --yuki-font-size-base: 15px;
}
```

**方式二：改 SCSS 变量重新编译（彻底换肤）**。改 `packages/theme-chalk/src/mixins/config.scss` 里的 `$color-primary`、`$color-success` 等变量，整个色板（含 hover / plain / 浅色背景这些派生色）会一起变；主题色浅色梯度是用 `light-mix()` / `dark-mix()` 两个函数按比例混白/混黑算出来的，改一个源头就够了。

> 注意：实心按钮、深色标签这类"实底颜色"目前是编译期由 SCSS 变量插值出来的，只改 CSS 变量不会变它们；想彻底换色请走方式二。

## 开发

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动 play 演示项目
pnpm doc:dev          # 启动文档
pnpm doc:build        # 构建文档（产物在 docs/.vitepress/dist）
pnpm -C play build    # 类型检查 + 构建演示项目
```

包管理用 pnpm（`packageManager` 已锁定 10.33.1），Node 版本建议 20 以上。

## License

[MIT](./LICENSE)
