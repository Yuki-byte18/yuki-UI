<script setup lang="ts">
import { ref } from 'vue'
import {
  AddCircle,
  CheckmarkCircle,
  CloudUploadOutline,
  HeartOutline,
  RefreshOutline,
  RocketOutline,
  SearchOutline,
  SettingsOutline,
  SparklesOutline,
  StarOutline,
  TrashOutline
} from '@vicons/ionicons5'
// 函数式组件：import 进来直接调用(main.ts 里 use 过之后 this.$message 也能用)
import yukiMessage from '@yuki/components/message'
import yukiMessageBox from '@yuki/components/message-box'
import type { MessageType } from '@yuki/components/message'

//=====================================================================
//树组件的数据和事件
//=====================================================================
const treeData = [
  {
    id: '1',
    label: '基础组件',
    children: [
      {
        id: '1-1',
        label: 'Button 按钮',
        children: [
          { id: '1-1-1', label: '主题色 / 朴素 / 圆角' },
          { id: '1-1-2', label: '尺寸 / 加载 / 禁用' }
        ]
      },
      { id: '1-2', label: 'Icon 图标' },
      { id: '1-3', label: 'Tag 标签' }
    ]
  },
  {
    id: '2',
    label: '数据展示',
    children: [
      { id: '2-1', label: 'Tree 树形控件' },
      { id: '2-2', label: 'VirtualList 虚拟列表' },
      { id: '2-3', label: 'Table 表格(还没写)', disabled: true }
    ]
  },
  {
    id: '3',
    label: '反馈组件',
    children: [
      { id: '3-1', label: 'Message 消息提示' },
      { id: '3-2', label: 'MessageBox 消息弹窗' }
    ]
  }
]

//树组件实例(用来演示通过 ref 调用组件暴露出来的方法)
const treeRef = ref<any>(null)

//事件日志：把组件抛出来的事件显示在页面上 方便看
const logs = ref<string[]>([])

function log(text: string) {
  logs.value.unshift(text)
  if (logs.value.length > 6) logs.value.pop()
}

function onNodeClick(data: any) {
  log(`node-click：点击了「${data.label}」`)
}

function onCheckChange(data: any, checked: boolean) {
  log(`check-change：「${data.label}」${checked ? '被勾选' : '被取消勾选'}`)
}

function onCheck(_data: any, info: { checkedKeys: (string | number)[] }) {
  log(`check：当前选中 ${info.checkedKeys.length} 个节点`)
}

//可关闭标签的演示数据
const cities = ref(['北京', '上海', '广州'])

function removeCity(city: string) {
  cities.value = cities.value.filter(item => item !== city)
  log(`标签：关闭了「${city}」`)
}

//声明式弹窗的操作回调
function onBoxAction(action: string) {
  log(`message-box：点了 ${action}`)
}

function getChecked() {
  const keys = treeRef.value?.getCheckedKeys() ?? []
  yukiMessage.info(`选中的节点：${keys.length ? keys.join('、') : '（空）'}`)
}

//=====================================================================
//消息提示
//=====================================================================
const messageTypeText: Record<MessageType, string> = {
  success: '操作成功',
  warning: '警告信息',
  info: '普通消息',
  error: '操作失败'
}

function showMessage(type: MessageType) {
  yukiMessage({
    message: `${messageTypeText[type]}：这是一条 ${type} 类型的消息`,
    type,
    showClose: true
  })
}

function showCustomMessage() {
  yukiMessage({
    message: '内容居中 + 2秒后自动关闭',
    type: 'success',
    center: true,
    plain: true,
    duration: 2000
  })
}

function showGroupingMessage() {
  // 分组模式：内容一样的消息会合并成一条 右上角显示次数
  yukiMessage({
    message: '这条消息会被合并显示(连点几次试试)',
    type: 'warning',
    grouping: true,
    duration: 2500
  })
}

//=====================================================================
//消息弹窗
//=====================================================================
//声明式用法的显示状态
const boxVisible = ref(false)

function showAlert() {
  yukiMessageBox.alert('这是一条普通的提示信息，只有一个确定按钮。', '提示', {
    type: 'info'
  })
}

async function showConfirm() {
  const res = await yukiMessageBox.confirm(
    '确定要删除这条记录吗？删除之后不可恢复。',
    '删除确认',
    {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '再想想'
    }
  )
  res.action === 'confirm'
    ? yukiMessage.success('已经删掉了')
    : yukiMessage.info('取消了操作')
}

async function showPrompt() {
  const res = await yukiMessageBox.prompt('请输入你的昵称(2到8个字符)', '昵称设置', {
    inputPlaceholder: '比如：yuki',
    inputPattern: /^.{2,8}$/,
    inputErrorMessage: '昵称长度要在 2 到 8 个字符之间'
  })
  if (res.action === 'confirm') {
    yukiMessage.success(`你好，${res.value}！`)
  }
}

//=====================================================================
//虚拟列表
//=====================================================================
const bigList = ref(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `用户 ${i + 1}`,
    email: `user${i + 1}@yuki-ui.com`,
    city: ['北京', '上海', '广州', '深圳'][i % 4]
  }))
)

//动态高度的数据：描述文字长短不一样 每一条的高度都不一样
const dynamicList = ref(
  Array.from({ length: 2000 }, (_, i) => ({
    id: i + 1,
    title: `第 ${i + 1} 条数据`,
    desc:
      i % 3 === 0
        ? '这是一条比较长的描述文字，用来把这一项撑高一点，测试虚拟列表的动态高度模式能不能正确处理。'
        : i % 3 === 1
          ? '中等长度的描述文字。'
          : '短描述'
  }))
)

const bigListRef = ref<any>(null)
const dynamicListRef = ref<any>(null)
const bottomCount = ref(0)

function scrollToMiddle() {
  bigListRef.value?.scrollToIndex(4999, 'center')
  log('虚拟列表：滚动到第 5000 条')
}

function onReachBottom() {
  bottomCount.value++
}
</script>

<template>
  <div class="page">
    <!-- 顶部标题 -->
    <header class="hero">
      <h1 class="hero__title">YUKI-UI</h1>
      <p class="hero__desc">基于 Vue 3 + TypeScript + SCSS 的组件库 · 组件演示</p>
      <div class="hero__tags">
        <yuki-tag effect="dark" type="primary" round>pnpm monorepo</yuki-tag>
        <yuki-tag effect="light" type="success" round>BEM 命名规范</yuki-tag>
        <yuki-tag effect="plain" type="warning" round>按需引入</yuki-tag>
      </div>
    </header>

    <main class="grid">
      <!-- ==================== Icon ==================== -->
      <section class="card">
        <h2 class="card__title">Icon 图标</h2>
        <p class="card__hint">支持颜色 / 尺寸 / 旋转，插槽里放任意图标组件</p>
        <div class="row">
          <yuki-icon :size="30" color="var(--yuki-color-primary)"><RocketOutline /></yuki-icon>
          <yuki-icon :size="30" color="var(--yuki-color-success)"><CheckmarkCircle /></yuki-icon>
          <yuki-icon :size="30" color="var(--yuki-color-warning)"><SparklesOutline /></yuki-icon>
          <yuki-icon :size="30" color="var(--yuki-color-danger)"><HeartOutline /></yuki-icon>
          <yuki-icon :size="30" color="var(--yuki-color-info)"><SettingsOutline /></yuki-icon>
          <yuki-icon :size="30" spin color="var(--yuki-color-primary)"><RefreshOutline /></yuki-icon>
        </div>
      </section>

      <!-- ==================== Button ==================== -->
      <section class="card">
        <h2 class="card__title">Button 按钮</h2>
        <p class="card__hint">主题色 / 朴素 / 圆角 / 圆形 / 文字 / 加载 / 禁用</p>
        <div class="row row--wrap">
          <yuki-button type="primary">主要按钮</yuki-button>
          <yuki-button type="success">成功</yuki-button>
          <yuki-button type="warning">警告</yuki-button>
          <yuki-button type="danger">危险</yuki-button>
          <yuki-button type="info">信息</yuki-button>
          <yuki-button>默认</yuki-button>
        </div>
        <div class="row row--wrap">
          <yuki-button type="primary" plain>朴素按钮</yuki-button>
          <yuki-button type="primary" round>圆角</yuki-button>
          <yuki-button type="primary" link>文字按钮</yuki-button>
          <yuki-button type="primary" disabled>禁用</yuki-button>
          <yuki-button type="primary" loading>加载中</yuki-button>
        </div>
        <div class="row row--wrap">
          <yuki-button size="large" type="primary">大号</yuki-button>
          <yuki-button size="small" type="primary">小号</yuki-button>
          <yuki-button type="primary" circle><AddCircle /></yuki-button>
          <yuki-button type="danger" plain>
            <template #icon><TrashOutline /></template>
            带图标
          </yuki-button>
        </div>
      </section>

      <!-- ==================== Tag ==================== -->
      <section class="card">
        <h2 class="card__title">Tag 标签</h2>
        <p class="card__hint">三种风格(light / dark / plain) · 可关闭 · 可圆角</p>
        <div class="row row--wrap">
          <yuki-tag type="primary">primary</yuki-tag>
          <yuki-tag type="success">success</yuki-tag>
          <yuki-tag type="warning">warning</yuki-tag>
          <yuki-tag type="danger">danger</yuki-tag>
          <yuki-tag type="info">info</yuki-tag>
          <yuki-tag>默认</yuki-tag>
        </div>
        <div class="row row--wrap">
          <yuki-tag type="primary" effect="dark">dark</yuki-tag>
          <yuki-tag type="success" effect="dark">dark</yuki-tag>
          <yuki-tag type="warning" effect="plain">plain</yuki-tag>
          <yuki-tag type="danger" effect="plain" round>圆角标签</yuki-tag>
          <yuki-tag type="primary" size="large">大号</yuki-tag>
          <yuki-tag type="primary" size="small">小号</yuki-tag>
        </div>
        <div class="row row--wrap">
          <yuki-tag
            v-for="city in cities"
            :key="city"
            type="primary"
            closable
            round
            @close="removeCity(city)"
          >
            {{ city }}
          </yuki-tag>
        </div>
      </section>

      <!-- ==================== Tree ==================== -->
      <section class="card card--wide">
        <h2 class="card__title">Tree 树形控件</h2>
        <p class="card__hint">
          递归渲染 · 复选框父子联动 · 半选状态 · 默认展开/勾选 · 自定义节点插槽
        </p>
        <div class="row row--wrap">
          <yuki-button size="small" @click="treeRef?.expandAllNodes()">展开全部</yuki-button>
          <yuki-button size="small" @click="treeRef?.collapseAllNodes()">收起全部</yuki-button>
          <yuki-button size="small" type="primary" @click="getChecked()">获取选中的节点</yuki-button>
          <yuki-button size="small" type="success" @click="treeRef?.setCheckedKeys(['1-1', '2-1'])">
            选中指定节点
          </yuki-button>
        </div>

        <div class="tree-demo">
          <yuki-tree
            ref="treeRef"
            :data="treeData"
            node-key="id"
            show-checkbox
            highlight-current
            :default-expanded-keys="['1', '2']"
            :default-checked-keys="['1-2']"
            @node-click="onNodeClick"
            @check-change="onCheckChange"
            @check="onCheck"
          >
            <template #default="{ data }">
              <span class="tree-label">
                {{ data.label }}
                <em v-if="data.disabled" class="tree-label__badge">禁用</em>
              </span>
            </template>
          </yuki-tree>
        </div>
      </section>

      <!-- ==================== Message ==================== -->
      <section class="card">
        <h2 class="card__title">Message 消息提示</h2>
        <p class="card__hint">函数式调用 · 自动堆叠 · 自动关闭 · 分组合并</p>
        <div class="row row--wrap">
          <yuki-button type="success" plain @click="showMessage('success')">成功</yuki-button>
          <yuki-button type="warning" plain @click="showMessage('warning')">警告</yuki-button>
          <yuki-button plain @click="showMessage('info')">消息</yuki-button>
          <yuki-button type="danger" plain @click="showMessage('error')">错误</yuki-button>
        </div>
        <div class="row row--wrap">
          <yuki-button size="small" @click="showCustomMessage">居中 + 朴素</yuki-button>
          <yuki-button size="small" @click="showGroupingMessage">分组合并(连点)</yuki-button>
          <yuki-button size="small" type="danger" link @click="yukiMessage.closeAll()">
            关闭全部
          </yuki-button>
        </div>
      </section>

      <!-- ==================== MessageBox ==================== -->
      <section class="card">
        <h2 class="card__title">MessageBox 消息弹窗</h2>
        <p class="card__hint">alert / confirm / prompt · Promise 返回结果 · 也能声明式使用</p>
        <div class="row row--wrap">
          <yuki-button @click="showAlert">alert 提示</yuki-button>
          <yuki-button type="warning" @click="showConfirm">confirm 确认</yuki-button>
          <yuki-button type="primary" @click="showPrompt">prompt 输入</yuki-button>
          <yuki-button type="success" plain @click="boxVisible = true">声明式用法</yuki-button>
        </div>

        <!-- 声明式用法：v-model 控制显示 -->
        <yuki-message-box
          v-model="boxVisible"
          title="声明式弹窗"
          type="success"
          @action="onBoxAction"
        >
          我是直接写在模板里的弹窗，用 v-model 控制显示隐藏。
        </yuki-message-box>
      </section>

      <!-- ==================== VirtualList ==================== -->
      <section class="card card--wide">
        <h2 class="card__title">VirtualList 虚拟列表</h2>
        <p class="card__hint">
          1 万条数据只渲染看得见的十几条 · 动态高度模式(estimated) · 触底加载
        </p>

        <div class="two-col">
          <div>
            <div class="sub-title">固定高度（10000 条）</div>
            <div class="row row--wrap">
              <yuki-button size="small" @click="scrollToMiddle">滚到第 5000 条</yuki-button>
              <yuki-button size="small" @click="bigListRef?.scrollToTop()">回到顶部</yuki-button>
              <yuki-tag type="info" size="small">触底次数：{{ bottomCount }}</yuki-tag>
            </div>
            <yuki-virtual-list
              ref="bigListRef"
              class="vlist"
              :data="bigList"
              :height="300"
              :item-height="56"
              item-key="id"
              @reach-bottom="onReachBottom"
            >
              <template #default="{ item, index }">
                <div class="vlist-row" :class="{ 'vlist-row--alt': index % 2 === 1 }">
                  <span class="vlist-row__index">{{ index + 1 }}</span>
                  <div class="vlist-row__main">
                    <div class="vlist-row__name">{{ item.name }}</div>
                    <div class="vlist-row__email">{{ item.email }}</div>
                  </div>
                  <yuki-tag type="primary" size="small">{{ item.city }}</yuki-tag>
                </div>
              </template>
            </yuki-virtual-list>
          </div>

          <div>
            <div class="sub-title">动态高度（2000 条，高度不一致）</div>
            <div class="row row--wrap">
              <yuki-button size="small" @click="dynamicListRef?.scrollToIndex(1000, 'start')">
                滚到第 1000 条
              </yuki-button>
              <yuki-button size="small" @click="dynamicListRef?.scrollToBottom()">滚到底部</yuki-button>
            </div>
            <yuki-virtual-list
              ref="dynamicListRef"
              class="vlist"
              :data="dynamicList"
              :height="300"
              :item-height="72"
              estimated
              item-key="id"
            >
              <template #default="{ item }">
                <div class="vlist-dyn">
                  <div class="vlist-dyn__title">{{ item.title }}</div>
                  <div class="vlist-dyn__desc">{{ item.desc }}</div>
                </div>
              </template>
            </yuki-virtual-list>
          </div>
        </div>
      </section>

      <!-- ==================== 事件日志 ==================== -->
      <section class="card">
        <h2 class="card__title">事件日志</h2>
        <p class="card__hint">组件抛出来的事件都会显示在这里</p>
        <ul class="logs">
          <li v-if="logs.length === 0" class="logs__empty">还没有任何操作</li>
          <li v-for="(item, index) in logs" :key="index" class="logs__item">
            <SearchOutline class="logs__icon" />
            {{ item }}
          </li>
        </ul>
        <div class="row">
          <yuki-icon :size="16" color="var(--yuki-text-color-secondary)"><StarOutline /></yuki-icon>
          <yuki-tag size="small" effect="plain">共 {{ logs.length }} 条日志</yuki-tag>
          <yuki-icon :size="16" color="var(--yuki-text-color-secondary)">
            <CloudUploadOutline />
          </yuki-icon>
        </div>
      </section>
    </main>

    <footer class="footer">YUKI-UI · 用 Vue 3 手写的组件库</footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 0 48px;
  background:
    radial-gradient(circle at 12% 0%, rgba(99, 102, 241, 0.14), transparent 42%),
    radial-gradient(circle at 88% 8%, rgba(16, 185, 129, 0.12), transparent 38%),
    var(--yuki-bg-color-page);
  color: var(--yuki-text-color-primary);
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Microsoft YaHei',
    Arial, sans-serif;
}

.hero {
  padding: 56px 32px 32px;
  text-align: center;
}

.hero__title {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  letter-spacing: 2px;
  background: linear-gradient(120deg, #6366f1, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero__desc {
  margin: 10px 0 16px;
  color: var(--yuki-text-color-secondary);
  font-size: 14px;
}

.hero__tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
}

.card {
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 26px rgba(31, 35, 41, 0.06);
}

.card--wide {
  grid-column: 1 / -1;
}

.card__title {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 700;
}

.card__hint {
  margin: 0 0 16px;
  color: var(--yuki-text-color-secondary);
  font-size: 12.5px;
  line-height: 1.6;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.row--wrap {
  flex-wrap: wrap;
}

.sub-title {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--yuki-text-color-regular);
}

.tree-demo {
  max-height: 320px;
  overflow: auto;
  padding: 10px;
  border: 1px solid var(--yuki-border-color-lighter);
  border-radius: 10px;
  background: var(--yuki-fill-color-blank);
}

.tree-label__badge {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--yuki-fill-color);
  color: var(--yuki-text-color-secondary);
  font-size: 11px;
  font-style: normal;
}

.two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.vlist {
  border: 1px solid var(--yuki-border-color-lighter);
  border-radius: 10px;
  background: var(--yuki-fill-color-blank);
}

.vlist-row {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  padding: 0 12px;
  border-bottom: 1px solid var(--yuki-border-color-lighter);
}

.vlist-row--alt {
  background: #fafbff;
}

.vlist-row__index {
  width: 52px;
  color: var(--yuki-text-color-placeholder);
  font-size: 12px;
}

.vlist-row__main {
  flex: 1;
  min-width: 0;
}

.vlist-row__name {
  font-size: 13.5px;
  font-weight: 600;
}

.vlist-row__email {
  color: var(--yuki-text-color-secondary);
  font-size: 12px;
}

.vlist-dyn {
  padding: 10px 12px;
  border-bottom: 1px solid var(--yuki-border-color-lighter);
}

.vlist-dyn__title {
  font-size: 13.5px;
  font-weight: 600;
}

.vlist-dyn__desc {
  margin-top: 4px;
  color: var(--yuki-text-color-secondary);
  font-size: 12.5px;
  line-height: 1.6;
}

.logs {
  min-height: 134px;
  margin: 0 0 12px;
  padding: 10px 12px;
  list-style: none;
  border: 1px dashed var(--yuki-border-color);
  border-radius: 10px;
  background: var(--yuki-fill-color-lighter);
}

.logs__empty {
  color: var(--yuki-text-color-placeholder);
  font-size: 12.5px;
}

.logs__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  color: var(--yuki-text-color-regular);
  font-size: 12.5px;
}

.logs__icon {
  width: 13px;
  height: 13px;
  color: var(--yuki-color-primary);
}

.footer {
  margin-top: 34px;
  color: var(--yuki-text-color-secondary);
  font-size: 12.5px;
  text-align: center;
}

@media (max-width: 900px) {
  .grid,
  .two-col {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
