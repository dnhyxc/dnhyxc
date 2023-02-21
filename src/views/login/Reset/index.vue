<!--
 * 重置密码页
 * @author: dnhyxc
 * @since: 2023-02-07
 * index.vue
-->
<template>
  <div class="reset-content">
    <div class="title">重置用户密码</div>
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
        <el-button type="primary" size="large" class="action" @click="onResetPwd(formRef)">重置并登录</el-button>
        <el-button class="action" size="large" @click="toLogin()">返回登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, reactive } from 'vue';
import { FormInstance } from 'element-plus';
import { commonStore, loginStore } from '@/store';

const router = useRouter();

const formRef = ref<FormInstance>();

const resetForm = reactive<{
  username: string;
  newPwd: string;
  confirmPwd: string;
}>({
  username: '',
  newPwd: '',
  confirmPwd: '',
});

const emit = defineEmits(['switchDom']);

// 确定重置密码
const onResetPwd = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      console.log('重置密码并登录', resetForm, commonStore.backPath);
      loginStore.onResetPwd({ username: resetForm.username, password: resetForm.confirmPwd }, router);
    } else {
      console.log('error submit!');
      return false;
    }
  });
};

const onEnter = () => {
  // if (!formRef.value) return;
  // formRef.value.validate(async (valid) => {
  //   if (valid) {
  //     console.log(commonStore, '登录', commonStore.backPath);
  //     router.push(commonStore.backPath);
  //   } else {
  //     console.log(resetForm, 'error submit!');
  //     return false;
  //   }
  // });
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
}
</style>
