<!--
 * 聊天窗口
 * @author: dnhyxc
 * @since: 2023-10-24
 * index.vue
-->
<template>
  <Loading :loading="chatStore.loading" class="chart-wrap">
    <div class="friends-menu">
      <div class="search">
        <el-form @submit.native.prevent="onSearch">
          <el-input v-model="keyword" size="large" placeholder="搜索联系人" clearable />
        </el-form>
      </div>
      <div class="friends-wrap">
        <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
          <div class="friend-list">
            <div
              v-for="item in chatStore.contactList"
              :key="item.contactId"
              :class="`friend-item ${item.contactId === active && 'active'}`"
              @click.stop="onActive(item.contactId)"
            >
              <Image :url="item.headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
              <div class="user-info">
                <div class="title">
                  <span class="username">{{ item.username }}</span>
                  <span class="time">12.09</span>
                </div>
                <div class="message">这是一条消息这是一条消息这是一条消息这是一条消息这是一条消息这是一条消息</div>
              </div>
            </div>
            <div class="load-more">加载更多</div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div class="content">
      <div class="title">
        <span class="username">dnhyxc</span>
        <el-dropdown trigger="click" placement="bottom-end">
          <i class="iconfont icon-gengduo3" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>消息置顶</el-dropdown-item>
              <el-dropdown-item>消息免打扰</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="message-wrap">
        <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
          <div class="messages">
            <div
              v-if="!noMore && hasScroll && isMounted"
              v-load="{ loadChatList, chatStore, scrollToBottom }"
              class="load-more"
            >
              loading...
            </div>
            <div v-for="(msg, index) in chatList" :key="msg.chatId" class="message-content">
              <div v-if="chatList.length === 1" class="info">
                由于对方并未关注你，在收到对方回复之前，你最多只能发送1条文字消息
              </div>
              <div v-if="index === 0 || index % 10 === 0" class="time">
                {{ formatTimestamp(msg.createTime) }}
              </div>
              <div v-if="msg.from === loginStore.userInfo.userId" class="message-info message-send">
                <div class="message">
                  <span class="send-date">{{ formatDate(msg.createTime, 'MM/DD HH:mm') }}</span>
                  {{ msg.content }}
                </div>
                <Image :url="HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
              </div>
              <div v-else class="message-info message-receive">
                <Image :url="HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
                <div class="message">
                  <span class="send-date">{{ formatDate(msg.createTime, 'MM/DD HH:mm') }}</span>
                  {{ msg.content }}
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <div class="draft-inp-wrap">
        <DraftInput class="draft-send-inp" :on-hide-input="onHideInput" :send-message="sendMessage" />
      </div>
    </div>
  </Loading>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, nextTick, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { HEAD_IMG } from '@/constant';
import { chatStore, loginStore } from '@/store';
import { formatTimestamp, formatDate } from '@/utils';
import Image from '@/components/Image/index.vue';

const route = useRoute();
const { userId } = route?.query;

const keyword = ref<string>('');
const active = ref<string>(userId as string);
const scrollRef = ref<any>(null);
const hasScroll = ref<boolean>(false);
const currentContactId = ref<string>(userId as string);
const isMounted = ref<boolean>(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const emit = defineEmits(['updateFocus']);

const noMore = computed(() => {
  const { chatList, total } = chatStore;
  return chatList.length >= total && chatList.length && total;
});

// 合并原有消息与新发送的消息
const chatList = computed(() => [...chatStore.chatList, ...chatStore.addChatList]);

onMounted(async () => {
  chatStore.initIO();
  chatStore.clearChatInfo();
  chatStore.clearContactInfo();
  await chatStore.getContactList();
  // 合并聊天记录
  await chatStore.mergeChats(currentContactId.value);
  // 获取聊天列表
  await loadChatList();
  scrollToBottom();
  checkScroll();
  (scrollRef.value?.wrapRef as HTMLElement)?.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  (scrollRef.value?.wrapRef as HTMLElement)?.removeEventListener('scroll', onScroll);
});

const onScroll = (e: Event) => {
  const scrollTop = (e.target as HTMLElement).scrollTop;
  if (scrollTop && scrollTop < 10) {
    isMounted.value = true;
  }
};

// 切换联系人
const onActive = async (contactId: string) => {
  isMounted.value = false;
  currentContactId.value = contactId;
  active.value = contactId;
  chatStore.initIO();
  chatStore.clearChatInfo(true);
  await chatStore.mergeChats(currentContactId.value);
  await loadChatList();
  scrollToBottom();
  checkScroll();
};

// 判断是否有滚动条
const checkScroll = () => {
  nextTick(() => {
    const scrollHeight = scrollRef.value?.wrapRef.scrollHeight;
    const clientHeight = scrollRef.value?.wrapRef.clientHeight;
    hasScroll.value = scrollHeight > clientHeight;
  });
};

// 加载更多数据
const loadChatList = async () => {
  return chatStore.getChatList(currentContactId.value);
};

// 搜索联系人
const onSearch = () => {
  const { userId } = route?.query;
  console.log(keyword.value, 'values', userId);
};

// 隐藏回复输入框
const onHideInput = () => {
  emit('updateFocus', false);
};

// 发送消息
const sendMessage = (content: string) => {
  chatStore.sendChatMessage({
    to: currentContactId.value as string,
    content,
  });
  scrollToBottom();
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      const scroll = scrollRef.value?.wrapRef as HTMLDivElement;
      const height = scrollRef.value?.wrapRef.scrollHeight;
      scroll.scrollTop = height;
    }, 100);
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.chart-wrap {
  display: flex;
  justify-content: space-between;
  border-radius: 5px;
  box-shadow: 0 0 8px 0 var(--shadow-mack);
  background-color: var(--pre-hover-bg);
  box-sizing: border-box;
  margin-left: 5px;
  margin-top: 3px;
  height: calc(100% - 3px);
  width: calc(100% - 9px);

  .friends-menu {
    display: flex;
    flex-direction: column;
    width: 260px;
    border-right: 1px solid @border-color;

    .search {
      padding: 10px;
    }

    .friends-wrap {
      flex: 1;
      overflow-y: auto;

      .friend-list {
        .friend-item {
          display: flex;
          justify-content: space-between;
          height: 65px;
          padding: 10px;
          cursor: pointer;
          box-sizing: border-box;

          .user-info {
            flex: 1;
            display: flex;
            justify-content: space-between;
            flex-direction: column;
            margin-left: 10px;

            .title {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: var(--font-1);

              .username {
                flex: 1;
                font-size: 16px;
                margin-right: 5px;
                .ellipsisMore(1);
              }

              .time {
                font-size: 12px;
                color: var(--font-3);
              }
            }

            .message {
              font-size: 13px;
              color: var(--font-3);
              .ellipsisMore(1);
            }
          }
        }

        .active {
          background-color: @bg-color;

          .user-info {
            .title {
              .username {
                color: @font-1;
              }
              .time {
                color: @font-3;
              }
            }

            .message {
              color: @font-3;
            }
          }
        }

        .load-more {
          text-align: center;
          height: 35px;
          line-height: 35px;
          font-size: 14px;
          color: var(--font-4);
          position: absolute;
          top: -50px;
        }
      }
    }
  }

  .head-img {
    width: 45px;
    height: 45px;
    border-radius: 5px;
    cursor: pointer;

    :deep {
      .image-item {
        border-radius: 5px;
      }
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    box-sizing: border-box;
    color: var(--font-1);

    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 55px;
      padding: 10px;
      box-sizing: border-box;
      border-bottom: 1px solid @border-color;
      font-size: 18px;

      .username {
        flex: 1;
        margin-right: 5px;
        .ellipsisMore(1);
      }

      .icon-gengduo3 {
        font-size: 18px;
        color: var(--font-1);
      }
    }

    .message-wrap {
      flex: 1;
      overflow-y: auto;

      .messages {
        height: auto;
        padding: 0 10px;

        .load-more {
          text-align: center;
          line-height: 32px;
          height: 32px;
          color: var(--font-5);
          font-size: 14px;
        }

        .info,
        .time {
          font-size: 13px;
          color: var(--font-4);
          margin-bottom: 20px;
          text-align: center;
          margin-top: 20px;
        }

        .message-info {
          margin-bottom: 20px;
          word-wrap: break-word;

          .message {
            max-width: 65%;
            color: @font-1;
            border-radius: 5px;
            padding: 5px;
          }

          .head-img {
            width: 35px;
            height: 35px;
          }
        }

        .message-send {
          position: relative;
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;

          .send-date {
            position: absolute;
            top: -15px;
            right: 43px;
            font-size: 10px;
            color: var(--font-4);
            display: none;
          }

          .message {
            margin-right: 8px;
            background-color: @chart-send-bg;

            &:hover {
              background-color: @hover-chart-send-bg;
              .send-date {
                display: block;
              }
            }
          }
        }

        .message-receive {
          position: relative;
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;

          .send-date {
            position: absolute;
            top: -15px;
            left: 43px;
            font-size: 10px;
            color: var(--font-4);
            display: none;
          }

          .message {
            margin-left: 8px;
            background-color: @bg-color;

            &:hover {
              background-color: @hover-chart-receive-bg;

              .send-date {
                display: block;
              }
            }
          }
        }
      }
    }

    .draft-inp-wrap {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      height: 120px;
      border-top: 1px solid #ccc;
      box-sizing: border-box;
      background-color: var(--input-bg-color);

      :deep {
        .emojis {
          display: flex;
          justify-content: center;
          position: absolute;
          bottom: 20px;
          left: 0;
          margin-top: 20px;
          width: 210px;
          padding: 10px 10px 5px;
          background-color: var(--input-bg-color);
          border-radius: 5px;
          border: 1px solid @border-color;

          .emoji-item {
            text-align: center;
          }
          .emoji:nth-child(5n) {
            margin-right: 0;
          }
        }

        .emojiWrap {
          position: absolute;
          top: -32px;
          left: 5px;
        }

        .textAreaWrap {
          height: 100%;
        }

        .el-textarea__inner {
          box-shadow: none;
          height: 90px !important;
          background-color: transparent;
          padding: 5px;

          &:focus {
            box-shadow: none;
          }
        }
      }
    }
  }

  :deep {
    .el-input__wrapper {
      color: var(--font-1);
      background-color: var(--input-bg-color);
    }

    .el-input__inner {
      color: var(--font-1);
      background-color: transparent;
    }
  }
}
</style>
