import { createRouter, RouteRecordRaw, createWebHashHistory } from 'vue-router';
// import { useUserStore } from '@/store/user';
// import { AUTH_CONFIG } from '@/constant';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/',
    name: 'main',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          title: '文章列表',
          keepAlive: true,
          requireAuth: true,
        },
        component: () => import('@/views/home/index.vue'),
      },
      {
        path: '/classify',
        name: 'classify',
        meta: {
          title: '文章分类',
          keepAlive: true,
          requireAuth: true,
        },
        component: () => import('@/views/classify/index.vue'),
      },
      {
        path: '/tag',
        name: 'tag',
        meta: {
          title: '文章标签',
          keepAlive: true,
          requireAuth: true,
        },
        component: () => import('@/views/tag/index.vue'),
      },
      {
        path: '/timeline',
        name: 'timeline',
        meta: {
          title: '时间轴线',
          keepAlive: true,
          requireAuth: true,
        },
        component: () => import('@/views/timeline/index.vue'),
      },
      {
        path: '/create',
        name: 'create',
        meta: {
          title: '发布文章',
          keepAlive: true,
          requireAuth: true,
        },
        component: () => import('@/views/create/index.vue'),
      },
      {
        path: '/author',
        name: 'author',
        meta: {
          title: '关于博主',
          keepAlive: true,
          requireAuth: true,
        },
        component: () => import('@/views/author/index.vue'),
      },
      {
        path: '/personal',
        name: 'personal',
        meta: {
          title: '我的主页',
          keepAlive: true,
          requireAuth: false,
        },
        component: () => import('@/views/personal/index.vue'),
      },
      {
        path: '/setting',
        name: 'setting',
        meta: {
          title: '账号设置',
          keepAlive: true,
          requireAuth: false,
        },
        component: () => import('@/views/setting/index.vue'),
        children: [
          {
            path: '/profile',
            name: 'profile',
            meta: {
              title: '个人资料',
              keepAlive: true,
              requireAuth: true,
            },
            component: () => import('@/views/setting/profile/index.vue'),
          },
          {
            path: '/account',
            name: 'account',
            meta: {
              title: '账号设置',
              keepAlive: true,
              requireAuth: true,
            },
            component: () => import('@/views/setting/account/index.vue'),
          },
        ],
        redirect: { name: 'profile' },
      },
      {
        path: '/detail/:id',
        name: 'detail',
        meta: {
          title: '文章详情',
          keepAlive: true,
          requireAuth: false,
        },
        component: () => import('@/views/detail/index.vue'),
      },
    ],
    redirect: { name: 'home' },
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      title: '登录',
      keepAlive: true,
      requireAuth: false,
    },
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404/index.vue'),
  },
];

const router = createRouter({
  // electron 只支持 hash router，使用 history router 会出现找不到对应路由得情况
  history: createWebHashHistory(),
  scrollBehavior: (to, from, savePosition) => {
    if (savePosition) {
      return savePosition;
    } else {
      return { top: 0 };
    }
  },
  routes,
});

// 全局守卫：登录拦截 本地没有存token,请重新登录
// router.beforeEach(async (to, from, next) => {
//   const userStore = useUserStore();

//   // 判断有没有登录
//   if (!userStore.token) {
//     if (to.name === 'login') {
//       next();
//     } else {
//       router.push('/login');
//     }
//     // 如果不是超级管理员，禁止访问后台账户管理
//   } else {
//     if (userStore.auth === AUTH_CONFIG.SUPER) {
//       next();
//     } else {
//       if (to.name === 'users' || to.name === 'account' || to.name === 'home') {
//         if (userStore.auth === AUTH_CONFIG.ADMIN) {
//           if (to.name !== 'home') {
//             router.push('/home');
//           } else {
//             next();
//           }
//         } else {
//           router.push('/article');
//         }
//       } else {
//         if (userStore.bindAccount?.length) {
//           to.name === 'bind' ? router.push('/article') : next();
//         } else {
//           to.name === 'bind' ? next() : router.push('/bind');
//         }
//       }
//     }
//   }
// });

export default router;
