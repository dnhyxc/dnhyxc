<!--
 * 时间轴
 * @author: dnhyxc
 * @since: 2023-02-15
 * index.vue
-->
<template>
  <div class="timeline">
    <div v-for="item in dataSource" v-show="item.articles?.length" :key="item.date" class="timeline-item">
      <div class="year">{{ item.date || '-' }}</div>
      <div class="card">
        <div v-for="card in item.articles" :key="card.id" class="card-item" @click.stop="onClickCard(card.id!)">
          <i v-if="card.isTop" class="font iconfont icon-star" />
          <div class="date">{{ formatDate(card.createTime!) || '-' }}</div>
          <LineCard :data="card" :delete-article="deleteArticle" :like-list-article="likeListArticle" is-time-line />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { formatDate } from '@/utils';
import { TimelineResult } from '@/typings/common';
import LineCard from '@/components/LineCard/index.vue';

const router = useRouter();

interface IProps {
  dataSource: TimelineResult[];
  deleteArticle?: (id: string) => void;
  likeListArticle?: (id: string) => void;
}

withDefaults(defineProps<IProps>(), {
  dataSource: () => [],
  deleteArticle: () => {},
  likeListArticle: () => {},
});

const onClickCard = (id: string) => {
  router.push(`/detail/${id}`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.timeline {
  position: relative;
  padding: 5px 0 0;

  .timeline-item {
    box-sizing: border-box;
    position: relative;
    width: 50%;

    .card {
      box-shadow: 0 0 8px 0 var(--shadow-mack);
      border-radius: 5px;
      padding: 10px;

      .card-item {
        position: relative;
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
          color: var(--font-1);
        }

        .icon-star {
          position: absolute;
          top: -2px;
          right: -2px;
          font-size: 45px;
          z-index: 99;
          .textLg();
        }
      }
    }

    &:nth-child(odd) {
      padding: 0 35px 30px 5px;

      &::after {
        position: absolute;
        top: 20px;
        left: 100%;
        content: '';
        width: 0;
        height: 100%;
        border-left: 1px solid var(--card-border);
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
        background-image: linear-gradient(120deg, var(--card-lg-color1) 0%, var(--card-lg-color2) 100%);
        z-index: 1;
      }

      .card {
        position: relative;

        .card-item {
          background-image: linear-gradient(225deg, var(--timeline-lg-color1) 0%, var(--timeline-lg-color2) 100%);
        }

        &::before {
          position: absolute;
          top: 15px;
          right: -13px;
          content: '';
          width: 0;
          height: 0;
          border-left: 12px solid var(--card-border);
          border-top: 12px solid transparent;
          border-bottom: 12px solid transparent;
        }
      }

      .year {
        position: absolute;
        top: 4px;
        right: -108px;
        font-size: 35px;
        font-weight: 700;
        color: var(--font-1);
      }
    }

    &:nth-child(even) {
      padding: 0 5px 30px 35px;
      margin-left: 50%;

      &::before {
        position: absolute;
        top: 20px;
        left: -7px;
        content: '';
        width: 15px;
        height: 15px;
        border-radius: 15px;
        background-image: linear-gradient(120deg, var(--card-lg-color1) 0%, var(--card-lg-color2) 100%);
        z-index: 1;
      }

      &::after {
        position: absolute;
        top: 20px;
        left: 0;
        content: '';
        width: 0;
        height: 100%;
        border-left: 2px solid var(--card-border);
      }

      &:last-child {
        &::after {
          content: none;
        }
      }

      .card {
        position: relative;

        .card-item {
          background-image: linear-gradient(-225deg, var(--timeline-lg-color1) 0%, var(--timeline-lg-color2) 100%);
        }

        &::before {
          position: absolute;
          top: 15px;
          left: -13px;
          content: '';
          width: 0;
          height: 0;
          border-right: 12px solid var(--card-border);
          border-top: 12px solid transparent;
          border-bottom: 12px solid transparent;
        }
      }

      .year {
        position: absolute;
        top: 4px;
        left: -108px;
        font-size: 35px;
        font-weight: 700;
        color: var(--font-1);
      }
    }

    &:nth-child(odd) {
      &:last-child {
        padding: 0 35px 0 5px;
      }
    }

    &:nth-child(even) {
      &:last-child {
        padding: 0 5px 0 35px;
      }
    }
  }
}
</style>
