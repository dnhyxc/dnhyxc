<template>
  <div class="setting-wrap">
    <div class="menu">
      <div
        v-for="menu in SETTING_MENU"
        :key="menu.key"
        :class="`${menu.path === activeMenu.path && 'active'} menu-item`"
        @click="onClick(menu)"
      >
        {{ menu.name }}
      </div>
    </div>
    <div class="content">
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <RouterView />
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { SETTING_MENU } from '@/constant';
import { MenuListParams } from '@/typings/common';

const activeMenu = ref<MenuListParams>(SETTING_MENU[0]);

const router = useRouter();
const route = useRoute();

// 点击菜单
const onClick = (menu: MenuListParams) => {
  activeMenu.value = menu;
  if (route.path === menu.path) return;
  router.push(menu.path);
};
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.setting-wrap {
  box-sizing: border-box;
  height: calc(100vh - 72px);
  overflow: hidden;

  .menu {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    border: 1px solid @card-border;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    background-color: @tab-color;

    .menu-item {
      box-sizing: border-box;
      padding: 6px 10px;
      cursor: pointer;

      .clickNoSelectText();

      &:last-child {
        margin-right: 0;
      }
    }

    .active {
      position: relative;
      color: @theme-blue;
      background-color: @fff;

      &:first-child {
        border-left: none;
      }

      &::after {
        position: absolute;
        bottom: -1px;
        left: 0;
        content: '';
        height: 2px;
        width: 100%;
        background-color: @theme-blue;
        border-radius: 2px;
      }
    }
  }

  .content {
    box-sizing: border-box;
    height: calc(100vh - 112px);
    border-left: 1px solid @card-border;
    border-right: 1px solid @card-border;
    border-bottom: 1px solid @card-border;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}
</style>
