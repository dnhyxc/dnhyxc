<!--
 * 账号设置
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="account-wrap">
    <div class="item">
      <span class="label">个人掘金</span>
      <div class="edit-wrap">
        <i class="font iconfont icon-yongyan" @click="onEdit('juejin')">&nbsp;填写</i>
        <div class="edit-content">
          <el-input v-model="accountForm.juejin" placeholder="请输入个人掘金网址" @keyup.enter="onEnter" />
          <div class="actions">
            <el-button type="primary" class="action" @click="onOk('juejin')">确定</el-button>
            <el-button class="action" @click="onCancel('juejin')">取消</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const accountForm = reactive<{
  juejin: string;
  zhihu: string;
}>({
  juejin: '',
  zhihu: '',
});

const currentEdit = ref<string>('');

// 输入框回车事件
const onEnter = () => {
  console.log(accountForm, 'accountForm');
};

// 编辑
const onEdit = (type: string) => {
  console.log(accountForm, 'accountForm', type);
  currentEdit.value = type;
};

// 编辑
const onOk = (type: string) => {
  console.log(accountForm, 'accountForm', type);
  currentEdit.value = type;
};

// 取消编辑
const onCancel = (type: string) => {
  console.log(accountForm, 'accountForm', type);
  currentEdit.value = '';
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.account-wrap {
  border-bottom: 1px solid red;
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
    align-items: center;
    width: 600px;
    padding: 10px 0;

    .label {
      margin-right: 12px;
      font-size: 14px;
    }

    .el-input {
      flex: 1;
    }

    .edit-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      margin-left: 10px;

      .font {
        color: @theme-blue;
        cursor: pointer;
      }

      .edit-content {
        width: 100%;
        border: 1px solid red;
      }
    }
  }
}
</style>
