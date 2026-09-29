# 标签 Tag

用来做标记和分类的小标签，支持五种主题色、三种风格（浅色 / 深色 / 描边）、可关闭和圆角。

## 基础用法

```vue
<template>
  <div class="row">
    <yuki-tag type="primary">primary</yuki-tag>
    <yuki-tag type="success">success</yuki-tag>
    <yuki-tag type="warning">warning</yuki-tag>
    <yuki-tag type="danger">danger</yuki-tag>
    <yuki-tag type="info">info</yuki-tag>
    <yuki-tag>默认</yuki-tag>
  </div>
</template>

<script setup lang="ts">
// 局部使用时的写法；main.ts 里 app.use(yukiTag) 之后这一行可以省略
import yukiTag from '@yuki/components/tag'
</script>
```

## 三种风格

`effect` 控制标签的视觉风格，默认是 `light`：

- `light`：浅色底 + 主题色文字
- `dark`：主题色实心底 + 白色文字
- `plain`：白底 + 主题色文字和描边

```vue
<template>
  <div class="row">
    <yuki-tag type="primary" effect="light">light</yuki-tag>
    <yuki-tag type="primary" effect="dark">dark</yuki-tag>
    <yuki-tag type="primary" effect="plain">plain</yuki-tag>
  </div>
</template>

<script setup lang="ts">
import yukiTag from '@yuki/components/tag'
</script>
```

## 尺寸

`size` 支持 `large` / `default` / `small`：

```vue
<template>
  <div class="row">
    <yuki-tag type="primary" size="large">大号</yuki-tag>
    <yuki-tag type="primary">默认</yuki-tag>
    <yuki-tag type="primary" size="small">小号</yuki-tag>
  </div>
</template>

<script setup lang="ts">
import yukiTag from '@yuki/components/tag'
</script>
```

## 可关闭

加上 `closable` 会在标签右边显示一个叉号。点叉号只触发 `close` 事件，不会冒泡出 `click`，所以你在 `close` 里删数据就行：

```vue
<template>
  <div class="row">
    <yuki-tag
      v-for="city in cities"
      :key="city"
      type="primary"
      closable
      @close="removeCity(city)"
    >
      {{ city }}
    </yuki-tag>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import yukiTag from '@yuki/components/tag'

const cities = ref(['北京', '上海', '广州'])

function removeCity(city: string) {
  cities.value = cities.value.filter(item => item !== city)
}
</script>
```

注意：组件只负责告诉你「叉号被点了」，真正的删除得自己在 `close` 里处理。

## 圆角

```vue
<template>
  <yuki-tag type="primary" round>圆角标签</yuki-tag>
</template>

<script setup lang="ts">
import yukiTag from '@yuki/components/tag'
</script>
```

## 关闭过渡动画

默认情况下标签的显示隐藏带过渡动画。如果外面用了 `v-for` 列表，删掉一条时其余标签会平滑移动；不想要这个效果就加 `disable-transitions`，组件会把 `transition` 设为 `none`。

## API

### Props

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `type` | 主题色 | `'' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `''` |
| `size` | 尺寸 | `'' \| 'large' \| 'default' \| 'small'` | `''` |
| `effect` | 风格：浅色底 / 深色实心 / 白底描边 | `'light' \| 'dark' \| 'plain'` | `'light'` |
| `closable` | 是否可关闭（显示右边的叉号） | `boolean` | `false` |
| `round` | 圆角标签（胶囊形状） | `boolean` | `false` |
| `disable-transitions` | 是否禁用过渡动画 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `click` | 点击标签时触发 | `evt: MouseEvent` |
| `close` | 点击关闭叉号时触发（不会同时触发 `click`） | `evt: MouseEvent` |

### Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 标签的文字内容 | — |
