<!--
 * 消息列表
 * @author: dnhyxc
 * @since: 2023-04-06
 * index.vue
-->
<template>
  <Loading :loading="messageStore.loading" class="message-wrap">
    <span v-if="messageStore.msgList?.length" class="delAll" @click="onDeleteAll">全部删除</span>
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
            class="line-card"
            @click.stop="toDetail(data)"
          >
            <template #title>
              <div class="left">{{ data.title }}</div>
              <div class="right">
                <span class="del" @click.stop="onDelete(data.id!)">删除</span>
              </div>
            </template>
            <template #content>
              <div class="art-info">
                <div class="pushDate">{{ data?.pushDate ? formatDate(data?.pushDate!) : '-' }}</div>
                <div class="desc">
                  <span class="username" @click.stop="toPersonal(data?.fromUserId!)">{{ data?.fromUsername }}</span>
                  <span class="action-type">{{ MESSAGE_ACTIONS[data?.action!] }}</span>
                </div>
              </div>
            </template>
          </LineCard>
        </div>
        <ToTopIcon v-if="scrollTop >= 500" class="msg-to-top" :on-scroll-to="onScrollTo" />
      </div>
      <div v-if="noMore" class="no-more">没有更多了～～～</div>
      <Empty v-if="showEmpty" />
    </el-scrollbar>
  </Loading>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useMessageStore } from '@/store/message';
import { useScroller } from '@/hooks';
import { scrollTo, formatDate } from '@/utils';
import eventBus from '@/utils/eventBus';
import { ArticleItem } from '@/typings/common';
import { MESSAGE_ACTIONS } from '@/constant';

const reload = inject<Function>('reload');

const messageStore = useMessageStore();

const { scrollRef, scrollTop } = useScroller();
const router = useRouter();

const isMounted = ref<boolean>(false);
const timer = ref<ReturnType<typeof setTimeout> | null>(null);
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
  // 获取未读消息数量
  messageStore.getNoReadMsgCount();
  // 接受前置路由守卫发送的消息，关闭消息列表
  eventBus.on('hide-msg-popover', (status: boolean) => {
    messageStore.visible = status;
  });
});

watch(
  () => messageStore.visible,
  (newVal) => {
    if (newVal) {
      // 消息弹出框显示的时候，清除消息数据
      messageStore.msgCount = 0;
      onGetMsgList();
    } else {
      messageStore.clearMessageInfo();
    }
  },
);

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

// 删除全部消息
const onDeleteAll = async () => {
  await messageStore.deleteAllMessage();
};

// 前往操作人主页
const toPersonal = (userId: string) => {
  router.push(`/personal?authorId=${userId}`);
};

// 去详情页
const toDetail = (data: ArticleItem) => {
  if (data?.articleId) {
    router.push(`/detail/${data.articleId}`);
    timer.value = setTimeout(() => {
      if (timer.value) {
        clearTimeout(timer.value);
        timer.value = null;
      }
      reload && reload();
    }, 100);
  }
};

// 置顶
const onScrollTo = (to?: number) => {
  scrollTo(scrollRef, to || 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.message-wrap {
  display: flex;
  flex-direction: column;
  height: 300px;
  overflow: auto;

  .delAll {
    position: absolute;
    top: 10px;
    right: 13px;
    color: var(--theme-blue);
    cursor: pointer;
    .clickNoSelectText();

    &:hover {
      color: var(--active-color);
    }
  }

  .list-wrap {
    display: flex;
    flex-direction: column;
    padding: 5px 3px;

    .left {
      flex: 1;
      font-weight: 700;
      color: var(--font-3);
      margin-right: 10px;
      .ellipsisMore(1);
    }

    .right {
      display: flex;
      align-items: center;
      font-size: 14px;

      .del {
        color: @font-danger;
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
      box-shadow: 0 0 5px @shadow-color;
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
          }

          .desc {
            .ellipsisMore(1);
            font-size: 14px;

            .username {
              margin-right: 5px;
              color: var(--theme-blue);
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
