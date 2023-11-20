<!--
 * 发布文章
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="edit-wrap">
    <MackdownEditor
      v-if="!editType"
      :on-publish="onPublish"
      :on-clear="onClear"
      :on-show-draft="showDraft"
      :article-id="(route?.query?.id as string)"
      :on-save-draft="onSaveDraft"
      :on-change-editor="onChangeEditor"
      :copy-code-success="onCopyCodeSuccess"
      :height="checkOS() === 'mac' ? 'calc(100vh - 98px)' : null"
      show-vscode
    />
    <MonacoEditor
      v-if="editType"
      v-model:theme="theme"
      :on-change-editor="onChangeEditor"
      :edit-type="editType"
      :on-publish="onPublish"
      :on-clear="onClear"
      :on-show-draft="showDraft"
      :article-id="(route?.query?.id as string)"
      :on-save-draft="onSaveDraft"
      class="create-monaco-eritor"
    />
    <CreateDrawer
      :key="JSON.stringify(createStore.classifys)"
      v-model="visible"
      v-model:isSaveDraft="isSaveDraft"
      :article-id="(route?.query?.id as string)"
    />
    <DraftList v-model:draft-visible="draftVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, onActivated, onDeactivated, watch, defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { articleStore, createStore } from '@/store';
import { checkOS } from '@/utils';
import AsyncLoading from '@/components/AsyncLoading/index.vue';
import CreateDrawer from './Create/index.vue';
import DraftList from './DraftList/index.vue';
const MonacoEditor = defineAsyncComponent({
  loader: () => import('@/components/MonacoEditor/index.vue'),
  loadingComponent: AsyncLoading,
});
const MackdownEditor = defineAsyncComponent({
  loader: () => import('@/components/MackdownEditor/index.vue'),
  loadingComponent: AsyncLoading,
});

const route = useRoute();
const router = useRouter();

const visible = ref<boolean>(false); // 权限设置弹窗的状态
const draftVisible = ref<boolean>(false); // 草稿箱弹窗状态
const editType = ref<boolean>(false); // 编辑器类型
const theme = ref<string>('vs'); // 主题
const isSaveDraft = ref<boolean>(false); // 是否是保存草稿

onMounted(() => {
  document.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown);
});

// 组件启用时，如果有文章id，则请求文章详情
onActivated(() => {
  // 启用组建时，获取创建文章的分类列表
  createStore.getAddedClassifys(router);
  if (!route.query.id) return;
  articleStore?.getArticleDetail({
    id: route.query.id as string,
    isEdit: true,
    router,
    toHome: !!route.query?.toHome,
  });
  createStore.clearCreateDraftInfo();
});

// 组件弃用时，关闭草稿列表弹窗
onDeactivated(() => {
  draftVisible.value = false;
  // 清空草稿信息
  // createStore.clearCreateDraftInfo();
});

watch(
  () => createStore.draftArticleId,
  (newVal) => {
    if (newVal) {
      createStore.getDraftDetail(newVal as string);
    }
  },
);

// 监听键盘事件
const onKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    // 调用接口保存草稿
    createStore.articleDraft();
  }
};

// 点击编辑器header发布文章按钮
const onPublish = () => {
  visible.value = true;
  isSaveDraft.value = false;
};

// 保存草稿
const onSaveDraft = (editor?: any) => {
  visible.value = true;
  isSaveDraft.value = true;
};

// 切换编辑器
const onChangeEditor = () => {
  editType.value = !editType.value;
};

// 清空编辑内容
const onClear = () => {
  // 手动去除query articleId 参数
  router.replace('/create');
  createStore?.clearCreateInfo(true);
};

// 弹窗显示、隐藏
const showDraft = () => {
  draftVisible.value = true;
  editType.value = false;
};

// 复制成功回调
const onCopyCodeSuccess = (value?: string) => {
  ElMessage({
    message: '复制成功',
    type: 'success',
    offset: 80,
  });
};
</script>

<script lang="ts">
export default {
  name: 'Create',
};
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.edit-wrap {
  border-radius: 5px;
  padding-left: 5px;
  padding-right: 3px;
  width: calc(100% - 9px);
  height: 100%;

  .create-monaco-eritor {
    height: calc(100% - 3px);
    margin-top: 3px;
  }
}
</style>
