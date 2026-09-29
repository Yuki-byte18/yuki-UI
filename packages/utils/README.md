# @yuki-byte/utils

[YUKI-UI](https://github.com/Yuki-byte18/yuki-UI) 组件库的工具包，两个小工具。

## 安装

```bash
pnpm add @yuki-byte/utils
```

## createNamespace：生成 BEM 类名

```ts
import { createNamespace } from '@yuki-byte/utils/create'

const bem = createNamespace('button') // 前缀 yuki-button

bem.b()                    // yuki-button
bem.e('text')              // yuki-button__text
bem.m('primary')           // yuki-button--primary
bem.be('group', 'text')    // yuki-button-group__text
bem.em('text', 'primary')  // yuki-button__text--primary
bem.is('disabled', true)   // is-disabled
```

## withInstall / withInstallFunction：给组件加 install

```ts
import { withInstall, withInstallFunction } from '@yuki-byte/utils/with-install'

// 普通组件：app.use(yukiButton) 后模板里能直接用 <yukiButton>
const yukiButton = withInstall(Button)

// 函数式组件（message 这种）：app.use 之后 this.$message 可用
const yukiMessage = withInstallFunction(messageService, 'message')
```

## License

MIT
