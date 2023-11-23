<!--
 * 消息列表
 * @author: dnhyxc
 * @since: 2023-04-06
 * index.vue
-->
<template>
  <Loading :loading="messageStore.loading" class="message-wrap">
    <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
      <div
        v-if="isMounted"
        v-infinite-scroll="onGetMsgList"
        :infinite-scroll-delay="300"
        :infinite-scroll-disabled="disabled"
        :infinite-scroll-distance="2"
        class="pullup-content"
      >
        <div class="list-wrap">
          <LineCard
            v-for="data in messageStore.msgList"
            :key="data.id"
            :data="data"
            :is-collect="true"
            :class="`line-card ${
              (data?.articleId || (data.action === 'CHAT' && route.path !== '/chat')) && 'push-card'
            }`"
            @click.stop="toDetail(data)"
          >
            <template #title>
              <div class="left">{{ data.title || FOLLOWED_INFO[data.action!] }}</div>
              <div class="right">
                <span class="del" @click.stop="onDelete(data.id!)">删除</span>
              </div>
            </template>
            <template #content>
              <div class="art-info">
                <div class="pushDate">
                  <span :class="`${data?.isReaded && 'is-readed'} read-status`">
                    {{ data?.isReaded ? '已读' : '未读' }}
                  </span>
                  <span>
                    {{ data?.pushDate ? formatDate(data?.pushDate!) : '-' }}
                  </span>
                </div>
                <div class="desc">
                  <span v-if="data?.action !== 'CHAT'" class="username" @click.stop="toPersonal(data?.fromUserId!)">{{
                    data?.fromUsername
                  }}</span>
                  <span v-if="data?.action !== 'CHAT'" class="action-type">{{ MESSAGE_ACTIONS[data?.action!] }}</span>
                  <span v-if="data?.action === 'CHAT'" class="action-type">{{ data.content }}</span>
                </div>
              </div>
            </template>
          </LineCard>
        </div>
      </div>
      <div v-if="noMore" class="no-more">没有更多了～～～</div>
      <Empty v-if="showEmpty" />
    </el-scrollbar>
  </Loading>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { messageStore, personalStore, loginStore } from '@/store';
import { useScroller } from '@/hooks';
import { scrollTo, formatDate } from '@/utils';
import eventBus from '@/utils/eventBus';
import { ArticleItem, ContactItem } from '@/typings/common';
import { MESSAGE_ACTIONS, FOLLOWED_INFO } from '@/constant';

const reload = inject<Function>('reload');

const { scrollRef, scrollTop } = useScroller();
const router = useRouter();
const route = useRoute();

const isMounted = ref<boolean>(false);
let timer: ReturnType<typeof setTimeout> | null = null;
const noMore = computed(() => {
  const { msgList, total } = messageStore;
  return msgList.length >= total && msgList.length;
});
const disabled = computed(() => messageStore.loading || noMore.value);
const showEmpty = computed(
  () => messageStore.loading !== null && !messageStore.loading && !messageStore.msgList?.length,
);

onMounted(() => {
  isMounted.value = true;
  // 接受前置路由守卫发送的消息，关闭消息列表
  eventBus.on('hide-msg-popover', (status: boolean) => {
    messageStore.visible = status;
  });
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});

// 获取消息列表
const onGetMsgList = async () => {
  await messageStore.getMessageList();
};

// 删除消息
const onDelete = async (id: string) => {
  await messageStore.deleteMessage(id);
  // 删除之后，自动跳转到原来所在位置
  onScrollTo(scrollTop.value);
};

// 前往操作人主页
const toPersonal = (userId: string) => {
  router.push(`/personal?authorId=${userId}`);
  if (route.path === '/personal' && loginStore?.userInfo.userId !== userId) {
    if (personalStore.currentTabKey === '1' && route.query.authorId === userId) return;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      reload?.();
      timer = null;
    }, 100);
  }
};

// 去详情页
const toDetail = (data: ArticleItem) => {
  if (data?.articleId) {
    router.push(`/detail/${data.articleId}`);
    timer = setTimeout(() => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      reload && reload();
    }, 100);
  }

  if (data.action === 'CHAT' && route.path !== '/chat') {
    router.push(`/chat?userId=${(data as unknown as ContactItem).from}`);
  }
};

// 置顶
const onScrollTo = (to?: number) => {
  const bottom = scrollRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  scrollTo(scrollRef, to || scrollTop.value > 0 ? 0 : bottom);
};

defineExpose({
  onScrollTo,
  scrollTop,
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.message-wrap {
  display: flex;
  flex-direction: column;
  height: 300px;
  overflow: auto;

  .list-wrap {
    display: flex;
    flex-direction: column;
    padding: 5px 3px;

    .line-card {
      cursor: default;
    }

    .push-card {
      cursor: pointer;
      &:hover {
        box-shadow: 0 0 5px var(--theme-blue);
      }
    }

    .left {
      flex: 1;
      font-weight: 700;
      color: var(--font-3);
      .ellipsisMore(1);
    }

    .right {
      display: flex;
      align-items: center;
      font-size: 14px;

      .del {
        margin-left: 10px;
        color: @font-danger;
        display: none;
        cursor: pointer;
      }

      .del {
        &:hover {
          color: var(--active-color);
        }
      }
    }

    .line-card {
      width: 100%;
      padding: 5px;
      box-shadow: 0 0 5px var(--shadow-mack);
      background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
      margin-bottom: 10px;
      border-radius: 5px;

      :deep {
        .art-info {
          flex: 1;
          margin-right: 0;

          .pushDate {
            font-size: 14px;
            margin-bottom: 5px;

            .read-status {
              margin-right: 10px;
              color: @font-danger;
            }

            .is-readed {
              color: @font-warning;
            }
          }

          .desc {
            .ellipsisMore(1);
            font-size: 14px;

            .username {
              margin-right: 10px;
              color: var(--theme-blue);
              cursor: pointer;

              &:hover {
                color: var(--active-color);
              }
            }
          }

          .tags {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            margin-bottom: 0;
          }
        }
      }

      &:hover {
        .right {
          .del {
            display: inline-block;
          }
        }
      }
    }
  }

  :deep {
    .msg-to-top {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 6px;
      height: 40px;
      box-sizing: border-box;
    }
  }

  .no-more {
    text-align: center;
    color: var(--font-4);
    margin: 0 0 5px;
    .clickNoSelectText();
  }
}
</style>
