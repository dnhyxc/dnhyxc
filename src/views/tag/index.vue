<!--
 * 文章标签
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="tag-wrap">
    <WordCloud :data="tagStore.tags" class="word-cloud-wrap" :callback="onCheckTag" :loading="tagStore.loading" />
    <div class="tag-list">
      <div class="title">
        <span>文章标签列表</span>
        <i
          :class="`font iconfont ${scrollTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
          @click="onScrollTo"
        />
      </div>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div v-for="i in tagStore.tags" :key="i.name" class="tag" @click="onCheckTag(i.name)">
          {{ i.name }}
          <span class="count">({{ i.value }} 篇)</span>
        </div>
      </el-scrollbar>
    </div>
  </div>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { scrollTo } from '@/utils';
import { useScroller } from '@/hooks';
import { tagStore } from '@/store';
import WordCloud from '@/components/WordCloud/index.vue';

const router = useRouter();
const { scrollRef, scrollTop } = useScroller();

onMounted(async () => {
  // 获取标签信息
  tagStore.getTags();
});

onUnmounted(() => {
  tagStore.tags = [];
});

// 滚动到某位置
const onScrollTo = () => {
  const bottom = scrollRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  scrollTo(scrollRef, scrollTop.value > 0 ? 0 : bottom);
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
  width: 100%;
  height: 100%;
  border-radius: 5px;

  .word-cloud-wrap {
    box-sizing: border-box;
    flex: 1;
    box-shadow: @shadow-mack;
    border-radius: 5px;
  }

  .tag-list {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    margin-left: 10px;
    padding: 10px 0;
    width: 220px;
    box-shadow: @shadow-mack;
    border-radius: 5px;

    :deep {
      .scrollbar-wrapper {
        flex: 1;
      }
    }

    .title {
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      color: @active;
      border-bottom: 1px solid @card-border;
      margin-left: 13px;
      margin-right: 13px;
      margin-bottom: 6px;
      padding-bottom: 9px;
      border-radius: 5px;
      .textLg();

      .font {
        font-size: 18px;
        cursor: pointer;
      }
    }

    .tag {
      position: relative;
      margin-right: 13px;
      padding: 8px 0 8px 13px;
      cursor: pointer;
      color: @font-1;
      .ellipsisMore(1);

      &:hover {
        color: @active;
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
          background-color: @active;
        }
        .count {
          color: @active;
        }
      }
    }

    .count {
      margin-left: 5px;
      font-size: 14px;
      color: @font-3;
    }
  }
}
</style>
