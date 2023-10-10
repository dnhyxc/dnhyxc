<!--
 * 代码运行器
 * @author: dnhyxc
 * @since: 2023-10-07
 * index.vue
-->
<template>
  <div class="code-run-wrap">
    <div class="header">
      <span class="title">代码测试</span>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <div class="content">
      <div class="code-edit-wrap">
        <MonacoEditor v-model:theme="theme" :run="run" :is-code-edit="true" class="code-edit" />
      </div>
      <div class="preview">
        <div v-drag class="line" />
        <MonacoEditor v-model:theme="theme" :code="codeResults" :is-code-edit="true" readonly class="code-result" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { codeTemplate, JSONParse } from '@/utils';

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

const emit = defineEmits<Emits>();

// 需要运行的源代码
const sourceCode = ref<string>('');
// 代码运行的结果
const codeResults = ref<string>('');
// 主题颜色
const theme = ref<string>('vs');
const iframeNode = ref<HTMLIFrameElement | null>(null);

onMounted(() => {
  bindEvents();
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

const setCodeResults = (info: { type: string; data: string }) => {
  codeResults.value += `${info.data}\n\n`;
};

// 运行代码
const run = (code: string) => {
  // if (sourceCode.value === code) return;
  iframeNode.value && document.body.removeChild(iframeNode.value);
  console.clear();
  // 首先清楚原有的代码执行结果
  codeResults.value = '';
  sourceCode.value = code;
  const iframe = document.createElement('iframe');
  iframeNode.value = iframe;
  iframe.style.display = 'none';
  iframe.src = 'about:blank';
  iframe.id = 'RUN_CODE';
  document.body.appendChild(iframe);
  const frameDocument = iframe.contentWindow?.document!;
  frameDocument.open();
  frameDocument.write(codeTemplate(code) as string);
  frameDocument.close();
};

// 关闭
const onClose = () => {
  emit('update:modalVisible', false);
  iframeNode.value && document.body.removeChild(iframeNode.value);
  console.clear();
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

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
          .toolbar {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
          }
          .monaco-editor-wrap {
            border-bottom-right-radius: 0;
          }
        }
      }
    }

    .preview {
      position: absolute;
      top: 0;
      right: 0;
      width: 35%;
      height: 100%;

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
          .toolbar {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
          }
          .monaco-editor-wrap {
            border-bottom-left-radius: 0;
          }
        }
      }
    }
  }
}
</style>
