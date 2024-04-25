<!--
 * 代码运行器
 * @author: dnhyxc
 * @since: 2023-10-07
 * index.vue
-->
<template>
  <div class="code-run-wrap">
    <div v-if="!hideHeader" class="header">
      <div class="title">
        <span class="title-text">代码测试</span>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <div class="content">
      <div class="code-edit-wrap">
        <MonacoEditor
          v-model:theme="theme"
          toggle-language-lneed-clear-content
          is-code-edit
          :get-language="getLanguage"
          :language="codeStore.codeDetail.language"
          :get-code-content="getCodeContent"
          :code="prevCode || codeStore.codeDetail.content || ''"
          :on-enter="onEnter"
          class="code-edit"
        >
          <template #save="monacoData">
            <div class="action-list">
              <el-button type="primary" link class="save-code" title="示例列表" @click="showDemoList">
                示例列表
              </el-button>
              <el-tooltip
                v-if="language === 'javascript'"
                :offset="0"
                placement="top"
                popper-class="custom-dropdown-styles"
              >
                <template #content>
                  <span class="info-text">手动运行模式：</span>可以点击<span class="info-text"> 手动运行模式 </span
                  >按钮运行或 <span class="info-text">ctrl + s </span>或
                  <span class="info-text">command + s </span>运行<br />
                  <span class="info-text">类控制台模式：</span>在输入内容末尾处回车之后触发运行,
                  类似浏览器控制台的运行模式
                </template>
                <i class="iconfont icon-info-circle-color info" />
              </el-tooltip>
              <el-button
                :disabled="!codeContent || (runMode === 1 && language === 'javascript')"
                type="primary"
                link
                :class="`${language === 'javascript' ? 'js-run-code' : 'save-code'}`"
                @click="run(monacoData)"
              >
                {{
                  language === 'javascript'
                    ? runMode === 1
                      ? '类控制台模式'
                      : runMode === 2
                      ? '手动运行模式'
                      : '运行模式'
                    : '运行'
                }}
              </el-button>
              <el-dropdown v-if="language === 'javascript'" class="dropdown" popper-class="custom-dropdown-styles">
                <i class="iconfont icon-mulu" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="onChangeMode(1)">类控制台模式</el-dropdown-item>
                    <el-dropdown-item @click="onChangeMode(2)">手动运行模式</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button
                :disabled="!codeContent"
                type="primary"
                link
                class="save-code"
                :title="codeStore.currentCodeId && codeContent ? '更新' : '保存'"
                @click="showCodeForm"
              >
                {{ codeStore.currentCodeId && codeContent ? '更新' : '保存' }}
              </el-button>
              <el-button
                :disabled="!codeContent"
                type="warning"
                link
                class="save-code"
                title="重置"
                @click="onReset(monacoData)"
              >
                重置
              </el-button>
            </div>
          </template>
        </MonacoEditor>
      </div>
      <div class="preview">
        <div v-drag class="line" />
        <MonacoEditor
          v-if="language !== 'html'"
          v-model:theme="theme"
          language="javascript"
          :code="codeResults"
          :is-code-edit="true"
          readonly
          class="code-result"
        >
          <template #save="monacoData">
            <div class="action-list">
              <el-button
                :disabled="!codeResults || codeStore.compileLoading"
                type="warning"
                link
                class="save-code"
                title="重置"
                @click="onClear(monacoData)"
              >
                {{ codeStore.compileLoading ? '正在运行中...' : codeResults ? '清空' : '' }}
              </el-button>
            </div>
          </template>
          <template #resLanguage>
            <span class="language-text result-text">{{ language }} 运行结果</span>
          </template>
        </MonacoEditor>
        <div class="preview-content">
          <div class="toolbar">
            <el-button type="warning" link class="clear-code" title="清空" @click="onClear">
              {{ htmlClear ? '清空' : '' }}
            </el-button>
            <span class="run-title">{{ language }} 运行结果</span>
          </div>
          <div ref="previewRef" class="iframe-wrap" />
        </div>
      </div>
    </div>
    <el-dialog
      v-model="visible"
      :close-on-click-modal="false"
      :title="`${codeStore.currentCodeId && codeContent ? '更新' : '保存'}代码示例`"
      width="500px"
      draggable
    >
      <div class="dialog-content">
        <el-form ref="formRef" label-position="top" :model="codeStore.codeInfo" @submit.native.prevent>
          <el-form-item
            prop="title"
            label="示例名称"
            :rules="[
              {
                required: true,
                message: '请输入示例名称',
                trigger: 'blur',
              },
            ]"
          >
            <el-input v-model="codeStore.codeInfo.title" maxlength="50" show-word-limit placeholder="请输入示例名称" />
          </el-form-item>
          <el-form-item prop="abstract" label="示例描述">
            <el-input
              v-model="codeStore.codeInfo.abstract"
              :autosize="{ minRows: 4, maxRows: 6 }"
              type="textarea"
              maxlength="500"
              show-word-limit
              resize="none"
              placeholder="请输入示例描述"
            />
          </el-form-item>
        </el-form>
        <div class="actions">
          <el-button @click="onCancel">取消</el-button>
          <el-button type="primary" @click="onSaveDemo">
            {{ codeStore.currentCodeId && codeContent ? '更新' : '保存' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
    <CodeList v-model:model-value="demoVisible" v-model:prev-code="prevCode" :on-change-mode="onChangeMode" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed, watch } from 'vue';
import type { FormInstance } from 'element-plus';
import { codeTemplate, htmlTemplate, JSONParse, message } from '@/utils';
import { codeStore } from '@/store';
import CodeList from './CodeList/index.vue';

interface IProps {
  hideHeader?: boolean;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

defineProps<IProps>();

const emit = defineEmits<Emits>();
// 代码运行结果预览容器
const previewRef = ref<HTMLDivElement | null>(null);
// 代码运行的结果
const codeResults = ref<string>('');
// 主题颜色
const theme = ref<string>('vs-dark');
const iframeNode = ref<HTMLIFrameElement | null>(null);
// 编辑的语言
const language = ref<string>('javascript');
// 保存弹窗
const visible = ref<boolean>(false);
const demoVisible = ref<boolean>(false);
const formRef = ref<FormInstance>();
// 编辑内容
const codeContent = ref<string>('');
// 上次运行的代码
const prevCode = ref<string>('');
// 控制html清空按钮的显示状态
const htmlClear = ref<boolean>(false);
// 缓存编辑器内容
const codeCache = ref<string>('');
// js 运行模式
const runMode = ref<number>(1);

onMounted(() => {
  bindEvents();
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  // 页面销毁时清空创建的代码示例信息
  codeStore.clearCodeId();
  window.removeEventListener('keydown', onKeydown);
});

// 监听快捷键操作
const onKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's' && codeContent.value) {
    run({ data: { content: codeContent.value } });
  }
};

const background = computed(() => {
  return theme.value !== 'vs' ? '#1e1e1e' : '#fff';
});

const fontColor = computed(() => {
  return theme.value !== 'vs' ? '#fff' : '#000';
});

// 解决切换主题预览背景不跟随改变的问题
watch(background, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    run({ data: { content: '' } }, false);
  }
});

const bindEvents = () => {
  nextTick(() => {
    window.addEventListener('message', (e) => {
      if (e.data.from === 'codeRunner') {
        const { data, type } = e.data;
        const parseData = JSONParse(data);
        // 运行结果信息
        const runInfo = { type, data: '' };
        let code = parseData
          .map((item: any) => (typeof item === 'object' ? JSON.stringify(item) : item))
          .join('\n')
          .replace(/"([^"]+)":/g, '$1: ');
        if (type === 'error') {
          code = code.replace(/\s+/g, ' ');
        }
        runInfo.data = code;
        setCodeResults(runInfo);
      }
    });
  });
};

// js 语言切换运行模式
const onChangeMode = (mode: number) => {
  runMode.value = mode;
};

// 合并运行结果
const setCodeResults = (info: { type: string; data: string }) => {
  codeResults.value += `${info.data}\n\n`;
};

const createIframe = ({ code, display, id }: { code: string; display: string; id?: string }) => {
  iframeNode.value && previewRef.value?.removeChild(iframeNode.value);
  const iframe = document.createElement('iframe');
  iframeNode.value = iframe;
  iframe.src = 'about:blank';
  iframe.style.display = display;
  id && (iframe.id = id);
  previewRef.value?.appendChild(iframe);
  const frameDocument = iframe.contentWindow?.document!;
  frameDocument.open();
  frameDocument.write(code);
  frameDocument.close();
};

// 运行C语言
const runCCode = async (code: string, verifiy?: boolean) => {
  if (verifiy && (code.includes('scanf') || (code.includes('gets(') && code.includes('<string.h>')))) {
    message({
      title: '暂不支持 scanf、gets 等输入方法！',
      type: 'warning',
    });
    return;
  }
  if (verifiy && !code.includes('int main')) {
    message({
      title: '请检查运行语言是否匹配',
      type: 'warning',
    });
    return;
  }
  // 编译C语言
  await codeStore.compileCCode(code);

  codeResults.value = codeStore.compileData;
};

// 按下回车运行 JS
const onEnter = async (value: string) => {
  if (runMode.value === 2 || !value.trim()) return;
  if (codeCache.value !== value.trim() && !value.endsWith('\nconsole') && !value.endsWith('console')) {
    await codeStore.compileJSCode(value);
    codeResults.value = codeStore.compileData;
    codeCache.value = value.trim();
  }
};

// 运行JS
const runJSCode = async (code: string) => {
  if (runMode.value === 1) return;
  createIframe({ code: codeTemplate(code), display: 'none' });
};

// 运行HTML
const runHTMLCode = (code: string) => {
  createIframe({
    code: htmlTemplate(code, { background: background.value, color: fontColor.value }),
    display: 'block',
    id: '__HTML_RESULT__',
  });
};

// 运行代码
const run = async (monacoData?: any, verifiy = true) => {
  htmlClear.value = true;
  const { content: code } = monacoData?.data;
  prevCode.value = code;
  // console.clear();
  // 首先清除原有的代码执行结果
  codeResults.value = '';
  const actions = {
    c: runCCode,
    javascript: runJSCode,
    html: runHTMLCode,
  };
  actions[language.value](code, verifiy);
};

// 关闭
const onClose = () => {
  emit('update:modalVisible', false);
  console.clear();
  // 关闭时清空创建的代码示例信息
  codeStore.clearCodeId();
};

// 实时获取编辑内容
const getCodeContent = (code: string) => {
  codeContent.value = code;
};

// 获取当前编辑语言
const getLanguage = (value: string) => {
  language.value = value;
  if (iframeNode.value) {
    iframeNode.value.contentWindow!.document.body.innerHTML = '';
  }
  codeResults.value = '';
  htmlClear.value = false;
};

// 显示保存代码弹窗
const showCodeForm = () => {
  visible.value = true;
};

// 保存示例
const onSaveDemo = async () => {
  await codeStore.saveCode({ content: codeContent.value as string, language: language.value });
  visible.value = false;
};

// 取消保存
const onCancel = () => {
  visible.value = false;
};

// 显示代码示例列表弹窗
const showDemoList = () => {
  demoVisible.value = true;
  // 先清空列表再获取代码示例列表
  codeStore.clearCodeInfo();
  codeStore.getCodeList();
};

// 重置
const onReset = (monacoData: any) => {
  const { editor } = monacoData.data;
  editor?.getModel()?.setValue('');
  codeStore.clearCodeId();
  prevCode.value = '';
  if (iframeNode.value) {
    iframeNode.value.contentWindow!.document.body.innerHTML = '';
  }
  codeResults.value = '';
  htmlClear.value = false;
  onChangeMode(1);
};

// 清空html运行结果
const onClear = (monacoData?: any) => {
  if (monacoData) {
    monacoData.data?.editor?.getModel()?.setValue('');
  }
  if (iframeNode.value) {
    iframeNode.value.contentWindow!.document.body.innerHTML = '';
  }
  codeResults.value = '';
  htmlClear.value = false;
  prevCode.value = '';
  onChangeMode(1);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.manaco-code-style() {
  .toolbar {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .monaco-editor-wrap {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    .overflow-guard {
      border-bottom-right-radius: 0;
    }
  }
}

.code-run-wrap {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 5px 0 var(--card-shadow);
  background-color: var(--pre-hover-bg);

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 45px;
    width: 100%;
    box-sizing: border-box;
    padding: 0 10px;
    color: var(--font-1);
    border-bottom: 1px solid var(--card-border);

    .title-text {
      font-size: 18px;
      margin-right: 10px;
    }

    .demo-list {
      font-size: 16px;
      color: var(--theme-blue);
      cursor: pointer;

      &:hover {
        color: @active;
      }
    }

    .left {
      font-size: 18px;
    }

    .close {
      color: var(--theme-blue);
      cursor: pointer;

      &:hover {
        color: @active;
      }
    }
  }

  .content {
    position: relative;
    flex: 1;
    display: flex;
    justify-content: space-between;

    .code-edit-wrap {
      position: absolute;
      top: 0;
      left: 0;
      width: 65%;
      height: 100%;

      .code-edit {
        box-shadow: none;
        border-radius: 0;
        border-bottom-left-radius: 5px;

        :deep {
          .manaco-code-style();
        }
      }

      .dropdown {
        height: 100%;
        line-height: 40px;
        display: inline-block;
        color: var(--theme-blue);
        cursor: pointer;
      }

      .save-code {
        margin-left: 0;
        margin-right: 14px;
      }

      .info {
        margin-left: 1px;
        color: var(--active);
        cursor: pointer;
      }

      .js-run-code {
        margin-left: 0;
        margin-right: 0;
      }

      .icon-mulu {
        margin-right: 15px;
      }
    }

    .preview {
      position: absolute;
      top: 0;
      right: 0;
      width: 35%;
      height: 100%;
      background-color: @fff;
      z-index: 99;

      .line {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 1px;
        transform: scaleX(0.8);
        background-color: var(--card-border);
        cursor: ew-resize;
        z-index: 1;

        &:hover {
          width: 5px;
          height: 100%;
        }

        &:active {
          width: 5px;
        }
      }

      .code-result {
        box-shadow: none;
        border-radius: 0;
        border-bottom-right-radius: 5px;

        :deep {
          .manaco-code-style();
        }

        .language-text {
          height: 40px;
          line-height: 38px;
          .ellipsisMore(1);
        }
      }

      .preview-content {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        height: 100%;
        background-color: v-bind(background);

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;
          padding: 0 10px;
          box-sizing: border-box;
          background-color: v-bind(background);
          border-bottom: 1px solid var(--border-color);
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;

          .run-title {
            font-size: 14px;
            color: @font-4;
            .ellipsisMore(1);
            height: 30px;
            line-height: 30px;
            margin-right: 2px;
          }
        }

        .iframe-wrap {
          flex: 1;
        }
      }

      :deep {
        #__HTML_RESULT__ {
          height: 100%;
          width: 100%;
          background-color: v-bind(background);
          border: none;
          box-sizing: border-box;
        }
      }
    }
  }

  .action-list {
    .ellipsisMore(1);
    display: flex;
    align-items: center;
  }

  .dialog-content {
    :deep {
      .el-form-item__label {
        color: var(--font-3);
      }

      .el-input__wrapper {
        color: var(--font-1);
        background-color: var(--input-bg-color);
      }

      .el-input__inner {
        color: var(--font-color);
        background-color: transparent;

        &::-webkit-input-placeholder {
          color: var(--placeholder-color);
        }
      }

      .el-input__count {
        background: none;
      }

      .el-input__count-inner {
        background: none;
      }

      .el-textarea__inner {
        color: var(--font-1);
        background-color: var(--input-bg-color);

        &::-webkit-input-placeholder {
          color: var(--placeholder-color);
        }
      }
    }

    .inp {
      margin: 10px 0;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
