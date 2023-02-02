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
  background-color: @menu-weak;
  .el-main {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    padding: 0;
    width: calc(100% - 62px);
  }
  .content {
    box-sizing: border-box;
    height: calc(100vh - 65px);
    width: 100%;
    padding: 0 12px;
  }
}
</style>
