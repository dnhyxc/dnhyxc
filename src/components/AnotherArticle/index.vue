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
    <div
      v-for="(i, index) in articleStore.anotherArticleList"
      :key="i.id || index"
      :class="`${index > 0 ? 'next-article' : 'prev-article'}`"
      @click="toDetail(i?.id)"
    >
      <div v-if="index === 0 && i?.id" class="icon">
        <i class="font iconfont icon-arrow-left-bold" />
      </div>
      <div v-if="i?.id" class="item">
        <div class="title">{{ i?.title }}</div>
        <div class="abstract">{{ i?.abstract }}</div>
        <div class="info">
          <span :title="i?.authorName">
            {{ i?.authorName!.length > 20 ? `${i?.authorName?.slice(0, 19)}...` : i?.authorName }}
          </span>
          <span>{{ ` · ${i?.tag} · ` }}</span>
          <span>{{ `${i?.classify} · ` }}</span>
          <span>{{ formatGapTime(i?.createTime!) }}</span>
        </div>
      </div>
      <div v-if="index > 0 && i?.id" class="icon">
        <i class="font iconfont icon-arrow-right-bold" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { articleStore } from '@/store';
import { formatGapTime } from '@/utils';

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
  console.log(id, 'id');

  router.push(`/detail/${id}`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.articleItem() {
  width: 49%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;

  .title {
    font-size: 16px;
    font-weight: 600;
    .ellipsisMore(1);
  }

  .abstract,
  .info {
    width: 100%;
    .ellipsisMore(1);
  }
}

.another-article-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: @fff;
  margin-bottom: 10px;
  border-radius: 5px;
  padding: 10px 16px;

  .prev-article {
    .articleItem();

    .item {
      width: 90%;

      .title,
      .abstract,
      .info {
        text-align: left;
      }
    }

    .icon {
      margin-right: 10px;
    }
  }

  .next-article {
    .articleItem();
    justify-content: flex-end;

    .item {
      width: 90%;

      .title,
      .abstract,
      .info {
        text-align: right;
      }
    }

    .icon {
      text-align: right;
      margin-left: 10px;
    }
  }
}
</style>
