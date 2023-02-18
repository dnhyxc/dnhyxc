<template>
  <div class="wrap">
    <el-container>
      <el-main class="el-main">
        <Header />
        <div :class="`${checkOS() === 'mac' && 'mac-content'} content`">
          <el-aside class="aside-wrap" :width="`${checkOS() === 'mac' ? '68px' : '60px'} `">
            <LeftMenu />
          </el-aside>
          <div class="right">
            <RouterView v-slot="{ Component }">
              <!-- 定义缓存组件：注意include="Create"，Create 组件内部必须声明组件名称 -->
              <KeepAlive include="Create">
                <component :is="Component" />
              </KeepAlive>
            </RouterView>
          </div>
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
  background-color: @theme;
  // background-color: @menu-weak;
  .el-main {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    padding: 0;
  }

  .content {
    display: flex;
    justify-content: flex-start;
    box-sizing: border-box;
    .pageHeight();
    width: calc(100% - 10px);
    padding-right: 10px;
    .right {
      flex: 1;
      border-radius: 5px;
      // box-shadow: 0 0 10px @menu-weak;
      // padding: 10px;
    }
  }
  .mac-content {
    height: calc(100vh - 60px);
    width: 99.9%;
    padding: 0 10px;
  }
}
</style>
