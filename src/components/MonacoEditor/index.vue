<!--
 * MonacoEditor 代码编辑器组建
 * @author: dnhyxc
 * @since: 2023-09-12
 * index.vue
-->
<template>
  <div class="toolbar">
    <el-tooltip effect="light" content="切换编辑器" placement="bottom">
      <el-button type="primary" link @click="changeLanguage">mackdown</el-button>
    </el-tooltip>
    <el-tooltip effect="light" content="转换编辑语言" placement="bottom">
      <el-button type="primary" link @click="changeLanguage">language</el-button>
    </el-tooltip>
  </div>
  <div ref="editorRef" class="monaco-editor-wrap"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
// @ts-ignore
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// @ts-ignore
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// @ts-ignore
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
// @ts-ignore
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import * as monaco from 'monaco-editor';

const editorRef = ref<any>();
const content = ref<any>();

let editor: monaco.editor.IStandaloneCodeEditor;

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (['typescript', 'javascript'].includes(label)) {
      return new tsWorker();
    }
    return new EditorWorker();
  },
};

onMounted(() => {
  initEditor();
});

// 初始化编辑器
const initEditor = () => {
  nextTick(() => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
    });

    if (!editor) {
      editor = monaco.editor.create(editorRef.value, {
        value: content.value, // 编辑器初始显示文字
        language: 'javascript', // 语言支持自行查阅demo
        automaticLayout: true, // 自适应布局
        theme: 'vs-dark', // 官方自带三种主题vs, hc-black, or vs-dark
        foldingStrategy: 'indentation',
        renderLineHighlight: 'all', // 行亮
        selectOnLineNumbers: true, // 显示行号
        minimap: {
          enabled: false, // 是否启用预览图
        },
        readOnly: false, // 只读
        fontSize: 14, // 字体大小
        scrollBeyondLastLine: true, // 取消代码后面一大段空白
        overviewRulerBorder: false, // 不要滚动条的边框
        tabSize: 2,
        colorDecorators: true, // 呈现内联色彩装饰器和颜色选择器
      });

      setTheme();
    } else {
      editor.setValue('');
    }

    // 监听值的变化
    editor.onDidChangeModelContent(() => {
      console.log(editor.getValue(), 'editor.getValue()');
      content.value = editor.getValue();
    });
  });
};

// 设置主题颜色
const setTheme = () => {
  // 定义一个主题
  monaco.editor.defineTheme('myTheme', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      // 'editor.foreground': '#000000',
      'editor.background': '#EDF9FA',
      // 'editorCursor.foreground': '#8B0000',
      // 'editor.lineHighlightBackground': '#0000FF20',
      // 'editorLineNumber.foreground': '#008800',
      // 'editor.selectionBackground': '#88000030',
      // 'editor.inactiveSelectionBackground': '#88000015',
    },
  });
  monaco.editor.setTheme('myTheme');
};

// 切换语言
const changeLanguage = () => {
  monaco.editor.setModelLanguage(editor?.getModel()!, 'html');
};

onUnmounted(() => {
  // editor.dispose();
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.toolbar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 10px;
  box-sizing: border-box;
  background-color: var(--modal-bg-color);
  border-bottom: 1px solid var(--card-border);
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.monaco-editor-wrap {
  height: calc(100% - 40px);

  :deep {
    .monaco-editor,
    .overflow-guard {
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }
}
</style>
