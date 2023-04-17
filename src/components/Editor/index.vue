<template>
  <div class="container">
    <!-- 上传图片菜单默认为禁用状态 设置 disabled-menus 为空数组可以开启 -->
    <v-md-editor
      v-model.trim="createStore.createInfo.content"
      placeholder="编辑内容"
      autofocus
      :height="height"
      :disabled-menus="[]"
      left-toolbar="undo redo | h bold italic | quote code | strikethrough hr | emoji link image | ul ol table | clear | draft | save | create"
      :toolbar="toolbar"
      @upload-image="onUploadImage"
      @copy-code-success="onCopyCodeSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { createStore, uploadStore } from '@/store';

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
}

interface IProps {
  articleId?: string;
  height?: string;
  onPublish?: () => void;
  onClear?: () => void;
  onShowDraft?: () => void;
  onSaveDraft?: () => void;
  copyCodeSuccess?: (value?: string) => void;
}

const props = withDefaults(defineProps<IProps>(), {
  articleId: '',
  height: 'calc(100vh - 75px)',
  onPublish: () => {},
  onClear: () => {},
  onShowDraft: () => {},
  onSaveDraft: () => {},
  copyCodeSuccess: () => {},
});

// 自定义工具栏配置
const toolbar = reactive<Toolbar>({
  create: {
    text: '发',
    title: '发布文章',
    action(editor) {
      if (!createStore?.createInfo?.content) {
        ElMessage({
          message: '嘿！一个字都没写休想发布',
          type: 'warning',
          offset: 80,
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
      if (!createStore?.createInfo?.content) {
        ElMessage({
          message: '嘿！一个字都没写休想发布',
          type: 'warning',
          offset: 80,
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
});

// 上传图片事件
const onUploadImage = async (event: Event, insertImage: Function, files: File) => {
  // 拿到 files 之后上传到文件服务器，然后向编辑框中插入对应的内容
  const res = await uploadStore.uploadFile(files[0]);
  insertImage({
    url: res,
    desc: files[0]?.name,
    width: '100%',
    height: 'auto',
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
  background-color: var(--fff);
  :deep {
    .v-md-editor {
      border-radius: 5px;
      box-shadow: @shadow-mack;
    }
    .v-md-textarea-editor pre,
    .v-md-textarea-editor textarea {
      background-color: var(--fff);
      border-bottom-left-radius: 5px;
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
    .v-md-editor__toolbar-item-create {
      color: var(--theme-blue);
      font-size: 14px;
      line-height: 30px;
    }
    .v-md-editor__toolbar-item-clear {
      color: @font-warning;
      font-size: 14px;
      line-height: 30px;
    }
    .v-md-editor__toolbar-item-save {
      color: var(--theme-blue);
      font-size: 14px;
      line-height: 30px;
    }
    .v-md-editor__toolbar-item-draft {
      color: var(--theme-blue);
      font-size: 14px;
      line-height: 30px;
    }
  }
}
</style>
