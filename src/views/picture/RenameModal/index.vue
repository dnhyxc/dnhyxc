<!--
 * 图片重命名弹窗
 * @author: dnhyxc
 * @since: 2023-08-12
 * index.vue
-->
<template>
  <div class="dialog-content">
    <el-dialog v-model="visible" width="450px" title="图片重命名" draggable>
      <div class="content">
        <el-form ref="formRef" :model="renameForm" @submit.native.prevent>
          <el-form-item
            prop="fileName"
            :rules="[
              {
                required: true,
                message: '请输入图片名称',
                trigger: 'change',
              },
            ]"
          >
            <el-input
              v-model="renameForm.fileName"
              v-focus
              size="large"
              placeholder="请输入图片名称"
              @keyup.enter="onSubmit"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="footer">
          <el-button class="btn" @click="onCancel">取消</el-button>
          <el-button class="btn" type="primary" :disabled="!renameForm.fileName" @click="onSubmit"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Directive, nextTick, reactive } from 'vue';
import type { FormInstance } from 'element-plus';
import { pictureStore } from '@/store';

interface IProps {
  imgId: string;
  renameVisible: boolean;
}

const props = defineProps<IProps>();

const formRef = ref<FormInstance>();
const renameForm = reactive<{ fileName: string }>({ fileName: '' });
const emit = defineEmits(['update:renameVisible']);

// 局部自动获取焦点指令
const vFocus: Directive = (el) => {
  nextTick(() => {
    if (el.tagName.toLocaleLowerCase() === 'input') {
      el.focus();
    } else if (el.getElementsByTagName('input')) {
      el.getElementsByTagName('input')[0].focus();
    }
  });
};

// 计算v-model传过来的参数，防止出现值是可读的，无法修改的警告
const visible = computed({
  get() {
    return props.renameVisible;
  },
  set(visible: boolean) {
    emit('update:renameVisible', visible);
  },
});

const onCancel = () => {
  emit('update:renameVisible', false);
};

const onSubmit = () => {
  if (!formRef.value) return;
  console.log(renameForm, 'renameForm');
  formRef.value.validate(async (valid) => {
    if (valid) {
      await pictureStore.updateImagesInfo({ id: props.imgId, fileName: renameForm.fileName });
      emit('update:renameVisible', false);
      formRef.value?.resetFields();
    } else {
      return false;
    }
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.dialog-content {
  .header {
    display: flex;
    align-items: center;
    color: var(--font-1);

    .title {
      font-size: 18px;
    }

    .info {
      font-size: 13px;
      color: var(--font-2);
    }
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .btn {
      width: 88px;
    }
  }

  :deep {
    .el-dialog__body {
      padding: 30px 20px 15px !important;
    }
  }
}
</style>
