<template>
  <div class="wrap">
    <ExitReminder v-if="loginStore.logoutStatus" />
    <ExitReminder v-if="!commonStore.networkStatus" class="outLine">
      <template #default>
        <div class="info">网络出现了一点小问题，正在尝试连接...</div>
      </template>
    </ExitReminder>
    <div class="el-container-wrap">
      <el-container>
        <el-main class="el-main">
          <Header />
          <div class="content">
            <el-aside class="aside-wrap" :width="`${checkOS() === 'mac' ? '62px' : '60px'}`">
              <LeftMenu />
            </el-aside>
            <div class="right">
              <RouterView v-if="isRouterAlive" v-slot="{ Component }">
                <!-- 定义缓存组件：注意include="Create"，Create 组件内部必须声明组件名称 -->
                <!-- <KeepAlive include="Create">
                  <component :is="Component" />
                </KeepAlive> -->
                <component :is="Component" />
              </RouterView>
            </div>
          </div>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, provide } from 'vue';
import { loginStore, commonStore } from '@/store';
import { useListeningNetwork } from '@/hooks';
import { checkOS } from '@/utils';
import Header from '@/components/Header/index.vue';
import LeftMenu from '@/components/LeftMenu/index.vue';
import ExitReminder from '@/components/ExitReminder/index.vue';

const isRouterAlive = ref<boolean>(true);

// 监听网络状态
useListeningNetwork();

// 刷新当前页面
const reload = () => {
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
  });
};

// 父组件注册刷新当前页面的方法
provide('reload', reload);
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.wrap {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  background-color: var(--background);
  overflow: hidden;
  background-image: var(--bg-image-url);
  background-position: var(--bg-position);
  background-repeat: var(--bg-repeat);
  background-size: var(--bg-img-size);
  animation: var(--bg-animation);
  .bgKeyframes(bgmove);

  .el-container-wrap {
    height: 100vh;
    backdrop-filter: var(--backdrop-filter);

    :deep {
      .el-container {
        height: 100vh;
      }
    }
  }

  .outLine {
    :deep {
      .message {
        height: 110px;
      }
    }

    .info {
      color: @font-warning;
      text-align: center;
      font-size: 18px;
    }
  }

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
    height: 100%;
    overflow: hidden;
    padding-right: 20px;
    padding-bottom: 25px;
    .right {
      flex: 1;
      border-radius: 5px;
    }
  }
}
</style>
