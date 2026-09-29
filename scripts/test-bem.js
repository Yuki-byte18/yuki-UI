//=====================================================================
//BEM 命名规范的手动验证脚本（学习用的草稿 从仓库根目录挪到了 scripts/）
//
//注意：下面这行 require 的是 .ts 文件，node 直接跑是不行的（node 不认识 ts 的 import 语法）
//想真跑起来的话 有几种办法：
//  1,装 tsx：pnpm add -D tsx && pnpm exec tsx scripts/test-bem.js
//  2,或者把 create.ts 里那两个函数复制成 .js 再 require
//  3,最省事：直接在 play/src/App.vue 里 console.log(createNamespace('button').b('primary'))
//=====================================================================

// 导入 createNamespace 函数
const { createNamespace } = require('../packages/utils/create.ts');

// 创建 bem 对象
const bem = createNamespace('button');

// 执行测试
console.log(bem.b('primary'));
