<!--
 * 新建收藏集弹窗
 * @author: dnhyxc
 * @since: 2023-03-08
 * index.vue
-->
<template>
  <div class="dialog-build-content">
    <el-dialog v-model="visible" width="500px" draggable>
      <template #header>
        <div class="header">新建收藏集</div>
      </template>
      <div class="content">
        <el-form ref="formRef" :model="addCollectForm" class="form-wrap" @submit.native.prevent>
          <el-form-item
            prop="name"
            label="名称 :"
            :rules="[
              {
                trigger: 'blur',
              },
            ]"
            class="form-item"
          >
            <el-input v-model.trim="addCollectForm.name" size="large" placeholder="请输入收藏集名称" />
          </el-form-item>
          <el-form-item
            prop="desc"
            label="描述 :"
            :rules="{
              trigger: 'blur',
            }"
            class="form-item"
          >
            <el-input
              v-model.trim="addCollectForm.desc"
              :autosize="{ minRows: 5, maxRows: 8 }"
              type="textarea"
              maxlength="200"
              show-word-limit
              placeholder="请输入收藏集描述"
            />
          </el-form-item>
          <el-form-item
            prop="status"
            label="状态 :"
            :rules="{
              trigger: 'blur',
            }"
            class="form-item"
          >
            <el-radio-group v-model="addCollectForm.status">
              <el-radio label="1">
                <span class="radio-label">公开</span>
                <span class="radio-info">所有人可见</span>
              </el-radio>
              <el-radio label="2">
                <span class="radio-label">隐私</span>
                <span class="radio-info">仅自己可见此收藏集</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="footer">
          <span class="actions">
            <el-button @click="onCancel">取消</el-button>
            <el-button type="primary" :disabled="!addCollectForm.name" @click="onSubmit">确定</el-button>
          </span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue';
import { FormInstance } from 'element-plus';
import { collectStore } from '@/store';
import { CollectParams } from '@/typings/common';

interface IProps {
  collectVisible?: boolean;
  buildVisible?: boolean;
  defaultValues?: CollectParams;
  isEdit?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  collectVisible: false,
  buildVisible: false,
  defaultValues: () => ({
    desc: '',
    name: '',
    status: '1',
    id: '',
  }),
  isEdit: false,
});

const emit = defineEmits(['update:collectVisible', 'update:buildVisible']);

const formRef = ref<FormInstance>();

const addCollectForm = reactive<CollectParams>(props.defaultValues);

// 计算v-model传过来的参数，防止出现值是可读的，无法修改的警告
const visible = computed({
  get() {
    return props.buildVisible;
  },
  set(visible: boolean) {
    emit('update:buildVisible', visible);
  },
});

watch(
  () => props.defaultValues,
  (newVal) => {
    addCollectForm.name = newVal.name;
    addCollectForm.desc = newVal.desc;
    addCollectForm.status = String(newVal.status);
  },
);

// 取消
const onCancel = () => {
  formRef.value?.resetFields();
  emit('update:buildVisible', false);
  // 如果是从收藏集点击编辑进来时，点击取消不打开收藏集列表弹窗
  if (props.isEdit) return;
  emit('update:collectVisible', true);
};

// 确定
const onSubmit = async () => {
  if (props.isEdit && props.defaultValues?.id) {
    await collectStore.updateCollect({ ...addCollectForm, id: props.defaultValues?.id });
  } else {
    await collectStore?.addCollect(addCollectForm);
  }
  formRef.value?.resetFields();
  emit('update:buildVisible', false);
  // 如果是从收藏集点击编辑进来时，点击确定不打开收藏集列表弹窗
  if (props.isEdit) return;
  emit('update:collectVisible', true);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.dialog-build-content {
  .header {
    font-size: 18px;
    color: var(--font-1);
  }

  .radio-info {
    margin-left: 10px;
    font-size: 13px;
  }

  :deep {
    .el-dialog__body {
      padding: 15px 15px 0;
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

    .el-form-item__label {
      color: var(--font-1);
    }

    .el-radio {
      color: var(--font-3);
    }
  }
}
</style>
