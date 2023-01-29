<template>
  <div class="wrap">
    <el-container>
      <el-aside width="60px">
        <LeftMenu />
      </el-aside>
      <el-main class="el-main">
        <Header />
        <div class="content">
          <RouterView />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header/index.vue';
import LeftMenu from '@/components/LeftMenu/index.vue';
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.wrap {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;

  .el-main {
    box-sizing: border-box;
    height: 100%;
    padding: 0;
    background-color: @background;
  }

  .content {
    box-sizing: border-box;
    flex: 1;
  }
}
</style>
