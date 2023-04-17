<template>
  <div class="setting-wrap">
    <div class="menu">
      <div
        v-for="menu in menuList"
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
import { ref, watchEffect, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { SETTING_MENU } from '@/constant';
import { loginStore } from '@/store';
import { MenuListParams } from '@/typings/common';

const menuList = computed(() => {
  const { token } = loginStore;
  const res = token ? SETTING_MENU : SETTING_MENU.filter((i) => i.show);
  return res;
});

const activeMenu = ref<MenuListParams>(menuList.value[0]);

const router = useRouter();
const route = useRoute();

watchEffect(() => {
  // 判断是否是个人资料、账号设置、主题设置、系统设置页
  if (SETTING_MENU.find((i) => i.path === route.path)) {
    router.push(activeMenu.value.path);
  }
});

// 点击菜单
const onClick = (menu: MenuListParams) => {
  activeMenu.value = menu;
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
    border: 1px solid var(--card-border);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    background-color: transparent;
    color: var(--font-2);

    .menu-item {
      box-sizing: border-box;
      padding: 5px 15px 6px;
      cursor: pointer;

      .clickNoSelectText();

      &:last-child {
        margin-right: 0;
      }
    }

    .active {
      position: relative;
      color: var(--theme-blue);

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
        background-color: var(--theme-blue);
        border-radius: 2px;
      }
    }
  }

  .content {
    box-sizing: border-box;
    height: calc(100vh - 112px);
    border-left: 1px solid var(--card-border);
    border-right: 1px solid var(--card-border);
    border-bottom: 1px solid var(--card-border);
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}
</style>
