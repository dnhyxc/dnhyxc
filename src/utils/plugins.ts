import BScroll from '@better-scroll/core';
// 支持鼠标滚动插件
import MouseWheel from '@better-scroll/mouse-wheel';
import ScrollBar from '@better-scroll/scroll-bar';
// 下拉加载插件
import Pullup from '@better-scroll/pull-up';
// 富文本编辑器
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import VueMarkdownEditor from '@kangc/v-md-editor';
import createEmojiPlugin from '@kangc/v-md-editor/lib/plugins/emoji/index';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
// 数学公式处理插件（该插件需要现在index.html中采用cdn引入）
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn';
// 代码行号
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index';
// 内容定位
import createAlignPlugin from '@kangc/v-md-editor/lib/plugins/align';
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index';
import createCopyCodePreview from '@kangc/v-md-editor/lib/plugins/copy-code/preview';
import Prism from 'prismjs';
import hljs from 'highlight.js';

import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import '@kangc/v-md-editor/lib/plugins/emoji/emoji.css';
// 预览mackdown配置
import '@kangc/v-md-editor/lib/style/preview.css';
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css';

export const usePlugins = <T>(app: T | any) => {
  // 注册下拉加载插件
  BScroll.use(Pullup);

  // 注册鼠标滚动插件
  BScroll.use(MouseWheel);

  // 自定义滚动条
  BScroll.use(ScrollBar);

  // 挂载 v-md-deitor 编辑器
  app.use(VueMarkdownEditor);

  // 挂载预览 mackdown 中间件
  app.use(VMdPreview);

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

  // 为预览组件增加复制功能
  VMdPreview.use(createCopyCodePreview());

  // 表情（注意：plugin use 必须放在 Theme 之后，否则不生效）
  VueMarkdownEditor.use(createEmojiPlugin());
  VueMarkdownEditor.use(createKatexPlugin());
  VueMarkdownEditor.use(createLineNumbertPlugin());
  VueMarkdownEditor.use(createAlignPlugin());
  VueMarkdownEditor.use(createCopyCodePlugin());
};

export {
  BScroll,
  MouseWheel,
  Pullup,
  vuepressTheme,
  VueMarkdownEditor,
  createEmojiPlugin,
  VMdPreview,
  createKatexPlugin,
  createLineNumbertPlugin,
  createAlignPlugin,
  createCopyCodePlugin,
  createCopyCodePreview,
};
