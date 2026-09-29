# 图标 Icon

`yuki-icon` 是一个图标外壳：它自己不带任何图形，只负责把插槽里的 svg 或图标组件统一成「能调大小、能调颜色、能转圈」的样子。

## 基础用法

插槽里放任意图标组件，比如 `@vicons/ionicons5`：

```vue
<template>
  <div class="row">
    <yuki-icon :size="30" color="var(--yuki-color-primary)">
      <RocketOutline />
    </yuki-icon>
    <yuki-icon :size="30" color="var(--yuki-color-success)">
      <CheckmarkCircle />
    </yuki-icon>
  </div>
</template>

<script setup lang="ts">
import { RocketOutline, CheckmarkCircle } from '@vicons/ionicons5'
// 局部使用时的写法；main.ts 里 app.use(yukiIcon) 之后这一行可以省略
import yukiIcon from '@yuki/components/icon'
</script>
```

## 尺寸与颜色

`size` 传数字时组件会自动拼上 `px`，也可以直接传字符串（比如 `'1.5em'`）。

`color` 只要是合法的 CSS 颜色都行，推荐直接用组件库的 CSS 变量（`var(--yuki-color-primary)` 这一类），这样换主题的时候图标颜色会自动跟着变。

两个属性都不传时，组件不会生成任何多余的行内样式。

## 旋转

加上 `spin` 之后图标会一直转圈，一般配合刷新、加载类的图标当 loading 用：

```vue
<template>
  <yuki-icon :size="24" spin color="var(--yuki-color-primary)">
    <RefreshOutline />
  </yuki-icon>
</template>

<script setup lang="ts">
import { RefreshOutline } from '@vicons/ionicons5'
import yukiIcon from '@yuki/components/icon'
</script>
```

按钮的 `loading` 状态用的就是同一个旋转类名（`yuki-icon-spin`），所以图标和按钮的 loading 动画看起来是一致的。

## API

### Props

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `color` | 图标颜色，任意合法 CSS 颜色 | `string` | — |
| `size` | 图标大小，数字按 `px` 处理 | `string \| number` | — |
| `spin` | 是否让图标旋转（加载类图标用） | `boolean` | `false` |

### Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 图标内容，放 svg 或任意图标组件 | — |
