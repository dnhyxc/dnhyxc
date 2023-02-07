import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import BScroll from '@better-scroll/core';
// 支持鼠标滚动插件
import MouseWheel from '@better-scroll/mouse-wheel';
// 下拉加载插件
import Pullup from '@better-scroll/pull-up';
// 富文本编辑器
import VueMarkdownEditor from '@kangc/v-md-editor';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
// 预览mackdown配置
import '@kangc/v-md-editor/lib/style/preview.css';
import Prism from 'prismjs';
import hljs from 'highlight.js';
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

// element-plus 全局配置
app.use(ElementPlus, { locale: zhCn, size: 'default', zIndex: 3000 });

// 挂载实例
app.mount('#app');

// 注册下拉加载插件
BScroll.use(Pullup);

// 注册鼠标滚动插件
BScroll.use(MouseWheel);

// 编辑mackdown配置
VueMarkdownEditor.use(vuepressTheme, {
  Prism,
  Hljs: hljs,
});

// 预览mackdown配置
VMdPreview.use(vuepressTheme, {
  Hljs: hljs,
  Prism,
});

// 挂载 v-md-deitor 编辑器
app.use(VueMarkdownEditor);

// 挂载预览 mackdown 中间件
app.use(VMdPreview);
