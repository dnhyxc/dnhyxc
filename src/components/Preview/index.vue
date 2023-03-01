<!--
 * 文章预览页面
 * @author: dnhyxc
 * @since: 2023-01-08
 * index.vue
-->
<template>
  <div class="preview-wrap">
    <v-md-preview id="__MD_PREVIEW__" ref="previewRef" :text="mackdown" default-show-toc></v-md-preview>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { commonStore } from '@/store';

interface IProps {
  mackdown: string;
}

withDefaults(defineProps<IProps>(), {
  mackdown: '',
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
  }
});

// 组件卸载时，清除tocTitles，以防存在下次进入详情页时，目录存在缓存
onUnmounted(() => {
  commonStore.tocTitles = [];
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.preview-wrap {
  width: 100%;

  :deep {
    .vuepress-markdown-body {
      padding: 20px;
      background-color: transparent;
    }
  }
}
</style>
