<!--
 * 文章详情新窗口
 * @author: dnhyxc
 * @since: 2023-04-03
 * index.vue
-->
<template>
  <div :class="`${checkOS() === 'mac' && 'mac-open-wrap'} open-wrap`">
    <div class="header">
      <div class="left">
        <div class="icon-wrap">
          <i class="page-icon iconfont icon-haidao_" />
        </div>
        <div class="title">登录</div>
      </div>
      <div class="right">
        <div v-for="svg in ACTION_SVGS" :key="svg.title" class="icon" @click="onClick(svg)">
          <el-tooltip
            effect="light"
            :content="svg.title === '最大化' ? (toggle ? '还原' : svg.title) : svg.title"
            placement="bottom"
            popper-class="custom-dropdown-styles"
          >
            <div
              :class="`icon-text iconfont ${
                svg.title === '最大化' ? (toggle ? 'icon-3zuidahua-3' : 'icon-3zuidahua-1') : svg.icon
              }`"
            />
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="content" @click="onLogin">登录</div>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { onMounted, nextTick, ref } from 'vue';
import { commonStore } from '@/store';
import { ipcRenderers, checkOS } from '@/utils';
import { ACTION_SVGS } from '@/constant';

// 窗口大小控制状态
const toggle = ref<boolean>(false);

onMounted(() => {
  nextTick(() => {
    // 判断页面是否加载完成
    commonStore.updatePageLoadStatus();
  });

  // 渲染进程监听窗口是否最大化
  ipcRenderer.on('newWin-max', (_, status) => {
    toggle.value = status;
  });
});

// 点击右侧窗口控制按钮
const onClick = (item: { title: string; svg: string }) => {
  if (item.title === '最大化') {
    toggle.value = !toggle.value;
    // ipcRenderers.sendNewWinMax('open');
    ipcRenderers.sendWindowMax();
  }

  if (item.title === '最小化') {
    // ipcRenderers.sendNewWinMin('open');
    ipcRenderers.sendWindowMin();
  }

  if (item.title === '关闭') {
    ipcRenderers.sendWindowOut();
  }
};

const onLogin = () => {
  ipcRenderers.sendOpenMainWin();
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.open-wrap {
  border: 1px solid red;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 55px;
    padding: 15px 16px 0 16px;
    -webkit-app-region: drag;

    .left {
      flex: 1;
      display: flex;
      align-items: center;

      .icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;

        .page-icon {
          display: inline-block;
          min-height: 30px;
          line-height: 30px;
          font-size: 30px;
          margin-bottom: 2px;
          margin-right: 20px;
          color: var(--theme-blue);
          cursor: pointer;
          -webkit-app-region: no-drag;
          .textLg();
        }
      }

      .title {
        font-size: 18px;
        font-weight: 700;
        color: var(--font-color);
        .headerTextLg();
      }
    }

    .right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      color: var(--font-1);

      .icon {
        position: relative;
        margin-left: 20px;
        -webkit-app-region: no-drag;
        z-index: 99;
      }
    }
  }
}

.mac-open-wrap {
  .header {
    .right {
      display: none;
    }
  }
}

.content {
  color: var(--font-1);
}
</style>
