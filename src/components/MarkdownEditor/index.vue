<template>
  <div class="container">
    <!-- 上传图片菜单默认为禁用状态 设置 disabled-menus 为空数组可以开启 -->
    <v-md-editor
      v-model="createStore.createInfo.content"
      placeholder="编辑内容"
      autofocus
      mode="edit"
      height="100%"
      :disabled-menus="[]"
      :left-toolbar="toolMenu"
      :toolbar="toolbar"
      @upload-image="onUploadImage"
      @copy-code-success="onCopyCodeSuccess"
    />
    <div v-if="showDot" class="save-info">未保存</div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { createStore, uploadStore } from '@/store';
import { message } from '@/utils';

interface ToolbarItem {
  action?: (editor: any) => void;
  title?: string;
  icon?: string;
  name?: string;
  text?: string;
}

interface Toolbar {
  create?: {
    title?: string;
    text?: string;
    icon?: string;
    action?: (editor?: any) => void;
    menus?: ToolbarItem[];
  };
  clear?: {
    title?: string;
    text?: string;
    icon?: string;
    action?: (editor?: any) => void;
    menus?: ToolbarItem[];
  };
  save?: {
    title?: string;
    text?: string;
    icon?: string;
    action?: (editor?: any) => void;
    menus?: ToolbarItem[];
  };
  draft?: {
    title?: string;
    text?: string;
    icon?: string;
    action?: (editor?: any) => void;
    menus?: ToolbarItem[];
  };
  monaco?: {
    title?: string;
    text?: string;
    icon?: string;
    action?: (editor?: any) => void;
    menus?: ToolbarItem[];
  };
  debug?: {
    title?: string;
    text?: string;
    icon?: string;
    action?: (editor?: any) => void;
    menus?: ToolbarItem[];
  };
}

interface IProps {
  articleId?: string;
  height?: string | null;
  onPublish?: () => void;
  onClear?: () => void;
  onShowDraft?: () => void;
  onSaveDraft?: () => void;
  onChangeEditor?: () => void;
  copyCodeSuccess?: (value?: string) => void;
  onShowCodeRun?: () => void;
  showVscode?: boolean;
  showDot?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  articleId: '',
  height: '100%',
  onPublish: () => {},
  onClear: () => {},
  onShowDraft: () => {},
  onSaveDraft: () => {},
  onChangeEditor: () => {},
  copyCodeSuccess: () => {},
  onShowCodeRun: () => {},
  showDot: 0,
});

// tool menu
const toolMenu = computed(() => {
  const menu =
    'undo redo | h bold italic | quote code | strikethrough hr | emoji link image | ul ol table | clear draft save create debug';
  if (props.showVscode) {
    return `${menu} | monaco`;
  }
  return menu;
});

// 自定义工具栏配置
const toolbar = reactive<Toolbar>({
  create: {
    text: '发',
    title: '发布文章',
    action(editor) {
      if (!createStore?.createInfo?.content?.trim()) {
        message({
          title: '嘿！一个字都没写休想发布',
          message: '请先编写文章内容后再尝试发布！',
          type: 'warning',
        });
        return;
      }
      props.onPublish && props.onPublish();
    },
  },
  clear: {
    text: '清',
    title: '清空内容',
    action(editor) {
      props.onClear && props.onClear();
    },
  },
  save: {
    text: '存',
    title: '保存草稿',
    action(editor) {
      if (!createStore?.createInfo?.content?.trim()) {
        message({
          title: '嘿！一个字都没写休想发布',
          message: '请先编写文章内容后再尝试发布！',
          type: 'warning',
        });
        return;
      }
      props?.onSaveDraft?.();
    },
  },
  draft: {
    text: '稿',
    title: '草稿列表',
    action(editor) {
      props?.onShowDraft?.();
    },
  },
  monaco: {
    text: 'vscode',
    title: '切换编辑器',
    action(editor) {
      props?.onChangeEditor?.();
    },
  },
  debug: {
    text: '测',
    title: '代码测试工具',
    action(editor) {
      props?.onShowCodeRun?.();
    },
  },
});

// 上传图片事件
const onUploadImage = async (event: Event, insertImage: Function, files: File) => {
  // 拿到 files 之后上传到文件服务器，然后向编辑框中插入对应的内容
  const res = await uploadStore.uploadFile(files[0]);
  insertImage({
    url: res?.filePath,
    desc: files[0]?.name,
  });
};

// 复制成功回调
const onCopyCodeSuccess = (value: string) => {
  props.copyCodeSuccess?.(value);
};
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.container {
  position: relative;

  .save-info {
    position: absolute;
    top: 12px;
    right: 145px;
    color: @font-danger;
    font-size: 12px;
    z-index: 99;
    .clickNoSelectText();
  }

  :deep {
    .v-md-editor {
      background-color: var(--fff);
    }

    .v-md-editor__toolbar-divider {
      margin: 0 8px;
    }

    .v-md-editor__right-area {
      background-color: var(--fff);
      border-radius: 5px;
    }

    .v-md-editor__left-area {
      border-right: 1px solid var(--card-border);
    }

    .v-md-editor__left-area-title {
      color: var(--font-1);

      &::after {
        border-bottom: 1px solid var(--card-border);
      }
    }

    .v-md-editor__menu-item {
      color: var(--font-2);
    }

    .v-md-editor__menu-item:hover {
      background-color: var(--card-border);
    }

    .v-md-editor__toc-nav-item {
      color: var(--font-2);
    }

    .v-md-editor__preview-wrapper {
      color: var(--font-2);
      border-left: 1px solid var(--card-border);
    }

    .vuepress-markdown-body {
      background-color: transparent;
      color: var(--e-edit-color);

      .v-md-pre-wrapper {
        background-color: var(--code-pre-bg);
        // background-color: var(--pre-bg-color);
        box-shadow: 0 0 2px var(--card-border);
      }

      .titleHsize();

      .codeStyle();

      & tr:nth-child(2n) {
        background-color: var(--pre-hover-bg);
      }

      & tr:nth-child(2n) {
        background-color: var(--table-even-bg);
      }
    }

    .v-md-editor__menu {
      background-color: var(--pop-menu-color);
      border: 1px solid var(--card-border);
    }

    .v-md-editor__toolbar {
      border-bottom: 1px solid var(--card-border);
      -webkit-app-region: no-drag;
    }

    .v-md-editor__editor-wrapper {
      border-right: none;
    }

    .v-md-editor__toolbar-item {
      color: var(--font-4);
      padding: 0 5px;

      &:hover {
        background-color: var(--bg-lg-color1);
        color: var(--font-4);
      }
    }

    .v-md-editor__toolbar-item--active {
      background-color: var(--bg-lg-color1);
      color: var(--font-4);

      &:hover {
        background-color: var(--bg-lg-color1);
      }
    }

    .v-md-editor {
      border-radius: 5px;
      box-shadow: 0 0 5px 0 var(--card-shadow);
    }

    .v-md-textarea-editor pre,
    .v-md-textarea-editor textarea {
      background-color: transparent;
      border-bottom-left-radius: 5px;
      color: var(--font-2);

      &::placeholder {
        color: var(--placeholder-color);
      }
    }

    .vuepress-markdown-body:not(.custom) {
      padding: 16px 20px;
    }

    .v-md-editor__toolbar-left {
      min-width: 200px;
    }

    .v-md-editor__toolbar-right {
      min-width: 125px;
    }

    .v-md-editor__toolbar-item-clear {
      color: @font-warning;
      font-size: 14px;
      line-height: 30px;
    }

    .v-md-editor__toolbar-item-create,
    .v-md-editor__toolbar-item-save,
    .v-md-editor__toolbar-item-draft,
    .v-md-editor__toolbar-item-monaco,
    .v-md-editor__toolbar-item-debug {
      color: var(--theme-blue);
      font-size: 14px;
      line-height: 30px;
    }

    .v-md-editor__toolbar-item-save {
      position: relative;

      &::before {
        position: absolute;
        right: 0px;
        top: 3px;
        content: '';
        width: 8px;
        height: 8px;
        background: @font-danger;
        border-radius: 8px;
        opacity: v-bind(showDot);
      }
    }

    .v-md-editor__toolbar-item-monaco {
      font-size: 16px;
      // margin-top: -2px;
    }
  }
}
</style>
