<!--
 * MonacoEditor 代码编辑器组建
 * @author: dnhyxc
 * @since: 2023-09-12
 * index.vue
-->
<template>
  <div class="container">
    <div :class="`${theme !== 'vs' && 'dark-toolbar'} toolbar`">
      <div class="left">
        <div v-if="!readonly" class="code-action">
          <el-dropdown class="menu-list" max-height="200px">
            <span class="action iconfont icon-yuyan" title="切换语言" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="item in languages" :key="item" @click="onChangeLanguage(item)">
                  {{ item }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown class="menu-list" trigger="click">
            <span class="action iconfont icon-sketchpad-theme" title="切换主题" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="onSelectTheme('vs')">晶莹白</el-dropdown-item>
                <el-dropdown-item @click="onSelectTheme('vs-dark')">暗夜黑</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span v-if="!isCodeEdit" class="action iconfont icon-markdown" title="切换编辑器" @click="onChangeEditor" />
        </div>
        <div v-if="!isCodeEdit" class="create-action">
          <el-button
            class="clear"
            type="warning"
            link
            title="清空内容"
            :disabled="!createStore.createInfo.content?.trim()"
            @click="onClear"
          >
            清
          </el-button>
          <span class="action" title="草稿列表" @click="onShowDraft">稿</span>
          <span class="action" title="保存草稿" @click="onSaveDraft">存</span>
          <span class="action" title="发布文章" @click="onPublish">发</span>
        </div>
        <div v-if="isCodeEdit" class="create-action prev-action">
          <slot name="save" :data="{ content, editor }"></slot>
        </div>
      </div>
      <div class="right">
        <div v-if="!readonly" class="language-text">当前语言：{{ language }}</div>
        <span v-else class="language-text result-text">{{ language }} 运行结果</span>
      </div>
    </div>
    <div ref="editorRef" :class="`${theme !== 'vs' && 'dark-monaco-editor-wrap'} monaco-editor-wrap`"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onDeactivated, computed, watchEffect } from 'vue';
import * as monaco from 'monaco-editor';
import { ElMessage } from 'element-plus';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { MONACO_EDITOR_LANGUAGES, CODE_RUN_LANGUAGES } from '@/constant';
import { createStore } from '@/store';

interface IProps {
  editType?: boolean;
  onChangeEditor?: () => void;
  onPublish?: () => void;
  onClear?: () => void;
  onShowDraft?: () => void;
  onSaveDraft?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  isCodeEdit?: boolean;
  readonly?: boolean;
  code?: string; // 传入的code内容
  theme?: string;
  getLanguage?: (language: string) => void;
  getCodeContent?: (code: string) => void;
  saveText?: string;
  language?: string;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:theme']);

// 编辑器ref
const editorRef = ref<HTMLDivElement | null>(null);
// 当前语言
const language = ref<string>(props.isCodeEdit ? 'javascript' : 'markdown');
// 编辑代码模式时的默认值
const content = ref<string | undefined>('');

let editor: monaco.editor.IStandaloneCodeEditor | null = null;

const theme = computed({
  get() {
    return props.theme as string;
  },
  set(value: string) {
    emit('update:theme', value);
  },
});

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

watchEffect(() => {
  // 设置编辑内容
  if (props.code && editor) {
    editor.getModel()?.setValue(props.code);
  }
  if (props.code === '' && editor) {
    editor.getModel()?.setValue('');
  }
  // 切换语言
  if (props.language && editor) {
    onChangeLanguage(props.language);
  }
});

const languages = computed(() => (props?.isCodeEdit ? CODE_RUN_LANGUAGES : MONACO_EDITOR_LANGUAGES));

// 组件弃用时，显示mackdown编辑器
onDeactivated(() => {
  props?.onChangeEditor?.();
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
    // 使ts能够实时显示警告和错误
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

    if (!editor) {
      editor = monaco.editor.create(editorRef?.value!, {
        value: props.isCodeEdit ? (props.readonly ? props.code : content.value) : createStore.createInfo.content, // 编辑器初始显示文字
        language: language.value, // 语言
        theme: props.theme || 'vs-dark', // 官方自带三种主题vs, hc-black, or vs-dark
        automaticLayout: true, // 自适应布局
        foldingStrategy: 'indentation',
        renderLineHighlight: props.readonly ? 'none' : 'all', // 行亮 all line none
        selectOnLineNumbers: true, // 显示行号
        lineNumbers: props.readonly ? 'off' : 'on', // 是否显示行号
        minimap: {
          enabled: false, // 是否启用预览图
        },
        scrollbar: {
          // 滚动条设置
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
          arrowSize: 10,
          alwaysConsumeMouseWheel: false,
        },
        readOnly: props.readonly, // 只读
        fontSize: 16, // 字体大小
        scrollBeyondLastLine: true, // 取消代码后面一大段空白
        overviewRulerBorder: false, // 不要滚动条的边框
        tabSize: 2,
        colorDecorators: true, // 呈现内联色彩装饰器和颜色选择器
      });
    }

    // 监听值的变化
    editor.onDidChangeModelContent(() => {
      if (props.isCodeEdit) {
        content.value = editor?.getValue() || '';
      } else {
        createStore.createInfo.content = editor?.getValue();
      }
      props?.getCodeContent?.(editor?.getValue() as string);
    });
  });
};

// 设置主题颜色
const setTheme = (type: string) => {
  emit('update:theme', type);
  // 定义一个主题
  monaco.editor.defineTheme('myTheme', {
    base: type as any,
    inherit: true,
    rules: [],
    colors: {},
  });
  monaco.editor.setTheme('myTheme');
};

// 切换语言
const onChangeLanguage = (value: string) => {
  language.value = value;
  monaco.editor.setModelLanguage(editor?.getModel()!, value);
  props?.getLanguage?.(value);
};

// 切换主题
const onSelectTheme = (type: string) => {
  setTheme(type);
};

// 切换编辑器类型
const onChangeEditor = () => {
  editor?.getModel()?.setValue(createStore.createInfo.content || '');
  props?.onChangeEditor?.();
};

// 清空编辑
const onClear = () => {
  props.onClear?.();
  editor?.getModel()?.setValue('');
};

// 保存
const onPublish = () => {
  if (!createStore?.createInfo?.content?.trim()) {
    ElMessage({
      message: '嘿！一个字都没写休想发布',
      type: 'warning',
      offset: 80,
    });
    return;
  }
  props.onPublish?.();
};

// 保存草稿
const onSaveDraft = () => {
  if (!createStore?.createInfo?.content?.trim()) {
    ElMessage({
      message: '嘿！一个字都没写休想发布',
      type: 'warning',
      offset: 80,
    });
    return;
  }
  props.onSaveDraft?.(editor as any);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.container {
  height: 100%;
  border-radius: 5px;
  box-sizing: border-box;
  box-shadow: 0 0 8px 0 var(--shadow-mack);

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 10px;
    box-sizing: border-box;
    background-color: @fff;
    // background-color: var(--pre-hover-bg);
    border-bottom: 1px solid var(--border-color);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    .create-action {
      .ellipsisMore(1);
    }

    .prev-action {
      display: flex;
      justify-content: space-between;
    }

    .menu-list {
      display: flex;
      align-items: center;
    }

    .left {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-right: 10px;

      .code-action {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      .action {
        color: var(--theme-blue);
        font-size: 14px;
        height: 30px;
        line-height: 30px;
        cursor: pointer;
        margin-right: 14px;

        &:hover {
          color: var(--active);
        }
      }

      .run-code {
        margin-right: 14px;
      }

      .clear-code {
        margin-left: 0;
        margin-right: 14px;
      }

      .icon-yuyan {
        font-size: 16px;
      }

      .icon-sketchpad-theme {
        font-size: 15px;
      }

      .icon-markdown {
        font-size: 25px;
      }

      .clear {
        font-size: 14px;
        color: @font-warning;
        margin-right: 14px;
        padding: 0;
        height: 30px;
        line-height: 30px;
      }
    }

    .right {
      display: flex;
      justify-content: flex-end;
      font-size: 14px;
      color: @font-5;

      .language-text {
        height: 30px;
        line-height: 30px;
        .ellipsisMore(1);
      }

      .result-text {
        margin-right: 2px;
      }
    }
  }

  .monaco-editor-wrap {
    height: calc(100% - 40px);
    padding: 10px 3px 0;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    background-color: @fff;
    box-sizing: border-box;

    :deep {
      .monaco-editor,
      .overflow-guard {
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
      }
    }
  }

  .dark-toolbar,
  .dark-monaco-editor-wrap {
    background-color: #1e1e1e;
  }
}
</style>
