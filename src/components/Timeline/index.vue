<!--
 * 时间轴
 * @author: dnhyxc
 * @since: 2023-02-15
 * index.vue
-->
<template>
  <div class="timeline">
    <div v-for="item in dataSource" :key="item.date" class="timeline-item">
      <div class="year">{{ item.date }}</div>
      <div class="card">
        <div v-for="card in item.articles" :key="card.id" class="card-item" @click="(e) => onClickCard(e, card.id)">
          <div class="date">{{ formatDate(card.createTime!) }}</div>
          <LineCard :data="card" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils';
import { TimelineResult } from '@/typings/common';
import LineCard from '@/components/LineCard/index.vue';

interface IProps {
  dataSource: TimelineResult[];
}

const props = withDefaults(defineProps<IProps>(), {
  dataSource: () => [],
});

console.log(props, 'props');

const onClickCard = (e: Event, item: any) => {
  e.stopPropagation();
  console.log(item, 'item');
};
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
        padding: 10px;
        cursor: pointer;

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
      padding: 0 50px 30px 20px;

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

        .card-item {
          background-image: @card-odd-lg;
        }

        &::before {
          position: absolute;
          top: 15px;
          right: -13px;
          content: '';
          width: 0;
          height: 0;
          border-left: 12px solid @blue-1;
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
      padding: 0 20px 30px 50px;
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

        .card-item {
          background-image: @card-lg;
        }

        &::before {
          position: absolute;
          top: 15px;
          left: -13px;
          content: '';
          width: 0;
          height: 0;
          border-right: 12px solid @pink-1;
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
