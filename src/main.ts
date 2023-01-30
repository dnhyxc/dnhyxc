import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import router from '@/router';
import store from '@/store/initStore';
import App from './App.vue';
import '@/assets/iconfont/iconfont.css';

import './style.less';

// 创建vue实例
const app = createApp(App);

// 挂在路由
app.use(router);

// 挂载pinia
app.use(store);

// 国际化配置
app.use(ElementPlus, {
  locale: zhCn,
});

// element-plus 全局配置
app.use(ElementPlus, { size: 'default', zIndex: 3000 });

// 挂载实例
app.mount('#app');
