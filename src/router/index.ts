import { defineAsyncComponent } from 'vue';
import { createRouter, RouteRecordRaw, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import { loginStore } from '@/store';
import { useCommonStore } from '@/store/common';
import { locGetItem } from '@/utils';
import { WITH_AUTH_ROUTES } from '@/constant';
import eventBus from '@/utils/eventBus';
import AsyncLoading from '@/components/AsyncLoading/index.vue';

const importComponent = (path: string) =>
  defineAsyncComponent({
    loader: () => import(`@/views/${path}/index.vue`),
    loadingComponent: AsyncLoading,
  });

// 需要后台配置权限的路由配置
export const authRoutes = [
  {
    path: '/tools',
    name: 'tools',
    meta: {
      title: '实用工具',
      auth: true,
    },
    component: importComponent('tools'),
  },
  {
    path: '/picture',
    name: 'picture',
    meta: {
      title: '图片合集',
      auth: true,
    },
    component: () => import('@/views/picture/index.vue'),
  },
];

export const routes: Array<RouteRecordRaw> = [
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
          title: '墨客首页',
          info: '欢迎来到墨客',
        },
        component: () => import('@/views/home/index.vue'),
      },
      {
        path: '/classify',
        name: 'classify',
        meta: {
          title: '文章分类',
        },
        component: () => import('@/views/classify/index.vue'),
      },
      {
        path: '/tag',
        name: 'tag',
        meta: {
          title: '文章标签',
        },
        component: () => import('@/views/tag/index.vue'),
      },
      {
        path: '/tag/list',
        name: 'tagList',
        meta: {
          title: '标签列表',
        },
        // @ts-ignore
        component: () => import('@/views/tag/articles/index.vue'),
      },
      {
        path: '/timeline',
        name: 'timeline',
        meta: {
          title: '时间轴线',
        },
        component: () => import('@/views/timeline/index.vue'),
      },
      {
        path: '/create',
        name: 'create',
        meta: {
          title: '发布文章',
        },
        component: () => import('@/views/create/index.vue'),
      },
      {
        path: '/interact',
        name: 'interact',
        meta: {
          title: '留言一角',
        },
        component: () => import('@/views/interact/index.vue'),
      },
      ...authRoutes,
      {
        path: '/author',
        name: 'author',
        meta: {
          title: '关于博主',
        },
        component: () => import('@/views/author/index.vue'),
      },
      {
        path: '/personal',
        name: 'personal',
        meta: {
          title: '我的主页',
        },
        component: () => import('@/views/personal/index.vue'),
      },
      {
        path: '/collect/:id',
        name: 'collect',
        meta: {
          title: '收藏信息',
        },
        component: () => import('@/views/collect/index.vue'),
      },
      {
        path: '/search',
        name: 'search',
        meta: {
          title: '高级搜索',
        },
        component: () => import('@/views/search'),
      },
      {
        path: '/setting',
        name: 'setting',
        meta: {
          title: '账号设置',
        },
        component: () => import('@/views/setting/index.vue'),
        children: [
          {
            path: '/profile',
            name: 'profile',
            meta: {
              title: '个人资料',
            },
            component: () => import('@/views/setting/profile/index.vue'),
          },
          {
            path: '/account',
            name: 'account',
            meta: {
              title: '账号设置',
            },
            component: () => import('@/views/setting/account/index.vue'),
          },
          {
            path: '/theme',
            name: 'theme',
            meta: {
              title: '主题设置',
            },
            component: () => import('@/views/setting/theme/index.vue'),
          },
          {
            path: '/system',
            name: 'system',
            meta: {
              title: '系统设置',
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
        },
        component: () => import('@/views/detail/index.vue'),
      },
      {
        path: '/draft',
        name: 'draft',
        meta: {
          title: '草稿预览',
        },
        component: () => import('@/views/draft/index.vue'),
      },
      {
        path: '/chat',
        name: 'chat',
        meta: {
          title: '发送私聊',
        },
        component: () => import('@/views/chat/index.vue'),
      },
    ],
    redirect: { name: 'home' },
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      title: '登录',
    },
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/article/:id',
    name: 'article',
    meta: {
      title: '文章详情',
    },
    component: () => import('@/views/article/index.vue'),
  },
  {
    path: '/compile',
    name: 'compile',
    meta: {
      title: '代码测试',
    },
    component: () => import('@/views/compile/index.vue'),
  },
  {
    path: '/message',
    name: 'message',
    meta: {
      title: '消息提示',
    },
    component: () => import('@/views/message/index.vue'),
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
  if (to.meta.auth) {
    // 获取用户权限信息
    const menus = (await loginStore.getUserMenuRoles()) as string[];
    if (!menus?.includes(to.name as string)) {
      next('/404');
    }
  }
  const commonStore = useCommonStore();
  // 判断是否是首屏加载，如果是则设置loading加载效果
  if (to.path !== '/home' && !to.path.includes('/article') && !to.path.includes('/compile')) {
    commonStore.updatePageLoadStatus();
  }
  // 路由切换时，隐藏消息弹窗
  eventBus.emit('hide-msg-popover', false);
  // 进入到登录页时，保存从哪进入的路由路径
  if (to.path === '/login') {
    commonStore.setBackPath(from.path);
  }
  // 控制设置跳转，在没登录的情况，访问我的主页和账号设置，需要重定向到系统设置
  if ((to.path === '/profile' || to.path === '/account') && !locGetItem('token')) {
    router.push('/system');
  }
  // 如果已经登录，点击返回，不再退回到登录页
  if (locGetItem('token') && to.path === '/login') {
    router.push(from.path);
  }
  if (WITH_AUTH_ROUTES.includes(to.path) && !locGetItem('token')) {
    ElMessage({
      message: '请先登录后再访问哦！',
      type: 'warning',
      offset: 80,
      duration: 2000,
    });
    router.push(from.path);
  }
  next();
});

export default router;
