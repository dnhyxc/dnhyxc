<template>
  <div class="container">
    <!-- 上传图片菜单默认为禁用状态 设置 disabled-menus 为空数组可以开启 -->
    <v-md-editor
      v-model.trim="createStore.createInfo.content"
      placeholder="编辑内容"
      autofocus
      :height="height"
      :disabled-menus="[]"
      left-toolbar="undo redo | h bold italic | quote code | strikethrough hr | emoji link image | ul ol table | clear | create"
      :toolbar="toolbar"
      @upload-image="onUploadImage"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, onActivated, onDeactivated } from 'vue';
import { ElMessage } from 'element-plus';
import { createStore } from '@/store';

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
}

interface IProps {
  articleId?: string;
  height?: string;
  onSaveMackdown?: (html: string) => void;
  onEditChange?: (html: string) => void;
  onPublish?: () => void;
  onClear?: () => void;
}

const props = withDefaults(defineProps<IProps>(), {
  articleId: '',
  height: 'calc(100vh - 75px)',
  onSaveMackdown: () => {},
  onEditChange: () => {},
  onPublish: () => {},
  onClear: () => {},
});

onActivated(() => {
  console.log('组件显示');
});

onDeactivated(() => {
  console.log('组件隐藏');
});

// 自定义工具栏配置
const toolbar = reactive<Toolbar>({
  create: {
    text: '发布',
    title: '发布',
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
    text: '清空',
    title: '清空',
    action(editor) {
      props.onClear && props.onClear();
    },
  },
});

// 上传图片事件
const onUploadImage = (event: Event, insertImage: Function, files: File) => {
  // 拿到 files 之后上传到文件服务器，然后向编辑框中插入对应的内容
  console.log(files);

  insertImage({
    url: 'https://pic1.zhimg.com/80/v2-32af95c7b9bb7da9e9f9f3e2601cc46c_720w.webp?source=1940ef5c',
    desc: '养眼',
    width: '100%',
    height: 'auto',
  });
};
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
    .v-md-editor__toolbar-item-clear {
      color: @font-warning;
      font-size: 14px;
      line-height: 30px;
    }
  }
}
</style>
