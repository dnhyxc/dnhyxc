import { createApp } from 'vue';
import { usePlugins, mountDirectives, EventBus } from '@/utils';
import router from '@/router';
import store from '@/store/initStore';
import App from './App.vue';
import TreeNode from '@/components/TreeNode/index.vue';

import '@/assets/iconfont/iconfont.css';
import './style.less';

// 创建vue实例
const app = createApp(App);

app.component('TreeNode', TreeNode);

// 挂在路由
app.use(router);

// 挂载pinia
app.use(store);

// 挂在第三方插件
usePlugins(app);

// 全局自定义获取焦点指令
mountDirectives(app);

// 使用 provide 依赖注入将事件总线注入
app.provide('$bus', EventBus);

// 挂载实例
app.mount('#app');
