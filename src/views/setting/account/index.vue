<!--
 * 账号设置
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="account-wrap">
    <div v-for="i in SETTING_TYPE" :key="i.type" class="item">
      <span class="label">{{ i.label }}</span>
      <div class="edit-wrap">
        <div v-show="accountForm[i.type] && currentEdit !== i.type" class="default">
          <span class="website">{{ accountForm[i.type] }}</span>
          <i class="edit-font font iconfont icon-12bianji3x" @click="onEdit(i.type)">&nbsp;编辑</i>
        </div>
        <i
          v-show="!accountForm[i.type] && currentEdit !== i.type"
          class="font iconfont icon-yongyan"
          @click="onEdit(i.type)"
          >&nbsp;填写</i
        >
        <div v-show="currentEdit === i.type" class="edit-content">
          <el-input v-model="accountForm[i.type]" :placeholder="i.placeholder" @keyup.enter="onEnter(i.type)" />
          <div class="actions">
            <el-button type="primary" class="action" @click="onOk(i.type)">确定</el-button>
            <el-button class="action" @click="onCancel(i.type)">取消</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="pwd-item item">
      <span class="label">修改密码</span>
      <div class="reset-wrap">
        <i class="edit-font font iconfont icon-sign-review" @click="onReset('pwd')">&nbsp;重置密码</i>
      </div>
    </div>
    <div class="logout-item item">
      <span class="label">账号注销</span>
      <div class="reset-wrap">
        <i class="edit-font font iconfont icon-tuichu1" @click="onReset('logout')">&nbsp;注销</i>
      </div>
    </div>
    <el-dialog v-model="visible" title="Tips" width="500">
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
            @keyup.enter="onResetEnter"
          />
        </el-form-item>
        <el-form-item class="form-item action-list">
          <el-button type="primary" size="large" class="action" @click="onResetPwd(formRef)">重置并登录</el-button>
          <el-button class="action" size="large" @click="toLogin()">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { Message } from '@/utils';
import { SETTING_TYPE } from '@/constant';
import { loginStore } from '@/store';

const { juejin = '', zhihu = '', github = '', blog = '' } = loginStore.userInfo;

const accountForm = reactive<{
  juejin: string;
  zhihu: string;
  github: string;
  blog: string;
}>({
  juejin,
  zhihu,
  github,
  blog,
});

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
// 当前正在编辑的 item（掘金、知乎...）
const currentEdit = ref<string>('');

// 密码修改、注销弹窗状态
const visible = ref<boolean>(false);

// 编辑
const onEdit = (type: string) => {
  currentEdit.value = type;
};

// 输入框回车事件
const onEnter = (type: string) => {
  console.log(accountForm, 'accountForm', accountForm[type]);
  currentEdit.value = '';
};

// 编辑
const onOk = (type: string) => {
  console.log(accountForm, 'accountForm', accountForm[type]);
  currentEdit.value = '';
};

// 取消编辑
const onCancel = (type: string) => {
  console.log(accountForm, 'accountForm', type);
  currentEdit.value = '';
};

// 密码修改/账号注销
const onReset = (type: string) => {
  console.log(type);
  visible.value = true;
  if (type === 'logout') {
    Message('确定下架该文章吗', '下架文章')
      .then(() => {
        ElMessage({
          type: 'success',
          message: '删除成功',
        });
      })
      .catch(() => {
        ElMessage({
          type: 'error',
          message: '删除失败',
        });
      });
  }
};

// 确定重置密码
const onResetPwd = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      console.log('重置密码并登录', resetForm);
      loginStore.onResetPwd({ username: resetForm.username, password: resetForm.confirmPwd });
    } else {
      console.log('error submit!');
      return false;
    }
  });
};

const onResetEnter = () => {
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
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.account-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10px 0 10px 0;
  border-radius: 5px;

  .item {
    display: flex;
    justify-content: center;
    width: 600px;
    padding: 20px 5px 25px 0;
    border-bottom: 1px solid @card-border;

    &:last-child {
      border-bottom: none;
    }

    .label {
      margin-right: 30px;
      font-size: 14px;
      padding-top: 5px;
      text-align: right;
      min-width: 70px;
      color: @font-3;
    }

    .el-input {
      flex: 1;
    }

    .edit-wrap {
      flex: 1;
      display: flex;
      align-items: flex-start;

      &:hover {
        .edit-font {
          display: inline-block;
        }
      }

      .default {
        display: flex;
        align-items: center;
        padding: 3px 0;
      }

      .font {
        color: @theme-blue;
        cursor: pointer;
        padding-top: 5px;
        .clickNoSelectText();
        font-size: 14px;
        margin-left: -2px;

        &:hover {
          color: @active;
        }
      }

      .edit-font {
        display: none;
        padding-top: 0;
        margin-left: 10px;
      }

      .edit-content {
        flex: 1;
        width: 100%;

        .actions {
          margin-top: 10px;
        }
      }
    }

    .reset-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      padding-top: 5px;

      .font {
        font-size: 14px;
        color: @theme-blue;
        cursor: pointer;

        &:hover {
          color: @active;
        }
      }
    }
  }
}
</style>
