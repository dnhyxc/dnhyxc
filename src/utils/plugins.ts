// 富文本编辑器
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import VueMarkdownEditor from '@kangc/v-md-editor';
import createEmojiPlugin from '@kangc/v-md-editor/lib/plugins/emoji/index';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
// 代码行号
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index';
// 内容定位
import createAlignPlugin from '@kangc/v-md-editor/lib/plugins/align';
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index';
import createCopyCodePreview from '@kangc/v-md-editor/lib/plugins/copy-code/preview';
import createHighlightLinesPlugin from '@kangc/v-md-editor/lib/plugins/highlight-lines/index';
import Prism from 'prismjs';

import '@kangc/v-md-editor/lib/plugins/highlight-lines/highlight-lines.css';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import '@kangc/v-md-editor/lib/plugins/emoji/emoji.css';
// 预览mackdown配置
import '@kangc/v-md-editor/lib/style/preview.css';
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css';

export const usePlugins = <T>(app: T | any) => {
  // 挂载 v-md-deitor 编辑器
  app.use(VueMarkdownEditor);

  // 挂载预览 mackdown 中间件
  app.use(VMdPreview);

  // 编辑mackdown配置
  VueMarkdownEditor.use(vuepressTheme, {
    Prism,
  });

  VueMarkdownEditor.use(createHighlightLinesPlugin());

  // 预览mackdown配置
  VMdPreview.use(vuepressTheme, {
    Prism,
  });

  // 为预览组件增加复制功能
  VMdPreview.use(createCopyCodePreview());

  // 表情（注意：plugin use 必须放在 Theme 之后，否则不生效）
  VueMarkdownEditor.use(createEmojiPlugin());
  VueMarkdownEditor.use(createLineNumbertPlugin());
  VueMarkdownEditor.use(createAlignPlugin());
  VueMarkdownEditor.use(createCopyCodePlugin());
};

export {
  vuepressTheme,
  VueMarkdownEditor,
  createEmojiPlugin,
  VMdPreview,
  createLineNumbertPlugin,
  createAlignPlugin,
  createCopyCodePlugin,
  createCopyCodePreview,
};
