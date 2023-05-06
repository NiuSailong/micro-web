import { defineConfig } from '@umijs/max';

export default defineConfig({
  qiankun: {
    slave: {},
  },
  title: false,
  dva: {},
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
  alias: {},
  define:{},
  ignoreMomentLocale: true,
  routes: [
    {
      name: '权限', path: "/",
      routes: [
        { name: 'home', path: "/home", component: "@/pages/index" },
      ],
    },
    { name: '404', path: '/*', component: '@/pages/404' },
  ],
  proxy: {},
  base: '/',
  hash: true,
  publicPath: '/',
  inlineLimit: 3000,
  runtimePublicPath: {},
  manifest: {
    basePath: '/',
  },
});
