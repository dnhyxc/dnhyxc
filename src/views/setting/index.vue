<template>
  <div class="wrap">
    <el-container>
      <el-main class="el-main">
        <div class="menu">
          <RouterLink to="/profile">个人资料</RouterLink>
          <RouterLink to="/account">账号设置</RouterLink>
        </div>
        <div class="content">
          <RouterView />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
@import '@/styles/index.less';

.wrap {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  height: 100vh;

  .el-main {
    display: flex;
    justify-content: flex-start;
    background-color: @background;
    padding: 60px 0 10px 10px;

    .menu {
      width: 110px;
    }

    .content {
      flex: 1;
      box-sizing: border-box;
      height: 100%;
    }
  }
}
</style>
