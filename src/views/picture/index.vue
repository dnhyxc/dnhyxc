<!--
 * 图片集
 * @author: dnhyxc
 * @since: 2023-07-18
 * index.vue
-->
<template>
  <Loading :key="winSize" :loading="pictureStore.loading" class="atlas-wrap">
    <template #default>
      <div class="upload-wrap">
        <div class="upload-btn">
          <Upload multiple is-atlas :preview="false" :show-img="false" :fixed-number="[800, 320]" :need-cropper="false">
            <div class="upload-text">上传图片</div>
          </Upload>
        </div>
      </div>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
          v-if="isMounted"
          v-infinite-scroll="onFetchData"
          :infinite-scroll-delay="300"
          :infinite-scroll-disabled="disabled"
          :infinite-scroll-distance="2"
          class="pullup-content"
        >
          <div v-if="pictureStore.atlasList.length > 0" class="img-list">
            <div v-for="(item, index) in pictureStore.atlasList" :key="index" class="img-item-wrap">
              <div class="img-item">
                <div class="download-btn del-btn" @click="onDownload(item)">
                  <i class="iconfont icon-xiazai1" />
                </div>
                <div class="del-btn" @click="onDeleteImage(item)">
                  <i class="iconfont icon-shanchu" />
                </div>
                <Image
                  :url="item.url || IMG1"
                  :transition-img="IMG1"
                  class="prew-img"
                  :on-click="() => onPreview(item)"
                />
              </div>
            </div>
          </div>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
        </div>
        <div v-if="noMore" class="no-more">没有更多了～～～</div>
        <Empty v-if="showEmpty" />
        <ImagePreview v-model:previewVisible="previewVisible" :select-image="selectImage" show-prev-and-next />
      </el-scrollbar>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useScroller } from '@/hooks';
import { pictureStore } from '@/store';
import { scrollTo, debounce, onDownloadFile } from '@/utils';
import { AtlasItemParams } from '@/typings/common';
import { IMG1 } from '@/constant';

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
const showEmpty = computed(
  () => pictureStore.loading !== null && !pictureStore.loading && !pictureStore.atlasList?.length,
);

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
  onDownloadFile(item);
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
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: calc(100% - 3px);
  padding: 5px 0;
  margin: 3px 4px 0 5px;
  border-radius: 5px;

  .upload-wrap {
    padding: 5px 10px 0;
    margin-bottom: 10px;

    .upload-btn {
      display: flex;
      align-items: center;
      height: 50px;
      border: 1px dashed var(--theme-blue);
      border-radius: 5px;

      .upload-text {
        color: var(--font-1);
      }

      &:hover {
        border: 1px dashed @blue-1;
      }
    }
  }

  .scrollbar-wrapper {
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--pre-hover-bg);
  }

  :deep {
    .scrollbar-wrapper();

    .el-dialog__body {
      padding: 10px 20px 20px !important;
    }
  }

  .img-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;

    .img-item-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 245px;
      height: 245px;
      padding: 5px;
      border-radius: 5px;
      box-sizing: border-box;
      cursor: pointer;

      .img-item {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        padding: 5px;
        box-sizing: border-box;
        box-shadow: 0 0 5px 0 var(--card-shadow);

        .prew-img {
          display: block;

          :deep {
            .image-item {
              max-height: 226px;
              border-radius: 5px;
            }
          }
        }

        &:hover {
          .del-btn {
            display: block;
          }
        }

        .del-btn {
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
  }

  .no-more {
    text-align: center;
    padding-top: 15px;
    padding-bottom: 15px;
    color: var(--font-4);
  }
}
</style>
