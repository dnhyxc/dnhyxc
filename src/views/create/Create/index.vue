<!--
 * 文章起草
 * @author: dnhyxc
 * @since: 2023-02-10
 * index.vue
-->
<template>
  <div class="drawer-wrap">
    <el-drawer v-model="visible" size="350" :show-close="false">
      <template #header="{ titleId, titleClass }">
        <h3 :id="titleId" :class="titleClass">
          {{
            isSaveDraft ? (createStore.draftArticleId ? '更新草稿' : '保存草稿') : articleId ? '更新文章' : '发布文章'
          }}
        </h3>
      </template>
      <div class="content">
        <el-form ref="formRef" label-width="52px" :model="createStore?.createInfo">
          <el-form-item
            prop="title"
            label="标题"
            :rules="[
              {
                required: true,
                message: '请输入文章标题',
                trigger: 'blur',
              },
            ]"
          >
            <el-input v-model="createStore.createInfo.title" placeholder="请输入文章标题" />
          </el-form-item>
          <el-form-item
            prop="classify"
            label="分类"
            :rules="[
              {
                required: !isSaveDraft,
                message: '请输入文章分类',
                trigger: 'blur',
              },
            ]"
          >
            <div class="classify">
              <el-input v-model="createStore.createInfo.classify" placeholder="请输入文章分类" />
              <el-dropdown max-height="200px" trigger="click" @command="onClassifyCommand">
                <el-button type="primary" :disabled="!createStore.classifys?.length">
                  选择&nbsp;
                  <i class="iconfont icon-xiajiantou" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="item in createStore.classifys" :key="item.id" :command="item.classifyName">
                      {{ item.classifyName }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-form-item>
          <el-form-item
            prop="tag"
            label="标签"
            :rules="[
              {
                required: !isSaveDraft,
                message: '请输入文章标签',
                trigger: 'blur',
              },
            ]"
          >
            <div class="classify">
              <el-input v-model="createStore.createInfo.tag" placeholder="请输入文章标签" />
              <el-dropdown max-height="200px" trigger="click" @command="onTagCommand">
                <el-button type="primary">选择&nbsp;<i class="iconfont icon-xiajiantou" /></el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="item in ARTICLE_TAG" :key="item.key" :command="item">
                      {{ item.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-form-item>
          <el-form-item
            v-if="!isSaveDraft"
            prop="createTime"
            label="时间"
            :rules="[
              {
                required: !isSaveDraft,
                message: '请选择发文时间',
                trigger: 'blur',
              },
            ]"
          >
            <el-date-picker
              v-model="createStore.createInfo.createTime"
              type="datetime"
              placeholder="请选择发文时间"
              class="el-date-picker"
            />
          </el-form-item>
          <el-form-item prop="cover" label="封面" class="form-item-cover">
            <div class="cover-wrap">
              <Upload
                v-model:file-path="createStore.createInfo.coverImage"
                :delete="!articleId"
                :get-upload-url="getUploadUrl"
              >
                <template #preview>
                  <img :src="uploadPath || createStore.createInfo?.coverImage!" class="cover-img" />
                </template>
              </Upload>
            </div>
          </el-form-item>
          <el-form-item
            prop="abstract"
            label="摘要"
            :rules="[
              {
                required: !isSaveDraft,
                message: '请输入文章摘要',
                trigger: 'blur',
              },
            ]"
          >
            <el-input
              v-model="createStore.createInfo.abstract"
              :autosize="{ minRows: 5, maxRows: 8 }"
              type="textarea"
              maxlength="300"
              show-word-limit
              placeholder="请输入文章摘要"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="footer">
          <el-button class="btn" @click="onCancel">取消</el-button>
          <el-button class="btn" type="primary" @click="onSubmit">
            {{ articleId ? '更新' : isSaveDraft ? (createStore.draftArticleId ? '更新' : '保存') : '发布' }}
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onDeactivated } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance } from 'element-plus';
import { ARTICLE_TAG } from '@/constant';
import { createStore, uploadStore } from '@/store';
import { checkImgUrlType } from '@/utils';
import Upload from '@/components/Upload/index.vue';

const router = useRouter();

interface IProps {
  modelValue: boolean;
  isSaveDraft: boolean;
  isPublish: boolean;
  articleId?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: false,
  isSaveDraft: false,
  articleId: '',
});

const emit = defineEmits(['update:modelValue', 'update:isPublish', 'update:prevContent']);

const uploadPath = ref<string>('');
const formRef = ref<FormInstance>();

// 计算v-model传过来的参数，防止出现值是可读的，无法修改的警告
const visible = computed({
  get() {
    return props.modelValue;
  },
  set(visible: boolean) {
    emit('update:modelValue', visible);
  },
});

// 获取上传的封面图url
const getUploadUrl = async (url: string) => {
  if (url && checkImgUrlType(url) === 'URL' && props.articleId) {
    const oldUrl = createStore.oldCoverImage;
    await createStore.createArticle(
      {
        coverImage: url,
        articleId: createStore?.createInfo?.articleId,
      },
      false, // 是否需要提示
    );
    // 如果文件不一致，则说明重新上传了新的图片，则需要删除老图片
    if (url !== oldUrl) {
      // 删除上传的老的封面图
      oldUrl && (await uploadStore.removeFile(oldUrl));
      createStore.oldCoverImage = url;
    }
  }
};

// 组件弃用时，如果有文章 id，则清除 createStore 中的 createInfo 属性，并且重置表单数据
onDeactivated(() => {
  if (createStore?.createInfo?.articleId) {
    createStore.clearCreateInfo(true);
    formRef.value?.resetFields();
  }
});

// 选择分类
const onClassifyCommand = (classify: string) => {
  createStore.createInfo.classify = classify;
};

// 选择标签
const onTagCommand = (item: { label: string; key: string }) => {
  createStore.createInfo.tag = item.label;
};

// 取消
const onCancel = () => {
  emit('update:modelValue', false);
  emit('update:isPublish', false);
};

// 新建/更新文章
const onSubmit = () => {
  if (props.isSaveDraft) {
    onSaveDraft();
  } else {
    onCreate();
  }
};

// 创建/更新文章
const onCreate = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      const res = await createStore.createArticle({
        ...createStore?.createInfo,
        coverImage: uploadPath.value || createStore?.createInfo?.coverImage,
        articleId: createStore?.createInfo?.articleId,
        createTime: createStore?.createInfo?.createTime?.valueOf(),
      });
      if (res) {
        createStore.clearCreateInfo(true);
        formRef.value?.resetFields();
        emit('update:isPublish', true);
        emit('update:modelValue', false);
        router?.push('/home');
      }
    } else {
      return false;
    }
  });
};

// 保存草稿
const onSaveDraft = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      await createStore.articleDraft();
      emit('update:modelValue', false);
      emit('update:isPublish', false);
      const { createInfo } = createStore;
      emit('update:prevContent', createInfo.content!);
    } else {
      return false;
    }
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.drawer-wrap {
  :deep {
    .el-drawer__header,
    .el-drawer__body {
      position: relative;
    }
  }
  .content {
    :deep {
      .el-drawer {
        min-width: 350px;
      }

      .el-date-picker {
        display: flex;
        width: 100%;

        .el-input__wrapper {
          flex: 1;
        }
      }

      .el-input__wrapper {
        color: var(--font-1);
        background-color: var(--input-bg-color);
      }

      .el-input__inner {
        color: var(--font-1);
        background-color: transparent;
      }

      .el-textarea__inner {
        color: var(--font-1);
        background-color: var(--input-bg-color);
      }

      .el-textarea .el-input__count {
        background-color: transparent;
      }

      .el-select {
        flex: 1;
      }

      .el-form-item__label {
        color: var(--font-1);
      }
    }

    .form-item-cover {
      display: flex;

      .cover-wrap {
        flex: 1;
        display: flex;
        align-content: center;
        justify-content: center;
        height: 140px;

        .cover-img {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 4px;
          .imgStyle();
        }
      }
    }

    .classify {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .icon-xiajiantou {
        font-size: 14px;
      }

      :deep {
        .el-input__wrapper {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        .el-button {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }
    }
  }

  .footer {
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    z-index: 92;

    .btn {
      width: 122px;
      height: 33px;
      padding: 8px 15px 7px;
    }
  }
}
</style>
