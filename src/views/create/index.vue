<!--
 * 发布文章
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="edit-wrap">
    <Editor :on-publish="onPublish" :article-id="(route?.query?.id as string)" />
    <CreateDrawer v-model="visible" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import Editor from '@/components/Editor/index.vue';
import CreateDrawer from './CreateDrawer/index.vue';

const route = useRoute();

const visible = ref<boolean>(false); // 权限设置弹窗的状态

// 点击编辑器header发布文章按钮
const onPublish = () => {
  visible.value = true;
};
</script>

<script lang="ts">
export default {
  name: 'Create',
};
</script>

<style lang="less" scoped>
@import '@/styles/index.less';
</style>
