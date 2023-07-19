<!--
 * 图片集
 * @author: dnhyxc
 * @since: 2023-07-18
 * index.vue
-->
<template>
  <Loading :key="winSize" :loading="false" class="atlas-wrap">
    <template #default>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
          v-if="isMounted"
          v-infinite-scroll="onFetchData"
          :infinite-scroll-delay="300"
          :infinite-scroll-disabled="disabled"
          :infinite-scroll-distance="2"
          class="pullup-content"
        >
          <div v-masonry transition-duration="0.2s" fit-width="true" item-selector=".img-item" class="img-list">
            <div v-for="(item, index) in atlasStore.atlasList" :key="index" v-masonry-tile class="img-item">
              <div class="del-btn" @click="onDeleteImage(item)">
                <i class="iconfont icon-shanchu" />
              </div>
              <img :src="item.url" alt="http://43.143.27.249:9216" class="img" />
            </div>
          </div>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
        </div>
        <div v-if="noMore" class="no-more">没有更多了～～～</div>
        <Empty v-if="!atlasStore.loading && !atlasStore.atlasList?.length" />
      </el-scrollbar>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useScroller } from '@/hooks';
import { atlasStore } from '@/store';
import { scrollTo, debounce } from '@/utils';
import { AtlasItemParams } from '@/typings/common';

const { scrollRef, scrollTop } = useScroller();

let previousWidth: number | null = window.innerWidth;
const winSize = ref<number>(0);
const isMounted = ref<boolean>(false);

const noMore = computed(() => {
  const { atlasList, total } = atlasStore;
  return atlasList.length >= total && atlasList.length;
});
const disabled = computed(() => atlasStore.loading || noMore.value);

const onResize = () => {
  if (previousWidth! > window.innerWidth) {
    winSize.value = window.innerWidth;
  }
  previousWidth = window.innerWidth;
};

onMounted(() => {
  isMounted.value = true;
  onFetchData();
  window.addEventListener('resize', debounce(onResize, 300));
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  previousWidth = null;
});

// 请求数据
const onFetchData = async () => {
  await atlasStore.getAtlasList();
};

// 删除图片
const onDeleteImage = (item: AtlasItemParams) => {
  atlasStore.deleteAtlasImages({ id: item.id, url: item.url });
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.atlas-wrap {
  box-sizing: border-box;
  height: 100%;
  box-shadow: 0 0 8px 0 var(--shadow-mack);
  background-color: var(--pre-hover-bg);
  padding: 5px 0;
  margin-left: 5px;
  margin-right: 4px;

  :deep {
    .scrollbar-wrapper();
  }

  .img-list {
    margin: 0 auto;
    width: 100%;

    .img-item {
      position: relative;
      width: 100%;
      max-width: 180px;
      margin: 0.2em;
      box-shadow: 0px 2px 10px 1px rgba(0, 0, 0, 0.1);
      border-radius: 5px;

      &:hover {
        .del-btn {
          display: block;
        }
      }

      .del-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        text-align: center;
        color: @font-danger;
        font-size: 18px;
        background-color: var(--to-top-bg-color);
        box-shadow: 0 0 3px var(--theme-blue);
        border-radius: 5px;
        padding: 0 3px;
        cursor: pointer;
        display: none;

        .icon-shanchu {
          font-size: 18px;
        }
      }

      .img {
        width: 100%;
        display: block;
        border-radius: 5px;
      }
    }
  }

  .no-more {
    text-align: center;
    padding-top: 15px;
    padding-bottom: 15px;
    color: var(--font-4);
  }
}
</style>
