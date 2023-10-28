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
          <el-input
            id="TEXTAREA_WRAP"
            ref="inputRef"
            v-model="keyword"
            :autosize="{ minRows: 3, maxRows: 10 }"
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
          />
        </div>
        <div v-if="showIcon || !showAvatar" id="EMOJI_WRAP" class="emojiWrap">
          <div id="EMOJI_LIST" class="emoji-list">
            <div id="ICONFONT" class="iconfontWrap">
              <span id="BIAOQING_XUE" class="iconfont" @click="onShowEmoji">
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
});

const inputRef = ref<HTMLDivElement | null>(null);
const keyword = ref<string>('');
const showIcon = ref<boolean>(false);
const showEmoji = ref<boolean>(false);
const picture = ref<string>('');

onMounted(() => {
  nextTick(() => {
    document.body.addEventListener('click', onClickNode);
    window.addEventListener('keydown', onKeyDown);
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
  window.removeEventListener('keydown', onKeyDown);
});

// window点击事件，判断点击的元素是否存在id，如果不存在则隐藏相关按钮或输入框
const onClickNode = (e: any) => {
  if (!e.target.id) {
    // 隐藏回复评论的输入框
    props?.onHideInput && props?.onHideInput();
  }
};

// 监听是否是ctrl+enter组合键
const onKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.keyCode === 13) {
    inputRef?.value?.blur();
    submitComment();
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
  keyword.value = word.trim();
};

// 显示表情
const onShowEmoji = () => {
  showEmoji.value = !showEmoji.value;
};

// 获取上传成功后的文件url
const getUploadUrl = (url: string) => {
  const { username } = loginStore?.userInfo;
  keyword.value = insertContent({ keyword: keyword.value, node: (inputRef?.value as any)?.textarea, username, url });
  inputRef.value?.focus();
};

// 添加表情
const addEmoji = (key: string) => {
  keyword.value = insertContent({ keyword: keyword.value, node: (inputRef?.value as any)?.textarea, emoji: key });
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
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.DraftInput {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100%;

  :deep {
    .el-textarea__inner {
      color: var(--font-1);
      background-color: var(--input-bg-color);
    }
  }

  .comments {
    padding-top: 20px;
    font-size: 18px;
    font-weight: 600;
  }

  .content {
    display: flex;
    padding-top: 20px;

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

    .emojiWrap {
      display: flex;
      justify-content: space-between;
      position: relative;
      margin-top: 10px;
      width: 100%;

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
        color: var(--font-2);

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
