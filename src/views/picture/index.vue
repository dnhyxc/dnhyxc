<!--
 * 图片集
 * @author: dnhyxc
 * @since: 2023-07-18
 * index.vue
-->
<template>
  <Loading
    :key="winSize"
    :loading="pictureStore.loading"
    :class="`${checkOS() === 'mac' && 'mac-atlas-wrap'} atlas-wrap`"
  >
    <template #default>
      <div class="atlas-header-wrap">
        <div class="upload-btn">
          <Upload multiple is-atlas :preview="false" :show-img="false" :fixed-number="[800, 320]" :need-cropper="false">
            <div class="upload-text"><i class="iconfont icon-upload" />上传图片</div>
          </Upload>
        </div>
        <div class="delete-wrap">
          <el-checkbox
            :indeterminate="
              selectedImageIds.length && selectedImageIds.length < pictureStore.atlasList.length ? true : false
            "
            :model-value="selectedImageIds.length && pictureStore.atlasList.length === selectedImageIds.length"
            @change="onSelectAll"
          />
          <el-button type="primary" link class="delete-btn select-all" @click="onSelectAll">全选</el-button>
          <el-button type="danger" link :disabled="!selectedImageIds.length" class="delete-btn" @click="onDeleteAll"
            >批量删除</el-button
          >
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
                <div class="header">
                  <div class="title" :title="item.fileName" @click="onSelectImages(item)">
                    <el-checkbox
                      :key="item.id"
                      :model-value="selectedImageIds.includes(item.id)"
                      size="large"
                      @change="onSelectImages(item)"
                    />
                    <span :class="`img-name ${selectedImageIds.includes(item.id) && 'is-checked'}`">
                      {{ item.fileName }}
                    </span>
                  </div>
                  <div class="actions">
                    <el-dropdown placement="bottom-end">
                      <i class="iconfont icon-gengduo3" />
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item @click="onDownload(item)">下载</el-dropdown-item>
                          <el-dropdown-item @click="onRename(item)">更名</el-dropdown-item>
                          <el-dropdown-item @click="onDeleteImage(item)">删除</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
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
        <RenameModal :key="renameVisible" v-model:renameVisible="renameVisible" :img-id="renameId" />
      </el-scrollbar>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useScroller } from '@/hooks';
import { pictureStore } from '@/store';
import { scrollTo, debounce, onDownloadFile, Message, checkOS } from '@/utils';
import { AtlasItemParams } from '@/typings/common';
import { IMG1 } from '@/constant';
import RenameModal from './RenameModal';

const { scrollRef, scrollTop } = useScroller();

let previousWidth: number | null = window.innerWidth;
const winSize = ref<number>(0);
const isMounted = ref<boolean>(false);
const previewVisible = ref<boolean>(false);
const selectImage = ref<AtlasItemParams>();
const selectedImageIds = ref<string[]>([]);
const renameVisible = ref<boolean>(false);
const renameId = ref<string>('');

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

// 选择图片
const onSelectImages = (item: AtlasItemParams) => {
  const findOne = selectedImageIds.value.some((i) => i === item.id);
  if (findOne) {
    selectedImageIds.value = selectedImageIds.value.filter((i) => i !== item.id);
  } else {
    selectedImageIds.value = [item.id, ...selectedImageIds.value];
  }
};

// 选择全部
const onSelectAll = () => {
  if (selectedImageIds.value.length === pictureStore.atlasList.length) {
    selectedImageIds.value = [];
  } else {
    const ids = pictureStore.atlasList.map((i) => i.id);
    selectedImageIds.value = ids;
  }
};

const onRename = (item: AtlasItemParams) => {
  console.log(item, 'item');
  renameId.value = item.id;
  renameVisible.value = true;
};

// 删除
const onDeleteAll = () => {
  Message('', '确定删除所选图片吗？').then(async () => {
    await pictureStore.deleteAtlasImages({ id: selectedImageIds.value });
    selectedImageIds.value = [];
  });
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
  Message('', '确定删除所选图片吗？').then(() => {
    pictureStore.deleteAtlasImages({ id: item.id, url: item.url });
  });
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
  justify-content: center;
  box-sizing: border-box;
  height: calc(100% - 3px);
  padding: 5px 0;
  margin: 3px 4px 0 5px;
  border-radius: 5px;

  .atlas-header-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: calc(100% - 42px);
    height: 45px;
    margin: 4px auto 10px;
    padding: 0 10px;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    border-radius: 5px;

    .upload-btn {
      display: flex;
      align-items: center;
      border-radius: 5px;

      .upload-text {
        color: var(--theme-blue);

        .icon-upload {
          margin-right: 5px;
          font-size: 18px;
        }

        &:hover {
          // border: 1px dashed @blue-1;
          color: @blue-1;
        }
      }
    }

    .delete-wrap {
      display: flex;
      align-items: center;

      .select-all {
        margin-left: 2px;
      }

      .delete-btn {
        font-size: 16px;
      }
    }
  }

  .scrollbar-wrapper {
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--pre-hover-bg);
  }

  :deep {
    .scrollbar-wrapper();
  }

  .img-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
    justify-content: center; /* 水平居中 */
    padding: 0 6px;
    // grid-gap: 1px 0; /* 可以设置相应的间距 */

    .img-item-wrap {
      width: 245px;
      height: 220px;
      padding: 5px;
      border-radius: 5px;
      box-sizing: border-box;
      cursor: pointer;

      .img-item {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        padding: 2px 5px 5px;
        box-sizing: border-box;
        box-shadow: 0 0 5px 0 var(--card-shadow);
        background-image: linear-gradient(to top, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 32px;

          .title {
            position: relative;
            flex: 1;
            display: flex;
            align-items: center;
            color: var(--font-1);
            margin-right: 10px;
            .ellipsisMore(1);

            .img-name {
              position: absolute;
              top: 9px;
              left: 20px;
              width: calc(100% - 15px);
              .ellipsisMore(1);
            }

            .is-checked {
              color: var(--theme-blue);
            }
          }

          .actions {
            display: flex;
            align-items: center;
            height: 100%;
            margin-right: -5px;

            .icon-gengduo3 {
              color: var(--font-1);
              font-size: 20px;
              margin-right: 3px;
              font-weight: 700;
            }

            .del-btn {
              text-align: center;
              color: @font-danger;
              font-size: 20px;
              border-radius: 5px;
              padding: 0 3px;
              cursor: pointer;

              &:first-child {
                margin-right: 5px;
              }

              .icon-shanchu {
                font-size: 20px;
              }
            }

            .download-btn {
              right: 35px;

              .icon-xiazai1 {
                font-size: 18px;
                color: var(--font-1);
              }
            }
          }
        }

        .prew-img {
          display: block;

          :deep {
            .image-item {
              height: calc(202px - 35px);
              border-radius: 5px;
            }
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

.mac-atlas-wrap {
  .img-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(242px, 1fr));
    justify-content: center; /* 水平居中 */
    padding: 0 6px;
    // grid-gap: 1px 0; /* 可以设置相应的间距 */

    .img-item-wrap {
      width: 244px;
    }
  }
}
</style>
