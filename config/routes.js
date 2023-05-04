export default [
  {
    title: '登录页',
    path: '/user',
    component: '@/layouts/UserLayout',
    routes: [
      {
        title: '登录',
        name: 'login',
        path: '/user/login',
        component: './User/login',
      },
    ],
  },
  {
    path: '/',
    component: '@/layouts/BasicLayout',
    title: '业务页面',
    routes: [
      { path: '/', component: '@/pages/index' },
        { path: '/TaskCenter', component: 'TaskCenter', title: '任务中心配置'},
        { path: '/PowerStation', component: 'PowerStation', title: '电源侧场站配置'},
        { path: '/SyncService', component: 'SyncService', title: '同步服务配置'},
        { path: '/SD-TaskCenter', component: 'TaskCenter', title: '售电-任务中心配置'},
        { path: '/SD-SyncService', component: 'SyncService', title: '售电-同步服务配置'},
      { path: '/*', component: '@/pages/404' },
    ],
  },
  { path: '/*', component: '@/pages/404' },
];
