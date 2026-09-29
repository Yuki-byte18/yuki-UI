# 按钮 Button

最常用的操作按钮，一个组件覆盖主题色、尺寸、朴素 / 圆角 / 圆形 / 文字 / 块级等形态，以及加载和禁用状态。

## 基础用法

```vue
<template>
  <div class="row">
    <yuki-button>默认按钮</yuki-button>
    <yuki-button type="primary" @click="onClick">主要按钮</yuki-button>
  </div>
</template>

<script setup lang="ts">
// 局部使用时的写法；main.ts 里 app.use(yukiButton) 之后这一行可以省略
import yukiButton from '@yuki/components/button'

function onClick(evt: MouseEvent) {
  console.log('点到了按钮', evt)
}
</script>
```

## 主题色

`type` 支持 `primary` / `success` / `warning` / `danger` / `info`，不传就是默认的白底灰框按钮。

```vue
<template>
  <div class="row">
    <yuki-button type="primary">主要</yuki-button>
    <yuki-button type="success">成功</yuki-button>
    <yuki-button type="warning">警告</yuki-button>
    <yuki-button type="danger">危险</yuki-button>
    <yuki-button type="info">信息</yuki-button>
  </div>
</template>

<script setup lang="ts">
import yukiButton from '@yuki/components/button'
</script>
```

## 尺寸

`size` 支持 `large` / `default` / `small`，不传时按默认尺寸渲染：

```vue
<template>
  <div class="row">
    <yuki-button size="large" type="primary">大号</yuki-button>
    <yuki-button type="primary">默认</yuki-button>
    <yuki-button size="small" type="primary">小号</yuki-button>
  </div>
</template>

<script setup lang="ts">
import yukiButton from '@yuki/components/button'
</script>
```

## 朴素、圆角与圆形

- `plain`：浅色背景 + 主题色文字和边框
- `round`：圆角按钮
- `circle`：正圆形，一般配合 `icon` 插槽只放一个图标

```vue
<template>
  <div class="row">
    <yuki-button type="primary" plain>朴素按钮</yuki-button>
    <yuki-button type="primary" round>圆角按钮</yuki-button>
    <yuki-button type="primary" circle>
      <template #icon>
        <AddCircle />
      </template>
    </yuki-button>
  </div>
</template>

<script setup lang="ts">
import { AddCircle } from '@vicons/ionicons5'
import yukiButton from '@yuki/components/button'
</script>
```

## 文字按钮与块级按钮

`link` 会去掉边框和背景，只留文字；`block` 让按钮宽度撑满父元素，适合移动端或者表单底部的操作。

```vue
<template>
  <div class="row">
    <yuki-button type="primary" link>文字按钮</yuki-button>
    <yuki-button type="primary" block>块级按钮</yuki-button>
  </div>
</template>

<script setup lang="ts">
import yukiButton from '@yuki/components/button'
</script>
```

## 加载与禁用

`loading` 为 true 时按钮显示转圈的 loading 图标，并且自动禁止点击；`disabled` 直接禁用。这两个状态下组件会在事件处理里拦掉点击，所以 `click` 事件不会触发，同时也会带上禁用样式。

```vue
<template>
  <div class="row">
    <yuki-button type="primary" loading>加载中</yuki-button>
    <yuki-button type="primary" disabled>禁用</yuki-button>
  </div>
</template>

<script setup lang="ts">
import yukiButton from '@yuki/components/button'
</script>
```

## 图标插槽

`icon` 插槽的内容会放在文字左边；`loading` 为 true 时优先显示 loading 图标：

```vue
<template>
  <yuki-button type="danger" plain>
    <template #icon>
      <TrashOutline />
    </template>
    删除
  </yuki-button>
</template>

<script setup lang="ts">
import { TrashOutline } from '@vicons/ionicons5'
import yukiButton from '@yuki/components/button'
</script>
```

## 渲染成别的标签

`tag` 决定按钮最终渲染成什么标签，默认是原生 `button`，想渲染成链接可以传 `'a'`，也可以传一个组件。

注意：只有渲染成原生 `button` 的时候，`disabled` / `type` / `autofocus` 这几个原生属性才会透传下去，避免渲染成 `a`、`div` 时 Vue 报「多余的属性」警告。原生 `type` 属性由 `native-type` 控制，默认 `button`。

## API

### Props

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `type` | 主题色，不传就是默认的白底灰框按钮 | `'' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `''` |
| `size` | 尺寸 | `'' \| 'large' \| 'default' \| 'small'` | `''` |
| `plain` | 朴素按钮：浅色背景 + 主题色文字 | `boolean` | `false` |
| `round` | 圆角按钮 | `boolean` | `false` |
| `circle` | 圆形按钮（一般搭配图标使用） | `boolean` | `false` |
| `link` | 文字按钮：没有边框和背景，只有文字 | `boolean` | `false` |
| `block` | 块级按钮：宽度撑满父元素 | `boolean` | `false` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `loading` | 是否加载中，会自动禁用点击并显示转圈图标 | `boolean` | `false` |
| `autofocus` | 是否自动获取焦点 | `boolean` | `false` |
| `native-type` | 原生 `type` 属性，仅在渲染成 `button` 时生效 | `'button' \| 'submit' \| 'reset'` | `'button'` |
| `tag` | 最终渲染成什么标签，想渲染成 `a` 就传 `'a'` | `string \| Component` | `'button'` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `click` | 点击按钮时触发；`disabled` 或 `loading` 时不会触发 | `evt: MouseEvent` |

### Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 按钮的文字内容 | — |
| `icon` | 按钮左边的图标内容 | — |
