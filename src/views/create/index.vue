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
    />
    <MonacoEditor
      v-if="editType"
      :on-change-editor="onChangeEditor"
      :edit-type="editType"
      :on-publish="onPublish"
      :on-clear="onClear"
      :on-show-draft="showDraft"
      :article-id="(route?.query?.id as string)"
      :on-save-draft="onSaveDraft"
    />
    <CreateDrawer
      :key="JSON.stringify(createStore.classifys)"
      v-model="visible"
      :article-id="(route?.query?.id as string)"
    />
    <DraftModal v-model:draft-visible="draftVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, onActivated, onDeactivated, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { articleStore, createStore } from '@/store';
import { checkOS } from '@/utils';
import CreateDrawer from './Create/index.vue';
import DraftModal from './Draft/index.vue';

const route = useRoute();
const router = useRouter();

const visible = ref<boolean>(false); // 权限设置弹窗的状态
const draftVisible = ref<boolean>(false); // 草稿箱弹窗状态
const editType = ref<boolean>(false); // 编辑器类型

// 组件启用时，如果有文章id，则请求文章详情
onActivated(() => {
  // 启用组建时，获取创建文章的分类列表
  createStore.getAddedClassifys();
  if (!route.query.id) return;
  articleStore?.getArticleDetail({
    id: route.query.id as string,
    isEdit: true,
    router,
    toHome: !!route.query?.toHome,
  });
});

watch(
  () => createStore.draftArticleId,
  (newVal) => {
    if (newVal) {
      createStore.getDraftDetail(newVal as string);
    }
  },
);

// 组件弃用时，关闭草稿列表弹窗
onDeactivated(() => {
  draftVisible.value = false;
  // 清空草稿信息
  createStore.clearCreateDraftInfo();
});

// 点击编辑器header发布文章按钮
const onPublish = () => {
  visible.value = true;
};

// 保存草稿
const onSaveDraft = () => {
  createStore.articleDraft();
  createStore.clearCreateInfo(true);
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
  onChangeEditor();
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
}
</style>
