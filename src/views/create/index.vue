<!--
 * 发布文章
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="edit-wrap">
    <Editor mackdown="" :on-publish="onPublish" />
    <CreateDrawer v-model="visible" :mackdown="mackdown" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Editor from '@/components/Editor/index.vue';
import CreateDrawer from './CreateDrawer/index.vue';

const visible = ref<boolean>(false); // 权限设置弹窗的状态
const mackdown = ref<string>(''); // 编辑的内容

// 点击编辑器header发布文章按钮
const onPublish = (value: string) => {
  visible.value = true;
  mackdown.value = value;
  console.log(mackdown, 'mackdown');
};
</script>

<style lang="less" scoped>
@import '@/styles/index.less';
</style>
