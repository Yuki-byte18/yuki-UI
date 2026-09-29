import { createVNode, render } from 'vue'
import MessageBox from './message-box.vue'
import type {
  MessageBoxAction,
  MessageBoxContent,
  MessageBoxData,
  MessageBoxOptions
} from './message-box'

//=====================================================================
//函数式调用(messageBox)的核心：把弹窗挂到body上 用Promise把结果返回给使用者
//用法：
//  await yukiMessageBox.confirm('确定要删除吗？')
//  await yukiMessageBox.prompt('请输入名字', '提示', { inputPattern: /^\w+$/ })
//=====================================================================

//活着的弹窗 用于 closeAll
interface MessageBoxInstance {
  id: string
  close: () => void
}

const instances: MessageBoxInstance[] = []

let seed = 1
let zIndexSeed = 4000

//创建并打开一个弹窗 返回Promise(点了确定/取消/关闭之后 resolve)
export function createMessageBox(
  options: MessageBoxOptions = {}
): Promise<MessageBoxData> {
  return new Promise(resolve => {
    const id = `yuki-message-box-${seed++}`
    const container = document.createElement('div')

    //callback 和 distinguishCancelAndClose 只有函数式调用才有
    //必须挑出来 不能传给组件(不然会变成dom上的垃圾属性)
    const { callback, distinguishCancelAndClose, ...rest } = options

    let action: MessageBoxAction = 'cancel'
    let vm: any = null

    //读输入框里的内容
    const getValue = (): string => {
      const value = vm?.exposed?.getInputValue?.()
      return typeof value === 'string' ? value : rest.inputValue ?? ''
    }

    const vnode = createVNode(MessageBox, {
      ...rest,
      zIndex: rest.zIndex ?? zIndexSeed++,
      //先按"关闭"渲染 再调用 open() 这样才有打开动画
      modelValue: false,
      onAction: (a: MessageBoxAction) => {
        //不开"区分取消和关闭"的时候 点叉/点遮罩也算取消
        action = a === 'close' && !distinguishCancelAndClose ? 'cancel' : a
        callback?.(action, getValue())
      },
      onVanish: () => {
        //先把值取出来 再把组件卸载掉
        const value = getValue()
        render(null, container)
        container.remove()

        const index = instances.findIndex(instance => instance.id === id)
        if (index > -1) instances.splice(index, 1)

        resolve({ value, action })
      }
    })

    render(vnode, container)
    document.body.appendChild(container)
    vm = vnode.component

    instances.push({
      id,
      close: () => vm?.exposed?.close?.()
    })

    //打开弹窗
    vm?.exposed?.open?.()
  })
}

//关闭所有弹窗
export function closeAll() {
  instances.slice().forEach(instance => instance.close())
}

//=====================================================================
//alert / confirm / prompt 三个快捷方法
//=====================================================================
type MessageBoxTitle = string | MessageBoxOptions

//第二个参数可以传标题字符串 也可以直接传配置对象
function buildOptions(
  message: MessageBoxContent,
  title?: MessageBoxTitle,
  options: MessageBoxOptions = {}
): MessageBoxOptions {
  if (title && typeof title === 'object') {
    return { ...title, message }
  }
  return {
    ...options,
    ...(title === undefined ? {} : { title }),
    message
  }
}

//只有一个"确定"按钮的提示框
export function alertMessageBox(
  message: MessageBoxContent,
  title?: MessageBoxTitle,
  options?: MessageBoxOptions
): Promise<MessageBoxData> {
  const opts = buildOptions(message, title, options)
  return createMessageBox({ ...opts, showCancelButton: false })
}

//"确定/取消"的确认框
export function confirmMessageBox(
  message: MessageBoxContent,
  title?: MessageBoxTitle,
  options?: MessageBoxOptions
): Promise<MessageBoxData> {
  const opts = buildOptions(message, title, options)
  return createMessageBox({ ...opts, showCancelButton: true })
}

//带输入框的弹窗
export function promptMessageBox(
  message: MessageBoxContent,
  title?: MessageBoxTitle,
  options?: MessageBoxOptions
): Promise<MessageBoxData> {
  const opts = buildOptions(message, title, options)
  return createMessageBox({
    ...opts,
    showCancelButton: true,
    inputType: opts.inputType || 'text'
  })
}
