<!--
 * 详情header
 * @author: dnhyxc
 * @since: 2023-03-03
 * index.vue
-->
<template>
  <div class="title-wrap">
    <div class="title">{{ articleStore?.articleDetail?.title }}</div>
    <div class="user-info">
      <Image
        :url="articleStore?.articleDetail?.headUrl || HEAD_IMG"
        :transition-img="HEAD_IMG"
        :on-click="() => toPersonal(articleStore?.articleDetail?.authorId)"
        class="herd-img"
      />
      <div class="create-info">
        <div class="username">
          <span>{{ articleStore?.articleDetail?.authorName }}</span>
          <slot name="follow">
            <span
              v-show="
                loginStore?.userInfo.userId &&
                articleStore?.articleDetail?.authorId !== loginStore.userInfo?.userId &&
                !route.path.includes('/article')
              "
              class="follow"
              @click="() => onFollow(articleStore?.articleDetail?.authorId!)"
            >
              {{ followStore.isFollowed ? '取消关注' : '关注作者' }}
            </span>
          </slot>
        </div>
        <div>
          <span>{{ formatDate(articleStore?.articleDetail?.createTime!, 'YYYY年MM月DD日 HH:mm') }}</span>
          <span class="read-count">阅读 {{ articleStore?.articleDetail?.readCount }}</span>
          <span
            v-if="
              loginStore?.userInfo?.userId === articleStore?.articleDetail?.authorId && !route.path.includes('/article')
            "
            class="edit-btn"
            @click.stop="onEditArticle"
          >
            <i class="edit-icon iconfont icon-12bianji3x" />编辑
          </span>
        </div>
      </div>
    </div>
    <Image
      v-if="articleStore?.articleDetail?.coverImage"
      :url="articleStore?.articleDetail?.coverImage"
      :transition-img="HEAD_IMG"
      class="image"
      :on-click="onPreview"
    />
    <p class="desc">{{ articleStore?.articleDetail?.abstract }}</p>
    <ImagePreview
      v-model:previewVisible="previewVisible"
      :select-image="{ url: articleStore?.articleDetail?.coverImage }"
      close-on-click-modal
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { articleStore, loginStore, createStore, followStore } from '@/store';
import { formatDate } from '@/utils';
import { HEAD_IMG } from '@/constant';
import Image from '@/components/Image/index.vue';

const router = useRouter();
const route = useRoute();
const followTimer = ref<boolean>(false);
// 图片预览状态
const previewVisible = ref<boolean>(false);

onMounted(() => {
  if (articleStore.articleDetail?.authorId && !route.path.includes('/article')) {
    followStore.findFollowed(articleStore.articleDetail?.authorId!, true);
  }
});

// 编辑文章
const onEditArticle = () => {
  // 点击编辑时，设置创建页初始值(这里设置一遍，用于解决创建也因为接口相应导致mackdown赋值延迟的问题)
  createStore.createInfo = {
    ...createStore.createInfo,
    content: articleStore?.articleDetail?.content!,
  };
  router.push(`/create?id=${route.params.id}&toHome=1`);
};

// 去我的主页
const toPersonal = (authorId: string | undefined) => {
  if (route.path.includes('/article')) return;
  router.push(`/personal?authorId=${authorId}`);
};

// 关注作者
const onFollow = async (authorId: string) => {
  if (followTimer.value) return;
  followTimer.value = true;
  await followStore.manageFollow(authorId, route.params.id as string);
  followTimer.value = false;
};

// 预览封面图
const onPreview = () => {
  previewVisible.value = true;
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

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

      .follow {
        margin-left: 15px;
        font-weight: 100;
        font-size: 14px;
        margin-top: 10px;
        margin-top: 3px;
        color: var(--theme-blue);
        cursor: pointer;
        .clickNoSelectText();

        &:hover {
          color: @font-warning;
        }
      }

      .read-count {
        margin: 0 15px;
      }

      .edit-btn {
        font-size: 15px;
        padding: 1px 2px;
        cursor: pointer;
        color: var(--theme-blue);

        &:hover {
          color: var(--el-color-primary-light-5);
        }

        .edit-icon {
          margin-right: 3px;
          padding-bottom: 4px;
        }
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
</style>
