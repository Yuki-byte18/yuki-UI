# 消息提示 Message

轻量的全局提示，用来反馈操作结果。它是函数式组件：import 进来直接调用，不需要写在模板里，消息会自己挂到 `body` 上并自动堆叠、自动关闭。

## 基础用法

```vue
<template>
  <yuki-button type="success" @click="open">显示消息</yuki-button>
</template>

<script setup lang="ts">
import yukiButton from '@yuki/components/button'
// 函数式调用：import 进来直接调，不用写进模板
import yukiMessage from '@yuki/components/message'

function open() {
  yukiMessage.success('操作成功')
}
</script>
```

不带任何快捷方法时，`yukiMessage` 本身也是一个函数，等价于直接把配置对象丢进去：

```ts
import yukiMessage from '@yuki/components/message'

yukiMessage('这是一条普通消息')
yukiMessage({ message: '带配置的消息', type: 'warning', showClose: true })
```

## 四种类型

`success` / `warning` / `info` / `error` 四个快捷方法，等价于调用时把 `type` 固定成对应的值：

```vue
<template>
  <div class="row">
    <yuki-button type="success" plain @click="yukiMessage.success('操作成功')">成功</yuki-button>
    <yuki-button type="warning" plain @click="yukiMessage.warning('请注意检查')">警告</yuki-button>
    <yuki-button plain @click="yukiMessage.info('这是一条消息')">消息</yuki-button>
    <yuki-button type="danger" plain @click="yukiMessage.error('操作失败')">错误</yuki-button>
  </div>
</template>

<script setup lang="ts">
import yukiButton from '@yuki/components/button'
import yukiMessage from '@yuki/components/message'
</script>
```

四种类型自带对应的图标和颜色，不需要自己传。

## 关闭按钮与自动关闭时长

- `duration`：多久后自动关闭（毫秒），默认 3000；传 `0` 就不自动关闭
- `showClose`：是否显示右边的关闭按钮
- `onClose`：关闭时的回调

鼠标移上去会暂停倒计时，移开之后重新计时。

```ts
import yukiMessage from '@yuki/components/message'

yukiMessage({
  message: '不会自动关闭的消息',
  type: 'info',
  duration: 0,
  showClose: true,
  onClose: () => console.log('消息被关掉了')
})
```

## 居中与朴素

`center` 让文字居中，`plain` 切到朴素模式（白底 + 主题色描边和文字）：

```ts
yukiMessage({
  message: '内容居中 + 朴素样式',
  type: 'success',
  center: true,
  plain: true,
  duration: 2000
})
```

## 分组合并

`grouping` 打开之后，内容和类型都相同的消息不会重复创建，而是合并成一条并在右上角显示重复次数，倒计时也会重新开始。适合「连点好几次提交按钮」这种场景：

```ts
yukiMessage({
  message: '这条消息会被合并显示（连点几次试试）',
  type: 'warning',
  grouping: true,
  duration: 2500
})
```

## 手动关闭

调用会同步返回一个 `MessageHandler`，拿到它就能手动关掉这一条；`closeAll` 关掉全部（传类型就只关这一种类型）：

```ts
import yukiMessage from '@yuki/components/message'

const handler = yukiMessage({
  message: '手动关闭的消息',
  type: 'info',
  duration: 0,
  showClose: true
})

// 只关这一条
handler.close()

// 关掉全部
yukiMessage.closeAll()

// 只关掉所有 success 类型的
yukiMessage.closeAll('success')
```

## 函数式调用

### Options

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `message` | 消息文字，也可以传虚拟节点 | `string \| VNode \| (() => VNode)` | `''` |
| `type` | 消息类型 | `'success' \| 'warning' \| 'info' \| 'error'` | `'info'` |
| `duration` | 多久后自动关闭（毫秒），传 `0` 表示不自动关闭 | `number` | `3000` |
| `showClose` | 是否显示关闭按钮 | `boolean` | `false` |
| `center` | 文字是否居中 | `boolean` | `false` |
| `plain` | 朴素模式：白底 + 主题色描边和文字 | `boolean` | `false` |
| `dangerouslyUseHTMLString` | 把消息内容当 HTML 字符串渲染（内容可信才开，有 XSS 风险） | `boolean` | `false` |
| `offset` | 距离页面顶部的距离（px），多条消息会自动堆叠 | `number` | `20` |
| `zIndex` | 层级，后创建的消息盖住前面的 | `number` | `0` |
| `grouping` | 分组：内容相同的消息合并成一条，右上角显示重复次数 | `boolean` | `false` |
| `repeatNum` | 重复次数（分组模式下由组件内部维护） | `number` | `1` |
| `onClose` | 关闭时的回调 | `() => void` | — |

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `yukiMessage` | 按配置对象创建一条消息，直接传字符串时会当成 `message` | `options?: MessageOptions \| string \| VNode` | `MessageHandler`（含 `close()`） |
| `yukiMessage.success` | 成功类型的消息，等价于 `type` 为 `'success'` | 同上 | `MessageHandler` |
| `yukiMessage.warning` | 警告类型的消息 | 同上 | `MessageHandler` |
| `yukiMessage.info` | 普通消息 | 同上 | `MessageHandler` |
| `yukiMessage.error` | 错误类型的消息 | 同上 | `MessageHandler` |
| `yukiMessage.closeAll` | 关闭全部消息，传类型就只关这一种类型 | `type?: MessageType` | `void` |

返回值说明：这些方法都是同步返回，拿到的是 `MessageHandler`（只有一个 `close()` 方法）而不是 Promise，所以不需要 `await`。想等消息关掉之后再做事，用 `onClose` 回调。

注册相关：`app.use(yukiMessage)` 之后，选项式 API 里可以用 `this.$message.success('xx')`，组合式 API 里可以 `inject('yuki-message')` 拿到它。组件本体也以 `YukiMessage` 单独导出，需要标签式使用或者二次封装时可以用。

## API

### Props

组件式使用（`import { YukiMessage } from '@yuki/components/message'`）时的 props，和上面函数式调用的 options 完全一致：

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `message` | 消息文字，也可以传虚拟节点 | `string \| VNode \| (() => VNode)` | `''` |
| `type` | 消息类型 | `'success' \| 'warning' \| 'info' \| 'error'` | `'info'` |
| `duration` | 多久后自动关闭（毫秒），传 `0` 表示不自动关闭 | `number` | `3000` |
| `showClose` | 是否显示关闭按钮 | `boolean` | `false` |
| `center` | 文字是否居中 | `boolean` | `false` |
| `plain` | 朴素模式 | `boolean` | `false` |
| `dangerouslyUseHTMLString` | 把内容当 HTML 渲染，有 XSS 风险 | `boolean` | `false` |
| `offset` | 距离页面顶部的距离（px） | `number` | `20` |
| `zIndex` | 层级 | `number` | `0` |
| `grouping` | 分组：内容相同的消息合并 | `boolean` | `false` |
| `repeatNum` | 重复次数 | `number` | `1` |
| `onClose` | 关闭时的回调 | `() => void` | — |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `destroy` | 淡出动画播完、实例即将被卸载时触发（函数式调用的实现靠它清理容器） | — |

### Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 自定义消息内容，不传就渲染 `message` | — |

### 方法

`defineExpose` 暴露出来的方法，由函数式调用的实现内部使用（拿到 `MessageHandler` 之后一般只需要它的 `close()`）：

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| `close` | 关闭这条消息（会先触发 `onClose`） | — |
| `setTop` | 设置距离页面顶部的距离，堆叠算法用它排位置 | `top: number` |
| `resetTimer` | 重新开始计时（分组模式下又来了一条一样的消息时用） | — |
| `incRepeatNum` | 重复次数 +1 | — |
| `getEl` | 拿到根元素，用来测量高度、计算堆叠位置 | — |
| `visible` | 当前的显示状态 | — |
