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
      { path: '/404', component: './404' },
    ],
  },
  {
    path: '/',
    component: '@/layouts/BasicLayout',
    title: '业务页面',
    routes: [
      { path: '/', component: '@/pages/index' },
      // { path: '/powerDistribution', component: '@/pages/PowerDistribution/index', title: '变配电' }, // 变配电
      { path: '/404', component: './404' },
    ],
  },
  { path: '/404', component: './404' },
];
