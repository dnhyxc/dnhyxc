<!--
 * 聊天窗口
 * @author: dnhyxc
 * @since: 2023-10-24
 * index.vue
-->
<template>
  <Loading :loading="chatStore.loading" class="chart-wrap" @dragover="onDragover" @dragleave="onDragleave">
    <div class="friends-menu">
      <div id="SEARCH" class="search">
        <el-input
          id="SEARCH_INPUT"
          ref="inputRef"
          v-model="keyword"
          size="large"
          placeholder="搜索联系人"
          @focus="onFocus"
          @keyup.enter="onSearch"
        />
        <i v-if="showClear" class="clear iconfont icon-shibai" />
      </div>
      <div v-if="!showSearchList" class="friends-wrap">
        <el-scrollbar ref="contactScrollRef" wrap-class="scrollbar-wrapper">
          <div class="friend-list">
            <div v-for="item in chatStore.contactList" :key="item.contactId" @click.stop="onActive(item)">
              <ContextMenu
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
              </ContextMenu>
            </div>
            <div v-rollLoad="{ loadContactList, chatStore }" class="load-more-contact">
              <span v-if="!noMoreContacts && hasContactScroll" class="load-contact">loading...</span>
            </div>
            <div v-if="noMoreContacts && chatStore.contactList.length > chatStore.contactPageSize" class="no-more">
              没有更多了～～～
            </div>
          </div>
        </el-scrollbar>
      </div>
      <Loading v-else :loading="chatStore.searchLoading" class="friends-wrap search-friends">
        <el-scrollbar ref="contactScrollRef" wrap-class="scrollbar-wrapper">
          <div
            v-infinite-scroll="onSearchContacts"
            :infinite-scroll-delay="300"
            :infinite-scroll-disabled="disabled"
            :infinite-scroll-distance="2"
            class="friend-list"
          >
            <div v-for="item in chatStore.searchList" :key="item.contactId" @click.stop="onActive(item)">
              <div :class="`friend-item ${item.contactId === active && 'active'}`">
                <Image :url="item.headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
                <div class="user-info search-user-info">
                  <span class="username" v-html="item.username" />
                </div>
              </div>
            </div>
            <div v-if="noMoreSearchContacts" class="no-more">没有更多了～～～</div>
            <div v-if="!chatStore.searchLoading && !chatStore.searchList?.length" class="empty">
              <img :src="NO_DATA_SVG" alt="" class="no-data" />
              <span>空空如也</span>
            </div>
          </div>
        </el-scrollbar>
      </Loading>
    </div>
    <div :class="`content ${!currentContactId && 'hide-content'}`" @drop="onDrop">
      <div v-if="currentContactId" class="title">
        <span class="username" v-html="contactName" />
        <el-dropdown trigger="click" placement="bottom-end" popper-class="custom-dropdown-styles">
          <i class="iconfont icon-gengduo3" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item class="dropdown-text" @click="onChatTop">
                {{ currentContact?.isTop ? '取消置顶' : '消息置顶' }}
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-text" @click="onChatUnDisturb">
                {{ currentContact?.isUnDisturb ? '开启消息提醒' : '消息免打扰' }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div ref="messageRef" :class="`message-wrap ${isDropOn && 'on-drop'}`">
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
            <div v-for="(msg, index) in chatList" :key="msg.chat.chatId" class="message-content">
              <!-- <div v-if="chatList.length === 1" class="info">
                由于对方并未关注你，在收到对方回复之前，你最多只能发送1条文字消息
              </div> -->
              <div v-if="index % 20 === 0" class="time">
                {{ formatTimestamp(msg.chat.createTime) }}
              </div>
              <div
                v-if="msg.chat.from === loginStore.userInfo.userId"
                :class="`message-info message-send ${chatStore.delIds.includes(msg.id) && 'message-del'}`"
              >
                <div class="message" @click="onPreview(msg)">
                  <span class="send-date">{{ formatDate(msg.chat.createTime, 'MM/DD HH:mm') }}</span>
                  <ContextMenu
                    :menu="CHAT_MENU(!!checkWithLink(msg.chat.content, true))"
                    @select="(menu:Menu) => onSelectMenu(menu, msg)"
                  >
                    <div class="chat-item" @dblclick="onDblclick">
                      <div v-if="msg.chat.replyInfo?.content" class="reply-content">
                        <div class="reply-time">
                          <span class="reply-title">
                            回复
                            <span class="username">{{ msg.chat.replyInfo?.username }}</span>
                          </span>
                          <span class="user-time">
                            {{ formatDate(msg.chat.replyInfo?.createTime, 'HH:mm') }}
                          </span>
                        </div>
                        <div class="reply-text" v-html="replaceCommentContent(msg.chat.replyInfo?.content || '')" />
                      </div>
                      <div class="message-text" v-html="replaceCommentContent(msg.chat.content)" />
                    </div>
                  </ContextMenu>
                </div>
                <Image :url="loginStore.userInfo.headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
              </div>
              <div v-else :class="`message-info message-receive ${chatStore.delIds.includes(msg.id) && 'message-del'}`">
                <Image
                  :url="avatar || currentContact?.headUrl || HEAD_IMG"
                  :transition-img="HEAD_IMG"
                  class="head-img"
                />
                <div class="message" @click="onPreview(msg)">
                  <span class="send-date">{{ formatDate(msg.chat.createTime, 'MM/DD HH:mm') }}</span>
                  <ContextMenu
                    :menu="CHAT_MENU(!!checkWithLink(msg.chat.content, true))"
                    @select="(menu:Menu) => onSelectMenu(menu, msg)"
                  >
                    <div class="chat-item" @dblclick="onDblclick">
                      <div v-if="msg.chat.replyInfo?.content" class="reply-content">
                        <div class="reply-time">
                          <span class="reply-title">
                            回复
                            <span class="username">{{ msg.chat.replyInfo?.username }}</span>
                          </span>
                          <span class="user-time">
                            {{ formatDate(msg.chat.replyInfo?.createTime, 'HH:mm') }}
                          </span>
                        </div>
                        <div class="reply-text" v-html="replaceCommentContent(msg.chat.replyInfo?.content || '')" />
                      </div>
                      <div class="message-text" v-html="replaceCommentContent(msg.chat.content)" />
                    </div>
                  </ContextMenu>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <div v-if="currentContactId" class="draft-inp-wrap">
        <DraftInput ref="draftInputRef" placeholder="enter 发送消息，ctrl + enter 换行" :send-message="sendMessage">
          <template #reply>
            <div v-if="replyInfo" class="reply-info">
              <div class="reply-user-info">
                <div class="reply-user-time">
                  回复 <span class="username">{{ replyInfo?.username }}</span>
                  {{ formatDate(replyInfo?.chat?.createTime, 'HH:mm') }}
                  <i class="iconfont icon-guanbi clear-reply" @click="onClearReply" />
                </div>
                <div class="reply-content" :title="replyInfo?.chat?.content">{{ replyInfo?.chat?.content }}</div>
              </div>
            </div>
          </template>
        </DraftInput>
      </div>
      <ImagePreview
        v-model:previewVisible="previewVisible"
        :select-image="prevImg"
        :prev-imgs="prevType === 'img' ? prevImgs : undefined"
        :show-prev-and-next="prevType === 'img'"
      />
    </div>
    <div v-if="!currentContactId" class="empty-content">
      <div class="empyt">
        <Empty text="未选中或未发起私聊，快选个人畅所欲言吧" />
      </div>
    </div>
    <ElModel v-model:visible="sendVisible" title="发送消息">
      <template #content>
        <div class="model-content">
          <div class="send-info">
            <div class="title">发送给：</div>
            <div class="send-user-info drag-img-info">
              <Image :url="avatar || currentContact?.headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
              <div class="username">{{ contactName }}</div>
            </div>
          </div>
          <div class="drag-img-info">
            <Image
              :url="dragImgInfo.url || HEAD_IMG"
              :transition-img="HEAD_IMG"
              class="head-img"
              @click="onPreviewDragImg"
            />
            <div class="img-info">
              <div class="img-name">{{ dragImgInfo.name }}</div>
              <div class="img-size">{{ (dragImgInfo.size / 1024).toFixed(1) }}K</div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="btn" @click="onCancel">取消</el-button>
          <el-button class="btn" type="primary" @click="onSubmit">发送</el-button>
        </div>
      </template>
    </ElModel>
  </Loading>
</template>

<script setup lang="ts">
import { clipboard } from 'electron';
import { onMounted, ref, computed, nextTick, onUnmounted, onBeforeUnmount, Ref, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { HEAD_IMG, CONTACT_MENU, CHAT_MENU, NO_DATA_SVG } from '@/constant';
import { chatStore, loginStore, messageStore, uploadStore } from '@/store';
import { ContactItem, Menu, ChatItem, ReplyChatInfo } from '@/typings/common';
import {
  formatTimestamp,
  formatDate,
  replaceCommentContent,
  Message,
  checkWithLink,
  onDownloadFile,
  fileToBase64,
  insertContent,
} from '@/utils';
import Image from '@/components/Image/index.vue';
import ContextMenu from '@/components/ContextMenu/index.vue';

const router = useRouter();
const route = useRoute();
const { userId, username } = route?.query;

const keyword = ref<string>('');
const active = ref<string>(userId as string);
const contactName = ref<string>(username as string);
const draftInputRef = ref<any>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const messageRef = ref<HTMLElement | null>(null);
const scrollRef = ref<any>(null);
const contactScrollRef = ref<any>(null);
const hasContactScroll = ref<boolean>(false);
const hasScroll = ref<boolean>(false);
const currentContactId = ref<string>(userId as string);
const isMounted = ref<boolean>(false);
const previewVisible = ref<boolean>(false);
const prevImg = ref<{ id: number | string; url: string }>({ id: 0, url: '' });
const prevType = ref<string>('img');
const avatar = ref<string>('');
const showMore = ref<boolean>(false); // 是否显示加载更多
const showSearchList = ref<boolean>(false);
const showClear = ref<boolean>(false);
const searchName = ref<string>('');
const isDropOn = ref<boolean>(false); // 判断是否将图片拖拽到容器上面
const menuAndHeadInfo = reactive<{ mw: number; hH: number }>({ mw: 0, hH: 0 });
const sendVisible = ref<boolean>(false);
const replyInfo = ref<ChatItem | null>(null);
const dragImgInfo = reactive<{
  name: string;
  size: number;
  url: string;
  file: File;
}>({
  name: '',
  size: 0,
  url: '',
  file: {} as File,
});

let timer: ReturnType<typeof setTimeout> | null = null;

const noMore = computed(() => {
  const { chatList, total } = chatStore;
  return chatList.length >= total && chatList.length && total;
});

const noMoreContacts = computed(() => {
  const { contactList, contactTotal } = chatStore;
  return !!(contactList.length >= contactTotal && contactList.length);
});

const noMoreSearchContacts = computed(() => {
  const { searchList, searchTotal } = chatStore;
  return searchList.length >= searchTotal && searchList.length;
});

const disabled = computed(() => chatStore.searchLoading || noMoreSearchContacts.value);

// 合并原有消息与新发送的消息
const chatList = computed(() => [...chatStore.chatList, ...chatStore.addChatList]);

// 获取所有的图片资源
const prevImgs = computed(() => {
  const urls: { id: number | string; url: string }[] = [];
  chatList.value.forEach((i) => {
    const { content, createTime } = i.chat;
    const links = checkWithLink(content) as string[];
    if (links?.length) {
      urls.push({
        id: createTime,
        url: links?.[0],
      });
    }
  });
  return urls;
});

// 获取初始化选中联系人信息
const currentContact = computed(() => {
  const { contactList } = chatStore;
  return contactList.find((i) => i.contactId === currentContactId.value);
});

// 监听发送拖拽图片窗口状态，将拖拽状态设置为false
watch(sendVisible, () => {
  isDropOn.value = false;
});

// 监听预览窗口状态，将拖拽状态设置为false
watch(previewVisible, () => {
  isDropOn.value = false;
});

// 监听聊天联系人id，清除回复信息
watch(currentContactId, () => {
  replyInfo.value = null;
});

onMounted(async () => {
  // 保存当前聊天对象的userId
  chatStore.chatUserId = userId as string;
  chatStore.initIO();
  chatStore.clearChatInfo();
  // 合并缓存联系人
  await chatStore.mergeContacts();
  // 合并聊天记录
  await chatStore.mergeChats(currentContactId.value);
  // 获取聊天列表
  await loadChatList();
  scrollToBottom();
  checkScroll(scrollRef, hasScroll, contactScrollRef, hasContactScroll);
  (scrollRef.value?.wrapRef as HTMLElement)?.addEventListener('scroll', onScroll);
  setMessageReaded();
  // 如果进入聊天时，还没获取到头像，则说明当前选中的联系人还没有加载到，在后面分页中，则调用获取用户信息接口获取
  getUserInfo();
  window.addEventListener('beforeunload', onBeforeunload);
  window.addEventListener('click', onClick, true);
  // 获取左侧页面左侧菜单
  const pageMenu = document.querySelector('#__LEFT_MENU__') as HTMLDivElement;
  // 获取页面头部
  const pageHead = document.querySelector('#__HEADER__') as HTMLDivElement;
  menuAndHeadInfo.mw = pageMenu.offsetWidth;
  menuAndHeadInfo.hH = pageHead.offsetHeight;
});

onBeforeUnmount(() => {
  // 合并聊天记录
  chatStore.mergeChats(currentContactId.value);
  // 页面离开时统一删除消息
  chatStore.deleteChats();
  chatStore.deleteContacts();
});

onUnmounted(() => {
  chatStore.clearContactInfo();
  chatStore.clearSearchInfo();
  (scrollRef.value?.wrapRef as HTMLElement)?.removeEventListener('scroll', onScroll);
  window.removeEventListener('beforeunload', onBeforeunload);
  window.removeEventListener('click', onClick);
  console.clear();
});

// 页面刷新前删除选中的需要删除的联系人及消息
const onBeforeunload = (e: Event) => {
  // 合并聊天记录
  chatStore.mergeChats(currentContactId.value);
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

// 当联系人未加载时,调用接口获取用户信息,从而获取头像
const getUserInfo = async () => {
  // 如果路由没有携带username，则通过contactList找到对应的username
  if (!username) {
    const findOne = chatStore.contactList.find((i) => i.contactId === userId);
    if (findOne) {
      contactName.value = findOne?.username || '';
    } else {
      // 如果没找到，需要清除当前聊天联系人id，防止右侧消息页面不显示为选中联系人的页面提示
      currentContactId.value = '';
    }
  }
  if (((!currentContact.value?.headUrl && !avatar.value) || !contactName.value) && currentContactId.value) {
    const fromOtherUser = chatList.value?.length
      ? chatList.value.some((i) => i.chat.from !== loginStore.userInfo.userId)
      : false;
    if (fromOtherUser) {
      const res = await chatStore.getUserInfo(currentContactId.value);
      if (res?.success) {
        avatar.value = res.data?.headUrl!;
        contactName.value = res.data?.username!;
        currentContactId.value = res.data?.userId!;
      }
    }
  }
};

// 点击搜索输入框，显示搜索联系人列表，否则显示联系人列表
const onClick = async (e: MouseEvent) => {
  const id = (e.target as HTMLElement).id;
  if (id === 'SEARCH' || id === 'SEARCH_INPUT') {
    showSearchList.value = true;
    // 合并缓存联系人
    await chatStore.mergeContacts();
    return;
  }
  if (showSearchList.value) {
    chatStore.clearContactInfo();
    chatStore.clearSearchInfo();
    showSearchList.value = false;
    keyword.value = '';
    searchName.value = '';
    showClear.value = false;
  }
};

// 获取焦点时显示清除图标
const onFocus = () => {
  showClear.value = true;
};

// 搜索联系人
const onSearch = (e: KeyboardEvent) => {
  const value = (e.target as HTMLInputElement).value;
  if (value === searchName.value) return;
  searchName.value = value;
  chatStore.clearSearchInfo();
  onSearchContacts();
};

// 搜索联系人列表
const onSearchContacts = async () => {
  await chatStore.searchContacts(keyword.value.trim());
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
  const { contactId, username, noReadCount, hasUnRead } = contact;
  if (contact.contactId === currentContactId.value) return;
  isMounted.value = false;
  currentContactId.value = contactId;
  chatStore.chatUserId = contactId;
  active.value = contactId;
  contactName.value = username;
  chatStore.initIO();
  chatStore.clearChatInfo();
  // 如果有未读消息(hasUnRead为true表示开启了消息免打扰)，则将缓存中的消息合到消息列表，否则从缓存中获取数据
  if (noReadCount || hasUnRead) {
    await chatStore.mergeChats(currentContactId.value);
  } else {
    await chatStore.getCacheChats(currentContactId.value);
  }
  await loadChatList();
  scrollToBottom();
  checkScroll(scrollRef, hasScroll);
  // 统一删除消息
  await chatStore.deleteChats();
  // 切换联系人是设置推送消息为已读
  setMessageReaded();
  // 切换用户时，将拖拽状态设置为false
  isDropOn.value = false;
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

// 发送消息
const sendMessage = (content: string) => {
  const params: ReplyChatInfo = {
    to: currentContactId.value as string,
    content,
  };
  if (replyInfo.value) {
    const {
      chat: { content, createTime },
      username,
    } = replyInfo.value;
    params.replyInfo = {
      content,
      createTime,
      username: username!,
    };
  }
  chatStore.sendChatMessage(params);
  // 发送消息之后清空回复信息
  replyInfo.value = null;
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
const onPreview = (data: ChatItem) => {
  prevType.value = 'img';
  const { content, createTime } = data.chat;
  const links = checkWithLink(content);
  if (links?.[0]) {
    prevImg.value = {
      id: createTime,
      url: links?.[0],
    };
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
  clipboard.writeText(data.chat.content);
};

// 图片另存为
const onSave = (data: ChatItem) => {
  const links = checkWithLink(data.chat.content);
  if (links?.[0]) {
    onDownloadFile({ url: links?.[0] });
  }
};

// 清空回复内容
const onClearReply = () => {
  replyInfo.value = null;
};

// 回复
const onReply = (data: ChatItem) => {
  const { from } = data.chat;
  const { userId, username } = loginStore.userInfo;
  replyInfo.value = {
    ...data,
    username: from === userId ? username : contactName.value,
  };
  // 设置输入框聚焦
  draftInputRef.value?.inputRef?.focus();
};

// 选中后菜单
const onSelectMenu = (menu: Menu, data: ChatItem) => {
  const actions = {
    1: delMsg,
    2: onCopy,
    3: onSave,
    4: onReply,
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

// 移除联系人，不删除相关聊天信息
const onRemoveContact = (data: ContactItem) => {
  Message('移除后可通过该用户主页重新建立私聊', '确定移除该聊天吗').then(() => {
    chatStore.addDelContactId(data.contactId);
    if (currentContactId.value === data.contactId) {
      currentContactId.value = '';
      active.value = '';
    }
  });
};

// 删除联系人，同时删除相关聊天记录
const onDeleteContact = (data: ContactItem) => {
  Message('删除后与该用户的聊天记录也将同时删除', '确定删除该聊天吗').then(() => {
    chatStore.addDelContactId(data.contactId);
    // 删除聊天记录
    chatStore.deleteChatMesaage(data.chatId);
    if (currentContactId.value === data.contactId) {
      currentContactId.value = '';
      active.value = '';
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
    4: onDeleteContact,
    5: toPersonal,
  };
  actions[menu.value](data);
};

// 点击消息右上角消息免打扰
const onChatUnDisturb = () => {
  if (currentContact.value) {
    onUnDisturb(currentContact.value);
  }
};

// 点击消息右上角消息置顶
const onChatTop = () => {
  if (currentContact.value) {
    setMsgTop(currentContact.value);
  }
};

// 双击选中消息内容
const onDblclick = (e: MouseEvent) => {
  const element = e.target as HTMLElement;
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(range);
};

// 拖拽元素进入容器
const onDragover = (event: DragEvent) => {
  event.preventDefault();
  const { clientX, clientY } = event;
  const { offsetLeft, offsetTop, clientWidth, clientHeight } = messageRef.value as HTMLElement;
  const top = offsetTop + menuAndHeadInfo.hH;
  const bottom = top + clientHeight;
  const left = offsetLeft + menuAndHeadInfo.mw;
  const right = left + clientWidth;
  if (left < clientX && clientX < right && top < clientY && clientY < bottom) {
    isDropOn.value = true;
  } else {
    isDropOn.value = false;
  }
  // 如果显示了发送弹窗，则拖拽区域拖拽标识要去除
  if (sendVisible.value) {
    isDropOn.value = false;
  }
};

// 拖拽元素完成
const onDrop = async (event: DragEvent) => {
  event.preventDefault();
  const fileList = event.dataTransfer?.files;
  // 检查是否有拖入的文件
  if (fileList?.length! > 0) {
    const file = fileList?.[0] as File;
    dragImgInfo.name = file.name;
    dragImgInfo.size = file.size;
    dragImgInfo.file = file;
    const base64 = await fileToBase64(fileList?.[0]!);
    dragImgInfo.url = base64 as string;
    sendVisible.value = true;
  }
};

// 拖拽元素离开拖拽容器
const onDragleave = (event: DragEvent) => {
  onDragover(event);
};

// 取消发送拖拽得图片
const onCancel = () => {
  sendVisible.value = false;
};

// 发送拖拽得图片
const onSubmit = async () => {
  const fileInfo = await uploadStore.uploadFile(dragImgInfo.file);
  const content = insertContent({
    keyword: '',
    username: fileInfo?.compressFile.name,
    url: fileInfo?.filePath,
  });
  sendMessage(content);
  sendVisible.value = false;
};

// 预览拖拽图片
const onPreviewDragImg = () => {
  prevType.value = 'drag';
  prevImg.value = {
    id: new Date().valueOf(),
    url: dragImgInfo.url,
  };
  previewVisible.value = true;
};
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
    .clickNoSelectText();

    .search {
      position: relative;
      padding: 10px;

      .clear {
        position: absolute;
        top: 21px;
        right: 20px;
        color: var(--font-5);
        cursor: pointer;
      }
    }

    .friends-wrap {
      position: relative;
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

        .no-more {
          margin: 5px 0 15px;
          text-align: center;
          font-size: 14px;
          color: var(--font-5);
        }

        .empty {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-bottom: 45px;
          color: var(--font-3);
          .no-data {
            width: 60px;
            height: 60px;
            font-size: 14px;
            margin-bottom: 20px;
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

          &:hover {
            background-color: @hover-bg-color;
            .user-info {
              .title {
                color: @font-1;

                .time {
                  font-size: 12px;
                  color: @font-3;
                }
              }

              .message {
                .message-text {
                  color: @font-3;
                }

                .is-undisturb {
                  color: @font-5;
                }
              }
            }
          }

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
            width: calc(100% - 54px);
            display: flex;
            justify-content: space-between;
            flex-direction: column;

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
                .ellipsis();
              }

              .is-undisturb {
                color: var(--font-6);
                font-size: 13px;
                margin-left: 10px;
              }
            }
          }

          .search-user-info {
            display: flex;
            align-items: flex-start;
            justify-content: center;
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
              .message-text {
                color: @font-3;
              }

              .is-undisturb {
                color: @font-5;
              }
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
    .clickNoSelectText();

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
      .clickNoSelectText();

      .icon-gengduo3 {
        cursor: pointer;
      }

      .username {
        flex: 1;
        margin-right: 5px;
        .ellipsisMore(1);

        :deep {
          span {
            color: var(--font-1) !important;
          }
        }
      }

      .icon-gengduo3 {
        font-size: 18px;
        color: var(--font-1);
      }
    }

    .message-wrap {
      flex: 1;
      overflow-y: auto;
      transition: all 0.3s ease-in-out;

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
          .clickNoSelectText();

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
          .clickNoSelectText();
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
            flex-direction: column;
            .reply-content {
              padding: 5px 8px;
              color: @font-3;
              font-size: 13px;
              background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.25) 100%);
              border-top-left-radius: 4px;
              border-top-right-radius: 4px;

              .reply-time {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .reply-title {
                  .username {
                    margin-left: 5px;
                  }
                }

                .user-time {
                  margin-left: 20px;
                }
              }

              .reply-text {
                margin-top: 5px;
              }
            }

            .message-text {
              width: 100%;
              text-align: justify;
              padding: 5px 8px;
              box-sizing: border-box;
              -webkit-user-drag: none;

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
        }
      }
    }

    .on-drop {
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: -1;
        left: -1;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border: 3px dashed var(--theme-blue);
        background-color: var(--pre-hover-bg);
      }
      transition: all 0.3s ease-in-out;
    }

    .draft-inp-wrap {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      height: 160px;
      overflow: auto;
      box-sizing: border-box;
      background-color: transparent;
      border-top: 1px solid var(--border-color);

      .reply-info {
        padding: 5px;
        box-sizing: border-box;
        font-size: 14px;

        .reply-user-info {
          padding: 5px 5px 6px;
          border-radius: 5px;
          background-image: linear-gradient(to right, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
          color: @placeholder-color;
          color: var(--font-6);

          .reply-user-time {
            position: relative;
            .clear-reply {
              position: absolute;
              right: 0;
              top: 0;
              font-size: 16px;
              cursor: pointer;

              &:hover {
                color: var(--active);
              }
            }
          }

          .username {
            margin: 0 5px;
          }

          .reply-content {
            margin-top: 5px;
            .ellipsisMore(1);
          }
        }
      }

      :deep {
        .emojis {
          display: flex;
          justify-content: center;
          position: absolute;
          bottom: 36px;
          left: 0;
          margin-top: 20px;
          width: 210px;
          padding: 10px 10px 5px;
          background-color: transparent;
          border-radius: 5px;
          border: 1px solid var(--border-color);
          backdrop-filter: blur(5px);
          .clickNoSelectText();

          .emoji-item {
            text-align: center;
          }
          .emoji:nth-child(5n) {
            margin-right: 0;
          }
        }

        .emojiWrap {
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
          min-height: auto !important;
          padding: 0 5px;
          border-radius: initial;
          background-color: transparent;
          overflow: hidden;
          box-sizing: border-box;

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
      padding-right: 30px;
    }

    .el-input__inner {
      color: var(--font-1);
      background-color: transparent;
    }
  }

  .model-content {
    .drag-img-info {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      .head-img {
        width: 50px;
        height: 50px;
        border-radius: 0;
        cursor: pointer;
        .clickNoSelectText();

        :deep {
          .image-item {
            border-radius: 0;
          }
        }
      }

      .img-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 50px;
        margin-left: 10px;
        color: var(--font-1);

        .img-name {
          font-size: 16px;
          .ellipsisMore(1);
        }

        .img-size {
          font-size: 14px;
          color: var(--font-5);
        }
      }
    }

    .send-info {
      color: var(--font-1);
      .title {
        font-size: 16px;
        margin-bottom: 10px;
      }

      .send-user-info {
        margin-bottom: 35px;
        .username {
          margin-left: 10px;
          font-size: 16px;
        }
      }
    }
  }

  .dialog-footer {
    .btn {
      width: 120px;
      height: 38px;
    }
  }
}

:deep {
  .dropdown-text {
    display: block;
    text-align: center;
    color: var(--font-1);
    .clickNoSelectText();
  }
}
</style>
