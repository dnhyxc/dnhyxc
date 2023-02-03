<!--
 * 左侧菜单
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div :class="`${checkOS() === 'mac' && 'mac-left-menu-wrap'} left-menu-wrap`">
    <div>
      <div class="icon-wrap">
        <img :src="PAGEICON" class="page-icon" />
      </div>
      <div v-for="menu in MENULIST" :key="menu.key" class="menu-list" @click="onSelectMenu(menu)">
        <el-tooltip class="box-item" effect="light" :content="menu.name" placement="right">
          <i
            :class="`${
              ((activeMenu.path === menu.path && route.path.includes(menu.path)) ||
                commonStore.activePath === menu.path) &&
              'active'
            } font iconfont ${menu.icon}`"
          />
        </el-tooltip>
      </div>
    </div>
    <div class="setting">
      <el-dropdown>
        <el-avatar shape="square" :size="38" fit="cover" :src="PAGESVG" class="avatar" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="toPersonal">
              <div class="dropdown">
                <i class="iconfont icon-gerenzhongxin" />
                <span class="dropdown-text">我的主页</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item @click="onLogout">
              <div class="dropdown">
                <i class="iconfont icon-tuichu1" />
                <span class="dropdown-text">退出登录</span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MENULIST, PAGESVG } from '@/constant';
import PAGEICON from '@/assets/svg/page_icon.svg';
import { MenuListParams } from '@/typings/common';
import { commonStore } from '@/store';
import { checkOS } from '@/utils';

const router = useRouter();
const route = useRoute();

const activeMenu = ref<MenuListParams>(MENULIST[0]);

// 选中菜单
const onSelectMenu = (menu: MenuListParams) => {
  activeMenu.value = menu;
  commonStore.setCrumbsInfo({
    crumbsName: menu.name,
    crumbsPath: menu.path,
  });
  if (route.path === menu.path) return;
  router.push(menu.path);
};

// 去我的主页
const toPersonal = () => {
  commonStore.setCrumbsInfo({
    crumbsName: '我的主页',
    crumbsPath: '/personal',
  });
  router.push('/personal');
};

// 退出登录
const onLogout = () => {
  commonStore.setCrumbsInfo({
    crumbsName: MENULIST[0].name,
    crumbsPath: MENULIST[0].path,
  });
  router.push('/login');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.left-menu-wrap {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  box-sizing: border-box;
  width: 60px;
  height: 100vh;
  padding: 12px 10px;
  border-right: 1px solid @menu-light;
  overflow: auto;

  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;

    .page-icon {
      width: 32px;
      height: 32px;
      margin-bottom: 20px;
    }
  }

  .menu-list {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 60px;

    .font {
      font-size: 26px;
      color: @sub-2-blue;
      cursor: pointer;
    }

    .active {
      color: @active;
    }
  }

  .setting {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    .avatar {
      color: @sub-2-blue;
      cursor: pointer;
    }

    .dropdown {
      display: flex;
      align-items: center;

      .clickNoSelectText();
      .dropdown-text {
        font-size: 13px;
      }
    }
  }
}

.mac-left-menu-wrap {
  margin-top: 28px;
  margin-bottom: 10px;
  height: calc(100vh - 38px);
  padding: 0 10px;

  .icon-wrap {
    .page-icon {
      margin-bottom: 10px;
    }
  }
}
</style>
