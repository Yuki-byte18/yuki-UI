# 虚拟列表 VirtualList

只渲染看得见的那几条，所以哪怕数据有几万条，滚动依然很流畅。容器用一个「影子元素」撑出正确的滚动条高度，渲染出来的那几条整体平移到当前滚动位置。

## 基础用法

固定高度模式：给 `height`（容器高度）和 `item-height`（每一条的高度，单位 px），`item-key` 用来告诉组件拿数据里的哪个字段当 key：

```vue
<template>
  <yuki-virtual-list
    :data="list"
    :height="300"
    :item-height="56"
    item-key="id"
  >
    <template #default="{ item, index }">
      <div class="row">
        <span>{{ index + 1 }}</span>
        <span>{{ item.name }}</span>
      </div>
    </template>
  </yuki-virtual-list>
</template>

<script setup lang="ts">
// 局部使用时的写法；main.ts 里 app.use(yukiVirtualList) 之后这一行可以省略
import yukiVirtualList from '@yuki/components/virtual-list'

// 一万条数据也没问题
const list = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`
}))
</script>
```

## 自定义每一项

默认插槽的参数是 `{ item, index }`，`item` 是这一条的数据，`index` 是它在整个数组里的下标（不是可见条目里的序号）：

```vue
<template>
  <yuki-virtual-list :data="list" :height="300" :item-height="56" item-key="id">
    <template #default="{ item, index }">
      <div class="row" :class="{ 'row--alt': index % 2 === 1 }">
        <div class="name">{{ item.name }}</div>
        <div class="email">{{ item.email }}</div>
      </div>
    </template>
  </yuki-virtual-list>
</template>

<script setup lang="ts">
import yukiVirtualList from '@yuki/components/virtual-list'

const list = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  email: `user${i + 1}@yuki-ui.com`
}))
</script>
```

## 动态高度

每一项高度不一样的时候加上 `estimated`。这时 `item-height` 变成「预估高度」，组件会边渲染边用 `ResizeObserver` 量出真实高度，再重新计算每一条的位置；数据变化时会清掉旧的高度记录。

```vue
<template>
  <yuki-virtual-list
    :data="list"
    :height="300"
    :item-height="72"
    estimated
    item-key="id"
  >
    <template #default="{ item }">
      <div class="item">
        <div class="item__title">{{ item.title }}</div>
        <div class="item__desc">{{ item.desc }}</div>
      </div>
    </template>
  </yuki-virtual-list>
</template>

<script setup lang="ts">
import yukiVirtualList from '@yuki/components/virtual-list'

const list = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  title: `第 ${i + 1} 条数据`,
  desc: i % 3 === 0 ? '这是一条比较长的描述文字，会把这一项撑高一点。' : '短描述'
}))
</script>
```

动态高度模式下，如果项里的内容后面才变高（比如图片加载完成），可以调用下面「方法」里的 `update()` 手动触发一次重新测量。

## 触底加载更多

滚动到距离底部 `bottom-threshold`（默认 20px）以内时会触发 `reach-bottom`：

```vue
<template>
  <yuki-virtual-list
    :data="list"
    :height="300"
    :item-height="48"
    item-key="id"
    :bottom-threshold="40"
    @reach-bottom="loadMore"
  >
    <template #default="{ item }">
      <div class="row">{{ item.name }}</div>
    </template>
  </yuki-virtual-list>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import yukiVirtualList from '@yuki/components/virtual-list'

let seed = 50
const list = ref(
  Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `用户 ${i + 1}` }))
)

function loadMore() {
  // 注意：滚动过程中这个事件会反复触发，真实项目里记得加 loading 标记做节流
  list.value = list.value.concat(
    Array.from({ length: 20 }, () => ({ id: ++seed, name: `用户 ${seed}` }))
  )
}
</script>
```

`scroll` 事件会把当前滚动位置抛出来，需要自己做「滚动到顶部加载历史」之类的逻辑时用得上。

## 空数据

`data` 为空数组时显示 `empty-text`（默认「暂无数据」），也可以用 `empty` 插槽换成自己的空状态：

```vue
<template>
  <yuki-virtual-list :data="[]" :height="200">
    <template #empty>
      <span>一条数据都没有</span>
    </template>
  </yuki-virtual-list>
</template>

<script setup lang="ts">
import yukiVirtualList from '@yuki/components/virtual-list'
</script>
```

## 通过 ref 调用方法

```vue
<template>
  <div class="row">
    <yuki-button size="small" @click="listRef?.scrollToIndex(4999, 'center')">
      滚到第 5000 条
    </yuki-button>
    <yuki-button size="small" @click="listRef?.scrollToTop()">回到顶部</yuki-button>
    <yuki-button size="small" @click="listRef?.scrollToBottom()">滚到底部</yuki-button>
    <yuki-button size="small" @click="report">打印当前滚动位置</yuki-button>
  </div>

  <yuki-virtual-list ref="listRef" :data="list" :height="300" :item-height="56" item-key="id">
    <template #default="{ item }">
      <div class="row">{{ item.name }}</div>
    </template>
  </yuki-virtual-list>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import yukiVirtualList from '@yuki/components/virtual-list'
import yukiButton from '@yuki/components/button'

const listRef = ref<any>(null)

const list = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, name: `用户 ${i + 1}` }))

function report() {
  console.log('当前偏移量：', listRef.value?.getOffset())
  console.log('总高度：', listRef.value?.getTotalHeight())
}
</script>
```

## API

### Props

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `data` | 要渲染的全部数据 | `VirtualListItem[]` | `[]` |
| `height` | 列表容器的高度，数字按 `px` 处理，也可以传 `'60vh'` 这样的字符串 | `string \| number` | `400` |
| `item-height` | 每一项的高度（px）。固定高度模式下必须准确，动态高度模式下它只是预估高度 | `number` | `40` |
| `estimated` | 动态高度模式：每一项高度不一样，边渲染边测量真实高度 | `boolean` | `false` |
| `buffer` | 上下各多渲染几条做缓冲，快速滚动时不会看到白屏 | `number` | `4` |
| `item-key` | 每一项的 key 怎么取：传数据的字段名，或者传一个函数 | `string \| ((item, index) => string \| number)` | `''` |
| `empty-text` | 没有数据时显示的文字 | `string` | `'暂无数据'` |
| `bottom-threshold` | 距离底部多少 px 算「触底」，用来触发上拉加载更多 | `number` | `20` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `scroll` | 容器滚动时触发 | `{ scrollTop: number, scrollLeft: number }` |
| `reach-bottom` | 滚动到距离底部 `bottom-threshold` 以内时触发（滚动过程中会反复触发，建议自己做节流） | — |

### Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 每一条数据的渲染内容，不传就直接显示数据本身 | `{ item: any, index: number }`（`index` 是这条数据在整个数组里的下标） |
| `empty` | 没有数据时的内容，不传就显示 `empty-text` | — |

### 方法

通过 `ref` 拿到组件实例后可以调用：

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| `scrollToOffset` | 滚动到指定偏移量 | `offset: number`、`smooth = false`（是否平滑滚动） |
| `scrollToIndex` | 滚动到第 index 条，`align` 决定它出现在顶部 / 中间 / 底部 | `index: number`、`align: 'start' \| 'center' \| 'end' = 'start'` |
| `scrollToTop` | 滚回顶部 | — |
| `scrollToBottom` | 滚到底部 | — |
| `getOffset` | 拿到当前滚动距离 | — |
| `getTotalHeight` | 拿到所有数据撑出来的总高度 | — |
| `update` | 手动触发一次重新测量（比如项里的图片加载完了、高度变了） | — |
