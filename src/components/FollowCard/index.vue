<!--
 * 工具卡片
 * @author: dnhyxc
 * @since: 2023-05-29
 * index.vue
-->
<template>
  <div class="follow-card-wrap" @click="toPersonal()">
    <div class="follow-item">
      <div class="left">
        <Image :url="data.headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="img" />
      </div>
      <div class="right">
        <div class="title">
          <span class="username">{{ data.username }}</span>
          <span v-if="showFollowBtn" class="follow-btn" @click.stop="() => onFollow(data.id, data)">
            {{ !data.isFollowed ? '关注用户' : '取消关注' }}
          </span>
        </div>
        <div class="desc">
          {{ data.job || '-' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { HEAD_IMG } from '@/constant';
import { loginStore } from '@/store';
import { FollowItem } from '@/typings/common';

const reload = inject<Function>('reload');

interface IProps {
  data: FollowItem;
  onFollow?: (id: string, data?: FollowItem) => void;
  onClick?: () => void;
  isAuthUserId?: string;
}

const props = defineProps<IProps>();

const router = useRouter();
const route = useRoute();

let timer: ReturnType<typeof setTimeout> | null = null;

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});

// 判断是否展示关注/取消关注按钮
const showFollowBtn = computed(() => {
  const { userId } = loginStore.userInfo;
  if (props.isAuthUserId) {
    return props.isAuthUserId === props.data.myUserId && userId === props.isAuthUserId;
  } else {
    return userId === props.data.myUserId;
  }
});

// 关注/取消关注
const onFollow = (id: string, data?: FollowItem) => {
  props?.onFollow?.(id, data);
};

// 去个人主页
const toPersonal = () => {
  router.push(`/personal?authorId=${props.data?.userId}`);
  if (route.path === '/personal') {
    timer = setTimeout(() => {
      reload?.();
      timer = null;
    }, 100);
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.follow-card-wrap {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  box-sizing: border-box;
  box-shadow: 0 0 5px var(--shadow-mack);
  cursor: pointer;

  .follow-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;

    .left {
      .img {
        border-radius: 5px;
        display: block;
        width: 70px;
        height: 70px;
        margin-right: 10px;

        :deep {
          .image-item {
            border-radius: 5px;
          }
        }
      }
    }

    .right {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;

      .title {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .username {
          flex: 1;
          font-size: 16px;
          font-weight: 700;
          color: var(--font-1);
          margin-right: 15px;
          .ellipsisMore(1);
        }

        .follow-btn {
          font-size: 14px;
          color: var(--theme-blue);
          cursor: pointer;
          .clickNoSelectText();

          &:hover {
            color: @font-warning;
          }
        }
      }

      .desc {
        color: var(--font-5);
        font-size: 13px;
        .ellipsisMore(2);
      }
    }
  }
}
</style>
