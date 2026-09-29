// VitePress 配置（1.x 写法）
// 本地启动：pnpm doc:dev     构建：pnpm doc:build
// 注意：如果你的 GitHub 用户名/仓库名和下面写的不一样，把 editLink 里的地址一起改掉
module.exports = {
  title: 'YUKI-UI',
  description: '基于 Vue 3 + TypeScript + SCSS 的组件库',
  lang: 'zh-CN',
  // 部署到 GitHub Pages 这种子路径（比如 /yuki-ui/）时才需要开下面这行
  // base: '/yuki-ui/',

  // 1.x 里这个是布尔值：显示每一页的"最后更新时间"（取自 git 提交记录）
  lastUpdated: true,

  // 站点图标（文件在 docs/public/favicon.svg，VitePress 会把 public 目录原样拷到产物根目录）
  head: [['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }]],

  // 部署好之后把下面这段打开，搜索引擎收录会更规范（hostname 换成你真实的 Vercel 域名）
  // sitemap: {
  //   hostname: 'https://yuki-ui.vercel.app'
  // },

  themeConfig: {
    // 导航栏左边的小图标（不想要这一行删掉即可）
    logo: '/favicon.svg',

    nav: [
      { text: '指南', link: '/guide/installation', activeMatch: '/guide/' },
      { text: '组件', link: '/component/icon', activeMatch: '/component/' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/quieStart' }
          ]
        }
      ],
      '/component/': [
        {
          text: '基础组件',
          items: [
            { text: 'Icon 图标', link: '/component/icon' },
            { text: 'Button 按钮', link: '/component/button' },
            { text: 'Tag 标签', link: '/component/tag' }
          ]
        },
        {
          text: '数据展示',
          items: [
            { text: 'Tree 树形控件', link: '/component/tree' },
            { text: 'VirtualList 虚拟列表', link: '/component/virtual-list' }
          ]
        },
        {
          text: '反馈组件',
          items: [
            { text: 'Message 消息提示', link: '/component/message' },
            { text: 'MessageBox 消息弹窗', link: '/component/message-box' }
          ]
        }
      ]
    },

    // 1.x 的写法：编辑此页的链接
    editLink: {
      pattern: 'https://github.com/Yuki-byte18/yuki-UI/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 内置的本地搜索（不需要额外的服务）
    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '本页目录'
    },

    lastUpdated: {
      text: '最后更新时间',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Yuki-byte18'
    }
  }
}
