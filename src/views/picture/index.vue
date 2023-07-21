<!--
 * 图片集
 * @author: dnhyxc
 * @since: 2023-07-18
 * index.vue
-->
<template>
  <Loading :key="winSize" :loading="pictureStore.loading" class="atlas-wrap">
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
          <div
            v-if="pictureStore.atlasList.length > 0"
            v-masonry
            transition-duration="0.2s"
            fit-width="true"
            item-selector=".img-item"
            class="img-list"
          >
            <div v-for="(item, index) in pictureStore.atlasList" :key="index" v-masonry-tile class="img-item">
              <div class="download-btn del-btn" @click="onDownload(item)">
                <i class="iconfont icon-xiazai1" />
              </div>
              <div class="del-btn" @click="onDeleteImage(item)">
                <i class="iconfont icon-shanchu" />
              </div>
              <img :src="item.url" alt="http://43.143.27.249:9216" class="img" @click="onPreview(item)" />
            </div>
          </div>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
        </div>
        <div v-if="noMore" class="no-more">没有更多了～～～</div>
        <Empty v-if="!pictureStore.loading && !pictureStore.atlasList?.length" />
        <ImagePreview v-model:previewVisible="previewVisible" :select-image="selectImage" />
      </el-scrollbar>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useScroller } from '@/hooks';
import { pictureStore } from '@/store';
import { scrollTo, debounce, ipcRenderers, url2Base64 } from '@/utils';
import { AtlasItemParams } from '@/typings/common';

const { scrollRef, scrollTop } = useScroller();

let previousWidth: number | null = window.innerWidth;
const winSize = ref<number>(0);
const isMounted = ref<boolean>(false);
const previewVisible = ref<boolean>(false);
const selectImage = ref<AtlasItemParams>();

const noMore = computed(() => {
  const { atlasList, total } = pictureStore;
  return atlasList.length >= total && atlasList.length;
});
const disabled = computed(() => pictureStore.loading || noMore.value);

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
  await pictureStore.getAtlasList();
};

// 下载
const onDownload = async (item: AtlasItemParams) => {
  const url = await url2Base64(item.url, item.type);
  if (url) {
    ipcRenderers.sendDownload(url as string);
    // 设置一次性监听，防止重复触发
    ipcRenderer.once('download-file', (e, res: string) => {
      if (res) {
        ElMessage({
          message: '下载成功',
          type: 'success',
          offset: 80,
          duration: 2000,
        });
      }
    });
  }
};

// 预览图片
const onPreview = (item: AtlasItemParams) => {
  previewVisible.value = true;
  selectImage.value = item;
};

// 删除图片
const onDeleteImage = (item: AtlasItemParams) => {
  pictureStore.deleteAtlasImages({ id: item.id, url: item.url });
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

    .el-dialog__body {
      padding: 10px 20px 20px !important;
    }
  }

  .img-list {
    margin: 0 auto;
    width: 100%;

    .img-item {
      position: relative;
      width: 100%;
      max-width: 180px;
      margin: 0.2em;
      border-radius: 5px;
      cursor: pointer;

      &:hover {
        .del-btn {
          display: block;
        }
      }

      .del-btn {
        display: inline-block;
        backdrop-filter: blur(10px);
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

      .download-btn {
        right: 35px;

        .icon-xiazai1 {
          font-size: 17px;
          color: var(--font-1);
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
