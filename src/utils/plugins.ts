// 瀑布流组件
import { VueMasonryPlugin } from 'vue-masonry';
// 富文本编辑器
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import VueMarkdownEditor from '@kangc/v-md-editor';
import createEmojiPlugin from '@kangc/v-md-editor/lib/plugins/emoji/index';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
// 代码行号
// import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index';
// 内容定位
import createAlignPlugin from '@kangc/v-md-editor/lib/plugins/align';
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index';
import createHighlightLinesPlugin from '@kangc/v-md-editor/lib/plugins/highlight-lines/index';
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn';
import Prism from 'prismjs';

import '@kangc/v-md-editor/lib/plugins/highlight-lines/highlight-lines.css';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import '@kangc/v-md-editor/lib/plugins/emoji/emoji.css';
// 预览mackdown配置
import '@kangc/v-md-editor/lib/style/preview.css';
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css';

// 扩展高亮语言
const codeHighlightExtensionMap = {
  vue: 'html',
  react: 'js',
  json: 'js',
  ts: 'js',
  typescript: 'js',
  c: 'js',
  java: 'js',
  go: 'js',
  'c++': 'js',
};

export const usePlugins = <T>(app: T | any) => {
  // 挂载瀑布流组件
  app.use(VueMasonryPlugin);

  // 挂载 v-md-deitor 编辑器
  app.use(VueMarkdownEditor);

  // 挂载预览 mackdown 中间件
  app.use(VMdPreview);

  // 编辑mackdown配置
  VueMarkdownEditor.use(vuepressTheme, {
    Prism,
    // 扩展高亮语言
    codeHighlightExtensionMap,
  });

  VueMarkdownEditor.use(createHighlightLinesPlugin());

  // 预览mackdown配置
  VMdPreview.use(vuepressTheme, {
    Prism,
    // 扩展高亮语言
    codeHighlightExtensionMap,
  });

  // 显示行号
  // VMdPreview.use(createLineNumbertPlugin());
  // 为预览组件增加复制功能
  VMdPreview.use(createCopyCodePlugin());
  // 预览组件支持表情
  VMdPreview.use(createEmojiPlugin());
  VMdPreview.use(createKatexPlugin());

  // 表情（注意：plugin use 必须放在 Theme 之后，否则不生效）
  VueMarkdownEditor.use(createEmojiPlugin());
  // VueMarkdownEditor.use(createLineNumbertPlugin());
  VueMarkdownEditor.use(createAlignPlugin());
  VueMarkdownEditor.use(createCopyCodePlugin());
  VueMarkdownEditor.use(createKatexPlugin());
};

export {
  vuepressTheme,
  VueMarkdownEditor,
  createEmojiPlugin,
  VMdPreview,
  // createLineNumbertPlugin,
  createAlignPlugin,
  createCopyCodePlugin,
};
