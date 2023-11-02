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
        <el-scrollbar ref="contactScrollRef" wrap-class="scrollbar-wrapper">
          <div class="friend-list">
            <div v-for="item in chatStore.contactList" :key="item.contactId" @click.stop="onActive(item)">
              <NContextMenu
                :menu="CONTACT_MENU(item.isTop, item.isUnDisturb)"
                @select="(menu:Menu) => onSelectContact(menu, item)"
              >
                <div
                  :class="`friend-item ${item.contactId === active && 'active'} ${
                    chatStore.delContactIds.includes(item.contactId) && 'del-friend-item'
                  }`"
                >
                  <div v-if="item.noReadCount" class="no-read-count">
                    {{ item.noReadCount > 99 ? `${item.noReadCount}+` : item.noReadCount }}
                  </div>
                  <span v-if="item.isTop" class="is-top" />
                  <Image :url="item.headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
                  <div class="user-info">
                    <div class="title">
                      <span class="username">{{ item.username }}</span>
                      <span class="time">{{ formatTimestamp(item.sendTime) }}</span>
                    </div>
                    <div class="message">
                      <span class="message-text">{{ item.message }}</span>
                      <i v-if="item.isUnDisturb" class="is-undisturb iconfont icon-tongzhi-qingwudarao-F" />
                    </div>
                  </div>
                </div>
              </NContextMenu>
            </div>
            <div v-rollLoad="{ loadContactList, chatStore }" class="load-more-contact">
              <span v-if="!noMoreContacts && hasContactScroll" class="load-contact">loading...</span>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div :class="`content ${!currentContactId && 'hide-content'}`">
      <div v-if="currentContactId" class="title">
        <span class="username">{{ contactName }}</span>
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
              v-dropdownLoad="{ loadChatList, chatStore, scrollToBottom }"
              class="load-more"
            >
              loading...
            </div>
            <div
              v-if="!noMore && chatStore.total > chatStore.pageSize && showMore && (noMore || !hasScroll || !isMounted)"
              class="on-load"
            >
              <span class="on-load-text" @click="onClickLoadMore">加载更多</span>
            </div>
            <div v-for="(msg, index) in chatList" :key="msg.chatId" class="message-content">
              <!-- <div v-if="chatList.length === 1" class="info">
                由于对方并未关注你，在收到对方回复之前，你最多只能发送1条文字消息
              </div> -->
              <div v-if="index === 0 || (index % 10 === 0 && !chatStore.delIds.includes(msg.id))" class="time">
                {{ formatTimestamp(msg.createTime) }}
              </div>
              <div
                v-if="msg.from === loginStore.userInfo.userId"
                :class="`message-info message-send ${chatStore.delIds.includes(msg.id) && 'message-del'}`"
              >
                <div class="message" @click="onPreview(msg.content)">
                  <span class="send-date">{{ formatDate(msg.createTime, 'MM/DD HH:mm') }}</span>
                  <NContextMenu :menu="CHAT_MENU" @select="(menu:Menu) => onSelectMenu(menu, msg)">
                    <div class="chat-item">
                      <div class="message-text" v-html="replaceCommentContent(msg.content)" />
                    </div>
                  </NContextMenu>
                </div>
                <Image :url="loginStore.userInfo.headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
              </div>
              <div v-else :class="`message-info message-receive ${chatStore.delIds.includes(msg.id) && 'message-del'}`">
                <Image :url="avatar || findAvatar || HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
                <div class="message" @click="onPreview(msg.content)">
                  <span class="send-date">{{ formatDate(msg.createTime, 'MM/DD HH:mm') }}</span>
                  <NContextMenu :menu="CHAT_MENU" @select="(menu:Menu) => onSelectMenu(menu, msg)">
                    <div class="chat-item">
                      <div class="message-text" v-html="replaceCommentContent(msg.content)" />
                    </div>
                  </NContextMenu>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <div v-if="currentContactId" class="draft-inp-wrap">
        <DraftInput
          class="draft-send-inp"
          placeholder="请输入 (Enter换行，Ctrl + Enter 发送)"
          :on-hide-input="onHideInput"
          :send-message="sendMessage"
        />
      </div>
      <ImagePreview v-model:previewVisible="previewVisible" :select-image="{ url: prevImg }" />
    </div>
    <div v-if="!currentContactId" class="empty-content">
      <div class="empyt">
        <Empty text="未选中或未发起私聊，快选个人畅所欲言吧" />
      </div>
    </div>
  </Loading>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, nextTick, onUnmounted, onBeforeUnmount, Ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { HEAD_IMG, CONTACT_MENU, CHAT_MENU } from '@/constant';
import { chatStore, loginStore, messageStore } from '@/store';
import { ContactItem, Menu, ChatItem } from '@/typings/common';
import { formatTimestamp, formatDate, replaceCommentContent, Message } from '@/utils';
import Image from '@/components/Image/index.vue';
import NContextMenu from '@/components/NContextMenu/index.vue';

const router = useRouter();
const route = useRoute();
const { userId, username } = route?.query;

const keyword = ref<string>('');
const active = ref<string>(userId as string);
const contactName = ref<string>(username as string);
const scrollRef = ref<any>(null);
const contactScrollRef = ref<any>(null);
const hasContactScroll = ref<boolean>(false);
const hasScroll = ref<boolean>(false);
const currentContactId = ref<string>(userId as string);
const isMounted = ref<boolean>(false);
const previewVisible = ref<boolean>(false);
const prevImg = ref<string>('');
const avatar = ref<string>('');
const showMore = ref<boolean>(false); // 是否显示加载更多

let timer: ReturnType<typeof setTimeout> | null = null;

const emit = defineEmits(['updateFocus']);

const noMore = computed(() => {
  const { chatList, total } = chatStore;
  return chatList.length >= total && chatList.length && total;
});

const noMoreContacts = computed(() => {
  const { contactList, contactTotal } = chatStore;
  return !!(contactList.length >= contactTotal && contactList.length);
});

// 合并原有消息与新发送的消息
const chatList = computed(() => [...chatStore.chatList, ...chatStore.addChatList]);

// 获取初始化选中联系人头像
const findAvatar = computed(() => {
  const { contactList } = chatStore;
  return contactList.find((i) => i.contactId === currentContactId.value)?.headUrl;
});

onMounted(async () => {
  // 保存当前聊天对象的userId
  chatStore.chatUserId = userId as string;
  chatStore.initIO();
  chatStore.clearChatInfo();
  // 合并聊天记录
  await chatStore.mergeChats(currentContactId.value);
  // 获取聊天列表
  await loadChatList();
  scrollToBottom();
  checkScroll(scrollRef, hasScroll, contactScrollRef, hasContactScroll);
  (scrollRef.value?.wrapRef as HTMLElement)?.addEventListener('scroll', onScroll);
  // 获取未读消息数量
  await chatStore.getUnReadChat();
  // 进入页面是将聊天消息的推送设置为已读
  setMessageReaded();
  // 如果进入聊天时，还没获取到头像，则说明当前选中的联系人还没有加载到，在后面分页中
  watchEffect(async () => {
    if (!findAvatar.value && currentContactId.value) {
      const res = await chatStore.getUserInfo(currentContactId.value);
      if (res?.success) {
        avatar.value = res.data.headUrl as string;
      }
    }
  });
  window.addEventListener('beforeunload', onBeforeunload);
});

onBeforeUnmount(() => {
  // 页面离开时统一删除消息
  chatStore.deleteChats();
  chatStore.deleteContacts();
});

onUnmounted(() => {
  (scrollRef.value?.wrapRef as HTMLElement)?.removeEventListener('scroll', onScroll);
  chatStore.clearContactInfo();
});

// 页面刷新前删除选中的需要删除的联系人及消息
const onBeforeunload = (e: Event) => {
  chatStore.deleteChats();
  chatStore.deleteContacts();
};

// 监听滚动，用于判断显示 loading 的时机
const onScroll = (e: Event) => {
  const scrollTop = (e.target as HTMLElement).scrollTop;
  if (scrollTop && scrollTop <= 10) {
    isMounted.value = true;
  }
};

// 设置提示消息推送已读
const setMessageReaded = async () => {
  await messageStore.getNoReadMsgCount();
  // 获取未读消息id
  const msgIds = messageStore.noReadMsgList?.filter((c) => c.action === 'CHAT').map((i) => i.id);
  if (msgIds?.length) {
    messageStore.setReadStatus(msgIds);
  }
};

// 切换联系人
const onActive = async (contact: ContactItem) => {
  const { contactId, username } = contact;
  isMounted.value = false;
  currentContactId.value = contactId;
  chatStore.chatUserId = contactId;
  active.value = contactId;
  contactName.value = username;
  chatStore.initIO();
  chatStore.clearChatInfo();
  await chatStore.mergeChats(currentContactId.value);
  await loadChatList();
  scrollToBottom();
  checkScroll(scrollRef, hasScroll);
  // 获取未读消息数量
  await chatStore.getUnReadChat();
  // 统一删除消息
  await chatStore.deleteChats();
  // 切换联系人是设置推送消息为已读
  setMessageReaded();
};

// 判断是否有滚动条，用户判断没有滚动时，不显示加载更多(loading)
const checkScroll = (elementRef: any, hasScroll: Ref<boolean>, contactRef?: any, contactHasScroll?: Ref<boolean>) => {
  nextTick(() => {
    const scrollHeight = elementRef.value?.wrapRef.scrollHeight;
    const clientHeight = elementRef.value?.wrapRef.clientHeight;
    hasScroll.value = scrollHeight > clientHeight;
    if (contactRef && contactHasScroll) {
      const scrollHeight = contactRef.value?.wrapRef.scrollHeight;
      const clientHeight = contactRef.value?.wrapRef.clientHeight;
      contactHasScroll.value = scrollHeight > clientHeight;
    }
  });
};

// 点击加载更多
const onClickLoadMore = async () => {
  const scroll = scrollRef.value?.wrapRef as HTMLDivElement;
  const beforeHeight = scroll?.scrollHeight;
  await loadChatList();
  const afterHeight = scroll.scrollHeight;
  const height = afterHeight - beforeHeight;
  (scroll! as HTMLElement).scrollTop = height;
  showMore.value = false;
};

// 加载更多数据
const loadChatList = async () => {
  return chatStore.getChatList(currentContactId.value);
};

// 加载联系人列表
const loadContactList = async () => {
  await chatStore.getContactList();
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
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    chatStore.wrapRef = scrollRef.value?.wrapRef;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      const scroll = scrollRef.value?.wrapRef as HTMLDivElement;
      const height = scroll?.scrollHeight;
      height && (scroll.scrollTop = height);
    }, 100);
  });
};

// 预览图片
const onPreview = (content: string) => {
  const regex = /<[^>]+>/g;
  const matches = content.match(regex);
  const links = matches?.map((match) => match.substring(1, match.length - 1).split(',')[1]);
  if (links?.[0]) {
    prevImg.value = links?.[0];
    previewVisible.value = true;
  }
};

// 删除消息
const delMsg = (data: ChatItem) => {
  Message('确定删除该消息吗', '删除消息').then(() => {
    chatStore.addDelIds(data.id);
    showMore.value = true;
  });
};

// 复制内容
const onCopy = (data: ChatItem) => {
  navigator.clipboard.writeText(data.content);
};

// 选中后菜单
const onSelectMenu = (menu: Menu, data: ChatItem) => {
  const actions = {
    1: delMsg,
    2: onCopy,
  };
  actions[menu.value](data);
};

// 消息置顶
const setMsgTop = (data: ContactItem) => {
  chatStore.onUppdateContact({
    contactId: data.contactId,
    createTime: new Date().valueOf(),
    isUnDisturb: data.isUnDisturb,
    isTop: !data.isTop,
    setTop: true,
  });
};

// 消息秒打扰
const onUnDisturb = (data: ContactItem) => {
  chatStore.onUppdateContact({
    contactId: data.contactId,
    createTime: data.createTime,
    isTop: data.isTop,
    isUnDisturb: !data.isUnDisturb,
  });
};

// 删除联系人
const onRemoveContact = (data: ContactItem) => {
  Message('删除后与该用户的聊天记录将不可恢复', '确定删除该聊天吗').then(() => {
    chatStore.addDelContactId(data.contactId);
    if (currentContactId.value === data.contactId) {
      currentContactId.value = '';
    }
  });
};

// 去联系人主页
const toPersonal = (data: ContactItem) => {
  router.push(`/personal?authorId=${data.contactId}`);
};

// 选中联系人菜单
const onSelectContact = (menu: Menu, data: ContactItem) => {
  const actions = {
    1: setMsgTop,
    2: onUnDisturb,
    3: onRemoveContact,
    4: toPersonal,
  };
  actions[menu.value](data);
};

// TODO 删除最新消息时，未更改联系人中显示的最新消息
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.chart-wrap {
  position: relative;
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
    border-right: 1px solid var(--border-color);
    box-sizing: border-box;

    .search {
      padding: 10px;
    }

    .friends-wrap {
      flex: 1;
      overflow-y: auto;

      .friend-list {
        .load-more-contact {
          margin: 8px 0 10px;
          text-align: center;

          .load-contact {
            font-size: 14px;
            color: var(--font-4);
          }
        }
        .friend-item {
          position: relative;
          display: flex;
          justify-content: space-between;
          height: 65px;
          padding: 10px;
          cursor: pointer;
          box-sizing: border-box;

          .no-read-count {
            position: absolute;
            top: 3px;
            right: 198px;
            height: 16px;
            line-height: 16px;
            box-sizing: border-box;
            background-color: @font-danger;
            font-size: 10px;
            color: @fff;
            border-radius: 10px;
            padding: 0 5px;
          }

          .is-top {
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 8px 8px 0;
            border-color: transparent var(--active) transparent transparent;
            transform: rotate(-90deg);
          }

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
              display: flex;
              align-items: center;
              justify-content: space-between;

              .message-text {
                flex: 1;
                font-size: 13px;
                color: var(--font-3);
                .ellipsisMore(1);
              }

              .is-undisturb {
                color: var(--font-6);
                font-size: 13px;
                margin-left: 10px;
              }
            }
          }
        }

        .del-friend-item {
          display: none;
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
          position: absolute;
          top: -50px;
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

  .empty-content {
    position: absolute;
    right: 0;
    top: 0;
    width: calc(100% - 260px);
    height: 100%;
    box-sizing: border-box;
    background-color: var(--background);
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
      border-bottom: 1px solid var(--border-color);
      font-size: 18px;

      .icon-gengduo3 {
        cursor: pointer;
      }

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
        display: flex;
        flex-direction: column;
        height: auto;
        width: 100%;
        box-sizing: border-box;
        padding: 0 10px;

        .load-more,
        .on-load {
          text-align: center;
          line-height: 32px;
          height: 32px;
          color: var(--font-5);
          font-size: 14px;

          .on-load-text {
            color: var(--theme-blue);
            cursor: pointer;
          }
        }

        .info,
        .time {
          font-size: 13px;
          color: var(--font-4);
          margin-bottom: 20px;
          text-align: center;
          margin-top: 20px;
        }

        .message-content {
          max-width: calc(100vw - 374px);
        }

        .message-info {
          margin-bottom: 20px;
          word-wrap: break-word;

          .message {
            max-width: 65%;
            color: @font-1;
            border-radius: 5px;
          }

          .chat-item {
            display: flex;
            justify-content: space-between;

            .message-text {
              flex: 1;
              text-align: justify;
              padding: 5px 8px;

              :deep {
                img {
                  padding: 3px 0 !important;
                  border-radius: 0 !important;
                }
              }
            }
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

        .message-del {
          display: none !important;
          border: 1px solid red;
        }
      }
    }

    .draft-inp-wrap {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      height: 130px;
      border-top: 1px solid var(--border-color);
      box-sizing: border-box;
      background-color: transparent;

      :deep {
        .emojis {
          display: flex;
          justify-content: center;
          position: absolute;
          bottom: 42px;
          left: 0;
          margin-top: 20px;
          width: 210px;
          padding: 10px 10px 5px;
          background-color: transparent;
          border-radius: 5px;
          border: 1px solid var(--border-color);
          backdrop-filter: blur(5px);

          .emoji-item {
            text-align: center;
          }
          .emoji:nth-child(5n) {
            margin-right: 0;
          }
        }

        .emojiWrap {
          position: absolute;
          top: -35px;
          padding-left: 5px;
          margin-top: 0;
          box-sizing: border-box;
          background-color: transparent;
          height: 31px;
          line-height: 31px;
        }

        .textAreaWrap {
          height: 100%;
        }

        .el-textarea__inner {
          box-shadow: none;
          height: 88px !important;
          padding: 0 5px;
          border-radius: initial;
          background-color: transparent;

          &:focus {
            box-shadow: none;
          }
        }
      }
    }

    .empyt-conyainer {
      position: relative;
      flex: 1;
      display: flex;
      justify-content: center;
      flex-direction: column;
    }
  }

  .hide-content {
    opacity: 0;
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
