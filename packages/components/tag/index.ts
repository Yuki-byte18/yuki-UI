import Tag from './src/tag.vue'
import { withInstall } from '@yuki/utils/with-install'

const yukiTag = withInstall(Tag)
export default yukiTag
export * from './src/tag'

declare module 'vue' {
  export interface GlobalComponents {
    yukiTag: typeof yukiTag
  }
}
