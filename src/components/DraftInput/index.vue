<!--
 * 评论输入组件
 * @author: dnhyxc
 * @since: 2023-03-03
 * index.vue
-->
<template>
  <div id="DRAFT_INPUT" class="DraftInput">
    <div v-if="showAvatar" id="COMMENTS" class="comments">评论</div>
    <div id="CONTENT" class="content">
      <div v-if="showAvatar" id="AVATAR" class="avatar" @click="onJump">
        <img id="IMAGE" :src="loginStore.userInfo.headUrl || HEAD_IMG" alt="头像" class="image" />
      </div>
      <div id="INPUT" class="input">
        <div id="TEXTAREA_WRAP" class="textAreaWrap">
          <div v-if="sendMessage && (showIcon || !showAvatar)" id="EMOJI_WRAP" class="emojiWrap">
            <div id="EMOJI_LIST" class="emoji-list">
              <div id="ICONFONT" class="iconfontWrap">
                <span id="SHOW_EMOJI" class="iconfont" @click="onShowEmoji">
                  <i id="BIAOQING_XUE" class="font iconfont icon-xiaolian" />
                  <span id="BIAOQING_XUE" class="icon-text">表情</span>
                </span>
                <span id="BIAOQING_XUE" class="iconfont">
                  <Upload
                    v-model:file-path="picture"
                    :preview="false"
                    :show-img="false"
                    :need-cropper="false"
                    :fixed-number="[600, 338]"
                    :get-upload-url="getUploadUrl"
                  >
                    <i id="CHARUTUPIAN" class="font iconfont icon-tupian" />
                    <span id="CHARUTUPIAN" class="icon-text">图片</span>
                  </Upload>
                </span>
              </div>
              <Emoji v-show="showEmoji" v-model:showEmoji="showEmoji" class="emojis" :add-emoji="addEmoji" />
            </div>
          </div>
          <div class="emoji-image-wrap">
            <slot name="reply"></slot>
            <el-input
              id="TEXTAREA_WRAP"
              ref="inputRef"
              v-model="keyword"
              :autosize="{ minRows }"
              maxlength="1000"
              :resize="sendMessage && 'none'"
              type="textarea"
              :placeholder="
                selectComment?.content
                  ? `回复 ${selectComment?.content}...`
                  : placeholder || '请输入评论（Enter换行，Ctrl + Enter 发送）'
              "
              class="textArea"
              @focus="onFocus"
              @change="onCommentChange"
              @keydown.enter.native="onKeyChange"
            />
          </div>
        </div>
        <div v-if="!sendMessage && (showIcon || !showAvatar)" id="EMOJI_WRAP" class="emojiWrap">
          <div id="EMOJI_LIST" class="emoji-list">
            <div id="ICONFONT" class="iconfontWrap">
              <span id="SHOW_EMOJI" class="iconfont" @click="onShowEmoji">
                <i id="BIAOQING_XUE" class="font iconfont icon-xiaolian" />
                <span id="BIAOQING_XUE" class="icon-text">表情</span>
              </span>
              <span id="BIAOQING_XUE" class="iconfont">
                <Upload
                  v-model:file-path="picture"
                  :preview="false"
                  :show-img="false"
                  :need-cropper="false"
                  :fixed-number="[600, 338]"
                  :get-upload-url="getUploadUrl"
                >
                  <i id="CHARUTUPIAN" class="font iconfont icon-tupian" />
                  <span id="CHARUTUPIAN" class="icon-text">图片</span>
                </Upload>
              </span>
            </div>
            <Emoji v-show="showEmoji" v-model:showEmoji="showEmoji" class="emojis" :add-emoji="addEmoji" />
          </div>
          <div v-if="!sendMessage" id="ACTION">
            <el-button
              id="BTN"
              type="primary"
              link
              size="large"
              :disabled="!keyword.trim()"
              @click.stop="submitComment"
            >
              发表评论
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, watchEffect } from 'vue';
import { loginStore, articleStore } from '@/store';
import { HEAD_IMG } from '@/constant';
import { insertContent } from '@/utils';
import { CommentParams } from '@/typings/common';

interface IProps {
  articleId?: string;
  getCommentList?: Function;
  showAvatar?: boolean;
  selectComment?: CommentParams;
  isThreeTier?: boolean;
  focus?: boolean;
  onReplay?: Function;
  onJump?: Function;
  onHideInput?: Function;
  sendMessage?: Function | null;
  placeholder?: string;
  minRows?: number;
  emojiImageWrapHeight?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  focus: false,
  articleId: '',
  getCommentList: () => ({}),
  selectComment: () => ({}),
  onReplay: () => {},
  onJump: () => {},
  onHideInput: () => {},
  sendMessage: null,
  placeholder: '',
  minRows: 4,
  emojiImageWrapHeight: '95px',
});

const inputRef = ref<HTMLDivElement | null>(null);
const keyword = ref<string>('');
const showIcon = ref<boolean>(false);
const showEmoji = ref<boolean>(false);
const picture = ref<string>('');

onMounted(() => {
  nextTick(() => {
    document.body.addEventListener('click', onClickNode);
    window.addEventListener('click', onHideEmoji, true);
  });

  // 监听props.focus为true的情况，设置输入框自动获取焦点
  watchEffect(() => {
    if (props.focus) {
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  });
});

onUnmounted(() => {
  document.body.removeEventListener('click', onClickNode);
  window.removeEventListener('click', onHideEmoji, true);
});

// window点击事件，判断点击的元素是否存在id，如果不存在则隐藏相关按钮或输入框
const onClickNode = (e: any) => {
  if (!e.target.id) {
    // 隐藏回复评论的输入框
    props?.onHideInput && props?.onHideInput();
  }
};

// 点击除了SHOW_EMOJI的元素关闭表情
const onHideEmoji = (e: MouseEvent) => {
  if ((e.target as HTMLElement).id !== 'SHOW_EMOJI') {
    showEmoji.value = false;
  }
};

// 跳转
const onJump = () => {
  props.onJump && props.onJump();
};

// 输入框获取焦点
const onFocus = () => {
  showIcon.value = false;
};

// 输入框onchange事件
const onCommentChange = (word: string) => {
  keyword.value = word;
};

// 输入框键盘摁下事件
const onKeyChange = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.keyCode === 13) {
    // 如果是私聊，则 ctrl + enter 为换行，否则就是发送评论
    if (props?.sendMessage) {
      keyword.value += '\n';
    } else {
      inputRef?.value?.blur();
      submitComment();
    }
  } else {
    if (props?.sendMessage) {
      e.preventDefault();
      if (keyword.value.trim()) {
        props?.sendMessage?.(keyword.value.trim());
        keyword.value = '';
      }
    }
  }
};

// 显示表情
const onShowEmoji = () => {
  showEmoji.value = !showEmoji.value;
};

// 获取上传成功后的文件url
const getUploadUrl = (url: string, name: string) => {
  const { username } = loginStore?.userInfo;
  const value = insertContent({
    keyword: props?.sendMessage ? '' : keyword.value,
    node: (inputRef?.value as any)?.textarea,
    username: name || username,
    url,
  });
  // 私聊发送图片时，上传完毕之后，直接发送，不需要回填到输入框
  if (props?.sendMessage) {
    props?.sendMessage?.(value);
  } else {
    keyword.value = value;
  }
  inputRef.value?.focus();
};

// 添加表情
const addEmoji = (key: string) => {
  keyword.value = insertContent({ keyword: keyword.value, node: (inputRef?.value as any)?.textarea, emoji: key });
  inputRef.value?.focus();
};

// 发布评论
const submitComment = async () => {
  if (!keyword.value.trim()) return;
  if (props?.sendMessage) {
    // 发送消息
    props?.sendMessage?.(keyword.value);
    showEmoji.value = false;
    keyword.value = '';
    showIcon.value = false;
    inputRef.value?.focus();
  } else {
    // 评论接口
    const res = await articleStore?.releaseComment({
      keyword: keyword.value,
      selectComment: props?.selectComment,
      articleId: props?.articleId || '',
      isThreeTier: props?.isThreeTier,
    });
    showEmoji.value = false;
    props?.onReplay && props?.onReplay({}, true);
    keyword.value = '';
    showIcon.value = false;
    if (res?.success) {
      props?.getCommentList && props?.getCommentList();
    }
  }
};

defineExpose({
  keyword,
  inputRef,
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.DraftInput {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  height: 100%;

  :deep {
    .el-textarea__inner {
      color: var(--font-1);
      background-color: var(--input-bg-color);

      &::-webkit-input-placeholder {
        color: var(--placeholder-color);
      }
    }

    ::placeholder {
      .clickNoSelectText();
    }
  }

  .comments {
    padding-top: 20px;
    font-size: 18px;
    font-weight: 600;
  }

  .content {
    display: flex;

    .avatar {
      margin-right: 20px;
      width: 50px;
      height: 50px;

      .image {
        height: 100%;
        width: 100%;
        border-radius: 50px;
        .imgStyle();
      }
    }
  }

  .input {
    flex: 1;
    position: relative;

    .textAreaWrap {
      width: 100%;

      .textArea {
        border: none;
        border-radius: 5px;
        background-color: var(--background);

        &:focus {
          background-color: var(--fff);
        }
      }
    }

    .emoji-image-wrap {
      height: v-bind(emojiImageWrapHeight);
      overflow-y: auto;
    }

    .emojiWrap {
      display: flex;
      justify-content: space-between;
      position: relative;
      margin-top: 10px;
      width: 100%;
      .clickNoSelectText();

      .emoji-list {
        position: relative;
        display: flex;
        justify-content: flex-start;
        flex-direction: column;

        .emojis {
          margin-top: 20px;
        }
      }

      .iconfontWrap {
        display: flex;
        color: var(--font-1);

        & > span:first-child {
          margin-right: 20px;
        }
      }

      .iconfont {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 14px;

        .icon-text {
          margin-left: 5px;
        }

        &:hover {
          color: var(--active);
        }

        .icon-charutupian {
          min-width: 55px;
        }
      }

      #ACTION {
        position: absolute;
        right: 0;
      }

      .enter {
        margin-right: 15px;
        color: var(--font-3);
      }
    }
  }
}
</style>
