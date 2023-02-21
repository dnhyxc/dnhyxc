<!--
 * 重置密码页
 * @author: dnhyxc
 * @since: 2023-02-07
 * index.vue
-->
<template>
  <div class="reset-content">
    <div class="title">重置用户密码</div>
    <ResetForm :on-enter="onEnter">
      <template #footer="formData">
        <el-button
          type="primary"
          size="large"
          class="action"
          @click="onResetPwd(formData.data as FormData<FormInstance>)"
          >重置并登录</el-button
        >
        <el-button class="action" size="large" @click="toLogin()">返回登录</el-button>
      </template>
    </ResetForm>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { FormInstance } from 'element-plus';
import { FormData } from '@/typings/common';
import { commonStore, loginStore } from '@/store';
import ResetForm from '@/components/ResetForm/index.vue';

const router = useRouter();

const emit = defineEmits(['switchDom']);

// 确定重置密码
const onResetPwd = (Form: FormData<FormInstance>) => {
  if (!Form.formRef) return;
  Form.formRef.validate(async (valid: any) => {
    if (valid) {
      console.log('重置密码并登录', Form.resetForm, commonStore.backPath);
      loginStore.onResetPwd({ username: Form.resetForm.username, password: Form.resetForm.confirmPwd }, router);
    } else {
      console.log('error submit!');
      return false;
    }
  });
};

const onEnter = (values: any) => {
  console.log(values);
};

// 却换到登录注册组件
const toLogin = () => {
  emit('switchDom', 'Login');
};
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.reset-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  height: 375px;
  padding: 20px 20px 38px 20px;
  border-radius: 5px;
  background: rgba(225, 225, 225, 0.1);
  box-shadow: 0 0 1px @page-color inset;
  backdrop-filter: blur(1px);
  .title {
    height: 50px;
    line-height: 50px;
    padding: 0 50px;
    margin-bottom: 30px;
    font-size: 20px;
    font-weight: 700;
  }
}
</style>
