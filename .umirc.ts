import { defineConfig } from '@umijs/max';
const packageName = require('./package.json').name;
import routes from './config/routes.js';
import DQ_PROXY from './config/proxy.js';

const { TERMINAL_ENV, CLIENT_ENV, NODE_ENV } = process.env;
const IS_PRODUCTION = NODE_ENV === 'production';

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
  alias: {
    "#": '/src/tool'
  },
  define:{
    TERMINAL_ENV: TERMINAL_ENV||"SUB",
    CLIENT_ENV: CLIENT_ENV,
    'process.env': {
      CLIENT_ENV: CLIENT_ENV,
    },
  },
  ignoreMomentLocale: true,
  routes,
  proxy: DQ_PROXY,
  base:  '/',
  hash: true,
  publicPath: '/', //这里打包地址都要基于主应用的中注册的entry值
  inlineLimit: 3000,
  runtimePublicPath: {},
  mountElementId: `${packageName}`,
  outputPath: `./${packageName}`,
  manifest: {
    basePath: '/',
  },
});
