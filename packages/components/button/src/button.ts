import { type ExtractPropTypes, type PropType, type Component } from 'vue'

//按钮主题色
export type ButtonType = '' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
//按钮尺寸
export type ButtonSize = '' | 'large' | 'default' | 'small'
//按钮原生type属性
export type ButtonNativeType = 'button' | 'submit' | 'reset'

//组件的入参配置对象
export const buttonProps = {
  //主题色 不传就是默认的白底灰框按钮
  type: {
    type: String as PropType<ButtonType>,
    default: ''
  },
  //尺寸
  size: {
    type: String as PropType<ButtonSize>,
    default: ''
  },
  //朴素按钮：浅色背景 + 主题色文字
  plain: Boolean,
  //圆角按钮
  round: Boolean,
  //圆形按钮(一般搭配图标使用)
  circle: Boolean,
  //文字按钮：没有边框和背景 只有文字
  link: Boolean,
  //块级按钮：宽度撑满父元素
  block: Boolean,
  //禁用
  disabled: Boolean,
  //加载中(会自动禁用点击 并显示转圈的loading图标)
  loading: Boolean,
  //自动获取焦点
  autofocus: Boolean,
  //原生 type 属性
  nativeType: {
    type: String as PropType<ButtonNativeType>,
    default: 'button'
  },
  //最终渲染成什么标签 想渲染成 a 标签就传 "a"
  tag: {
    type: [String, Object] as PropType<string | Component>,
    default: 'button'
  }
} as const

export type ButtonProps = ExtractPropTypes<typeof buttonProps>
