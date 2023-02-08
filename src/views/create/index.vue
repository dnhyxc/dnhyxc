<!--
 * 发布文章
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="edit-wrap">
    <Editor mackdown="" />
  </div>
</template>

<script setup lang="ts">
import Editor from '@/components/Editor/index.vue';
</script>

<style lang="less" scoped>
@import '@/styles/index.less';
</style>
