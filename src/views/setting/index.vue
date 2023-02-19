<template>
  <div class="wrap">
    <el-container>
      <el-main class="el-main">
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
          <RouterView />
        </div>
      </el-main>
    </el-container>
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

.wrap {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  height: calc(100vh - 75px);
  overflow: hidden;

  .el-main {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    padding: 0;
    border: 1px solid red;
    height: calc(100vh - 75px);

    .menu {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      margin-bottom: 20px;

      .menu-item {
        margin-right: 20px;
        cursor: pointer;

        .clickNoSelectText();

        &:last-child {
          margin-right: 0;
        }
      }

      .active {
        position: relative;
        color: @active;

        &::after {
          position: absolute;
          bottom: -5px;
          left: 0;
          content: '';
          height: 2px;
          width: 100%;
          background-color: @active;
          border-radius: 2px;
        }
      }
    }

    .content {
      flex: 1;
      box-sizing: border-box;
      height: 100%;
    }
  }
}
</style>
