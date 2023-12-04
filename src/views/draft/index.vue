<!--
 * 草稿预览
 * @author: dnhyxc
 * @since: 2023-12-04
 * index.vue
-->
<template>
  <Loading :loading="false" :class="`${checkOS() === 'mac' && 'mac-draft-detail-wrap'} draft-detail-wrap`">
    <div :class="`${commonStore?.tocTitles?.length === 0 && 'no-rm-content'} content`">
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div ref="articleInfoRef" class="article-info">
          <div class="title-wrap">
            <div class="title">{{ createStore.draftInfo.title }}</div>
            <div class="user-info">
              <Image
                :url="createStore.draftInfo?.headUrl || HEAD_IMG"
                :transition-img="HEAD_IMG"
                :on-click="() => toPersonal(createStore.draftInfo?.authorId)"
                class="herd-img"
              />
              <div class="create-info">
                <div class="username" @click="() => toPersonal(createStore.draftInfo?.authorId)">
                  {{ createStore.draftInfo?.authorName }}
                </div>
                <div>
                  {{ formatDate(createStore.draftInfo?.createTime!, 'YYYY年MM月DD日 HH:mm') }}
                </div>
              </div>
            </div>
            <Image
              v-if="createStore.draftInfo?.coverImage"
              :url="createStore.draftInfo?.coverImage || HEAD_IMG"
              :transition-img="HEAD_IMG"
              class="image"
            />
            <p v-if="createStore.draftInfo.abstract" class="desc">{{ createStore.draftInfo?.abstract }}</p>
          </div>
          <Preview
            v-if="createStore.draftInfo.content"
            :mackdown="createStore.draftInfo.content"
            :copy-code-success="onCopyCodeSuccess"
          />
          <div class="classifys">
            <div v-if="createStore.draftInfo.classify" class="classify">
              <span class="label">分类：</span>
              <span class="tag_item" @click.stop="toClassify(createStore.draftInfo.classify!)">{{
                createStore.draftInfo.classify
              }}</span>
            </div>
            <div v-if="createStore.draftInfo.tag" class="classify tag">
              <span class="label">标签：</span>
              <span class="tag_item" @click.stop="toTag(createStore.draftInfo.tag!)">{{
                createStore.draftInfo.tag
              }}</span>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
    </div>
    <div v-if="commonStore?.tocTitles?.length > 0" class="right">
      <Toc class="toc-list" />
    </div>
  </Loading>
</template>

<script setup lang="ts">
import { onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useScroller } from '@/hooks';
import { scrollTo, checkOS, formatDate } from '@/utils';
import { createStore, commonStore } from '@/store';
import { HEAD_IMG } from '@/constant';
import Toc from '@/components/Toc/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';
const Preview = defineAsyncComponent(() => import('@/components/Preview/index.vue'));

const route = useRoute();
const router = useRouter();

const { scrollRef, scrollTop } = useScroller();

onMounted(async () => {
  await createStore.getDraftDetail(route.query.id as string);
});

// 复制成功回调
const onCopyCodeSuccess = (value?: string) => {
  ElMessage({
    message: '复制成功',
    type: 'success',
    offset: 80,
  });
};

// 去我的主页
const toPersonal = (authorId: string | undefined) => {
  if (route.path.includes('/article')) return;
  router.push(`/personal?authorId=${authorId}`);
};

// 去分类页
const toClassify = (classify: string) => {
  router.push(`/classify?classify=${classify}`);
};

// 去标签
const toTag = (tag: string) => {
  if (route.path !== '/tag/list') {
    router.push(`/tag/list?tag=${tag}`);
  }
};

// 置顶
const onScrollTo = (height?: number) => {
  scrollTo(scrollRef, height || 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.draft-detail-wrap {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  padding-right: 4px;

  .content {
    position: relative;
    flex: 1;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    margin-left: 5px;
    margin-right: 10px;
    .pageHeight();
    border-radius: 5px;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--pre-hover-bg);

    :deep {
      .el-scrollbar {
        border-radius: 5px;
        width: 100%;
      }
      .scrollbar-wrapper {
        box-sizing: border-box;
        height: 100%;
        border-radius: 5px;
      }
    }

    .article-info {
      .title-wrap {
        width: 100%;
        padding: 20px 20px 0;
        box-sizing: border-box;
        color: var(--font-1);

        .title {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .user-info {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 20px;

          .herd-img {
            width: 60px;
            height: 60px;
            border-radius: 60px;
            cursor: pointer;

            :deep {
              .image-item {
                border-radius: 60px;
              }
            }
          }

          .create-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin-left: 10px;

            .username {
              display: flex;
              align-items: center;
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 10px;
            }
          }
        }

        .image {
          width: 100%;
          height: auto;
          cursor: default;
          border-radius: 5px;

          :deep {
            .image-item {
              border-radius: 5px;
            }
          }
        }

        .desc {
          margin-top: 10px;
          margin-bottom: 30px;
        }
      }

      .classifys {
        display: flex;
        justify-content: flex-start;
        padding: 5px 20px 15px;
        color: var(--el-color-primary-dark-2);
        margin-bottom: 30px;

        .classify {
          .label {
            font-size: 13px;
            color: var(--font-5);
          }

          .tag_item {
            font-size: 14px;
            padding: 3px 10px 5px;
            border-radius: 5px;
            background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
            .ellipsis();
            cursor: pointer;

            &:hover {
              color: var(--active-color);
            }
          }
        }

        .tag {
          margin-left: 30px;
        }
      }
    }
  }

  .no-rm-content {
    margin-right: 0;
  }

  .right {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 30%;
    max-width: 260px;
    box-sizing: border-box;
    border-radius: 5px;
    max-height: calc(100vh - 82px);

    .toc-list {
      box-sizing: border-box;
      flex: 1;
      background-color: var(--pre-hover-bg);
    }

    & > :last-child {
      margin-bottom: 0;
    }
  }
}

.mac-draft-detail-wrap {
  .content {
    height: calc(100vh - 88px);
  }

  .right {
    margin-right: 3px;
    max-height: calc(100vh - 88px);
  }
}
</style>
