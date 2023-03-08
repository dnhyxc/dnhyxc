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
        <el-form ref="formRef" :model="buildCollectForm" class="form-wrap" @submit.native.prevent>
          <el-form-item
            prop="collectName"
            label="名称 :"
            :rules="[
              {
                trigger: 'change',
              },
            ]"
            class="form-item"
          >
            <el-input v-model.trim="buildCollectForm.collectName" size="large" placeholder="请输入收藏集名称" />
          </el-form-item>
          <el-form-item
            prop="abstract"
            label="描述 :"
            :rules="{
              trigger: 'change',
            }"
            class="form-item"
          >
            <el-input
              v-model.trim="buildCollectForm.abstract"
              :autosize="{ minRows: 5, maxRows: 8 }"
              type="textarea"
              maxlength="200"
              show-word-limit
              placeholder="请输入收藏集描述"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="footer">
          <span class="actions">
            <el-button @click="onCancel">取消</el-button>
            <el-button type="primary" :disabled="!buildCollectForm.collectName" @click="onSubmit">确定</el-button>
          </span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import { FormInstance } from 'element-plus';

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

const buildCollectForm = reactive<{ abstract: string; collectName: string }>({
  collectName: '',
  abstract: '',
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
const onSubmit = () => {
  console.log(buildCollectForm, 'buildCollectForm');
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
}
</style>
