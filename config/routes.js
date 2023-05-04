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
      { path: '/*', component: '@/pages/404' },
    ],
  },
  { path: '/*', component: '@/pages/404' },
];
