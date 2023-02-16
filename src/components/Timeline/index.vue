<!--
 * 时间轴
 * @author: dnhyxc
 * @since: 2023-02-15
 * index.vue
-->
<template>
  <div class="timeline">
    <div class="timeline-item">
      <div class="card">
        <div class="card-item">
          <div class="date">2023-02-09</div>
          <Card />
        </div>
        <div class="card-item">
          <div class="date">2023-02-10</div>
          <div class="timeline-card">
            <div class="title">title</div>
            <div class="desc">desc</div>
            <div class="tags">
              <div class="author">作者</div>
              <div class="classify">分类</div>
              <div class="tag">标签</div>
            </div>
            <div class="action">
              <div class="like">点赞</div>
              <div class="comment">评论</div>
              <div class="read-count">阅读数</div>
            </div>
          </div>
        </div>
      </div>
      <div class="year">2023</div>
    </div>
    <div class="timeline-item">
      <div class="card">
        <div class="card-item">
          <div class="date">2023-02-10</div>
          <Card />
        </div>
      </div>
      <div class="year">2022</div>
    </div>
    <div class="timeline-item">
      <div class="card">
        <div class="card-item">
          <div class="date">2023-02-10</div>
          <Card />
        </div>
      </div>
      <div class="year">2021</div>
    </div>
    <div class="timeline-item">
      <div class="card">
        <div class="card-item">
          <div class="date">2023-02-10</div>
          <Card />
        </div>
      </div>
      <div class="year">2020</div>
    </div>
    <div class="timeline-item">
      <div class="card">
        <div class="card-item">
          <div class="date">2023-02-10</div>
          <Card />
        </div>
        <div class="card-item">
          <div class="date">2023-02-10</div>
          <Card />
        </div>
      </div>
      <div class="year">2019</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/Card/index.vue';
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.timeline {
  position: relative;
  padding: 20px 0;

  .timeline-item {
    box-sizing: border-box;
    position: relative;
    width: 50%;

    .card {
      box-shadow: @shadow-mack;
      border-radius: 5px;
      padding: 10px;

      .card-item {
        margin-bottom: 10px;
        border-radius: 5px;
        background-image: @card-lg;
        padding: 10px;

        &:last-child {
          margin-bottom: 0;
        }

        .date {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 10px;
        }
      }
    }

    &:nth-child(odd) {
      padding: 0 50px 50px 20px;

      &::after {
        position: absolute;
        top: 20px;
        left: 100%;
        content: '';
        width: 0;
        height: 100%;
        border-left: 2px solid @card-border;
      }

      &:last-child {
        &::after {
          content: none;
        }
      }

      &::before {
        position: absolute;
        top: 20px;
        right: -8px;
        content: '';
        width: 15px;
        height: 15px;
        border-radius: 15px;
        background-image: @card-lg;
        z-index: 1;
      }

      .card {
        position: relative;

        &::before {
          position: absolute;
          top: 15px;
          right: -12px;
          content: '';
          width: 0;
          height: 0;
          border-left: 12px solid @shadow-color;
          border-top: 12px solid transparent;
          border-bottom: 12px solid transparent;
        }
      }

      .year {
        position: absolute;
        top: 16px;
        right: -95px;
        font-size: 25px;
        font-weight: 700;
      }
    }

    &:nth-child(even) {
      padding: 0 20px 50px 50px;
      margin-left: 50%;

      &::before {
        position: absolute;
        top: 20px;
        left: -7px;
        content: '';
        width: 15px;
        height: 15px;
        border-radius: 15px;
        background-image: @card-lg;
        z-index: 1;
      }

      &::after {
        position: absolute;
        top: 20px;
        left: 0;
        content: '';
        width: 0;
        height: 100%;
        border-left: 2px solid @card-border;
      }

      &:last-child {
        &::after {
          content: none;
        }
      }

      .card {
        position: relative;

        &::before {
          position: absolute;
          top: 15px;
          left: -12px;
          content: '';
          width: 0;
          height: 0;
          border-right: 12px solid @shadow-color;
          border-top: 12px solid transparent;
          border-bottom: 12px solid transparent;
        }
      }

      .year {
        position: absolute;
        top: 16px;
        left: -95px;
        font-size: 25px;
        font-weight: 700;
      }
    }
  }
}
</style>
