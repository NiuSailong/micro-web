import { defineConfig } from '@umijs/max';
const packageName = require('./package.json').name;
import routes from './config/routes';
import proxy from './config/proxy';

const { NODE_ENV, TERMINAL_ENV, CLIENT_ENV } = process.env;

const IS_PRODUCTION = NODE_ENV === 'production';

export default defineConfig({
  title: false,
  ignoreMomentLocale: true,
  mountElementId: `${packageName}`,
  routes,
  proxy,
  base: `/saas/child/${packageName}`,
  hash: true,
  publicPath: `/saas/child/${packageName}/`, //这里打包地址都要基于主应用的中注册的entry值
  fastRefresh: true,
  outputPath: `/${packageName}`,
  inlineLimit: 3000,
  qiankun: {
    slave: {},
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
  define: {
    TERMINAL_ENV: TERMINAL_ENV || 'SUB',
    CLIENT_ENV: CLIENT_ENV,
    'process.env.CLIENT_ENV': CLIENT_ENV,
  },
  // styles:["https://api.tiles.mapbox.com/mapbox-gl-js/v2.13.0/mapbox-gl.css"],
  // links: [
  //   {
  //     rel: 'stylesheet',
  //     type: 'text/css',
  //     charset: 'utf-8',
  //     href: 'https://at.alicdn.com/t/font_2395018_nng9x1qhat.css',
  //   },
  // ],
  // copy: [
  //   {
  //     from: 'node_modules/three/examples/jsm/libs/draco/gltf/',
  //     to: 'assets/gltf/'
  //   },
  // ],
  externals: IS_PRODUCTION
    ? {
      jspdf: 'jspdf',
      echarts: 'echarts',
    }
    : {},
  scripts: IS_PRODUCTION
    ? [
      'var isHasEchart= false;' +
      'document.getElementsByTagName("script").' +
      'forEach(m=>{if(m.src==="https://static-pre.gw-greenenergy.com/echarts.min.js")' +
      '{isHasEchart=true;}});' +
      'if(!isHasEchart){' +
      "    const script = document.createElement('script');\n" +
      '    script.src = "https://static-pre.gw-greenenergy.com/echarts.min.js"\n' +
      "    script.type = 'text/javascript';\n" +
      '    document.body.appendChild(script);\n' +
      '}',
    ]
    : [],
  // chainWebpack: webpackPlugin,
  runtimePublicPath: {},
  antd: {},
  npmClient: 'npm',
});
