import { type ExtractPropTypes, type PropType } from 'vue'

//标签主题色
export type TagType = '' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
//标签尺寸
export type TagSize = '' | 'large' | 'default' | 'small'
//标签风格：light浅色底 / dark深色实心 / plain白底描边
export type TagEffect = 'light' | 'dark' | 'plain'

export const tagProps = {
  type: {
    type: String as PropType<TagType>,
    default: ''
  },
  size: {
    type: String as PropType<TagSize>,
    default: ''
  },
  effect: {
    type: String as PropType<TagEffect>,
    default: 'light'
  },
  //是否可关闭(显示右边的叉)
  closable: Boolean,
  //圆角标签(胶囊形状)
  round: Boolean,
  //是否禁用过渡动画
  disableTransitions: Boolean
} as const

export type TagProps = ExtractPropTypes<typeof tagProps>
