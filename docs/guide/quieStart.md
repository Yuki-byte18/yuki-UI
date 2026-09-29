# 快速开始

这一页给你一个最小的可运行示例：装完依赖之后照着抄两个文件，就能在页面上看到第一个 YUKI-UI 组件。

## 最小示例

先把依赖装上（在项目根目录执行一次即可）：

```bash
pnpm install
```

然后写两个文件。`main.ts` 负责引入样式、注册要用的组件；`App.vue` 里直接用组件标签。

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 引入组件库的全部样式（里面已经汇总了每个组件的 scss）
import '@yuki-byte/theme-chalk/src/index.scss'

// 按需引入：用哪个组件就引哪个
import yukiButton from '@yuki-byte/components/button'

const app = createApp(App)

// app.use 会自动执行组件的 install，把组件全局注册掉
app.use(yukiButton)

app.mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <div class="page">
    <yuki-button type="primary" @click="count++">点我 {{ count }} 次</yuki-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<style>
.page {
  padding: 24px;
}
</style>
```

跑起来之后点一下按钮，数字会往上加，说明组件已经注册成功、事件也正常透传。

## 组件是全局注册的

`app.use(yukiButton)` 这一步做的事就是调用 `app.component('yukiButton', Button)`，所以注册过的组件在任何组件的模板里都能直接写标签，不需要再 import：

```vue
<template>
  <yuki-tag type="primary" round>标签</yuki-tag>
  <yuki-tree :data="treeData" node-key="id" show-checkbox />
  <yuki-virtual-list :data="list" :height="300" :item-height="48" />
</template>
```

标签名用 kebab-case 写就行（`yuki-button`、`yuki-virtual-list`），组件的 `name` 是 camelCase（`yukiButton`），Vue 会自动对应上。

想要「用哪个引哪个」的按需加载，就在 `main.ts` 里只引真正用到的组件；反过来，如果只想在某个组件里用，也可以在它的 `<script setup>` 里 import。

## 函数式组件怎么用

Message 和 MessageBox 不需要写在模板里，import 进来直接调用：

```ts
// main.ts 里注册一下，之后 this.$message / this.$messageBox 也能用
import yukiMessage from '@yuki-byte/components/message'
import yukiMessageBox from '@yuki-byte/components/message-box'

app.use(yukiMessage)
app.use(yukiMessageBox)
```

```ts
import yukiMessage from '@yuki-byte/components/message'
import yukiMessageBox from '@yuki-byte/components/message-box'

// 消息提示：同步返回一个 handler，可以手动关闭
yukiMessage.success('操作成功')

// 消息弹窗：返回 Promise，await 出来的是用户的选择
const res = await yukiMessageBox.confirm('确定要删除吗？', '提示')
if (res.action === 'confirm') {
  yukiMessage.success('删掉了')
}
```

## 自定义主题

主题分两层：SCSS 变量在编译期决定最终样式，CSS 变量在运行时也能被覆盖。

### SCSS 变量（编译期）

设计令牌都写在 `packages/theme-chalk/src/mixins/config.scss` 里，比如：

| 变量名 | 默认值 | 说明 |
| --- | --- | --- |
| `$namespace` | `'yuki'` | 类名前缀 |
| `$color-primary` | `#6366f1` | 主题色 |
| `$color-success` | `#10b981` | 成功色 |
| `$color-warning` | `#f59e0b` | 警告色 |
| `$color-danger` | `#ef4444` | 危险色 |
| `$color-info` | `#909399` | 信息色 |
| `$text-color-primary` | `#1f2329` | 主要文字色 |
| `$border-color` | `#dcdfe6` | 边框色 |
| `$font-size-base` | `14px` | 基础字号 |
| `$border-radius-base` | `6px` | 基础圆角 |
| `$index-message` | `3000` | 消息提示的层级 |
| `$index-message-box` | `4000` | 消息弹窗的层级 |

改整套配色，就直接改 `config.scss` 里的这几个变量（比如把 `$color-primary` 换成 `#ff6b6b`），然后重新编译样式。各组件样式里的颜色、浅色梯度、聚焦圈都是从这个文件取值算出来的，所以改一处就能全局生效；`light-mix` / `dark-mix` 这两个函数会用新主题色重新生成深浅梯度，不用自己一个个补。

### CSS 变量（运行时）

`packages/theme-chalk/src/var.scss` 会把上面的 SCSS 变量输出成 `:root` 上的 CSS 变量，前缀是 `--yuki-`：

- 主题色：`--yuki-color-primary`、`--yuki-color-success`、`--yuki-color-warning`、`--yuki-color-danger`、`--yuki-color-info`
- 主题色浅色梯度：`--yuki-color-primary-light-3` / `-5` / `-7` / `-8` / `-9`
- 文字：`--yuki-text-color-primary`、`--yuki-text-color-regular`、`--yuki-text-color-secondary`、`--yuki-text-color-placeholder`、`--yuki-text-color-disabled`
- 边框与填充：`--yuki-border-color`、`--yuki-fill-color`、`--yuki-bg-color`、`--yuki-bg-color-page`
- 字号与圆角：`--yuki-font-size-base`、`--yuki-border-radius-base`
- 层级：`--yuki-index-message`、`--yuki-index-message-box`

```css
/* 放进自己的全局样式里，不需要重新编译组件库就能生效 */
:root {
  --yuki-color-primary: #ff6b6b;
  --yuki-border-radius-base: 10px;
}
```

这两种方式的生效范围不太一样，选之前先想清楚要改什么：

- CSS 变量对「样式里写着 `var(--yuki-xxx)` 的地方」立即生效：文字 / 边框 / 填充 / 字号 / 圆角这些通用变量，以及按钮的 hover 态、树的高亮和复选框、弹窗的按钮焦点圈等等。往 `document.documentElement.style` 上写值就能当场换掉，适合深色模式、用户自定义品牌色这类需要动态切换的场景。
- 而「主要按钮的实心底色」「标签的深色风格」「四种消息类型的颜色」这类颜色，是编译期由 SCSS 变量算好写进样式的（`'primary': $color-primary`），所以只覆盖 `--yuki-color-primary` 不会把它们一起改掉。想让所有组件彻底换一套配色，还是改 `config.scss` 再重新编译更靠谱。
