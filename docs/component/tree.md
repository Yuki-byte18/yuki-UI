# 树形控件 Tree

用一份嵌套数据渲染出可以展开、勾选、选中的树。组件内部会把你的数据编译成一套带父子关系的节点模型，所以父子联动、半选状态这些都不用自己算。

## 基础用法

`data` 是树的原始数据，`node-key` 指定用数据里哪个字段当节点的唯一标识（默认是 `id`）。如果数据里没有这个字段，组件会退一步用它在这棵树里的路径当 key，比如 `'0-1'`。

```vue
<template>
  <yuki-tree :data="treeData" node-key="id" :default-expanded-keys="['1']" />
</template>

<script setup lang="ts">
// 局部使用时的写法；main.ts 里 app.use(yukiTree) 之后这一行可以省略
import yukiTree from '@yuki/components/tree'

const treeData = [
  {
    id: '1',
    label: '基础组件',
    children: [
      { id: '1-1', label: 'Button 按钮' },
      { id: '1-2', label: 'Icon 图标' }
    ]
  },
  { id: '2', label: '数据展示' }
]
</script>
```

## 字段映射

数据里的字段名不是 `label` / `children` 的时候，用 `props` 做映射，组件内部取字段（取文字、取子节点、取禁用状态、判断是否叶子）都会走这套映射：

```vue
<template>
  <yuki-tree
    :data="data"
    node-key="key"
    :props="{ label: 'name', children: 'childs', disabled: 'off', isLeaf: 'leaf' }"
  />
</template>

<script setup lang="ts">
import yukiTree from '@yuki/components/tree'

const data = [
  { key: 'a', name: '第一层', leaf: true }
]
</script>
```

`isLeaf` 只在数据里明确写了的时候生效，没写就看这个节点有没有子节点。

## 复选框与父子联动

加上 `show-checkbox` 会显示复选框。默认是联动模式：

- 勾上父节点，它的子孙节点一起被勾上
- 子节点全部勾上时，父节点自动变成勾选
- 子节点只勾了一部分时，父节点显示半选

打开 `check-strictly` 之后变成严格模式，父子各管各的，互不影响。

```vue
<template>
  <yuki-tree
    :data="treeData"
    node-key="id"
    show-checkbox
    :default-expanded-keys="['1']"
    :default-checked-keys="['1-1']"
    @check-change="onCheckChange"
    @check="onCheck"
  />
</template>

<script setup lang="ts">
import yukiTree from '@yuki/components/tree'

const treeData = [
  {
    id: '1',
    label: '基础组件',
    children: [
      { id: '1-1', label: 'Button 按钮' },
      { id: '1-2', label: 'Icon 图标' }
    ]
  }
]

function onCheckChange(data: any, checked: boolean) {
  console.log(`${data.label} ${checked ? '被勾选' : '被取消勾选'}`)
}

function onCheck(data: any, info: { checkedKeys: (string | number)[] }) {
  console.log('当前勾选了', info.checkedKeys.length, '个节点')
}
</script>
```

两个勾选事件的分工：`check-change` 是「某一个节点状态变了」，会在联动过程中触发；`check` 是「这一轮勾选结束了」，一次性给你勾选的 key / 节点和半选的 key / 节点，做提交的时候用这个。

## 默认展开与默认勾选

- `default-expanded-keys`：初始化时展开哪些节点
- `default-checked-keys`：初始化时勾选哪些节点
- `expand-all`：直接展开所有有子节点的节点

这三个都只在初始化（以及 `expand-all` 被切换）时生效。之后想再改，请通过 `ref` 调用下面「方法」里列出的方法。

## 选中与展开的交互

- `selectable`（默认 `true`）：节点能不能被选中。设为 `false` 就只剩展开 / 收起功能，`current-change` 也不再触发
- `highlight-current`（默认 `false`）：选中的节点要不要高亮
- `expand-on-click-node`（默认 `true`）：点击节点文字时是否顺带展开 / 收起
- `accordion`（默认 `false`）：手风琴模式，同一层级同时只能展开一个节点
- `show-line`：显示连接线；`indent`：每一层的缩进距离（px，默认 18）

```vue
<template>
  <yuki-tree
    :data="treeData"
    node-key="id"
    highlight-current
    accordion
    :indent="24"
    @current-change="onCurrentChange"
  />
</template>

<script setup lang="ts">
import yukiTree from '@yuki/components/tree'

const treeData = [
  { id: '1', label: '第一组', children: [{ id: '1-1', label: '子节点' }] },
  { id: '2', label: '第二组', children: [{ id: '2-1', label: '子节点' }] }
]

function onCurrentChange(data: any) {
  console.log('当前选中', data.label)
}
</script>
```

## 自定义节点内容

默认插槽会把每一层节点的文字换掉，参数是 `{ node, data }`，两个值都是当前节点的原始数据。因为是递归渲染，这个插槽对每一个节点都会生效：

```vue
<template>
  <yuki-tree :data="treeData" node-key="id" show-checkbox>
    <template #default="{ data }">
      <span class="tree-label">{{ data.label }}</span>
    </template>
  </yuki-tree>
</template>

<script setup lang="ts">
import yukiTree from '@yuki/components/tree'

const treeData = [{ id: '1', label: '自定义文字' }]
</script>
```

## 空数据

`data` 为空数组时显示 `empty-text`（默认「暂无数据」），也可以用 `empty` 插槽换成自己的空状态：

```vue
<template>
  <yuki-tree :data="[]">
    <template #empty>
      <span>这里什么都没有</span>
    </template>
  </yuki-tree>
</template>

<script setup lang="ts">
import yukiTree from '@yuki/components/tree'
</script>
```

## 通过 ref 调用方法

组件把常用操作都 `defineExpose` 出来了，拿到组件实例就能直接调：

```vue
<template>
  <div class="row">
    <yuki-button size="small" @click="treeRef?.expandAllNodes()">展开全部</yuki-button>
    <yuki-button size="small" @click="treeRef?.collapseAllNodes()">收起全部</yuki-button>
    <yuki-button size="small" type="primary" @click="getChecked">获取选中的节点</yuki-button>
    <yuki-button size="small" type="success" @click="treeRef?.setCheckedKeys(['1-1', '2'])">
      选中指定节点
    </yuki-button>
  </div>

  <yuki-tree ref="treeRef" :data="treeData" node-key="id" show-checkbox />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import yukiTree from '@yuki/components/tree'
import yukiButton from '@yuki/components/button'

const treeRef = ref<any>(null)

const treeData = [
  { id: '1', label: '第一组', children: [{ id: '1-1', label: '子节点' }] },
  { id: '2', label: '第二组' }
]

function getChecked() {
  console.log('勾选的 key：', treeRef.value?.getCheckedKeys() ?? [])
  console.log('勾选的节点：', treeRef.value?.getCheckedNodes() ?? [])
}
</script>
```

## API

### Props

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `data` | 树的原始数据，每一项都可以通过 `children` 字段嵌套 | `TreeNodeData[]` | `[]` |
| `props` | 字段映射：配置 `label` / `children` / `disabled` / `isLeaf` 分别对应数据里的哪个字段 | `TreeOptionProps` | `{}` |
| `node-key` | 用数据里的哪个字段当节点的唯一标识 | `string` | `'id'` |
| `empty-text` | 没有数据时显示的文字 | `string` | `'暂无数据'` |
| `expand-all` | 是否默认展开全部节点 | `boolean` | `false` |
| `default-expanded-keys` | 默认展开哪些节点（key 数组） | `TreeKey[]` | `[]` |
| `default-checked-keys` | 默认勾选哪些节点（key 数组） | `TreeKey[]` | `[]` |
| `show-checkbox` | 是否显示复选框 | `boolean` | `false` |
| `check-strictly` | 严格模式：父子勾选不联动，各管各的 | `boolean` | `false` |
| `accordion` | 手风琴模式：同一层级同时只能展开一个节点 | `boolean` | `false` |
| `selectable` | 节点是否可选中（不可选中就只有展开功能） | `boolean` | `true` |
| `highlight-current` | 是否高亮当前选中的节点 | `boolean` | `false` |
| `expand-on-click-node` | 点击节点文字是否也展开 / 收起节点 | `boolean` | `true` |
| `show-line` | 是否显示连接线 | `boolean` | `false` |
| `indent` | 每一层的缩进距离（px） | `number` | `18` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `node-click` | 点击节点时触发（节点被禁用时不触发） | `data: TreeNodeData`、`node: TreeNodeModel`、`evt: MouseEvent` |
| `node-contextmenu` | 在节点上右键时触发 | `evt: MouseEvent`、`data: TreeNodeData`、`node: TreeNodeModel` |
| `check-change` | 某个节点的勾选状态变化时触发（联动模式下会多次触发） | `data: TreeNodeData`、`checked: boolean`、`indeterminate: boolean`（当前实现固定为 `false`） |
| `check` | 一轮勾选结束后触发，一次性给出勾选与半选的结果 | `data: TreeNodeData`、`info: { checkedKeys, checkedNodes, halfCheckedKeys, halfCheckedNodes }` |
| `current-change` | 当前选中的节点变化时触发 | `data: TreeNodeData`、`node: TreeNodeModel` |
| `expand-change` | 节点展开 / 收起时触发 | `data: TreeNodeData`、`expanded: boolean`、`node: TreeNodeModel` |

### Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 自定义每个节点显示的内容，会替换掉默认的 `label` 文字 | `{ node: TreeNodeData, data: TreeNodeData }`（两个值都是当前节点的原始数据） |
| `empty` | 没有数据时的内容，不传就显示 `empty-text` | — |

### 方法

通过 `ref` 拿到组件实例后可以调用：

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| `getCheckedKeys` | 拿到所有被勾选节点的 key，传 `true` 只返回叶子节点 | `leafOnly?: boolean` |
| `getCheckedNodes` | 拿到所有被勾选节点的数据，传 `true` 只返回叶子节点 | `leafOnly?: boolean` |
| `getHalfCheckedKeys` | 拿到所有半选节点的 key | — |
| `getHalfCheckedNodes` | 拿到所有半选节点的数据 | — |
| `setCheckedKeys` | 重新设置被勾选的节点（会先清空已有勾选） | `keys: TreeKey[]` |
| `setChecked` | 设置某一个节点的勾选状态 | `key: TreeKey`、`checked: boolean`、`deep = true`（子孙是否跟着变） |
| `getCurrentKey` | 拿到当前选中节点的 key，没有就返回 `null` | — |
| `getCurrentNode` | 拿到当前选中节点的数据，没有就返回 `null` | — |
| `setCurrentKey` | 设置当前选中的节点 key | `key: TreeKey \| null` |
| `setCurrentNode` | 按节点数据设置当前选中项（数据不在树里就清空选中） | `data: TreeNodeData` |
| `getNode` | 按 key 拿到内部节点模型（里面能拿到 `parent` / `children` / `level` / `disabled`） | `key: TreeKey` |
| `expandAllNodes` | 展开所有有子节点的节点 | — |
| `collapseAllNodes` | 收起全部节点 | — |
| `setExpandAll` | 传 `true` 展开全部，传 `false` 收起全部 | `flag: boolean` |
