<!--
 * 左侧菜单
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <el-aside
    class="aside-wrap"
    :width="`${checkOS() === 'mac' ? (toggleMenu ? '220px' : '62px') : toggleMenu ? '220px' : '60px'}`"
  >
    <div
      id="__LEFT_MENU__"
      :class="`${checkOS() === 'mac' && 'mac-left-menu-wrap'} left-menu-wrap ${toggleMenu && 'menu-list-large'}`"
    >
      <div :class="`icon-wrap ${checkOS() === 'mac' && 'mac-icon-wrap'}`" @click="goHome">
        <i class="page-icon iconfont icon-haidao_" />
        <span class="title-name">墨客</span>
      </div>
      <el-scrollbar v-show="!toggleMenu" ref="scrollRef">
        <div
          v-for="menu in menuList"
          :key="menu.key"
          class="menu-list"
          @click.stop="(e: Event) => onSelectMenu(e, menu as MenuListParams)"
        >
          <el-tooltip
            class="box-item"
            effect="light"
            :content="menu.name"
            placement="right"
            popper-class="custom-dropdown-styles"
          >
            <i
              :class="`${
                ((activeMenu.path === menu.path && route.path.includes(menu.path)) || route.path === menu.path) &&
                'active'
              } ${menu.key} font iconfont ${menu.fillIcon}`"
            />
          </el-tooltip>
        </div>
      </el-scrollbar>
      <div v-show="!toggleMenu" class="setting">
        <div class="toggle"><i class="icon iconfont icon-caidantanchu" @click="onToggleMenu" /></div>
        <el-popover
          v-if="loginStore?.userInfo?.userId"
          placement="right-end"
          popper-class="login-popover"
          :width="180"
          :show-arrow="false"
          trigger="hover"
        >
          <template #reference>
            <el-avatar
              shape="square"
              :size="checkOS() === 'mac' ? 40 : 38"
              fit="cover"
              :src="loginStore.userInfo?.headUrl || HEAD_IMG"
              class="avatar"
              @click.stop="toPersonal"
            />
          </template>
          <div class="drop-user-info-list">
            <div class="user-info">
              <el-avatar
                shape="square"
                :size="checkOS() === 'mac' ? 40 : 38"
                fit="cover"
                :src="loginStore.userInfo?.headUrl || HEAD_IMG"
                class="avatar"
                @click.stop="toPersonal"
              />
              <div class="username">{{ loginStore.userInfo?.username }}</div>
            </div>
            <div class="drop-item" @click="toPersonal">
              <i class="iconfont icon-gerenzhongxin" />
              <span class="dropdown-text">我的主页</span>
            </div>
            <div class="drop-item" @click="onQuit">
              <i class="iconfont icon-tuichu1" />
              <span class="dropdown-text">退出登录</span>
            </div>
          </div>
        </el-popover>
        <div v-else class="login-btn" @click.stop="onLogin">
          <div class="login">登录</div>
        </div>
      </div>
      <div v-show="toggleMenu" class="menu-wrap">
        <div>
          <div
            v-for="menu in menuList"
            :key="menu.key"
            class="menu-list"
            @click.stop="(e: Event) => onSelectMenu(e, menu as MenuListParams)"
          >
            <div
              :class="`${
                ((activeMenu.path === menu.path && route.path.includes(menu.path)) || route.path === menu.path) &&
                'active'
              } menu-item`"
            >
              <i :class="`${menu.key} font iconfont ${menu.fillIcon}`" />
              <span :class="`menu-name ${menu.key}-menu`">{{ menu._name }}</span>
            </div>
          </div>
        </div>
        <div v-if="loginStore.userInfo.userId" class="user-info">
          <div class="toggle"><i class="icon iconfont icon-caidanshouqi" @click="onToggleMenu" /></div>
          <el-popover
            v-if="loginStore?.userInfo?.userId"
            placement="bottom-start"
            popper-class="login-popover"
            :width="180"
            :show-arrow="false"
            trigger="hover"
          >
            <template #reference>
              <el-avatar
                shape="square"
                :size="checkOS() === 'mac' ? 40 : 38"
                fit="cover"
                :src="loginStore.userInfo?.headUrl || HEAD_IMG"
                class="avatar"
                @click.stop="toPersonal"
              />
            </template>
            <div class="drop-user-info-list">
              <div class="drop-item" @click="toPersonal">
                <i class="iconfont icon-gerenzhongxin" />
                <span class="dropdown-text">我的主页</span>
              </div>
              <div class="drop-item out" @click="onQuit">
                <i class="iconfont icon-tuichu1" />
                <span class="dropdown-text">退出登录</span>
              </div>
            </div>
          </el-popover>
          <div class="username">dnhyxc</div>
          <div class="motto">
            <span>答案交给时光寻觅</span>
            <span>未来不是时光锁期</span>
          </div>
          <div class="links">
            <span v-for="i in links" :key="i.icon" class="link-icon" @click.stop="onClickLink(i.url, i.name)">
              <i :class="`icon iconfont ${i.icon}`" />
            </span>
          </div>
        </div>
        <div v-else class="to-login" @click.stop="onLogin">
          <div class="login-btn-large">
            <i class="login iconfont icon-gerenzhongxin" />
            前往登录
          </div>
          <i :class="`toggle-icon iconfont ${toggleMenu ? 'icon-caidanshouqi' : 'icon-caidantanchu'}`"
             @click.stop="onToggleMenu" />
        </div>
      </div>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, inject, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MENULIST, HEAD_IMG, ICONLINKS } from '@/constant';
import { MenuListParams } from '@/typings/common';
import { loginStore } from '@/store';
import { checkOS, setMenuType, getMenuType, checkUrl, message } from '@/utils';
import { authRoutes } from '@/router';
import { shell } from "electron";

const reload = inject<Function>('reload');

const router = useRouter();
const route = useRoute();

let timer: ReturnType<typeof setTimeout> | null = null;
const activeMenu = ref<MenuListParams>(MENULIST[0]);
const toggleMenu = ref<boolean>(getMenuType());

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});

// 计算菜单
const menuList = computed(() => {
  const {token, menus} = loginStore;
  const list = token ? MENULIST : MENULIST.filter((i) => i.show && !i.authorWiew);
  // 判断是否是博主，否则无法访问图片集
  const removeMenu = authRoutes.filter((i) => menus.some((j) => j !== i.name));
  // 根据权限设置菜单
  return list.filter((i) =>
    removeMenu.length ? removeMenu.some((j) => j.name !== i.key) : authRoutes.every((j) => j.name !== i.key),
  );
});

// 监听路由变化
watchEffect(() => {
  if (route.path.includes('/tag/list')) {
    const menu = MENULIST.find((i) => route.path.includes(i.path));
    if (menu) {
      activeMenu.value = menu;
    }
  }
});

const links = computed(() => {
  const linkList = [];
  const {github, juejin, zhihu, blog} = loginStore.userInfo;
  if (github) linkList.push({key: 'github', url: github});
  if (juejin) linkList.push({key: 'juejin', url: juejin});
  if (zhihu) linkList.push({key: 'zhihu', url: zhihu});
  if (blog) linkList.push({key: 'blog', url: blog});
  return linkList.map(i => ({
    name: i.key,
    url: i.url,
    icon: ICONLINKS.find(j => j.label === i.key)?.name,
  }));
});

const onToggleMenu = () => {
  toggleMenu.value = !toggleMenu.value;
  setMenuType(toggleMenu.value);
};

// 选中菜单
const onSelectMenu = (e: Event, menu: MenuListParams) => {
  activeMenu.value = menu;
  if (route.path === menu.path) return;
  router.push(menu.path);
};

// 返回首页
const goHome = () => {
  router.push('/home');
};

// 去我的主页
const toPersonal = () => {
  router.push('/personal');
  if (route.path === '/personal') {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      reload?.();
      timer = null;
    }, 100);
  }
};

const onClickLink = (href: string, name: string) => {
  if (checkUrl(href)) {
    // 使用浏览器打开链接
    shell.openExternal(href);
  } else {
    message({
      title: '链接无效',
      message: `${ name } 链接无法使用`,
      type: 'success',
    });
  }
};

// 登录
const onLogin = () => {
  router.push('/login');
};

// 退出登录
const onQuit = () => {
  loginStore.onQuit();
  router.push('/login');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.aside-wrap {
  overflow-x: hidden;

  .left-menu-wrap {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    box-sizing: border-box;
    width: v-bind("`${toggleMenu ? '220px' : '60px'}`");
    height: 100%;
    border-radius: 5px;
    overflow: auto;
    padding: 22px 0 5px;
    transition: all 0.2s ease;
    .clickNoSelectText;

    .icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 5px;

      .page-icon {
        display: inline-block;
        min-height: 40px;
        line-height: 40px;
        font-size: 40px;
        color: var(--theme-blue);
        cursor: pointer;
        -webkit-app-region: no-drag;
        transition: all 0.3s;
        font-weight: 500;
        .menuLg();

        &:hover {
          transform: scale(1.15);
        }
      }

      .title-name {
        display: none;
        letter-spacing: 5px;
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
        display: block;
        font-size: 26px;
        line-height: 35px;
        font-weight: 700;
        color: @sub-2-blue;
        cursor: pointer;
        transition: all 0.3s;
        .menuLg();

        &:hover {
          transform: scale(1.15);
          color: var(--hover-text-color);
        }
      }

      .active {
        color: var(--active-color);
        .textLgActive();
      }

      .icon-outline-designtools {
        font-size: 25px;
      }

      .icon-luoxuan {
        font-size: 25px;
      }

      .icon-biaoqianku {
        font-size: 25px;
      }

      .icon-shenfenzheng {
        font-size: 23px;
      }
    }

    .setting {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99;

      .avatar {
        cursor: pointer;
        .clickNoSelectText();
      }
    }
  }

  .mac-left-menu-wrap {
    width: v-bind("`${toggleMenu ? '220px' : '62px'}`");
    padding: 22px 0 5px;

    .icon-wrap {
      .page-icon {
        width: 40px;
        height: 40px;
        margin-bottom: 10px;
      }
    }

    .menu-list {
      .font {
        font-size: 32px;
      }

      .icon-luoxuan {
        font-size: 31px;
      }

      .icon-shenfenzheng {
        font-size: 29px;
      }

      .icon-biaoqianku,
      .icon-b-chat,
      .icon-outline-designtools {
        font-size: 30px;
      }
    }
  }

  .menu-list-large {
    display: flex;
    justify-content: flex-start;
    padding: 0 5px 5px 20px;
    transition: all 0.2s ease;
    overflow-x: hidden;

    .icon-wrap {
      justify-content: flex-start;
      align-items: flex-start;
      padding-top: 15px;
      margin-bottom: 5px;
      padding-left: 4px;

      .page-icon {
        margin-bottom: 9px;
        margin-left: -3px;
      }

      .title-name {
        display: inline-block;
        font-weight: 500;
        font-size: 22px;
        margin-left: 5px;
        margin-top: 3px;
        .menuLg();
      }
    }

    .mac-icon-wrap {
      align-items: flex-end;
      padding-top: 20px;
      margin-bottom: 0;

      .title-name {
        margin-top: 3px;
        margin-bottom: 5px;
      }
    }

    .menu-wrap {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      box-shadow: 0 0 5px 0 var(--card-shadow);
      border-radius: 5px;
      overflow: hidden;

      .menu-list {
        flex: 1;
        justify-content: flex-start;
        max-height: 45px;

        .font {
          font-size: 22px;
        }

        .menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 3px 10px;
          border-radius: 5px;

          &:hover {
            background: var(--green-1);

            .font,
            .menu-name {
              color: var(--hover-text-color);
            }
          }

          .icon-fankuitianxie {
            margin-left: -2px;
          }

          .font {
            .menuLg;
          }

          .author {
            font-size: 19px;
            margin-left: 1px;
            margin-right: 2px;
          }

          .menu-name {
            margin-left: 10px;
            .menuLg;
          }
        }

        .active {
          .font,
          .menu-name {
            color: var(--active-color);
            .textLgActive;
          }
        }
      }

      .user-info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 220px;
        margin-top: 20px;
        padding: 0 10px 10px;
        .menuLg;

        .username {
          font-size: 20px;
          font-weight: 700;
        }

        .motto {
          display: flex;
          flex-direction: column;
          font-size: 16px;
        }

        .links {
          display: flex;
          justify-content: flex-start;
          align-items: center;

          .link-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--icon-bg-color);
            margin-right: 5px;
            border-radius: 5px;
            height: 33px;
            width: 33px;
            cursor: pointer;

            .icon {
              font-size: 22px;
              .menuLg;

              &:hover {
                color: var(--hover-text-color);
              }
            }

            .icon-wangzhi {
              font-size: 20px;
            }
          }
        }
      }
    }

    .toggle {
      margin-left: -1px;
      margin-bottom: 5px;
    }

    .to-login {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      font-size: 18px;
      .menuLg;

      .login-btn-large {
        display: flex;
        align-items: center;
        font-size: 16px;
        cursor: pointer;

        &:hover {
          color: var(--hover-text-color);

          .login {
            color: var(--hover-text-color)
          }
        }

        .login {
          font-size: 22px;
          .menuLg;
          margin-right: 10px;
        }
      }

      .toggle-icon {
        display: flex;
        align-items: center;
        margin-left: 1px;
        font-size: 18px;
        cursor: pointer;

        &:hover {
          color: var(--hover-text-color);
        }
      }
    }
  }

  .toggle {
    margin-bottom: 10px;
    .menuLg;

    .icon {
      font-size: 20px;
      cursor: pointer;

      &:hover {
        color: var(--hover-text-color);
      }
    }
  }

  .login-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 38px;
    height: 38px;
    border-radius: 5px;
    .clickNoSelectText();
    .bgLgColor();
    font-size: 14px;
    cursor: pointer;
    color: var(--active);
    box-shadow: 0 0 2px var(--shadow-color) inset;
  }
}

.drop-user-info-list {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--font-1);
  .clickNoSelectText();

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-bottom: 5px;

    .username {
      font-size: 18px;
      font-weight: 700;
      margin-top: 10px;
      text-align: center;
      width: 100%;
      .ellipsisMore(1);
    }
  }

  .drop-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-size: 14px;
    cursor: pointer;
    height: 32px;
    line-height: 32px;

    &:hover {
      background-color: var(--pre-bg-color);
      color: var(--theme-blue);
    }

    .dropdown-text {
      margin-left: 5px;
    }
  }

  .out {
    margin-bottom: 8px;
  }
}
</style>
