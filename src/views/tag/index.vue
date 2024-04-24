<!--
 * 文章标签
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <Loading :loading="tagStore.loading" class="tag-wrap">
    <div class="cloud-content">
      <WordCloud :data="tagStore.tags" class="word-cloud-wrap" :callback="onCheckTag" :loading="tagStore.loading" />
    </div>
    <div class="tag-list">
      <div class="title">
        <span>文章标签列表</span>
        <i
          :class="`font iconfont ${scrollChildTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
          @click="onScrollTo"
        />
      </div>
      <el-scrollbar ref="scrollChildRef" wrap-class="scrollbar-wrapper">
        <div v-for="i in tagStore.tags" :key="i.name" class="tag" @click="onCheckTag(i.name)">
          {{ i.name }}
          <span class="count">({{ i.value }} 篇)</span>
        </div>
      </el-scrollbar>
    </div>
  </Loading>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { scrollTo } from '@/utils';
import { useChildScroller } from '@/hooks';
import { tagStore } from '@/store';
import AsyncLoading from '@/components/AsyncLoading/index.vue';
const WordCloud = defineAsyncComponent({
  loader: () => import('@/components/WordCloud/index.vue'),
  loadingComponent: AsyncLoading,
});

const router = useRouter();
const { scrollChildRef, scrollChildTop } = useChildScroller();

onMounted(() => {
  // 获取标签信息
  tagStore.getTags();
});

onUnmounted(() => {
  tagStore.tags = [];
});

// 滚动到某位置
const onScrollTo = () => {
  const bottom = scrollChildRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  scrollTo(scrollChildRef, scrollChildTop.value > 0 ? 0 : bottom);
};

// 选中标签
const onCheckTag = (tag: string) => {
  // 保存当前选中标签
  tagStore.currentTag = tag;
  router.push(`/tag/list?tag=${tag}`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.tag-wrap {
  display: flex;
  justify-content: flex-start;
  box-sizing: border-box;
  margin: 0 5px;
  height: 100%;
  // height: calc(100% - 4px);
  border-radius: 5px;

  .cloud-content {
    flex: 1;
    border-radius: 5px;

    .word-cloud-wrap {
      width: 100%;
      height: calc(100% - 8px);
      box-sizing: border-box;
      margin-top: 8px;
      box-shadow: 0 0 5px 0 var(--card-shadow);
      border-radius: 5px;
      background-color: var(--pre-hover-bg);
    }
  }

  .tag-list {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    margin-left: 10px;
    padding: 8px 0 10px;
    margin-top: 8px;
    width: 220px;
    height: calc(100% - 8px);
    box-shadow: 0 0 5px 0 var(--card-shadow);
    border-radius: 5px;
    background-color: var(--pre-hover-bg);

    :deep {
      .scrollbar-wrapper {
        flex: 1;
      }
    }

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      color: var(--active-color);
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 6px;
      padding: 0 13px 9px;
      color: var(--font-1);

      .font {
        font-size: 18px;
        cursor: pointer;

        &:hover {
          color: var(--active-color);
        }
      }
    }

    .tag {
      position: relative;
      margin-right: 13px;
      padding: 2px 0 2px 13px;
      height: 35px;
      line-height: 35px;
      cursor: pointer;
      color: var(--font-1);
      .ellipsisMore(1);

      &:hover {
        color: var(--active-color);
        &::before {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          content: '';
          width: 4px;
          height: 50%;
          border-top-right-radius: 5px;
          border-bottom-right-radius: 5px;
          background-color: var(--active-color);
        }
        .count {
          color: var(--active-color);
        }
      }
    }

    .count {
      margin-left: 5px;
      font-size: 14px;
      color: var(--font-3);
    }
  }
}
</style>
