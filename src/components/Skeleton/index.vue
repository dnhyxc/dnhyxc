<!--
 * 骨架屏
 * @author: dnhyxc
 * @since: 2023-06-27
 * index.vue
-->
<template>
  <div class="skeleton-wrap">
    <div class="header">
      <div class="title">
        <div class="page-icon"></div>
        <div class="page-name"></div>
      </div>
      <div class="header-action">
        <div class="actions"></div>
      </div>
    </div>
    <div class="content">
      <div class="left-menu">
        <div class="menus">
          <div v-for="n in 4" :key="n" class="icon"></div>
        </div>
        <div class="avatar-wrap">
          <div class="avatar"></div>
        </div>
      </div>
      <div class="right">
        <div class="carousel">
          <div class="carousel-item"></div>
        </div>
        <div class="card-list">
          <div v-for="i in 8" :key="i" class="card">
            <div class="card-item"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

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
    padding: 0 20px 0 10px;
    height: 55px;
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
        .bgKeyframes(bgmove);
        border-radius: 5px;
        margin-top: 15px;
      }

      .page-name {
        height: 25px;
        width: 200px;
        margin-left: 15px;
        border-radius: 5px;
        .bgMoveColor(135deg);
        .bgKeyframes(bgmove);
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
        .bgKeyframes(bgmove);
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
      padding-bottom: 20px;

      .menus {
        flex: 1;
        padding-left: 5px;

        .icon {
          height: 35px;
          width: 35px;
          margin-bottom: 25px;
          border-radius: 5px;
          .bgMoveColor(135deg);
          .bgKeyframes(bgmove);
        }
      }

      .avatar-wrap {
        padding-left: 5px;

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 5px;
          .bgMoveColor(135deg);
          .bgKeyframes(bgmove);
        }
      }
    }

    .right {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding-right: 15px;
      padding-bottom: 15px;

      .carousel {
        padding: 0 5px;

        .carousel-item {
          height: 200px;
          width: 100%;
          border-radius: 5px;
          margin-bottom: 15px;
          .bgMoveColor(135deg);
          .bgKeyframes(bgmove);
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
            .bgKeyframes(bgmove);
          }
        }
      }
    }
  }
}
</style>
