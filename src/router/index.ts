import { createRouter, RouteRecordRaw, createWebHistory } from 'vue-router';
import { useCommonStore } from '@/store/common';

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
          keepAlive: false,
        },
        component: () => import('@/views/home/index.vue'),
      },
      {
        path: '/classify',
        name: 'classify',
        meta: {
          title: '文章分类',
          keepAlive: false,
        },
        component: () => import('@/views/classify/index.vue'),
      },
      {
        path: '/tag',
        name: 'tag',
        meta: {
          title: '文章标签',
          keepAlive: false,
        },
        component: () => import('@/views/tag/index.vue'),
      },
      {
        path: '/tag/list',
        name: 'tagList',
        meta: {
          title: '标签列表',
          keepAlive: false,
        },
        component: () => import('@/views/tag/articles/index.vue'),
      },
      {
        path: '/timeline',
        name: 'timeline',
        meta: {
          title: '时间轴线',
          keepAlive: false,
          auth: true,
        },
        component: () => import('@/views/timeline/index.vue'),
      },
      {
        path: '/create',
        name: 'create',
        meta: {
          title: '发布文章',
          keepAlive: true,
          auth: true,
        },
        component: () => import('@/views/create/index.vue'),
      },
      {
        path: '/author',
        name: 'author',
        meta: {
          title: '关于博主',
          keepAlive: false,
        },
        component: () => import('@/views/author/index.vue'),
      },
      {
        path: '/personal',
        name: 'personal',
        meta: {
          title: '我的主页',
          keepAlive: false,
          auth: true,
        },
        component: () => import('@/views/personal/index.vue'),
      },
      {
        path: '/setting',
        name: 'setting',
        meta: {
          title: '账号设置',
          keepAlive: false,
          auth: true,
        },
        component: () => import('@/views/setting/index.vue'),
        children: [
          {
            path: '/profile',
            name: 'profile',
            meta: {
              title: '个人资料',
              keepAlive: false,
              auth: true,
            },
            component: () => import('@/views/setting/profile/index.vue'),
          },
          {
            path: '/account',
            name: 'account',
            meta: {
              title: '账号设置',
              keepAlive: false,
              auth: true,
            },
            component: () => import('@/views/setting/account/index.vue'),
          },
          {
            path: '/theme',
            name: 'theme',
            meta: {
              title: '主题设置',
              keepAlive: false,
              auth: true,
            },
            component: () => import('@/views/setting/theme/index.vue'),
          },
          {
            path: '/system',
            name: 'system',
            meta: {
              title: '系统设置',
              keepAlive: false,
            },
            component: () => import('@/views/setting/system/index.vue'),
          },
        ],
        redirect: { name: 'profile' },
      },
      {
        path: '/detail/:id',
        name: 'detail',
        meta: {
          title: '文章详情',
          keepAlive: false,
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
      keepAlive: false,
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
  history: createWebHistory(),
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
router.beforeEach(async (to, from, next) => {
  if (to.path === '/login') {
    const commonStore = useCommonStore();
    console.log(from.path, 'from.path');
    commonStore.setBackPath(from.path);
  }
  next();
});

export default router;
