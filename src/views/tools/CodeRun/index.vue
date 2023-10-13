<!--
 * 代码运行器
 * @author: dnhyxc
 * @since: 2023-10-07
 * index.vue
-->
<template>
  <div class="code-run-wrap">
    <div class="header">
      <div class="title">
        <span class="title-text">代码测试</span>
        <span type="primary" link class="demo-list" @click="showDemoList">示例列表</span>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <div class="content">
      <div class="code-edit-wrap">
        <MonacoEditor
          v-model:theme="theme"
          :is-code-edit="true"
          :get-language="getLanguage"
          :language="codeStore.codeDetail.language"
          :get-code-content="getCodeContent"
          :code="codeStore.codeDetail.content || ''"
          class="code-edit"
        >
          <template #save="monacoData">
            <div class="action-list">
              <el-button
                :disabled="!codeContent"
                type="primary"
                link
                class="save-code"
                title="发布文章"
                @click="run(monacoData)"
              >
                运行
              </el-button>
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
          :code="codeResults"
          :is-code-edit="true"
          readonly
          class="code-result"
        >
          <template #save="monacoData">
            <div class="action-list">
              <el-button
                :disabled="!codeResults"
                type="warning"
                link
                class="save-code"
                title="重置"
                @click="onClear(monacoData)"
              >
                清空
              </el-button>
            </div>
          </template>
        </MonacoEditor>
        <div class="preview-content">
          <div class="toolbar">
            <el-button type="warning" link class="clear-code" title="清空" @click="onClear">清空</el-button>
            <span class="run-title">{{ language }} 运行结果</span>
          </div>
          <div ref="previewRef" class="iframe-wrap" />
        </div>
      </div>
    </div>
    <el-dialog v-model="visible" :close-on-click-modal="false" title="保存代码示例" width="500px" draggable>
      <div class="dialog-content">
        <el-form ref="formRef" label-width="80px" :model="codeStore.codeInfo">
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
            <el-input v-model="codeStore.codeInfo.title" placeholder="请输入示例名称" />
          </el-form-item>
          <el-form-item prop="abstract" label="示例描述">
            <el-input
              v-model="codeStore.codeInfo.abstract"
              :autosize="{ minRows: 3, maxRows: 5 }"
              type="textarea"
              maxlength="100"
              show-word-limit
              resize="none"
              placeholder="请输入示例描述"
            />
          </el-form-item>
        </el-form>
        <div class="actions">
          <el-button type="primary" @click="onSaveDemo">保存示例</el-button>
          <el-button @click="onCancel">取消保存</el-button>
        </div>
      </div>
    </el-dialog>
    <CodeList v-model:model-value="demoVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue';
import type { FormInstance } from 'element-plus';
import { codeTemplate, htmlTemplate, JSONParse } from '@/utils';
import { codeStore } from '@/store';
import CodeList from './CodeList/index.vue';

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

const emit = defineEmits<Emits>();
// 代码运行结果预览容器
const previewRef = ref<HTMLDivElement | null>(null);
// 代码运行的结果
const codeResults = ref<string>('');
// 主题颜色
const theme = ref<string>('vs');
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

onMounted(() => {
  bindEvents();
});

onUnmounted(() => {
  // 页面销毁时清空创建的代码示例信息
  codeStore.clearCodeId();
});

const background = computed(() => {
  return theme.value !== 'vs' ? '#1e1e1e' : '#fff';
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

// 运行代码
const run = (monacoData: any) => {
  const { content: code } = monacoData.data;
  prevCode.value = code;
  console.clear();
  // 首先清除原有的代码执行结果
  codeResults.value = '';
  if (language.value === 'html') {
    createIframe({
      code: htmlTemplate(code, { background: background.value }),
      display: 'block',
      id: '__HTML_RESULT__',
    });
  } else {
    createIframe({ code: codeTemplate(code) as string, display: 'none' });
  }
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
};

// 清空html运行结果
const onClear = (monacoData?: any) => {
  if (monacoData) {
    monacoData.data?.editor?.getModel()?.setValue('');
  }
  if (iframeNode.value) {
    iframeNode.value.contentWindow!.document.body.innerHTML = '';
  }
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
  height: 100%;
  box-shadow: 0 0 8px 0 var(--shadow-mack);
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

    .title-text {
      margin-right: 10px;
    }

    .demo-list {
      font-size: 14px;
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

        :deep {
          .manaco-code-style();
        }
      }

      .save-code {
        margin-left: 0;
        margin-right: 14px;
      }

      .action-list {
        .ellipsisMore(1);
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

        :deep {
          .manaco-code-style();
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
          border-bottom: 1px solid var(--card-border);
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
          background-color: @fff;
          border: none;
          box-sizing: border-box;
        }
      }
    }
  }

  .dialog-content {
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
