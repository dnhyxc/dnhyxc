<!--
 * 文章预览页面
 * @author: dnhyxc
 * @since: 2023-01-08
 * index.vue
-->
<template>
  <div class="preview-wrap">
    <v-md-preview :text="mackdown" default-show-toc></v-md-preview>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  mackdown: string;
}

withDefaults(defineProps<IProps>(), {
  mackdown: '',
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
