<!--
 * diff editor
 * @author: dnhyxc
 * @since: 2024-01-29
 * index.vue
-->
<template>
  <div class="diff-editor-wrap">
    <div ref="diffEditorRef" class="diff-editor"></div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, nextTick, onBeforeUnmount, onMounted } from 'vue';
import * as monaco from 'monaco-editor';

interface IProps {
  language: string;
  oldValue: string;
  value: string;
  height: string;
  theme?: string;
}

const props = defineProps<IProps>();

const diffEditorRef = ref(null);
const defaultOpts = reactive({
  value: props.value || '',
  language: props.language || 'markdown', // 语言
  theme: props.theme || 'vs-dark', // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
  roundedSelection: false, // 右侧不显示编辑器预览框
  autoIndent: true, // 自动缩进
  readOnly: true, // 是否只读
  renderLineHighlight: 'none',
  lineNumbers: 'on',
  diffWordWrap: true,
  wordWrap: 'on',
  automaticLayout: true,
  minimap: {
    enabled: false, // 是否启用预览图
  },
  scrollBeyondLastLine: true, // 取消代码后面一大段空白
  overviewRulerBorder: false, // 不要滚动条的边框
  fontSize: 16, // 字体大小
  scrollbar: {
    // 滚动条设置
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
    arrowSize: 10,
    alwaysConsumeMouseWheel: false,
  },
});
let originalModel: monaco.editor.ITextModel | null;
let modifiedModel: monaco.editor.ITextModel | null;
let monacoDiffInstance: monaco.editor.IStandaloneDiffEditor | null;

onMounted(() => {
  nextTick(() => {
    init();
  });
});

onBeforeUnmount(() => {
  monacoDiffInstance?.dispose();
  originalModel = null;
  modifiedModel = null;
  monacoDiffInstance = null;
});

watch(
  () => props.oldValue,
  (newValue) => {
    originalModel = monaco.editor.createModel(newValue, props.language || 'markdown');
    monacoDiffInstance?.setModel({
      original: originalModel,
      modified: modifiedModel!,
    });
  },
  { deep: true },
);

watch(
  () => props.value,
  (newValue) => {
    modifiedModel = monaco.editor.createModel(newValue, props.language || 'markdown');
    monacoDiffInstance?.setModel({
      original: originalModel!,
      modified: modifiedModel,
    });
  },
  { deep: true },
);

// 初始化编辑器实例
const init = () => {
  if (!diffEditorRef.value) return;
  monacoDiffInstance = monaco.editor.createDiffEditor(diffEditorRef.value, defaultOpts as any);
  originalModel = monaco.editor.createModel(props.oldValue, props.language || 'markdown');
  modifiedModel = monaco.editor.createModel(props.value, props.language || 'markdown');
  monacoDiffInstance.setModel({
    original: originalModel,
    modified: modifiedModel,
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.diff-editor-wrap {
  height: 100%;
  width: 100%;
  border-radius: 5px;

  .diff-editor {
    height: v-bind(height);
  }

  :deep {
    .monaco-diff-editor.side-by-side .editor.modified {
      box-shadow: 0 0 1px 0 var(--border-color);
    }
  }
}
</style>
