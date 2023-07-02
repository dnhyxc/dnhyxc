<template>
  <div :class="`${checkOS() === 'mac' && 'mac-setting-wrap'} setting-wrap`">
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { SETTING_MENU } from '@/constant';
import { loginStore } from '@/store';
import { checkOS } from '@/utils';
import { MenuListParams } from '@/typings/common';

const menuList = computed(() => {
  const { token } = loginStore;
  const res = token ? SETTING_MENU : SETTING_MENU.filter((i) => i.show);
  return res;
});

const activeMenu = ref<MenuListParams>(menuList.value[0]);

const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (loginStore.userInfo?.userId) {
    router.push('/profile');
  } else {
    router.push('/system');
  }
});

watch(
  () => route.path,
  (newVal) => {
    const currentMenu = SETTING_MENU.find((i) => i.path === newVal);
    activeMenu.value = currentMenu!;
  },
);

// 点击菜单
const onClick = (menu: MenuListParams) => {
  activeMenu.value = menu;
  router.push(menu.path);
};
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.setting-wrap {
  box-sizing: border-box;
  height: calc(100vh - 76px);
  overflow: hidden;
  border-radius: 5px;
  background-color: var(--pre-hover-bg);
  padding-left: 4px;
  width: calc(100% - 3px);

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
      color: var(--font-color);

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

.mac-setting-wrap {
  height: calc(100vh - 86px);

  .content {
    height: calc(100vh - 122px);
  }
}
</style>
