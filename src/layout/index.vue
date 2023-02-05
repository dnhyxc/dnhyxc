<template>
  <div class="wrap">
    <el-container>
      <el-aside :width="`${checkOS() === 'mac' ? '68px' : '60px'} `">
        <LeftMenu />
      </el-aside>
      <el-main class="el-main">
        <Header />
        <div :class="`${checkOS() === 'mac' && 'mac-content'} content`">
          <RouterView />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header/index.vue';
import LeftMenu from '@/components/LeftMenu/index.vue';
import { checkOS } from '@/utils';
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
  }
  .content {
    box-sizing: border-box;
    height: calc(100vh - 62px);
    width: 100%;
    padding: 0 10px 0 8px;
  }
  .mac-content {
    height: calc(100vh - 60px);
  }
}
</style>
