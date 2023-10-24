<!--
 * 聊天窗口
 * @author: dnhyxc
 * @since: 2023-10-24
 * index.vue
-->
<template>
  <div class="chart-wrap">
    <div class="friends-menu">
      <div class="search">
        <el-form @submit.native.prevent="onSubmit">
          <el-input v-model="keyword" size="large" placeholder="搜索联系人" clearable />
        </el-form>
      </div>
    </div>
    <div class="content">
      <div class="title">dnhyxc</div>
      <div class="messages">消息列表</div>
      <div class="draft-inp-wrap">输入框</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const keyword = ref<string>('');

const onSubmit = () => {
  console.log(keyword.value, 'values');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.chart-wrap {
  display: flex;
  justify-content: space-between;
  border-radius: 5px;
  box-shadow: 0 0 8px 0 var(--shadow-mack);
  background-color: var(--pre-hover-bg);
  box-sizing: border-box;
  margin-left: 5px;
  margin-top: 3px;
  height: calc(100% - 3px);
  width: calc(100% - 9px);

  .friends-menu {
    width: 280px;
    border-right: 1px solid var(--card-border);

    .search {
      padding: 10px;
    }
  }

  .content {
    flex: 1;
  }

  :deep {
    .el-input__wrapper {
      color: var(--font-1);
      background-color: var(--input-bg-color);
    }

    .el-input__inner {
      color: var(--font-1);
      background-color: transparent;
    }
  }
}
</style>
