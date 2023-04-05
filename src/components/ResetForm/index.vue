<!--
 * 密码重置表单
 * @author: dnhyxc
 * @since: 2023-02-21
 * index.vue
-->
<template>
  <!-- @submit.native.prevent 阻止表单提交刷新页面 -->
  <el-form ref="formRef" :rules="rules" :model="resetForm" class="form-wrap" @submit.native.prevent>
    <el-form-item prop="username" class="form-item">
      <el-input v-model.trim="resetForm.username" size="large" placeholder="请输入用户名" @keyup.enter="onEnter" />
    </el-form-item>
    <el-form-item v-if="needPwd" prop="newPwd" class="form-item">
      <el-input
        v-model.trim="resetForm.newPwd"
        size="large"
        placeholder="请输入新密码"
        show-password
        @keyup.enter="onEnter"
      />
    </el-form-item>
    <el-form-item v-if="needPwd" prop="confirmPwd" class="form-item">
      <el-input
        v-model.trim="resetForm.confirmPwd"
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
import type { FormInstance, FormRules } from 'element-plus';
import { ResetFormParams } from '@/typings/common';
import { verifyUsername, verifyPassword, verifyResetPassword } from '@/utils';

interface IProps {
  dataSource?: ResetFormParams;
  needPwd?: boolean;
  onEnter?: (formRef: any, resetForm: ResetFormParams) => void;
}

const props = withDefaults(defineProps<IProps>(), {
  dataSource: () => ({
    username: '',
    newPwd: '',
    confirmPwd: '',
  }),
  needPwd: true,
  onEnter: () => {},
});

const formRef = ref<FormInstance>();

const resetForm = reactive<ResetFormParams>(props.dataSource);

const validateUsername = (rule: any, value: any, callback: any) => {
  const { msg, status } = verifyUsername(value);
  if (value === '') {
    callback(new Error('用户名不能为空'));
  } else if (!status) {
    callback(new Error(msg));
  } else {
    callback();
  }
};

const validatePassword = (rule: any, value: any, callback: any) => {
  const { msg, status } = verifyPassword(value);
  if (value === '') {
    callback(new Error('密码不能为空'));
  } else if (!status) {
    console.log(msg, 'msg');
    callback(new Error(msg));
  } else {
    callback();
  }
};

const validateConfirmPwd = (rule: any, value: any, callback: any) => {
  const { msg, status } = verifyResetPassword(value, resetForm?.newPwd!);
  if (value === '') {
    callback(new Error('确认密码不能为空'));
  } else if (!status) {
    console.log(msg, 'msg');
    callback(new Error(msg));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  username: [{ validator: validateUsername, trigger: 'blur', required: true }],
  newPwd: [{ validator: validatePassword, trigger: 'blur', required: true }],
  confirmPwd: [{ validator: validateConfirmPwd, trigger: 'blur', required: true }],
});

const onEnter = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      props.onEnter && props.onEnter(formRef, resetForm);
    } else {
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
