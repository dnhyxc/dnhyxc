<!--
 * 聊天窗口
 * @author: dnhyxc
 * @since: 2023-10-24
 * index.vue
-->
<template>
  <div class="chart-wrap">
    <div class="friends-menu">
      <div class="search">
        <el-form @submit.native.prevent="onSubmit">
          <el-input v-model="keyword" size="large" placeholder="搜索联系人" clearable />
        </el-form>
      </div>
      <div class="friends-wrap">
        <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
          <div class="friend-list">
            <div
              v-for="item in [0, 1, 2, 3, 4, 5]"
              :key="item"
              :class="`friend-item ${item === active && 'active'}`"
              @click.stop="onActive(item)"
            >
              <Image :url="HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
              <div class="user-info">
                <div class="title">
                  <span class="username">dnhyxc</span>
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
            <div v-for="msg in [0, 1, 2, 3, 4, 5, 6]" :key="msg" class="message-content">
              <div v-if="msg === 0" class="info">由于对方并未关注你，在收到对方回复之前，你最多只能发送1条文字消息</div>
              <div class="time">10-23 10:19</div>
              <div v-if="msg % 2 === 0" class="message-info message-send">
                <div class="message">这是一条消息这是一条消息这是一条消息这是一条消息这是一条消息这是一条消息</div>
                <Image :url="HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
              </div>
              <div v-else class="message-info message-receive">
                <Image :url="HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
                <div class="message">这是一条消息这是一条消息这是一条消息这是一条消息这是一条消息这是一条消息</div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <div class="draft-inp-wrap">
        <DraftInput class="draft-send-inp" :on-hide-input="onHideInput" :send-message="sendMessage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { HEAD_IMG } from '@/constant';
import { chatStore, loginStore } from '@/store';
import Image from '@/components/Image/index.vue';

const keyword = ref<string>('');
const active = ref<number>(0);

const emit = defineEmits(['updateFocus']);

const route = useRoute();

onMounted(() => {
  chatStore.initIO();
});

const onSubmit = () => {
  const { userId } = route?.query;
  console.log(keyword.value, 'values', userId);
};

const onActive = (item: any) => {
  console.log(item, 'item');
  active.value = item;
};

// 隐藏回复输入框
const onHideInput = () => {
  emit('updateFocus', false);
};

// 发送消息
const sendMessage = (content: string) => {
  console.log(content, 'value');
  const { userId } = route?.query;
  console.log(keyword.value, 'values', userId);
  chatStore.sendChatMessage({
    from: loginStore.userInfo?.userId!,
    to: userId as string,
    content,
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
    width: 280px;
    border-right: 1px solid @border-color;

    .search {
      padding: 10px;
    }

    .friends-wrap {
      flex: 1;
      overflow-y: auto;

      .friend-list {
        height: 1000px;
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
        margin-top: 20px;
        padding: 0 10px;
        height: auto;

        .info,
        .time {
          font-size: 13px;
          color: var(--font-4);
          margin-bottom: 20px;
          text-align: center;
        }

        .message-info {
          margin-bottom: 20px;

          .message {
            flex: 0.65;
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
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;

          .message {
            margin-right: 8px;
            background-color: @chart-send-bg;

            &:hover {
              background-color: @hover-chart-send-bg;
            }
          }
        }

        .message-receive {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;

          .message {
            margin-left: 8px;
            background-color: @bg-color;

            &:hover {
              background-color: @hover-chart-receive-bg;
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
