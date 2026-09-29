import VirtualList from './src/virtual-list.vue'
import { withInstall } from '@yuki/utils/with-install'

const yukiVirtualList = withInstall(VirtualList)
export default yukiVirtualList
export * from './src/virtual-list'

declare module 'vue' {
  export interface GlobalComponents {
    yukiVirtualList: typeof yukiVirtualList
  }
}
