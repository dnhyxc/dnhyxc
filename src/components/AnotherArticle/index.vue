<!--
 * 上下篇文章切换组件
 * @author: dnhyxc
 * @since: 2023-03-01
 * index.vue
-->
<template>
  <div
    v-if="articleStore.anotherArticleList[0]?.id || articleStore.anotherArticleList[1]?.id"
    class="another-article-wrap"
  >
    <div v-for="(i, index) in articleStore.anotherArticleList" :key="i.id || index" class="list">
      <div v-show="i?.id" class="article" @click="toDetail(i?.id)">
        <div class="item">
          <div class="prev">
            <span class="left">
              {{ index === 0 ? '上一篇' : '下一篇' }}
            </span>
            <span class="right">
              <i v-if="index === 0 && i?.id" class="font-top iconfont icon-shuangjiantouzuo" />
              <i v-if="index > 0 && i?.id" class="font iconfont icon-shuangjiantouyou" />
            </span>
          </div>
          <div class="header">
            <span class="title">{{ i?.title }}</span>
            <span class="date">{{ formatGapTime(i?.createTime!) }}</span>
          </div>
          <div class="tag-list">
            <span class="classify" @click.stop="onJump(i?.classify!, 'classify')">分类：{{ i?.classify }}</span>
            <span class="tag" @click.stop="onJump(i?.tag!, 'tag')">标签：{{ i?.tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { articleStore } from '@/store';
import { formatGapTime } from '@/utils';

const reload = inject<Function>('reload');

interface IProps {
  id: string;
}

const router = useRouter();

const props = defineProps<IProps>();

onMounted(() => {
  articleStore.getAnotherArticles({ id: props.id });
});

// 跳转详情
const toDetail = (id: string) => {
  router.push(`/detail/${id}`);
  setTimeout(() => {
    reload && reload();
  }, 100);
};

// 去分类或者标签列表
const onJump = (name: string, type: string) => {
  if (type === 'tag') {
    router.push(`/tag/list?tag=${name}`);
  } else {
    router.push(`/classify?classify=${name}`);
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.another-article-wrap {
  .list {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    border-radius: 5px;

    .article {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      width: 100%;
      margin-bottom: 10px;
      border-radius: 5px;
      box-shadow: @shadow-mack;

      &:hover {
        background-image: @card-lg-2;
      }

      &:last-child {
        padding: 10px;
      }

      .item {
        flex: 1;
        margin-right: 10px;
        cursor: pointer;

        .prev {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          color: @font-4;

          .right {
            transform: rotate(90deg);
          }
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .title {
            flex: 0.7;
            .ellipsisMore(1);
          }

          .date {
            flex: 0.3;
            .ellipsisMore(1);
            text-align: right;
          }
        }

        .tag-list {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 5px;
          font-size: 14px;
          color: @theme-blue;

          .classify,
          .tag {
            flex: 1;
            .ellipsisMore(1);

            &:hover {
              color: @active;
            }
          }

          .tag {
            text-align: right;
          }
        }
      }
    }

    &:last-child {
      .article {
        margin-bottom: 0;
      }
    }
  }
}
</style>
