<!--
 * 发布文章
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="edit-wrap">
    <Editor :on-publish="onPublish" :on-clear="onClear" :article-id="(route?.query?.id as string)" />
    <CreateDrawer v-model="visible" :article-id="(route?.query?.id as string)" />
  </div>
</template>

<script setup lang="ts">
import { ref, onActivated } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Editor from '@/components/Editor/index.vue';
import CreateDrawer from './CreateDrawer/index.vue';
import { articleStore, createStore } from '@/store';

const route = useRoute();
const router = useRouter();

const visible = ref<boolean>(false); // 权限设置弹窗的状态

// 组件启用时，如果有文章id，则请求文章详情
onActivated(() => {
  if (!route.query.id) return;
  articleStore?.getArticleDetail(route.query.id as string, true);
});

// 点击编辑器header发布文章按钮
const onPublish = () => {
  visible.value = true;
};

// 清空编辑内容
const onClear = () => {
  // 手动去除query articleId 参数
  router.push('/create');
  createStore?.clearCreateInfo(true);
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
