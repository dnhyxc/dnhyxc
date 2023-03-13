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
        <h3 :id="titleId" :class="titleClass">{{ articleId ? '更新文章' : '发布文章' }}</h3>
      </template>
      <div class="content">
        <el-form ref="formRef" label-width="52px" :model="createStore?.createInfo" class="form-wrap">
          <el-form-item
            prop="title"
            label="标题"
            :rules="[
              {
                required: true,
                message: '请输入文章标题',
                trigger: 'change',
              },
            ]"
            class="form-item"
          >
            <el-input v-model="createStore.createInfo.title" placeholder="请输入文章标题" />
          </el-form-item>
          <el-form-item
            prop="classify"
            label="分类"
            :rules="[
              {
                required: true,
                message: '请输入文章分类',
                trigger: 'change',
              },
            ]"
            class="form-item"
          >
            <div class="classify">
              <el-input v-model="createStore.createInfo.classify" placeholder="请输入文章分类" />
              <el-dropdown max-height="200px" trigger="click" @command="onClassifyCommand">
                <el-button type="primary">选择&nbsp;<i class="iconfont icon-xiajiantou" /></el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="item in ARTICLE_CLASSIFY" :key="item" :command="item">
                      {{ item }}
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
                required: true,
                message: '请输入文章标签',
                trigger: 'change',
              },
            ]"
            class="form-item"
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
            prop="createTime"
            label="时间"
            :rules="[
              {
                required: true,
                message: '请选择发文时间',
                trigger: 'change',
              },
            ]"
            class="form-item"
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
              <Upload v-model:default-url="createStore.createInfo.coverImage" />
            </div>
          </el-form-item>
          <el-form-item
            prop="abstract"
            label="摘要"
            :rules="[
              {
                required: true,
                message: '请输入文章摘要',
                trigger: 'change',
              },
            ]"
            class="form-item"
          >
            <el-input
              v-model="createStore.createInfo.abstract"
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
import { ref, computed, onDeactivated } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance } from 'element-plus';
import { ARTICLE_CLASSIFY, ARTICLE_TAG } from '@/constant';
import { createStore } from '@/store';
import Upload from '@/components/Upload/index.vue';

const router = useRouter();

interface IProps {
  modelValue: boolean;
  articleId?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: false,
  articleId: '',
});

const emit = defineEmits(['update:modelValue']);

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

// 组件弃用时清除 createStore 中的 createInfo 属性，并且重置表单数据
onDeactivated(() => {
  createStore.clearCreateInfo();
  formRef.value?.resetFields();
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
  createStore.clearCreateInfo(true);
  formRef.value?.resetFields();
  emit('update:modelValue', false);
};

// 确认
const onSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      await createStore.createArticle(
        {
          ...createStore?.createInfo,
          articleId: createStore?.createInfo?.articleId,
          createTime: createStore?.createInfo?.createTime?.valueOf(),
        },
        router,
      );
      onCancel();
    } else {
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

    .classify {
      display: flex;
      justify-content: space-between;
      align-items: center;

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
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
