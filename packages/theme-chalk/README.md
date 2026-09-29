# @yuki-byte/theme-chalk

[YUKI-UI](https://github.com/Yuki-byte18/yuki-UI) 组件库的样式包，纯 SCSS，不需要构建。

## 安装与引入

```bash
pnpm add @yuki-byte/theme-chalk
```

```ts
// main.ts 里引一次，所有组件样式就都有了
import '@yuki-byte/theme-chalk/src/index.scss'
```

## 文件结构

```
src/
  index.scss          # 入口：汇总下面所有样式 + 输出 CSS 变量
  var.scss            # 设计变量 -> :root 上的 CSS 变量（运行时可通过 CSS 变量换肤）
  mixins/
    config.scss       # SCSS 变量：主题色、文字、边框、圆角、阴影、层级...
    mixins.scss       # SCSS 函数：b / e / m / when 以及 ellipsis、scrollbar 等工具
  icon.scss
  button.scss
  tag.scss
  tree.scss
  message.scss
  message-box.scss
  virtual-list.scss
```

## 主题定制

**方式一：CSS 变量（运行时）**

```css
:root {
  --yuki-color-primary: #0ea5e9;
  --yuki-border-radius-base: 8px;
}
```

**方式二：SCSS 变量（编译期，能改到所有派生色）**

改 `src/mixins/config.scss` 里的 `$color-primary`、`$color-success` 等变量，主题色的浅色梯度由 `light-mix()` / `dark-mix()` 自动算出来，重新编译即可。

## License

MIT
