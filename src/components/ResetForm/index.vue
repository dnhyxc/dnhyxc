<!--
 * 密码重置表单
 * @author: dnhyxc
 * @since: 2023-02-21
 * index.vue
-->
<template>
  <el-form ref="formRef" :model="resetForm" class="form-wrap">
    <el-form-item
      prop="username"
      :rules="[
        {
          required: true,
          message: '用户名不能为空',
          trigger: 'blur',
        },
      ]"
      class="form-item"
    >
      <el-input v-model="resetForm.username" size="large" placeholder="请输入用户名" />
    </el-form-item>
    <el-form-item
      prop="newPwd"
      :rules="{
        required: true,
        message: '新密码不能为空',
        trigger: 'blur',
      }"
      class="form-item"
    >
      <el-input v-model="resetForm.newPwd" size="large" placeholder="请输入新密码" show-password />
    </el-form-item>
    <el-form-item
      prop="confirmPwd"
      :rules="{
        required: true,
        message: '确认密码不能为空',
        trigger: 'blur',
      }"
      class="form-item"
    >
      <el-input
        v-model="resetForm.confirmPwd"
        size="large"
        placeholder="请输入确认密码"
        show-password
        @keyup.enter="onEnter"
      />
    </el-form-item>
    <el-form-item class="form-item action-list">
      <div class="actions">
        <slot :data="{ formRef, resetForm }" name="footer"></slot>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { FormInstance } from 'element-plus';
import { ResetFormParams } from '@/typings/common';

interface IProps {
  onEnter?: (values: ResetFormParams) => void;
}

const props = withDefaults(defineProps<IProps>(), {
  onEnter: () => {},
});

const formRef = ref<FormInstance>();

const resetForm = reactive<ResetFormParams>({
  username: '',
  newPwd: '',
  confirmPwd: '',
});

const onEnter = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      props.onEnter && props.onEnter(resetForm);
      // router.push(commonStore.backPath);
    } else {
      console.log(resetForm, 'error submit!');
      return false;
    }
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.form-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 500px;

  .form-item {
    margin-bottom: 30px;
    padding: 0 50px;
  }

  .action-list {
    margin-bottom: 0;
    margin-top: 10px;

    .actions {
      display: flex;
      justify-content: space-between;
      width: 100%;

      :deep {
        .action {
          flex: 1;
        }
      }
    }
  }
}
</style>
