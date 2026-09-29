import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import DefineOptions from 'unplugin-vue-define-options/vite'
import { fileURLToPath, URL } from 'node:url'

// 每个组件目录都是一个入口
// 这样使用者才能 @yuki-byte/components/button 这样按需引入
const entry = {
  icon: 'icon/index.ts',
  button: 'button/index.ts',
  tag: 'tag/index.ts',
  tree: 'tree/index.ts',
  message: 'message/index.ts',
  'message-box': 'message-box/index.ts',
  'virtual-list': 'virtual-list/index.ts'
}

// 相对路径转绝对路径（vite 的 entry 用绝对路径最稳）
const input = Object.fromEntries(
  Object.entries(entry).map(([name, path]) => [
    name,
    fileURLToPath(new URL(path, import.meta.url))
  ])
)

export default defineConfig({
  // 和 play 演示项目保持一致：defineOptions 宏用这个插件
  plugins: [vue(), DefineOptions()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: input,
      formats: ['es']
    },
    rollupOptions: {
      // vue 和内部工具包都不打包进产物
      external: ['vue', /^@yuki-byte\//],
      output: {
        // 产物结构：dist/button/index.js —— 和 package.json 里的 exports 映射一一对应
        entryFileNames: '[name]/index.js',
        // 组件之间共用的代码（比如 message-box 里引用了 button）抽成公共 chunk
        chunkFileNames: 'chunks/[name]-[hash].js'
      }
    }
  }
})
