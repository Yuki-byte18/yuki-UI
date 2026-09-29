# 消息弹窗 MessageBox

模拟系统弹窗的反馈组件：`alert` 提示、`confirm` 确认、`prompt` 输入三种形态，函数式调用时用 Promise 把用户的选择交还给你，也支持 `v-model` 写在模板里。

## 基础用法

`alert` 只有一个确定按钮，适合单纯的提示：

```vue
<template>
  <yuki-button @click="showAlert">alert 提示</yuki-button>
</template>

<script setup lang="ts">
import yukiButton from '@yuki-byte/components/button'
// 函数式调用：import 进来直接用
import yukiMessageBox from '@yuki-byte/components/message-box'

function showAlert() {
  yukiMessageBox.alert('这是一条普通的提示信息，只有一个确定按钮。', '提示', {
    type: 'info'
  })
}
</script>
```

## 确认框

`confirm` 会带上取消按钮，`await` 出来的结果里 `action` 就是用户点了什么：

```vue
<template>
  <yuki-button type="warning" @click="showConfirm">confirm 确认</yuki-button>
</template>

<script setup lang="ts">
import yukiButton from '@yuki-byte/components/button'
import yukiMessageBox from '@yuki-byte/components/message-box'
import yukiMessage from '@yuki-byte/components/message'

async function showConfirm() {
  const res = await yukiMessageBox.confirm('确定要删除这条记录吗？删除之后不可恢复。', '删除确认', {
    type: 'warning'
  })

  res.action === 'confirm'
    ? yukiMessage.success('已经删掉了')
    : yukiMessage.info('取消了操作')
}
</script>
```

## 输入框

`prompt` 会在内容下面放一个输入框，用户输入的内容从返回值的 `value` 里拿。`inputType` 支持 `text` / `textarea` / `password` / `number`，`prompt` 不传时默认是 `text`：

```vue
<template>
  <yuki-button type="primary" @click="showPrompt">prompt 输入</yuki-button>
</template>

<script setup lang="ts">
import yukiButton from '@yuki-byte/components/button'
import yukiMessageBox from '@yuki-byte/components/message-box'
import yukiMessage from '@yuki-byte/components/message'

async function showPrompt() {
  const res = await yukiMessageBox.prompt('请输入你的昵称（2 到 8 个字符）', '昵称设置', {
    inputPlaceholder: '比如：yuki',
    inputPattern: /^.{2,8}$/,
    inputErrorMessage: '昵称长度要在 2 到 8 个字符之间'
  })

  if (res.action === 'confirm') {
    yukiMessage.success(`你好，${res.value}！`)
  }
}
</script>
```

## 输入校验

- `inputPattern`：一个正则，不匹配就报错
- `inputValidator`：一个函数，返回 `false` 或者一个字符串都算不通过（返回字符串时，字符串本身就是错误提示），支持返回 Promise，所以可以做异步校验
- `inputErrorMessage`：校验不通过时显示的提示文字，默认「输入的数据不合法!」

校验不通过时弹窗不会关，会在输入框下面显示错误提示；用户重新输入后错误提示自动清掉。异步校验进行中，确定按钮会进入 loading 状态。

## 自定义按钮

`confirmButtonText` / `cancelButtonText` 改按钮文字，`confirmButtonType` / `cancelButtonType` 改按钮主题色（取值和按钮组件的 `type` 一样），`roundButton` 让两个按钮变圆角：

```ts
import yukiMessageBox from '@yuki-byte/components/message-box'

yukiMessageBox.confirm('要保存这次的修改吗？', '保存确认', {
  confirmButtonText: '保存',
  cancelButtonText: '再想想',
  confirmButtonType: 'success',
  roundButton: true
})
```

## 关闭行为

- `closeOnClickModal`（默认 `true`）：点遮罩是否关闭
- `closeOnPressEscape`（默认 `true`）：按 Esc 是否关闭
- `showClose`（默认 `true`）：是否显示右上角的叉号

默认情况下，点叉号和点遮罩都算「取消」（`action` 是 `'cancel'`）。想区分「取消」和「关闭」，就在函数式调用时打开 `distinguishCancelAndClose`，这样点叉号 / 点遮罩返回的是 `'close'`：

```ts
const res = await yukiMessageBox.confirm('确定要继续吗？', '提示', {
  distinguishCancelAndClose: true
})

res.action === 'cancel' ? console.log('点了取消') : console.log('直接关掉了')
```

## 声明式用法

弹窗也能直接写在模板里，用 `v-model` 控制显示隐藏（`app.use(yukiMessageBox)` 已经把组件本体全局注册了）：

```vue
<template>
  <yuki-button type="success" plain @click="visible = true">声明式用法</yuki-button>

  <yuki-message-box
    v-model="visible"
    title="声明式弹窗"
    type="success"
    @action="onAction"
  >
    我是直接写在模板里的弹窗，用 v-model 控制显示隐藏。
  </yuki-message-box>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import yukiButton from '@yuki-byte/components/button'

const visible = ref(false)

function onAction(action: 'confirm' | 'cancel' | 'close') {
  console.log('用户点了', action)
}
</script>
```

想自己局部注册的话，组件本体以 `YukiMessageBox` 单独导出。

## 函数式调用

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `yukiMessageBox` | 按配置对象打开一个弹窗 | `options?: MessageBoxOptions` | `Promise<MessageBoxData>` |
| `yukiMessageBox.alert` | 只有一个确定按钮的提示框 | `message: MessageBoxContent`、`title?: string \| MessageBoxOptions`、`options?: MessageBoxOptions` | `Promise<MessageBoxData>` |
| `yukiMessageBox.confirm` | 带取消按钮的确认框 | 同上 | `Promise<MessageBoxData>` |
| `yukiMessageBox.prompt` | 带输入框的弹窗（不传 `inputType` 时默认 `'text'`） | 同上 | `Promise<MessageBoxData>` |
| `yukiMessageBox.closeAll` | 关闭所有还开着的弹窗 | — | `void` |

第二个参数的写法很随意：传字符串就是标题，传对象就当成 options（此时标题写在对象的 `title` 上）。

返回值说明：这几个方法都返回 Promise，用户点了确定 / 取消 / 关闭、弹窗动画播完之后才 resolve，结果是 `MessageBoxData`：

- `action`：用户点了什么，取值 `'confirm'` / `'cancel'` / `'close'`
- `value`：`prompt` 时用户输入的内容，其他情况是 `inputValue` 或者空字符串

不想用 `await` 的话可以在 options 里传 `callback(action, value)`，效果一样。

### Options

函数式调用能传的选项 = 下面 Props 表的全部属性，外加两个只有函数式调用才有的：

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `callback` | 结果回调，不写回调就 `await` 返回的 Promise | `(action: MessageBoxAction, value: string) => void` | — |
| `distinguishCancelAndClose` | 区分「取消」和「关闭」：开了之后点叉号 / 点遮罩返回 `'close'` 而不是 `'cancel'` | `boolean` | `false` |

注册相关：`app.use(yukiMessageBox)` 之后，选项式 API 里可以用 `this.$messageBox.confirm('xx')`，组合式 API 里可以 `inject('yuki-messageBox')` 拿到它。

## API

### Props

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `modelValue` | 控制显示隐藏的 `v-model` | `boolean` | `false` |
| `title` | 标题，不传就显示「提示」 | `string` | `''` |
| `message` | 内容，也可以传虚拟节点 | `string \| VNode \| (() => VNode)` | `''` |
| `type` | 类型，会在标题旁边显示对应颜色的图标 | `'' \| 'success' \| 'info' \| 'warning' \| 'error'` | `''` |
| `width` | 弹窗宽度 | `string \| number` | `'420px'` |
| `zIndex` | 层级 | `number` | `0` |
| `showCancelButton` | 是否显示取消按钮（`alert` 不需要） | `boolean` | `false` |
| `showClose` | 是否显示右上角的叉号 | `boolean` | `true` |
| `confirmButtonText` | 确定按钮的文字 | `string` | `'确定'` |
| `cancelButtonText` | 取消按钮的文字 | `string` | `'取消'` |
| `confirmButtonType` | 确定按钮的主题色 | `ButtonType` | `'primary'` |
| `cancelButtonType` | 取消按钮的主题色 | `ButtonType` | `''` |
| `roundButton` | 两个按钮是否圆角 | `boolean` | `false` |
| `closeOnClickModal` | 点遮罩是否关闭 | `boolean` | `true` |
| `closeOnPressEscape` | 按 Esc 是否关闭 | `boolean` | `true` |
| `center` | 内容是否居中 | `boolean` | `false` |
| `dangerouslyUseHTMLString` | 把内容当 HTML 渲染（内容可信才开，有 XSS 风险） | `boolean` | `false` |
| `customClass` | 自定义类名，加在遮罩层上 | `string` | — |
| `inputType` | 输入框类型，传了就说明这是个输入弹窗 | `'' \| 'text' \| 'textarea' \| 'password' \| 'number'` | `''` |
| `inputPlaceholder` | 输入框的占位文字 | `string` | — |
| `inputValue` | 输入框的初始值 | `string` | `''` |
| `inputPattern` | 输入内容的校验正则 | `RegExp` | — |
| `inputValidator` | 输入内容的校验函数，返回 `false` 或字符串都算不通过，支持 Promise | `(value: string) => boolean \| string \| Promise<boolean \| string>` | — |
| `inputErrorMessage` | 校验不通过时的提示文字 | `string` | `'输入的数据不合法!'` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `update:modelValue` | 弹窗内部关闭时同步 `v-model` | `value: boolean` |
| `action` | 用户点了确定 / 取消 / 关闭时触发 | `action: 'confirm' \| 'cancel' \| 'close'` |
| `vanish` | 淡出动画播完、实例即将被卸载时触发（函数式调用的实现靠它清理容器并 resolve） | — |

### Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 自定义弹窗内容，不传就渲染 `message` | — |

### 方法

通过 `ref` 拿到组件实例后可以调用（函数式调用的实现用的也是这几个）：

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| `open` | 打开弹窗 | — |
| `close` | 关闭弹窗 | — |
| `getInputValue` | 拿到输入框当前的值 | — |
