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
                trigger: 'change',
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
              trigger: 'change',
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
              trigger: 'change',
            }"
            class="form-item"
          >
            <el-radio-group v-model="addCollectForm.status">
              <el-radio label="1">
                <span class="radio-label">公开</span>
                <span class="radio-info">当其他人关注此收藏集后不可再更改为隐私</span>
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
import { computed, ref, reactive } from 'vue';
import { FormInstance } from 'element-plus';
import { collectStore } from '@/store';

interface IProps {
  collectVisible: boolean;
  buildVisible?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  collectVisible: false,
  buildVisible: false,
});

const emit = defineEmits(['update:collectVisible', 'update:buildVisible']);

const formRef = ref<FormInstance>();

const addCollectForm = reactive<{ desc: string; name: string; status: string }>({
  name: '',
  desc: '',
  status: '1',
});

// 计算v-model传过来的参数，防止出现值是可读的，无法修改的警告
const visible = computed({
  get() {
    return props.buildVisible;
  },
  set(visible: boolean) {
    emit('update:buildVisible', visible);
  },
});

// 取消
const onCancel = () => {
  formRef.value?.resetFields();
  emit('update:buildVisible', false);
  emit('update:collectVisible', true);
};

// 确定
const onSubmit = async () => {
  await collectStore?.addCollect(addCollectForm);
  formRef.value?.resetFields();
  emit('update:buildVisible', false);
  emit('update:collectVisible', true);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.dialog-build-content {
  .header {
    font-size: 18px;
  }

  .radio-info {
    margin-left: 10px;
    font-size: 13px;
  }

  :deep {
    .el-dialog__body {
      padding: 15px 15px 0;
    }
  }
}
</style>
