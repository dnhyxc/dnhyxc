<!--
 * 登录/注册页
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="login-content">
    <div class="title">{{ isRegister ? '账号注册' : '账号密码登录' }}</div>
    <el-form ref="formRef" :rules="rules" :model="loginForm" class="form-wrap">
      <el-form-item prop="username" class="form-item">
        <el-input v-model="loginForm.username" size="large" placeholder="请输入用户名" @keyup.enter="onEnter" />
      </el-form-item>
      <el-form-item prop="password" class="form-item">
        <el-input
          v-model="loginForm.password"
          size="large"
          placeholder="请输入密码"
          show-password
          @keyup.enter="onEnter"
        />
      </el-form-item>
      <el-form-item v-if="!isRegister" prop="code" class="form-item code-item">
        <el-input
          v-model="loginForm.code"
          size="large"
          class="code-inp"
          placeholder="请输入验证码"
          @keyup.enter="onEnter"
        />
        <canvas ref="canvasCtx" class="code-canvas" :width="width" :height="height" @click="onResetCode"></canvas>
      </el-form-item>
      <el-form-item class="form-item action-list">
        <el-button type="primary" size="large" class="action" @click="onLogin(formRef)">{{
          isRegister ? '注册' : '登录'
        }}</el-button>
      </el-form-item>
    </el-form>
    <div class="reset-wrap">
      <el-button class="action" link @click="toRegister">{{
        isRegister ? '已有帐号，前往登录' : '没有账号，点我注册'
      }}</el-button>
      <el-button class="action" link @click="onBackHome">返回首页</el-button>
      <el-button class="action" link @click="onForgetPwd">忘记密码</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { loginStore } from '@/store';
import { verifyUsername, verifyPassword, verifyCode, drawCharater } from '@/utils';

const router = useRouter();

const formRef = ref<FormInstance>();
const isRegister = ref<boolean>(false);
// canvas ref
const canvasCtx = ref<HTMLCanvasElement | null>(null);
// 生成的验证码
const charater = ref<string>('');
// canvas 宽度
const width = 120;
// canvas 高度
const height = 40;

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
    callback(new Error(msg));
  } else {
    callback();
  }
};

const validateCode = (rule: any, value: any, callback: any) => {
  // 开发环境不进行校验
  if (import.meta.env.DEV) return true;
  const { msg, status } = verifyCode(value, charater.value);
  if (value === '') {
    callback(new Error('验证码不能为空'));
  } else if (!status) {
    callback(new Error(msg));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  username: [{ validator: validateUsername, trigger: 'blur', required: true }],
  password: [{ validator: validatePassword, trigger: 'blur', required: true }],
  code: [{ validator: validateCode, trigger: 'blur', required: true }],
});

const loginForm = reactive<{
  username: string;
  password: string;
  code: string;
}>({
  username: loginStore.userInfo?.username || '',
  password: '',
  code: '',
});

const emit = defineEmits(['switchDom']);

onMounted(() => {
  nextTick(() => {
    charater.value = drawCharater({
      canvasElement: canvasCtx.value!,
      width,
      height,
    });
  });
});

watch(isRegister, (newVal: boolean) => {
  if (!newVal) {
    nextTick(() => {
      charater.value = drawCharater({
        canvasElement: canvasCtx.value!,
        width,
        height,
      });
    });
  }
});

// 登录注册表单提交
const onSubmit = (formEl: FormInstance, type: string) => {
  formEl.validate(async (valid) => {
    if (valid) {
      if (type === 'login') {
        await loginStore.onLogin(loginForm, router);
      } else {
        await loginStore.onRegister(loginForm);
        isRegister.value = false;
      }
    } else {
      return false;
    }
  });
};

// 前往注册
const toRegister = () => {
  isRegister.value = !isRegister.value;
};

// 登录
const onLogin = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  onSubmit(formEl, isRegister.value ? 'register' : 'login');
};

// 登陆注册回车事件
const onEnter = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      await loginStore.onLogin(loginForm, router);
    } else {
      return false;
    }
  });
};

// 返回首页
const onBackHome = () => {
  router.push('/home');
};

// 点击忘记密码切换组件
const onForgetPwd = () => {
  emit('switchDom', 'Reset');
};

// 重置验证码
const onResetCode = () => {
  if (canvasCtx.value) {
    charater.value = '';
    charater.value = drawCharater({
      canvasElement: canvasCtx.value,
      width,
      height,
    });
  }
};
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.login-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  height: 375px;
  padding: 10px 20px 20px;
  border-radius: 5px;
  background: rgba(225, 225, 225, 0.1);
  box-shadow: 0 0 2px @page-color inset;
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

    .code-item {
      display: flex;
      justify-content: flex-start;

      .code-inp {
        flex: 1;
        border-radius: 10px;
      }

      :deep {
        .el-input__wrapper {
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
        }
      }

      .code-canvas {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        cursor: pointer;
      }
    }
  }

  .reset-wrap {
    display: flex;
    justify-content: flex-end;
    padding: 0 50px;
    margin-top: 10px;

    .action {
      color: var(--theme-blue);

      &:hover {
        color: var(--active-color);
      }
    }
  }
}
</style>
