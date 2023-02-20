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
        <h3 :id="titleId" :class="titleClass">发布文章</h3>
      </template>
      <div class="content">
        <el-form ref="formRef" label-width="50px" :model="createArticleForm" class="form-wrap">
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
            class="form-item"
          >
            <el-input v-model="createArticleForm.title" placeholder="请输入文章标题" />
          </el-form-item>
          <el-form-item
            prop="classify"
            label="分类"
            :rules="[
              {
                required: true,
                message: '请输入文章分类',
                trigger: 'blur',
              },
            ]"
            class="form-item"
          >
            <el-select v-model="createArticleForm.classify" clearable placeholder="请输入文章分类">
              <el-option v-for="item in ARTICLE_CLASSIFY" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item
            prop="tag"
            label="标签"
            :rules="[
              {
                required: true,
                message: '请输入文章标签',
                trigger: 'blur',
              },
            ]"
            class="form-item"
          >
            <el-select v-model="createArticleForm.tag" clearable placeholder="请输入文章标签">
              <el-option v-for="item in ARTICLE_TAG" :key="item.key" :label="item.label" :value="item.label" />
            </el-select>
          </el-form-item>
          <el-form-item
            prop="createTime"
            label="时间"
            :rules="[
              {
                required: true,
                message: '请选择发文时间',
                trigger: 'blur',
              },
            ]"
            class="form-item"
          >
            <el-date-picker
              v-model="createArticleForm.createTime"
              type="datetime"
              placeholder="请选择发文时间"
              :default-time="new Date()"
              class="el-date-picker"
            />
          </el-form-item>
          <el-form-item prop="cover" label="封面" class="form-item-cover">
            <div class="cover-wrap">
              <Upload :get-cover-image="getCoverImage" />
            </div>
          </el-form-item>
          <el-form-item
            prop="abstract"
            label="摘要"
            :rules="[
              {
                required: true,
                message: '请输入文章摘要',
                trigger: 'blur',
              },
            ]"
            class="form-item"
          >
            <el-input
              v-model="createArticleForm.abstract"
              :autosize="{ minRows: 5, maxRows: 8 }"
              type="textarea"
              maxlength="300"
              placeholder="请输入文章摘要"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="footer">
          <el-button @click="onCancel">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FormInstance } from 'element-plus';
import { CreateArticleParams } from '@/typings/common';
import { ARTICLE_CLASSIFY, ARTICLE_TAG } from '@/constant';
import { createStore } from '@/store';
import Upload from '@/components/Upload/index.vue';

interface IProps {
  modelValue: boolean;
  mackdown: string;
}

const formRef = ref<FormInstance>();
const createArticleForm = ref<CreateArticleParams>({
  title: '',
  classify: '',
  tag: '',
  createTime: new Date().valueOf(),
  coverImg: '',
  abstract: '',
});

const props = withDefaults(defineProps<IProps>(), {
  modelValue: false,
  mackdown: '',
});

const emit = defineEmits(['update:modelValue']);

// 计算v-model传过来的参数，防止出现值是可读的，无法修改的警告
const visible = computed({
  get() {
    return props.modelValue;
  },
  set(visible: boolean) {
    emit('update:modelValue', visible);
  },
});

// 获取上传组件中的coverImage
const getCoverImage = (url: string) => {
  createArticleForm.value.coverImg = url;
};

// 取消
const onCancel = () => {
  emit('update:modelValue', false);
};

// 确认
const onSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      const params = {
        ...createArticleForm.value,
        content: props.mackdown,
      };
      console.log(params, 'params');
      await createStore.createArticle(params);
      // emit('update:modelValue', false);
    } else {
      console.log(createArticleForm.value, 'error submit!');
      return false;
    }
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.drawer-wrap {
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

      .el-select {
        flex: 1;
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
      }
    }
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
