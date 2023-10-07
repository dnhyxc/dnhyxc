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
        <MonacoEditor :run="run" :is-code-edit="true" />
      </div>
      <div class="preview">运行预览 {{ runCode }}</div>
      <iframe ref="iframe" style="display: none" sandbox="allow-same-origin allow-scripts"></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { codeTemplate, JSONParse, JSONStringify } from '@/utils';

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

const emit = defineEmits<Emits>();

const iframe = ref<HTMLIFrameElement | null>(null);
const runCode = ref<string>('');

onMounted(() => {
  bindEvents();
});

const bindEvents = () => {
  nextTick(() => {
    window.addEventListener('message', (e) => {
      console.log(e, 'eeeeeeeee');

      if (e.data.from === 'codeRunner') {
        const { data, type } = e.data;
        const parseData = JSONParse(data);

        console.log(parseData, 'parseData', data, type);

        if (parseData?.length > 1) {
          if (type === 'error') {
            const errorMessage = JSONStringify(parseData).replace(/\s+/g, ' ');
            console.log(errorMessage.slice(1, errorMessage.length - 1), 'errrrrrrror');
          } else {
            const code = JSONStringify(parseData).replace(/"([^"]+)":/g, '$1:');
            console.log(code.slice(1, code.length - 1));
          }
        } else {
          console.log(parseData[0]);
        }

        // parseData.forEach((d) => {
        //   console.log(d, 'ddddddddddd', parseData);

        //   const info = { type };
        //   if (Array.isArray(d)) {
        //     info.data = JSON.stringify(d);
        //   } else if (d.constructor === Object) {
        //     info.data = JSON.stringify(d, null, 2);
        //   } else {
        //     info.data = String(d);
        //   }
        //   info.lines = typeof info.data === 'string' ? info.data.split(/\r\n|\r|\n/).length : 1;
        //   console.log(info, 'infoinfoinfoinfo');
        //   console.log(info.data, 'infoinfoinfoinfo,info.data');
        // });
      }
    });
  });
};

// 运行代码
const run = (code: string) => {
  const frameDocument = iframe.value?.contentWindow?.document!;
  frameDocument.open();
  frameDocument.write(codeTemplate(code));
  frameDocument.close();
};

// 关闭
const onClose = () => {
  emit('update:modalVisible', false);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.code-run-wrap {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 10px 10px;
  height: 100%;
  box-shadow: 0 0 8px 0 var(--shadow-mack);
  background-color: var(--pre-hover-bg);

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 45px;
    width: 100%;

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
    flex: 1;
    display: flex;
    justify-content: space-between;

    .code-edit-wrap,
    .preview {
      flex: 0.5;
    }

    .preview {
      margin-left: 10px;
    }
  }
}
</style>
