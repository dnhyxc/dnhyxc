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
      max-width: calc(100vw - 350px);
      padding: 20px;
      background-color: transparent;
      color: var(--font-2);

      blockquote {
        color: var(--font-5);
        background: var(--shade-3);
      }

      code {
        color: var(--code-color);
        font-size: 15px;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: var(--h-color);
      }
    }
  }
}
</style>
