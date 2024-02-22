<!--
 * 评论输入框
 * @author: dnhyxc
 * @since: 2023-04-28
 * index.vue
-->
<template>
  <div class="editor-wrap">
    <pre ref="editorRef" class="editor" tabindex="0" contenteditable></pre>
    <el-button id="emoji" @click="addEmoji">emoji</el-button>
    <el-button id="reply" @click="onReplay">reply</el-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Editor from '@/utils/editor';

const editorRef = ref<HTMLElement | null>(null);

let editor: any = null;

onMounted(() => {
  const atList = document.createElement('div');
  atList.className = 'at-list';
  atList.innerHTML = `
  <div>susan</div>
  <div>jim</div>
`;
  editor = new Editor(editorRef.value!, {
    submit: {
      will: (e) => e.key === 'Enter' && !e.ctrlKey && !e.altKey,
      done: console.log,
    },
    emoji: {
      render(emoji) {
        const img = document.createElement('img');
        img.className = 'emoji';
        img.src = 'http://43.143.27.249/image/24b6f805c6687e5694cbee718.gif';
        return img;
      },
    },
    file: {
      // @ts-ignore
      format(data) {
        return true;
      },
      render(data) {
        const div = document.createElement('div');
        div.innerText = '文件...';
        return div;
      },
    },
    reply: {
      render() {
        const div = document.createElement('section');
        div.className = 'reply';
        div.innerText = '回复...';
        return div;
      },
    },
    at: {
      async find() {
        return [
          { id: 1, name: 'susan' },
          { id: 2, name: 'jim' },
        ];
      },
      show({ bottom, left }) {
        atList.style.display = 'block';
        atList.style.left = `${left}px`;
        atList.style.top = `${bottom}px`;
      },
      hide() {
        atList.style.display = 'none';
      },
    },
    onValidChange(text) {
      // submit.disabled = !/\S/.test(text as string);
    },
  });
});

const addEmoji = () => {
  editor.insert([{ type: 'emoji' }]);
};

const onReplay = () => {
  editor.insert([{ type: 'reply' }]);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.editor-wrap {
  .editor {
    padding: 8px;
    height: 200px;
    margin: 0;
    box-sizing: border-box;
    white-space: pre-wrap;
    border: solid 1px #d8d8d8;
    border-radius: 4px;
    outline: none;
    font-size: 18px;
    font-family: system-ui;
    overflow-y: auto;
  }

  .at-list {
    position: fixed;
    display: none;
    width: 120px;
    background: #fff;
    border: solid 1px #d8d8d8;
    padding: 6px;
    cursor: pointer;
    transform: translateY(-100%);
  }

  .emoji {
    display: inline-block;
    width: 30px;
    height: 30px;
    margin: 0 2px;
    border-radius: 50%;
    vertical-align: middle;
  }

  .file {
    background: #d8d8d8;
    padding: 6px;
  }

  .reply {
    width: calc(100% - 12px);
    background: #d8d8d8;
    padding: 6px;
  }
}
</style>
