import Tree from './src/tree.vue'
import { withInstall } from '@yuki/utils/with-install'

const yukiTree = withInstall(Tree)

export default yukiTree
//把props类型和节点类型也导出 使用者可以拿到 TreeProps / TreeNodeData 用
export * from './src/tree'

declare module 'vue' {
  export interface GlobalComponents {
    yukiTree: typeof yukiTree
  }
}
