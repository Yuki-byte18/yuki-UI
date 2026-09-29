import { createVNode, isVNode, nextTick, render } from 'vue'
import Message from './message.vue'
import type {
  MessageContext,
  MessageHandler,
  MessageOptions,
  MessageParams,
  MessageProps,
  MessageType
} from './message'

//=====================================================================
//函数式调用(message)的核心：实例管理
//组件式注册是 app.component() 那函数式组件就是自己手动 createVNode + render
//因为 message 是"用完就扔"的 不需要写在模板里 所以要自己管理创建和销毁
//=====================================================================

//所有活着的消息 数组顺序 = 从上到下的顺序
const instances: MessageContext[] = []

//自增的id 用来找实例 / 也顺手当dom的id方便调试
let seed = 1
//自增的层级 后面的消息盖住前面的
let zIndexSeed = 3000

//两条消息之间的间距
const GAP = 16
//第一条消息距离页面顶部的距离
const START_TOP = 20

//把"字符串 / 虚拟节点 / 配置对象"统一成配置对象
function normalize(options: MessageParams): MessageOptions {
  if (typeof options === 'string' || isVNode(options)) {
    return { message: options }
  }
  return options
}

//重新计算所有消息的位置：
//从上往下一条条摆 上一条的top + 上一条的高度 + 间距 = 这一条的top
//所以中间删掉一条 后面的会自动往上挪(有css transition 所以是平滑移动的)
function updateOffsets() {
  let top = START_TOP
  instances.forEach(ctx => {
    const el = ctx.vm?.exposed?.getEl?.() as HTMLElement | undefined
    if (el) {
      ctx.vm.exposed.setTop(top)
      top += (el.offsetHeight || 0) + GAP
    }
  })
}

//卸载一条消息(过渡动画播完 message.vue 会 emit destroy 然后走到这里)
function destroyMessage(id: string) {
  const index = instances.findIndex(ctx => ctx.id === id)
  if (index === -1) return

  const ctx = instances[index]
  instances.splice(index, 1)
  //render(null) 就是卸载组件
  render(null, ctx.container)
  ctx.container.remove()
  //重新排一下剩下消息的位置
  nextTick().then(updateOffsets)
}

//创建一条消息
export function createMessage(options: MessageParams = {}): MessageHandler {
  const normalized = normalize(options)

  //分组模式：内容和类型都一样的消息不重复创建 只把次数+1 并重新计时
  if (normalized.grouping) {
    const same = instances.find(
      ctx =>
        ctx.props.message === normalized.message &&
        ctx.props.type === (normalized.type || 'info')
    )
    if (same) {
      same.vm?.exposed?.incRepeatNum?.()
      same.vm?.exposed?.resetTimer?.()
      return same.handler
    }
  }

  const id = `yuki-message-${seed++}`

  //每条消息一个独立的容器 div 直接挂在 body 上
  //好处：不会被使用者的父元素 overflow:hidden 切掉 也不受父元素定位影响
  const container = document.createElement('div')
  const vnode = createVNode(Message, {
    ...normalized,
    id,
    zIndex: zIndexSeed++,
    //过渡动画播完 组件会 emit('destroy') 这里接住它去卸载
    onDestroy: () => destroyMessage(id)
  })

  render(vnode, container)
  document.body.appendChild(container)

  const handler: MessageHandler = {
    close: () => vnode.component?.exposed?.close?.()
  }

  const ctx: MessageContext = {
    id,
    vnode,
    //vnode.component 就是组件实例 能拿到暴露出来的东西和最终的props(带默认值)
    vm: vnode.component,
    props: vnode.component!.props as unknown as MessageProps,
    handler,
    container
  }
  instances.push(ctx)

  //等这一次渲染完 dom 有了高度 再算位置
  nextTick().then(updateOffsets)

  return handler
}

//关闭全部消息(传了type就只关这一种类型的)
export function closeAll(type?: MessageType) {
  instances.slice().forEach(ctx => {
    if (!type || ctx.props.type === type) {
      ctx.handler.close()
    }
  })
}
