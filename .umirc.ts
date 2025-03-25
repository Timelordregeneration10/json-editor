import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'RMT',
  },
  routes: [
    {
      name: 'kilala json editor',
      path: '/',
      component: './Main',
      hideInMenu: true,
      // 不展示菜单
      menuRender: false,
      // 不展示菜单顶栏
      menuHeaderRender: false,
    },
  ],
  npmClient: 'npm',
  history: { type: "hash" },
  publicPath: '/json-editor/'
});

