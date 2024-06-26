<!--
 * 发布文章
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <Loading :loading="articleStore.loading" class="edit-wrap">
    <MarkdownEditor
      v-if="!editType"
      show-vscode
      :on-publish="onPublish"
      :on-clear="onClear"
      :on-show-draft="showDraft"
      :article-id="(route?.query?.id as string)"
      :on-save-draft="onSaveDraft"
      :on-change-editor="onChangeEditor"
      :copy-code-success="onCopyCodeSuccess"
      :on-show-code-run="onShowCodeRun"
      :show-dot="prevContent.trim() !== createStore.createInfo.content?.trim() ? 1 : 0"
      class="create-editor"
    />
    <MonacoEditor
      v-if="editType"
      v-model:theme="theme"
      :on-change-editor="onChangeEditor"
      :edit-type="editType"
      :on-publish="onPublish"
      :on-clear="onClear"
      :on-show-draft="showDraft"
      :to-preview="toPreview"
      :article-id="(route?.query?.id as string)"
      :on-save-draft="onSaveDraft"
      :show-dot="prevContent.trim() !== createStore.createInfo.content?.trim() ? 1 : 0"
      :prev-content="prevContent"
      :code="createStore.draftDetail.content"
      class="create-editor"
    >
      <template #leftAction>
        <span class="action iconfont icon-debug-alt" title="代码测试工具" @click="onShowCodeRun" />
      </template>
    </MonacoEditor>
    <CreateDrawer
      :key="JSON.stringify(createStore.classifys)"
      v-model="visible"
      v-model:isSaveDraft="isSaveDraft"
      v-model:isPublish="isPublish"
      v-model:prevContent="prevContent"
      :article-id="(route?.query?.id as string)"
    />
    <DraftList v-model:draft-visible="draftVisible" />
  </Loading>
</template>

<script setup lang="ts">
import { ref, watch, defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { articleStore, createStore, loginStore } from '@/store';
import { Message, ipcRenderers, message } from '@/utils';
import Loading from '@/components/Loading/index.vue';
import AsyncLoading from '@/components/AsyncLoading/index.vue';
import CreateDrawer from './Create/index.vue';
import DraftList from './DraftList/index.vue';

const MonacoEditor = defineAsyncComponent({
  loader: () => import('@/components/MonacoEditor/index.vue'),
  loadingComponent: AsyncLoading,
});
const MarkdownEditor = defineAsyncComponent({
  loader: () => import('@/components/MarkdownEditor/index.vue'),
  loadingComponent: AsyncLoading,
});

const route = useRoute();
const router = useRouter();

const visible = ref<boolean>(false); // 权限设置弹窗的状态
const draftVisible = ref<boolean>(false); // 草稿箱弹窗状态
const editType = ref<boolean>(false); // 编辑器类型
const theme = ref<string>('vs-dark'); // 主题
const isSaveDraft = ref<boolean>(false); // 是否是保存草稿
const prevContent = ref<string>('');
const isPublish = ref<boolean>(false);

onMounted(() => {
  init();
  document.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  draftVisible.value = false;
  createStore.clearCreateInfo(true);
  document.removeEventListener('keydown', onKeyDown);
});

// 组件启用时，如果有文章id，则请求文章详情
const init = async () => {
  // 启用组建时，获取创建文章的分类列表
  await createStore.getAddedClassifys();
  if (!route.query.id) return;
  await articleStore?.getArticleDetail({
    id: route.query.id as string,
    isEdit: true,
    router,
    toHome: !!route.query?.toHome,
    toggleLoadStatus: true,
  });
  prevContent.value = createStore.createInfo?.content || '';
  createStore.clearCreateDraftInfo();
  isPublish.value = false;
};

onBeforeRouteLeave(async (to, from, next) => {
  const {createInfo} = createStore;
  if (!createInfo.content?.trim() || isPublish.value || prevContent.value.trim() === createInfo.content?.trim() || !loginStore.token) {
    next();
  } else {
    try {
      const res = await Message('保存到草稿后，可从草稿中选择进行继续编辑', '是否保存编辑内容到草稿？');
      if (res === 'confirm') {
        await onSave();
        next();
      }
    } catch (error) {
      prevContent.value = '';
      next();
    }
  }
});

watch(
  () => createStore.draftArticleId,
  async (newVal) => {
    if (newVal) {
      await createStore.getDraftDetail(newVal as string);
      prevContent.value = createStore.createInfo?.content || '';
    }
  },
);

const onSave = async () => {
  const {createInfo, articleDraft} = createStore;
  if (!createInfo.content?.trim() || prevContent.value.trim() === createInfo.content?.trim()) return;
  // 调用接口保存草稿
  await articleDraft();
  prevContent.value = createInfo.content!;
};

// 监听键盘事件
const onKeyDown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    onSave();
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
  prevContent.value = '';
};

// 弹窗显示、隐藏
const showDraft = () => {
  draftVisible.value = true;
  // editType.value = false;
};

// 复制成功回调
const onCopyCodeSuccess = (value?: string) => {
  message({
    title: '复制成功！',
    type: 'success',
  });
};

// 预览
const toPreview = (id: string) => {
  // 手动去除query articleId 参数
  router.push(`/draft?id=${ id }`);
};

// 开启代码调试
const onShowCodeRun = () => {
  const {userInfo, token} = loginStore;
  ipcRenderers.sendNewWin({
    path: 'compile?from=tools_codeRun',
    id: 'tools_codeRun',
    userInfo: JSON.stringify({userInfo, token}),
  });
};
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.edit-wrap {
  border-radius: 5px;
  margin-left: 5px;
  width: calc(100% - 10px);
  height: 100%;

  .create-editor {
    height: calc(100% - 8px);
    margin-top: 8px;
    width: 100%;

    .icon-debug-alt {
      color: var(--theme-blue);
      margin-top: -2px;
      margin-right: 14px;
      cursor: pointer;

      &:hover {
        color: var(--active);
      }
    }
  }
}
</style>
