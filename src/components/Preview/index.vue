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
      :text="markdown"
      default-show-toc
      @copy-code-success="onCopyCodeSuccess"
    />
    <ImagePreview v-model:previewVisible="previewVisible" :select-image="{ url: imageUrl }" close-on-click-modal />
  </div>
</template>

<script setup lang="ts">
import { shell } from 'electron';
import { ref, onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { commonStore } from '@/store';

interface IProps {
  markdown: string;
  copyCodeSuccess?: (value?: string) => void;
  onScroll?: Function | null | undefined;
}

const props = defineProps<IProps>();

const previewRef = ref<any>(null);
// 图片预览状态
const previewVisible = ref<boolean>(false);
// 预览图片 url
const imageUrl = ref<string>('');
const imgCount = ref<number>(0);
const imgTotal = ref<number>(0);

// 存储预览组件中所有的标题
onMounted(() => {
  if (previewRef.value) {
    // 给store中的previewRef赋值
    commonStore.previewRef = previewRef.value;
    const anchors: HTMLHeadingElement[] = previewRef.value.$el.querySelectorAll('h1,h2,h3,h4,h5,h6');

    if (props?.onScroll) {
      const images: HTMLImageElement[] = previewRef.value.$el.querySelectorAll('img');
      imgTotal.value = images.length;

      if (images.length) {
        images?.forEach((image) => {
          image.addEventListener('load', onImageLoaded);
        });
      } else {
        props?.onScroll?.();
      }
    }

    const titles = Array.from(anchors).filter((title) => !!title.innerText.trim());
    if (titles.length) {
      const hTags = Array.from(new Set(titles.map((title) => title.tagName))).sort();
      // 存储所有的标题标签
      commonStore.tocTitles = titles.map((el, index) => {
        return {
          el,
          title: el.innerText,
          activeTitle: el.innerText + index,
          lineIndex: el.getAttribute('data-v-md-line'),
          indent: hTags.indexOf(el.tagName),
        };
      });
    }

    previewRef.value.$el.addEventListener('click', onImageClick);
  }
});

onBeforeRouteLeave(() => {
  previewRef.value?.$el?.removeEventListener('click', onImageClick);
});

// 组件卸载时，清除tocTitles，以防存在下次进入详情页时，目录存在缓存
onUnmounted(() => {
  previewRef.value = null;
  commonStore.tocTitles = [];
  commonStore.tocTops = [];
});

const onImageClick = (e: Event) => {
  e.preventDefault();
  const anchor = e.target as HTMLAnchorElement;
  // 判断是否是 a 标签，使用默认浏览器打开链接
  if (anchor.tagName === 'A') {
    shell.openExternal(anchor.href);
    return;
  }
  // 判断是否 a 标签的子元素
  if (anchor.closest('a')) {
    const parentAnchor = anchor.parentNode as HTMLAnchorElement;
    shell.openExternal(parentAnchor?.href);
    return;
  }
  const image = e.target as HTMLImageElement;
  // 预览文章中的图片
  if (image.tagName === 'IMG') {
    imageUrl.value = image.src;
    previewVisible.value = true;
  }
};

const onImageLoaded = () => {
  imgCount.value++;
  if (imgCount.value === imgTotal.value) {
    props?.onScroll?.();
  }
};

// 复制成功回调
const onCopyCodeSuccess = (value: string) => {
  props?.copyCodeSuccess?.(value);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.preview-wrap {
  width: 100%;
  box-sizing: border-box;

  :deep {
    .v-md-pre-wrapper {
      background: var(--code-pre-bg);
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

      .titleHsize();

      .codeStyle();

      p {
        img {
          display: block;
          margin: auto;
        }
      }

      pre::-webkit-scrollbar {
        width: 6px !important;
      }

      pre::-webkit-scrollbar-thumb {
        background-color: var(--scroll-color);
      }

      code {
        background-color: var(--p-code-bg-color);
      }

      pre {
        //max-width: calc(100vw - var(--pre-width));
        //border: 1px solid red;
      }

      table {
        thead {
          background-color: var(--table-even-bg);
        }
      }

      & tr:nth-child(2n) {
        background-color: var(--table-even-bg);
      }
    }
  }
}
</style>
