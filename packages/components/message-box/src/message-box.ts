import { type ExtractPropTypes, type PropType, type VNode } from 'vue'
import { type ButtonType } from '../../button/src/button'

//弹窗的类型(只影响标题旁边那个小图标)
export type MessageBoxType = '' | 'success' | 'info' | 'warning' | 'error'

//用户点了什么：确定 / 取消 / 右上角关闭和点遮罩
export type MessageBoxAction = 'confirm' | 'cancel' | 'close'

//prompt 输入框的类型
export type MessageBoxInputType = 'text' | 'textarea' | 'password' | 'number'

//弹窗内容
export type MessageBoxContent = string | VNode | (() => VNode)

export const messageBoxProps = {
  //控制显示隐藏的 v-model
  modelValue: Boolean,
  //标题 不传就用默认的"提示"
  title: {
    type: String,
    default: ''
  },
  //内容
  message: {
    type: [String, Object, Function] as PropType<MessageBoxContent>,
    default: ''
  },
  //类型：会在标题旁边显示对应颜色的图标
  type: {
    type: String as PropType<MessageBoxType>,
    default: ''
  },
  //弹窗宽度
  width: {
    type: [String, Number] as PropType<string | number>,
    default: '420px'
  },
  //层级
  zIndex: {
    type: Number,
    default: 0
  },
  //是否显示取消按钮(alert 不需要取消按钮)
  showCancelButton: Boolean,
  //是否显示右上角的叉
  showClose: {
    type: Boolean,
    default: true
  },
  //确定按钮的文字
  confirmButtonText: {
    type: String,
    default: '确定'
  },
  //取消按钮的文字
  cancelButtonText: {
    type: String,
    default: '取消'
  },
  //确定按钮的主题色
  confirmButtonType: {
    type: String as PropType<ButtonType>,
    default: 'primary'
  },
  //取消按钮的主题色
  cancelButtonType: {
    type: String as PropType<ButtonType>,
    default: ''
  },
  //确定按钮是不是圆角
  roundButton: Boolean,
  //点遮罩是否关闭
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  //按 esc 是否关闭
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  //内容是否居中
  center: Boolean,
  //把内容当 html 渲染(内容可信才开 有xss风险)
  dangerouslyUseHTMLString: Boolean,
  //自定义类名
  customClass: String,

  //=================== 下面是 prompt 输入框相关的 ===================
  //输入框类型 传了就说明这是个输入弹窗
  inputType: {
    type: String as PropType<MessageBoxInputType>,
    default: ''
  },
  //输入框的占位文字
  inputPlaceholder: String,
  //输入框的初始值
  inputValue: {
    type: String,
    default: ''
  },
  //输入内容的校验正则
  inputPattern: {
    type: Object as PropType<RegExp>,
    default: undefined
  },
  //输入内容的校验函数 返回 false 或者字符串(字符串就是错误提示)都算不通过
  inputValidator: {
    type: Function as PropType<
      (value: string) => boolean | string | Promise<boolean | string>
    >,
    default: undefined
  },
  //校验不通过时的提示文字
  inputErrorMessage: {
    type: String,
    default: '输入的数据不合法!'
  }
} as const

export type MessageBoxProps = ExtractPropTypes<typeof messageBoxProps>

//函数式调用能传的东西 = 所有props + 两个只有函数式调用才有的选项
export type MessageBoxOptions = Partial<MessageBoxProps> & {
  //结果回调(不写回调就 await 返回的 Promise)
  callback?: (action: MessageBoxAction, value: string) => void
  //区分"取消"和"关闭"：开了之后点叉/点遮罩返回 close 而不是 cancel
  distinguishCancelAndClose?: boolean
}

//await 出来的结果
export interface MessageBoxData {
  //prompt 时用户输入的内容
  value: string
  //用户点了什么
  action: MessageBoxAction
}
