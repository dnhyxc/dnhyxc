<template>
  <div class="wrap">
    <div class="el-container-wrap">
      <el-container>
        <el-main class="el-main">
          <Header />
          <div :class="`${checkOS() === 'mac' && 'mac-content'} content`">
            <el-aside class="aside-wrap" :width="`${checkOS() === 'mac' ? '68px' : '60px'} `">
              <LeftMenu />
            </el-aside>
            <div class="right">
              <RouterView v-if="isRouterAlive" v-slot="{ Component }">
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
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, provide } from 'vue';
import Header from '@/components/Header/index.vue';
import LeftMenu from '@/components/LeftMenu/index.vue';
import { checkOS } from '@/utils';

const isRouterAlive = ref<boolean>(true);

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
  position: relative;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  background-color: var(--background);
  overflow: hidden;
  background: var(--bg-image);
  background-size: var(--bg-size);
  animation: var(--bg-animation);
  .bgKeyframes(bgmove);

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-image: url('@/assets/images/404.webp');
    background-position: center;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .el-container-wrap {
    height: 100vh;
    backdrop-filter: blur(15px);

    :deep {
      .el-container {
        height: 100vh;
      }
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
    .pageHeight();
    width: calc(100% - 10px);
    padding-right: 10px;
    .right {
      flex: 1;
      border-radius: 5px;
    }
  }
  .mac-content {
    height: calc(100vh - 60px);
    width: 99.9%;
    padding: 0 10px;
  }
}
</style>
