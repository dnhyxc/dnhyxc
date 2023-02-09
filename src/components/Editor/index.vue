<template>
  <div class="container">
    <v-md-editor
      v-model="mackdown"
      :height="height"
      autofocus
      left-toolbar="undo redo | h bold italic | quote code | strikethrough hr | emoji link image | ul ol table | create"
      :toolbar="toolbar"
      placeholder="编辑内容"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watchEffect } from 'vue';

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
}

interface IProps {
  articleId?: string;
  height?: string;
  mackdown?: string;
  onSaveMackdown?: (html: string) => void;
  onEditChange?: (html: string) => void;
  onPublish?: (html: string) => void;
}

const props = withDefaults(defineProps<IProps>(), {
  articleId: '',
  height: 'calc(100vh - 63px)',
  mackdown: '',
  onSaveMackdown: () => {},
  onEditChange: () => {},
  onPublish: () => {},
});

const mackdown = ref<string>('');

// 自定义工具栏配置
const toolbar = reactive<Toolbar>({
  create: {
    text: props.articleId ? '更新文章' : '发布文章',
    title: props.articleId ? '更新文章' : '发布文章',
    action(editor) {
      props.onPublish && props.onPublish(mackdown.value);
    },
  },
});

watchEffect(() => {
  if (props.mackdown) {
    mackdown.value = props.mackdown;
  }
});
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.container {
  background-color: @fff;
  :deep {
    .v-md-editor {
      border-radius: 5px;
      box-shadow: @shadow-mack;
    }
    .v-md-textarea-editor pre,
    .v-md-textarea-editor textarea {
      background-color: @fff;
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
      color: @theme-blue;
      font-size: 14px;
      line-height: 30px;
    }
  }
}
</style>
