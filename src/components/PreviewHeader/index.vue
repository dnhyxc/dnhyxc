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
        :on-click="() => toSetting(articleStore?.articleDetail?.authorId)"
        class="herd-img"
      />
      <div class="create-info">
        <div class="username">{{ articleStore?.articleDetail?.authorName }}</div>
        <div>
          <span>{{ formatDate(articleStore?.articleDetail?.createTime!, 'YYYY年MM月DD日 HH:mm') }}</span>
          <span class="read-count">阅读 {{ articleStore?.articleDetail?.readCount }}</span>
          <el-button
            v-if="loginStore?.userInfo?.userId === articleStore?.articleDetail?.authorId"
            type="primary"
            link
            @click.stop="onEditArticle"
          >
            编辑
          </el-button>
        </div>
      </div>
    </div>
    <Image
      v-if="articleStore?.articleDetail?.coverImage"
      :url="articleStore?.articleDetail?.coverImage || HEAD_IMG"
      :transition-img="HEAD_IMG"
      :on-click="() => toSetting(articleStore?.articleDetail?.authorId)"
      class="image"
    />
    <p class="desc">{{ articleStore?.articleDetail?.abstract }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { articleStore, loginStore, createStore } from '@/store';
import { formatDate } from '@/utils';
import { HEAD_IMG } from '@/constant';
import Image from '@/components/Image/index.vue';

const router = useRouter();
const route = useRoute();

// 编辑文章
const onEditArticle = () => {
  // 点击编辑时，设置创建页初始值(这里设置一遍，用于解决创建也因为接口相应导致mackdown赋值延迟的问题)
  createStore.createInfo = {
    ...createStore.createInfo,
    content: articleStore?.articleDetail?.content!,
  };
  router.push(`/create?id=${route.params.id}`);
};

// 去我的主页
const toSetting = (authorId: string | undefined) => {
  router.push(`/personal?id=${authorId}`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.title-wrap {
  width: 100%;
  padding: 20px 20px 0;
  box-sizing: border-box;

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
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
      }

      .read-count {
        margin: 0 15px;
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
