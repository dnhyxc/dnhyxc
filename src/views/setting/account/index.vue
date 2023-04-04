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
        >
          &nbsp;填写
        </i>
        <div v-show="currentEdit === i.type" class="edit-content">
          <el-input
            v-model.trim="accountForm[i.type]"
            v-focus
            :placeholder="i.placeholder"
            @keyup.enter="onEnter(i.type)"
          />
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
        <i class="edit-font reset-font font iconfont icon-zhongzhi" @click="onReset('password')">&nbsp;重置密码</i>
      </div>
    </div>
    <div class="logout-item item">
      <span class="label">账号注销</span>
      <div class="reset-wrap">
        <i class="edit-font font iconfont icon-tuichu1" @click="onReset('logout')">&nbsp;注销</i>
      </div>
    </div>
    <el-dialog v-model="visible" :title="resetType === 'password' ? '重置密码' : '账号注销'" width="500">
      <ResetForm
        :key="visible ? 1 : 0"
        :on-enter="onResetEnter"
        :need-pwd="resetType === 'password'"
        :data-source="dataSource"
      >
        <template #footer="formData">
          <el-button class="action" size="large" @click="onCancelResetPwd(formData.data as FormData<FormInstance>)">
            取消
          </el-button>
          <el-button
            type="primary"
            size="large"
            class="action"
            @click="onResetPwd(formData.data as FormData<FormInstance>)"
          >
            {{ resetType === 'password' ? '重置' : '注销' }}
          </el-button>
        </template>
      </ResetForm>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, Ref, Directive, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { FormInstance, ElMessage } from 'element-plus';
import { SETTING_TYPE } from '@/constant';
import { loginStore } from '@/store';
import { FormData, ResetFormParams } from '@/typings/common';
import ResetForm from '@/components/ResetForm/index.vue';

const router = useRouter();

// 局部自动获取焦点指令
const vFocus: Directive = (el) => {
  nextTick(() => {
    if (el.tagName.toLocaleLowerCase() === 'input') {
      el.focus();
    } else if (el.getElementsByTagName('input')) {
      el.getElementsByTagName('input')[0].focus();
    }
  });
};

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

// 注销、重置密码表单初始化数据
const dataSource = reactive<ResetFormParams>({
  username: loginStore.userInfo?.username || '',
  newPwd: '',
  confirmPwd: '',
});

// 当前正在编辑的 item（掘金、知乎...）
const currentEdit = ref<string>('');

// 密码修改、注销弹窗状态
const visible = ref<boolean>(false);

// 标记是重置密码还是注销
const resetType = ref<string>('');

// 编辑
const onEdit = (type: string) => {
  currentEdit.value = type;
};

// 输入框回车事件
const onEnter = async (type: string) => {
  loginStore.updateUserInfo(
    {
      [type]: accountForm[type],
    },
    1, // 1 标识更改用户信息，2 标识更改用户密码
    router,
  );
  currentEdit.value = '';
};

// 编辑
const onOk = (type: string) => {
  loginStore.updateUserInfo(
    {
      [type]: accountForm[type],
    },
    1, // 1 标识更改用户信息，2 标识更改用户密码
    router,
  );
  currentEdit.value = '';
};

// 取消编辑
const onCancel = (type: string) => {
  currentEdit.value = '';
};

// 密码修改/账号注销
const onReset = (type: string) => {
  resetType.value = type;
  visible.value = true;
};

// 确定重置密码
const onResetPwd = (Form: FormData<FormInstance>) => {
  if (!Form.formRef) return;
  Form.formRef.validate(async (valid) => {
    if (valid) {
      const { username, confirmPwd } = Form.resetForm;
      if (resetType.value === 'password') {
        // 重置密码
        await loginStore.onResetPwd({ username, password: confirmPwd! });
        Form.formRef.resetFields();
        Form.resetForm = { username: '', confirmPwd: '', newPwd: '' };
        // 成功时关闭弹窗
        visible.value = false;
      } else {
        if (username !== loginStore.userInfo?.username) {
          ElMessage({
            message: '您要注销的用户名不是当前登录人的用户名',
            type: 'warning',
            offset: 80,
          });
          return;
        }
        await loginStore.onLogout(router);
        Form.formRef.resetFields();
        Form.resetForm = { username: '', confirmPwd: '', newPwd: '' };
        // 成功时关闭弹窗
        visible.value = false;
      }
    } else {
      return false;
    }
  });
};

// 重置密码、注销回车事件
const onResetEnter = async (formRef: Ref<FormInstance>, resetForm: ResetFormParams) => {
  const { username, confirmPwd } = resetForm;
  if (resetType.value === 'password') {
    await loginStore.onResetPwd({ username, password: confirmPwd! });
  } else {
    if (username !== loginStore.userInfo?.username) {
      ElMessage({
        message: '您要注销的用户名不是当前登录人的用户名',
        type: 'warning',
        offset: 80,
      });
      return;
    }
    await loginStore.onLogout(router);
  }
  // 重置密码，成功时关闭弹窗
  formRef.value.resetFields();
  resetForm = { username: '', confirmPwd: '', newPwd: '' };
  setTimeout(() => {
    visible.value = false;
  }, 50);
};

// 取消重置密码
const onCancelResetPwd = (Form: FormData<FormInstance>) => {
  Form.formRef.resetFields();
  Form.resetForm = { username: '', confirmPwd: '', newPwd: '' };
  visible.value = false;
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

      .edit-font {
        font-size: 15px;
      }

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

      .reset-font {
        font-size: 15px;
      }
    }
  }
}
</style>
