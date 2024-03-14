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
          <el-dropdown class="menu-list" max-height="200px" popper-class="custom-dropdown-styles">
            <span class="action iconfont icon-yuyan" title="切换语言" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="item in languages"
                  :key="item"
                  class="dropdown-text"
                  @click="onChangeLanguage(item)"
                >
                  {{ item }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown class="menu-list" popper-class="custom-dropdown-styles">
            <span class="action iconfont icon-sketchpad-theme" title="切换主题" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item class="dropdown-text" @click="onSelectTheme('vs')">晶莹白</el-dropdown-item>
                <el-dropdown-item class="dropdown-text" @click="onSelectTheme('vs-dark')">暗夜黑</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span class="action iconfont icon-tishi" title="快捷键说明" @click="onShowInfo" />
          <span v-if="!isCodeEdit" class="action iconfont icon-bianjiqi" title="切换编辑器" @click="onChangeEditor" />
        </div>
        <div v-if="!isCodeEdit" class="create-action">
          <div v-if="showDot" class="action un-save" @click="onDiffValue">未保存</div>
          <div v-if="showDot" class="action" @click="onDiffValue">
            {{ showDiff ? '关闭对比' : '对比变更' }}
          </div>
          <el-button
            class="action clear"
            type="warning"
            link
            title="清空内容"
            :disabled="!createStore.createInfo.content?.trim()"
            @click="onClear"
          >
            清
          </el-button>
          <span class="action" title="草稿列表" @click="onShowDraft">稿</span>
          <span v-if="createStore.draftArticleId" class="action" title="预览草稿" @click="onPreviewDraft">览</span>
          <span class="action save-draft" title="保存草稿" @click="onSaveDraft">存</span>
          <span class="action" title="发布文章" @click="onPublish">发</span>
        </div>
        <div v-if="isCodeEdit" class="create-action prev-action">
          <slot name="save" :data="{ content, editor }"></slot>
        </div>
      </div>
      <div class="right">
        <slot v-if="!readonly" name="curLanguage">
          <div class="language-text">当前语言：{{ language }}</div>
        </slot>
        <slot v-else name="resLanguage">
          <span class="language-text result-text">{{ language }} 运行结果</span>
        </slot>
      </div>
    </div>
    <div
      v-show="!showDiff"
      ref="editorRef"
      :class="`${theme !== 'vs' && 'dark-monaco-editor-wrap'} monaco-editor-wrap`"
    />
    <DiffMonacoEditor
      v-show="showDiff"
      :value="createStore.createInfo.content || ''"
      :old-value="prevContent || ''"
      language="markdown"
      :height="checkOS() === 'mac' ? 'calc(100vh - 138px)' : 'calc(100vh - 125px)'"
    />
    <ElModel v-model:visible="visible" title="vscode 快捷键说明" :footer="false" :width="'86vw'" :draggable="false">
      <template #content>
        <div class="model-content">
          <el-scrollbar>
            <div v-for="item in VS_CODE_SHORTCUT_KEYS" :key="item.name" class="shortcuts">
              <span class="key-name">{{ item.name }}</span>
              <span class="key-desc">{{ item.desc }}</span>
            </div>
          </el-scrollbar>
        </div>
      </template>
    </ElModel>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onDeactivated, computed, watchEffect, watch } from 'vue';
import * as monaco from 'monaco-editor';
import { ElMessage } from 'element-plus';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import prettier from 'prettier';
import parserMarkdown from 'prettier/parser-markdown';
import parserBabel from 'prettier/parser-babel';
import parserTypescript from 'prettier/parser-typescript';
import parserHtml from 'prettier/parser-html';
import parserYaml from 'prettier/parser-yaml';
import parserPostcss from 'prettier/parser-postcss';
import { MONACO_EDITOR_LANGUAGES, CODE_RUN_LANGUAGES, VS_CODE_SHORTCUT_KEYS } from '@/constant';
import { checkOS } from '@/utils';
import { createStore } from '@/store';
import DiffMonacoEditor from '@/components/MonacoDiffEditor/index.vue';

interface IProps {
  editType?: boolean;
  onChangeEditor?: () => void;
  onPublish?: () => void;
  onClear?: () => void;
  onShowDraft?: () => void;
  toPreview?: (id: string) => void;
  onSaveDraft?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  isCodeEdit?: boolean;
  readonly?: boolean;
  code?: string; // 传入的code内容
  theme?: string;
  getLanguage?: (language: string) => void;
  getCodeContent?: (code: string) => void;
  saveText?: string;
  language?: string;
  showDot?: number;
  prevContent?: string;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:theme']);

// 编辑器ref
const editorRef = ref<HTMLDivElement | null>(null);
// 当前语言
const language = ref<string>(props.isCodeEdit ? 'javascript' : 'markdown');
// 编辑代码模式时的默认值
const content = ref<string | undefined>('');
// 是否显示快捷键提示弹窗
const visible = ref<boolean>(false);
// 控制是否显示对比内容
const showDiff = ref<boolean>(false);

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

watch(
  () => props.showDot,
  (newVal) => {
    if (!newVal) {
      showDiff.value = false;
    }
  },
);

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
        wordWrap: 'on', // 超出一屏自动换行
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

// markdown 格式化
const provider = {
  provideDocumentFormattingEdits: (model: any, options: any, token: any) => {
    const text = model.getValue();
    const formattedText = prettier.format(text, {
      parser: 'markdown',
      singleQuote: true,
      plugins: [parserMarkdown, parserBabel, parserTypescript, parserHtml, parserPostcss, parserYaml],
    });
    return [
      {
        range: model.getFullModelRange(),
        text: formattedText,
      },
    ];
  },
};

// 注册 markdown 格式化
monaco.languages.registerDocumentFormattingEditProvider('markdown', provider);

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

// 预览
const onPreviewDraft = () => {
  if (!createStore?.draftArticleId) return;
  props?.toPreview?.(createStore?.draftArticleId);
};

// 显示快捷键提示弹窗
const onShowInfo = () => {
  visible.value = true;
};

// 显示变更内容
const onDiffValue = () => {
  showDiff.value = !showDiff.value;
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.container {
  position: relative;
  height: 100%;
  border-radius: 5px;
  box-sizing: border-box;
  box-shadow: 0 0 8px 0 var(--shadow-mack);
  overflow: hidden;

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 10px;
    box-sizing: border-box;
    background-color: @fff;
    border-bottom: 1px solid var(--border-color);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    .create-action {
      margin-bottom: 2px;
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
        display: inline-block;
        color: var(--theme-blue);
        font-size: 14px;
        height: 20px;
        line-height: 20px;
        cursor: pointer;
        margin-right: 14px;

        &:hover {
          color: var(--active);
        }

        .diff {
          margin-left: 14px;
        }
      }

      .un-save {
        font-size: 12px;
        color: @font-danger;
        &:hover {
          color: @font-danger;
        }
        cursor: default;
      }

      .save-draft {
        position: relative;

        &::before {
          position: absolute;
          right: -6px;
          top: -3px;
          content: '';
          width: 8px;
          height: 7px;
          background: @font-danger;
          border-radius: 8px;
          opacity: v-bind(showDot);
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

      .icon-tishi {
        font-size: 16px;
        margin-top: -2px;
      }

      .icon-bianjiqi {
        font-size: 17px;
      }

      .clear {
        font-size: 14px;
        color: @font-warning;
        margin-right: 14px;
        padding: 0;
        margin-top: -1px;
        height: 20px;
        line-height: 20px;
      }
    }

    .right {
      display: flex;
      justify-content: flex-end;
      font-size: 14px;
      color: @font-5;

      .language-text {
        height: 40px;
        line-height: 38px;
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

  .model-content {
    height: 72vh;

    .shortcuts {
      display: flex;
      justify-content: center;
      padding: 10px 0;
      color: var(--font-1);

      .key-name {
        margin-right: 20px;
        font-weight: 700;
      }

      .key-desc {
        color: var(--font-3);
      }
    }
  }
}

:deep {
  .dropdown-text {
    color: var(--font-1);

    &:hover {
      color: var(--theme-blue);
      background-color: var(--pre-bg-color);
    }
  }
}
</style>
