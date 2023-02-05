<!--
 * 登录页
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="login">
    <div class="content">
      <div class="title">账号密码登录</div>
      <el-form ref="formRef" :model="loginForm" class="form-wrap">
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
          <el-input v-model="loginForm.username" size="large" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item
          prop="password"
          :rules="{
            required: true,
            message: '密码不能为空',
            trigger: 'blur',
          }"
          class="form-item"
        >
          <el-input
            v-model="loginForm.password"
            size="large"
            placeholder="请输入密码"
            show-password
            @keyup.enter="onEnter"
          />
        </el-form-item>
        <el-form-item class="form-item action-list">
          <el-button type="primary" size="large" class="action" @click="onLogin(formRef)">用户登录</el-button>
          <el-button class="action" size="large" @click="onRegister(formRef)">账号注册</el-button>
        </el-form-item>
      </el-form>
      <div class="reset-wrap">
        <el-button class="action" link @click="onForgetPwd">忘记密码</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, reactive } from 'vue';
import type { FormInstance } from 'element-plus';
import { commonStore, loginStore } from '@/store';

const router = useRouter();

const formRef = ref<FormInstance>();

const loginForm = reactive<{
  username: string;
  password: string;
}>({
  username: '',
  password: '',
});

// 登录
const onLogin = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      console.log('登录', loginForm, commonStore.backPath);
      await loginStore.onLogin(loginForm);
      router.push(commonStore.backPath);
    } else {
      console.log('error submit!');
      return false;
    }
  });
};

// 注册
const onRegister = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      console.log('注册', loginForm);
      loginStore.onRegister(loginForm);
    } else {
      console.log('error submit!');
      return false;
    }
  });
};

const onEnter = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      console.log(commonStore, '登录', commonStore.backPath);
      router.push(commonStore.backPath);
    } else {
      console.log(loginForm, 'error submit!');
      return false;
    }
  });
};

// 忘记密码
const onForgetPwd = () => {
  console.log('忘记密码');
};
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.login {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: @fff;
  background: rgba(0, 0, 0, 0.1);

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-image: url('@/assets/images/cywl.jpg');
    background-position: center;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-size: cover;
    z-index: -1;
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    height: 375px;
    padding: 20px;
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
        display: flex;
        justify-content: space-between;
        margin-bottom: 0;
        margin-top: 10px;

        .action {
          flex: 1;
        }
      }
    }

    .reset-wrap {
      display: flex;
      justify-content: flex-end;
      padding: 0 50px;
      margin-top: 10px;
    }
  }
}
</style>
