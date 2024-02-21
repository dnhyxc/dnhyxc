<!--
 * pop content
 * @author: dnhyxc
 * @since: 2023-10-24
 * index.vue
-->
<template>
  <div class="pop-container" @click.stop="toPersonal">
    <div class="header">
      <Image :url="comment.headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="image" />
      <div class="user-info">
        <div class="username">{{ comment.username }}</div>
        <div class="job">{{ comment.job }}</div>
      </div>
    </div>
    <div class="follows">
      <div class="follow">
        <span>{{ followStore.total || '-' }}</span>
        <span>关注</span>
      </div>
      <div class="follow">
        <span>{{ followStore.followMeTotal || '-' }}</span>
        <span>粉丝</span>
      </div>
    </div>
    <div
      v-if="comment.userId !== loginStore.userInfo.userId && comment.userId !== getStoreUserInfo()?.userInfo?.userId"
      class="actions"
    >
      <el-button class="btn" type="primary" plain @click.stop="onFollow">
        {{ followStore.isFollowed ? '已关注' : '关注' }}
      </el-button>
      <el-button class="btn" type="success" plain @click.stop="toChat">私信</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { followStore, loginStore, chatStore } from '@/store';
import { HEAD_IMG } from '@/constant';
import { getStoreUserInfo } from '@/utils';
import { CommentParams } from '@/typings/common';
import Image from '@/components/Image/index.vue';

interface IPorps {
  comment: CommentParams;
}

const router = useRouter();

const props = defineProps<IPorps>();

// 关注/取消关注
const onFollow = async () => {
  await followStore.manageFollow(props.comment?.userId as string, loginStore?.userInfo.userId!);
  followStore.clearInteractList();
  followStore.getFollowList(props.comment?.userId, 1, 9999);
  followStore.getFollowMeList(props.comment?.userId, 1, 9999);
};

const toPersonal = () => {
  router.push(`/personal?authorId=${props.comment?.userId}`);
};

// 去聊天页面
const toChat = async () => {
  await chatStore.addContacts(props.comment?.userId!);
  router.push(`/chat?userId=${props.comment?.userId}&username=${props.comment?.username}`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.pop-container {
  position: relative;
  .header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .image {
      width: 55px;
      height: 55px;
      border-radius: 55px;
      cursor: pointer;

      :deep {
        .image-item {
          border-radius: 55px;
        }
      }
    }

    .user-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      text-align: center;
      margin-top: 10px;
      color: var(--font-1);

      .username {
        font-size: 16px;
        margin-bottom: 5px;
      }

      .job {
        font-size: 13px;
      }
    }
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;

    .btn {
      flex: 1;
    }
  }

  .follows {
    display: flex;
    justify-content: space-between;
    cursor: pointer;

    .follow {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      margin-top: 10px;
      color: var(--font-2);
    }
  }
}
</style>
