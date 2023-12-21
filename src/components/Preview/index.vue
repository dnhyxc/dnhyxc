<!--
 * 文章预览页面
 * @author: dnhyxc
 * @since: 2023-01-08
 * index.vue
-->
<template>
  <div class="preview-wrap">
    <v-md-preview
      id="__MD_PREVIEW__"
      ref="previewRef"
      :text="mackdown"
      default-show-toc
      @copy-code-success="onCopyCodeSuccess"
    ></v-md-preview>
  </div>
</template>

<script setup lang="ts">
import { shell } from 'electron';
import { ref, onMounted, onUnmounted } from 'vue';
import { commonStore } from '@/store';

interface IProps {
  mackdown: string;
  copyCodeSuccess?: (value?: string) => void;
}

const props = withDefaults(defineProps<IProps>(), {
  mackdown: '',
  copyCodeSuccess: () => {},
});

const previewRef = ref<any>(null);

// 存储预览组件中所有的标题
onMounted(() => {
  if (previewRef.value) {
    // 给store中的previewRef赋值
    commonStore.previewRef = previewRef.value;
    const anchors: HTMLHeadingElement[] = previewRef.value.$el.querySelectorAll('h1,h2,h3,h4,h5,h6');
    const titles = Array.from(anchors).filter((title) => !!title.innerText.trim());
    if (titles.length) {
      const hTags = Array.from(new Set(titles.map((title) => title.tagName))).sort();
      // 存储所有的标题标签
      commonStore.tocTitles = titles.map((el) => ({
        title: el.innerText,
        lineIndex: el.getAttribute('data-v-md-line'),
        indent: hTags.indexOf(el.tagName),
      }));
    }
    // 获取所有的链接，使用默认浏览器打开
    const links: HTMLAnchorElement[] = previewRef.value.$el.querySelectorAll('a');
    if (links?.length) {
      Array.from(links).forEach((i) => {
        i.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            shell.openExternal(i.href);
          },
          false,
        );
      });
    }
  }
});

// 组件卸载时，清除tocTitles，以防存在下次进入详情页时，目录存在缓存
onUnmounted(() => {
  previewRef.value = null;
  commonStore.tocTitles = [];
});

// 复制成功回调
const onCopyCodeSuccess = (value: string) => {
  props.copyCodeSuccess?.(value);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.preview-wrap {
  width: 100%;

  :deep {
    .v-md-pre-wrapper {
      background: var(--pre-bg-color);
    }

    .vuepress-markdown-body {
      box-sizing: border-box;
      padding: 20px;
      background-color: transparent;
      color: var(--font-2);

      .v-md-pre-wrapper:before {
        color: var(--font-6);
        top: 2px;
        right: 8px;
      }

      strong {
        font-weight: 700;
        color: var(--markdown-strong-color);
      }

      blockquote {
        color: var(--font-5);
        background: var(--shade-3);
        border-left: 4px solid var(--active-color);
        border-radius: 5px;
      }

      code {
        background-color: var(--p-code-bg-color);
        font-size: 15px;
        color: var(--code-color);
      }

      pre {
        max-width: calc(100vw - 450px);

        code {
          color: var(--code-color);
          background-color: transparent;
          font-size: 15px;
        }
      }

      a {
        color: var(--el-color-primary-dark-2);
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: var(--h-color);
        font-weight: 700;
      }

      td,
      th {
        border: 1px solid var(--card-border);
      }

      table{
        thead{
          background-color: var(--table-even-bg);
        }
      }

      & tr:nth-child(2n) {
        background-color: var(--table-even-bg);
      }
      & .token.block-comment,
      & .token.cdata,
      & .token.comment,
      & .token.doctype,
      & .token.prolog {
        color: var(--font-6);
      }

      & .token.punctuation {
        color: var(--font-5);
      }

      & .token.attr-value,
      & .token.char,
      & .token.regex,
      & .token.string,
      & .token.variable {
        color: var(--markdown-return-color);
      }

      & .token.atrule,
      & .token.builtin,
      & .token.important,
      & .token.keyword,
      & .token.selector {
        color: var(--markdown-const-color);
      }

      & .token.class-name,
      & .token.constant,
      & .token.property,
      & .token.symbol {
        color: var(--markdown-param-color);
      }
    }
  }
}
</style>
