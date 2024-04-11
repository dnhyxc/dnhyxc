<!--
 * 重置密码页
 * @author: dnhyxc
 * @since: 2023-02-07
 * index.vue
-->
<template>
  <div class="reset-content">
    <div class="title">
      <div class="icon-wrap">
        <i class="page-icon iconfont icon-haidao_"/>
      </div>
      重置用户密码
    </div>
    <ResetForm :on-enter="onEnter">
      <template #footer="formData">
        <el-button
          type="primary"
          size="large"
          class="action"
          @click="onResetPwd(formData.data as FormData<FormInstance>)"
        >
          确定重置
        </el-button>
        <el-button class="action" size="large" @click="toLogin()">返回登录</el-button>
      </template>
    </ResetForm>
  </div>
</template>

<script setup lang="ts">
import {Ref} from 'vue';
import {useRouter} from 'vue-router';
import {FormInstance} from 'element-plus';
import {FormData, ResetFormParams} from '@/typings/common';
import {loginStore} from '@/store';
import ResetForm from '@/components/ResetForm/index.vue';

const router = useRouter();

const emit = defineEmits(['switchDom']);

// 确定重置密码
const onResetPwd = (Form: FormData<FormInstance>) => {
  if (!Form.formRef) return;
  Form.formRef.validate(async (valid: any) => {
    if (valid) {
      const res = await loginStore.onResetPwd(
        {username: Form.resetForm.username, phone: Form.resetForm.phone, password: Form.resetForm.confirmPwd!},
        router,
      );
      res && toLogin();
    } else {
      return false;
    }
  });
};

const onEnter = (formRef: Ref<FormInstance>, resetForm: ResetFormParams) => {
  formRef.value.validate(async (valid: any) => {
    if (valid) {
      const res = await loginStore.onResetPwd(
        {username: resetForm.username, phone: resetForm.phone, password: resetForm.confirmPwd!},
        router,
      );
      res && toLogin();
    } else {
      return false;
    }
  });
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
  //TODO
  //height: 520px;
  padding: 20px 20px 38px 20px;
  border-radius: 5px;
  background: var(--login-bg);
  //TODO
  //box-shadow: 0 0 2px @page-color inset;

  .title {
    display: flex;
    align-items: center;
    height: 50px;
    line-height: 50px;
    //TODO
    //padding: 0 50px;
    margin-bottom: 25px;
    font-size: 20px;
    font-weight: 700;

    .icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;

      .page-icon {
        display: inline-block;
        min-height: 30px;
        line-height: 30px;
        font-size: 30px;
        margin-bottom: 2px;
        margin-right: 10px;
        color: var(--theme-blue);
        cursor: pointer;
        -webkit-app-region: no-drag;
        .textLg();
      }
    }
  }
}
</style>
