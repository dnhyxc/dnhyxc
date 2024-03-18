<!--
 * 骨架屏
 * @author: dnhyxc
 * @since: 2023-06-27
 * index.vue
-->
<template>
  <div :class="`${checkOS() === 'mac' && 'mac-skeleton-wrap'} skeleton-wrap`">
    <div :class="`${showType && 'article-header'} header`">
      <div class="title">
        <div class="page-icon" />
        <div class="page-name" />
      </div>
      <div class="header-action">
        <div class="actions" />
      </div>
    </div>
    <div v-if="showType" class="content-wrap">
      <div :class="`${checkOS() === 'mac' && 'mac-content'} content`" />
      <div :class="`${checkOS() === 'mac' && 'mac-right'} right`">
        <div class="action-list" />
        <div class="toc-list" />
        <div class="another-list" />
        <div class="another-list" />
      </div>
    </div>
    <div v-else class="content">
      <div class="left-menu">
        <div class="menus">
          <div v-for="n in 4" :key="n" class="icon" />
        </div>
        <div class="avatar-wrap">
          <div class="avatar" />
        </div>
      </div>
      <div class="right">
        <div class="carousel">
          <div class="carousel-item" />
        </div>
        <div class="card-list">
          <div v-for="i in 8" :key="i" class="card">
            <div class="card-item" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { checkOS } from '@/utils';
import { computed } from 'vue';

const showType = computed(() => {
  return location.pathname.includes('/article') || location.pathname.includes('/compile');
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.skeleton-wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  background-color: var(--background);

  .header {
    display: flex;
    justify-content: space-between;
    padding: 0 27px 0 10px;
    height: 60px;
    box-sizing: border-box;
    -webkit-app-region: drag;
    cursor: pointer;

    .title {
      display: flex;
      align-items: center;

      .page-icon {
        width: 40px;
        height: 40px;
        .bgMoveColor(135deg);
        border-radius: 5px;
        margin-top: 15px;
        margin-left: 3px;
      }

      .page-name {
        height: 25px;
        width: 200px;
        margin-left: 12px;
        border-radius: 5px;
        .bgMoveColor(135deg);
      }
    }

    .header-action {
      display: flex;
      align-items: center;
      .actions {
        height: 25px;
        width: 200px;
        margin-left: 20px;
        border-radius: 5px;
        .bgMoveColor(135deg);
      }
    }
  }

  .article-header {
    padding: 0 20px 0 15px;
    height: 50px;

    .title {
      .page-icon {
        width: 35px;
        height: 35px;
        margin-top: 10px;
      }

      .page-name {
        width: 90px;
        margin-top: 10px;
      }
    }

    .header-action {
      .actions {
        width: 108px;
        margin-top: 10px;
      }
    }
  }

  .content {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    box-sizing: border-box;

    .left-menu {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      width: 60px;
      padding-top: 40px;
      padding-bottom: 25px;

      .menus {
        flex: 1;
        padding-left: 5px;

        .icon {
          height: 35px;
          width: 35px;
          margin-bottom: 25px;
          border-radius: 5px;
          .bgMoveColor(135deg);
        }
      }

      .avatar-wrap {
        padding-left: 5px;

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 5px;
          .bgMoveColor(135deg);
        }
      }
    }

    .right {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding-right: 22px;
      padding-bottom: 20px;

      .carousel {
        padding: 0 5px;

        .carousel-item {
          height: 200px;
          width: 100%;
          border-radius: 5px;
          margin-bottom: 15px;
          .bgMoveColor(135deg);
        }
      }

      .card-list {
        display: flex;
        flex-wrap: wrap;
        flex: 1;
        border-radius: 5px;

        .card {
          padding: 5px;
          width: 25%;
          box-sizing: border-box;

          .card-item {
            width: 100%;
            height: 100%;
            border-radius: 5px;
            .bgMoveColor(135deg);
          }
        }
      }
    }
  }

  .content-wrap {
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    padding: 0 20px 0 18px;
    height: 100%;
    margin-top: 10px;

    .content {
      position: relative;
      flex: 1;
      display: flex;
      justify-content: center;
      box-sizing: border-box;
      margin-right: 10px;
      height: calc(100vh - 89px);
      border-radius: 5px;
      box-shadow: 0 0 8px 0 var(--shadow-mack);
      .bgMoveColor(135deg);
    }

    .mac-content {
      height: calc(100vh - 108px);
    }

    .right {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      max-width: 260px;
      width: 30%;
      box-sizing: border-box;
      border-radius: 5px;
      max-height: calc(100vh - 89px);

      .action-list {
        height: 50px;
        box-shadow: 0 0 8px 0 var(--shadow-mack);
        margin-bottom: 10px;
        border-radius: 5px;
        .bgMoveColor(135deg);
      }

      .toc-list {
        box-sizing: border-box;
        flex: 1;
        background-color: var(--pre-hover-bg);
        box-shadow: 0 0 8px 0 var(--shadow-mack);
        border-radius: 5px;
        .bgMoveColor(135deg);
      }

      .another-list {
        height: 95px;
        box-shadow: 0 0 8px 0 var(--shadow-mack);
        margin-top: 10px;
        border-radius: 5px;
        .bgMoveColor(135deg);
      }

      & > :last-child {
        margin-bottom: 0;
      }
    }

    .mac-right {
      max-height: calc(100vh - 108px);
    }
  }
}

.mac-skeleton-wrap {
  .header {
    padding: 30px 27px 0 10px;
    margin-bottom: 20px;
  }

  .content {
    .left-menu {
      padding-bottom: 26px;
    }
    .right {
      padding-right: 22px;
      padding-bottom: 21px;
    }
  }
}
</style>
