import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// utils 包只有两个纯 ts 文件，不需要编译 .vue，所以不用 vue 插件
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: {
        create: fileURLToPath(new URL('./create.ts', import.meta.url)),
        'with-install': fileURLToPath(new URL('./with-install.ts', import.meta.url))
      },
      // 只出 ESM（现代构建工具和 Node 都支持）
      formats: ['es']
    },
    rollupOptions: {
      // vue 不打包进产物，由使用者的项目提供
      external: ['vue'],
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
})
