<!--
 * 详情评论组件
 * @author: dnhyxc
 * @since: 2023-03-03
 * index.vue
-->
<template>
  <div ref="commentsRef" class="Comments">
    <div class="draftInputWrap">
      <DraftInput :get-comment-list="getCommentList" :focus="focus" :article-id="id" :on-hide-input="onHideInput" />
    </div>
    <div v-if="articleStore?.commentList?.length > 0" class="title">
      全部评论
      <span class="replyCount">{{ getCommentCount }}</span>
    </div>
    <div
      v-for="i in articleStore?.commentList"
      v-show="articleStore?.commentList?.length > 0"
      :key="i.commentId"
      class="commentWrap"
    >
      <div class="avatar" @click.stop="toPersonal(i?.userId!)">
        <Image :url="i.headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="image" />
      </div>
      <div class="commentContent">
        <div class="commentMain">
          <div class="userInfo">
            <span class="name">{{ i.username }}</span>
            <span class="date">{{ formatGapTime(i?.date!) }}</span>
          </div>
          <div class="desc">{{ i.content }}</div>
          <div class="action">
            <div class="actionContent">
              <div class="likeAndReplay">
                <i
                  :class="`font iconWrap iconfont ${i.isLike ? 'is-like icon-24gf-thumbsUp2' : 'icon-24gl-thumbsUp2'}`"
                  @click="onGiveLike(i)"
                >
                  <span class="icon-text">{{ i.likeCount! > 0 ? i.likeCount : '点赞' }}</span>
                </i>

                <i
                  id="ON_REPLAY"
                  :class="`font iconWrap iconfont icon-pinglun ${
                    selectComment?.commentId === i.commentId && 'cancelReplay'
                  }`"
                  @click="onReplay(i, selectComment?.commentId === i.commentId)"
                >
                  <span v-if="selectComment?.commentId === i.commentId" class="cancelReplay icon-text">取消回复</span>
                  <span v-else id="ON_REPLAY" class="icon-text">{{ i.replyList?.length || '回复' }}</span>
                </i>
              </div>
              <el-button
                v-if="loginStore?.userInfo.userId === i.userId"
                type="primary"
                link
                class="deleteComment"
                @click="onDeleteComment(i)"
              >
                删除
              </el-button>
            </div>
            <DraftInput
              v-if="selectComment?.commentId === i.commentId"
              :focus="selectComment?.commentId === i.commentId"
              :show-avatar="false"
              class="draftContent"
              :select-comment="selectComment"
              :on-replay="onReplay"
              :get-comment-list="getCommentList"
              :on-hide-input="onHideInput"
              :article-id="id"
            />
          </div>
        </div>
        <div v-if="i.replyList && i.replyList.length > 0" class="commentChild">
          <div v-for="j in checkReplyList(i.replyList, i.commentId!)" :key="j.commentId" class="commentChildItem">
            <div class="avatar" @click.stop="toPersonal(j?.userId!)">
              <Image :url="j.headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="image" />
            </div>
            <div class="commentChildItemContent">
              <div class="userInfo">
                <span class="name">
                  <span>{{ j.username }}</span>
                  <span v-if="j.userId === authorId" class="isAuthor">(作者)</span>
                  <span v-if="j.fromUsername" class="replyInfo">
                    回复
                    <span class="fromUsername">{{ j.fromUsername }}</span>
                  </span>
                </span>
                <span class="date">{{ j.date && formatGapTime(j.date) }}</span>
              </div>
              <div v-if="j.content" class="desc">{{ j.content }}</div>
              <div v-if="j.formContent" class="formContent">{{ `“${j.formContent}”` }}</div>
              <div id="ON_REPLAY" class="action">
                <div class="actionContent">
                  <div class="likeAndReplay">
                    <i
                      :class="`font iconWrap iconfont ${
                        j.isLike ? 'is-like icon-24gf-thumbsUp2' : 'icon-24gl-thumbsUp2'
                      }`"
                      @click.stop="onGiveLike(j, true)"
                    >
                      <span class="icon-text">{{ j.likeCount! > 0 ? j.likeCount : '点赞' }}</span>
                    </i>
                    <i
                      id="ON_REPLAY"
                      :class="`font iconWrap iconfont icon-pinglun ${
                        selectComment?.commentId === j.commentId && 'cancelReplay'
                      }`"
                      @click="onReplay(j, selectComment?.commentId === j.commentId)"
                    >
                      <span v-if="selectComment?.commentId === j.commentId" class="cancelReplay icon-text">
                        取消回复
                      </span>
                      <span v-else id="ON_REPLAY" class="icon-text">{{ j.replyList?.length || '回复' }}</span>
                    </i>
                  </div>
                  <el-button
                    v-if="loginStore?.userInfo.userId === j.userId"
                    type="primary"
                    link
                    class="deleteComment"
                    @click="onDeleteComment(j, true)"
                  >
                    删除
                  </el-button>
                </div>
                <DraftInput
                  v-if="selectComment?.commentId === j.commentId"
                  :focus="selectComment?.commentId === j.commentId"
                  :show-avatar="false"
                  class="draftContent"
                  :select-comment="selectComment"
                  is-three-tier
                  :on-replay="onReplay"
                  :get-comment-list="getCommentList"
                  :on-hide-input="onHideInput"
                  :article-id="id"
                />
              </div>
            </div>
          </div>
          <div
            v-if="checkReplyList(i.replyList, i.commentId!).length !== i.replyList.length"
            class="viewMore"
            @click.stop="onViewMoreReply(i.commentId!)"
          >
            <span class="viewText">查看更多（{{ i.replyList && i.replyList.length - 2 }}条）回复</span>
            <i class="font iconWrap iconfont icon-xiajiantou" @click.stop="onViewMoreReply(i.commentId!)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { CommentParams } from '@/typings/common';
import { HEAD_IMG } from '@/constant';
import { loginStore, articleStore } from '@/store';
import { formatGapTime } from '@/utils';
import Image from '@/components/Image/index.vue';
import DraftInput from '@/components/DraftInput/index.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

interface IProps {
  id: string;
  authorId: string;
  getCommentLength?: Function;
  focus?: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits(['updateFocus']);

// 选中的评论
const selectComment = ref<CommentParams>();
// 显示更多评论状态
const viewMoreComments = ref<string[]>([]);

const commentsRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  getCommentList();
});

// 初始化获取评论
const getCommentList = () => {
  if (!props.id) return ElMessage.error('文章不翼而飞了，评论也随之不知所踪');
  articleStore.getCommentList(props.id);
};

// 计算评论数
const getCount = (comments: CommentParams[]) => {
  let count = 0;
  comments.forEach((i) => {
    const length: number = i.replyList?.length || 0;
    count += length + 1;
  });
  return count;
};

// 计算评论数
const getCommentCount = computed(() => {
  return getCount(articleStore?.commentList);
});

// 去个人主页
const toPersonal = (authorId: string) => {
  router.push(`/personal?authorId=${authorId}`);
};

// 点击回复按钮事件
const onReplay = (comment: CommentParams, status: boolean) => {
  if (status) {
    selectComment.value = {} as CommentParams;
  } else {
    selectComment.value = comment;
  }
};

// 点赞接口
const onGiveLike = (comment: CommentParams, isThreeTier?: boolean) => {
  if (articleStore?.likeLoading) return;
  articleStore?.onGiveLikeToComment({
    isThreeTier,
    commentId: comment?.commentId!,
    getCommentList,
  });
};

// 删除评论
const onDeleteComment = (comment: CommentParams, isThreeTier?: boolean) => {
  articleStore?.deleteComment({ comment, articleId: props?.id, isThreeTier, getCommentList });
};

// 隐藏回复输入框
const onHideInput = () => {
  emit('updateFocus', false);
  selectComment.value = {} as CommentParams;
};

// 判断viewMoreComments是否包含commentId，以此返回对应的replyList
const checkReplyList = (replyList: CommentParams[], commentId: string) => {
  if (viewMoreComments.value.includes(commentId)) {
    return replyList;
  }
  return replyList.slice(0, 2);
};

// 收集可以查看全部的commentId
const onViewMoreReply = (commentId: string) => {
  viewMoreComments.value = [...viewMoreComments.value, commentId];
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.Comments {
  padding: 0 20px 20px 20px;
  border-radius: 5px;

  .draftInputWrap {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .title {
    font-size: 20px;
    font-weight: 600;
    padding: 40px 20px 0 0;
  }

  .replyCount {
    margin-left: 5px;
  }

  .commentWrap {
    display: flex;
    justify-content: space-between;
    padding-top: 30px;

    .avatar {
      margin-right: 15px;

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
    }

    .iconWrap {
      margin-right: 25px;
      font-size: 15px;

      &:hover {
        color: @theme-blue;
      }
      cursor: pointer;
      .clickNoSelectText();

      .icon-text {
        margin-left: 5px;
      }
    }

    .is-like {
      color: @theme-blue;
    }

    .commentContent {
      flex: 1;

      .commentMain {
        &:hover {
          .deleteComment {
            display: block;
          }
        }
      }

      .userInfo {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;

        .name {
          font-size: 17px;
          font-weight: 600;

          .isAuthor {
            margin-left: 10px;
            font-weight: 400;
            font-size: 14px;
          }

          .replyInfo {
            font-weight: 400;
            font-size: 14px;
            margin-left: 10px;

            .fromUsername {
              font-size: 16px;
              margin-left: 10px;
              font-weight: 600;
            }
          }
        }

        .date {
          color: @font-4;
        }
      }

      .formContent {
        margin-top: 10px;
        border: 1px solid @layer-3-border;
        padding: 5px 20px 6px 20px;
        background-color: @background;
        border-radius: 5px;
      }

      .deleteComment {
        display: none;
        padding: 0;
      }

      .action {
        margin-top: 10px;

        .actionContent {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .likeAndReplay {
            display: flex;
            align-items: center;
            height: 32px;
            line-height: 32px;
          }
        }

        .deleteComment {
          color: @font-danger;
        }

        .draftContent {
          padding-left: 0;
        }

        .cancelReplay {
          color: @theme-blue;
        }
      }

      .commentChild {
        background-color: @layer-2-2;
        margin-top: 15px;
        padding: 15px;
        border-radius: 5px;

        .commentChildItem {
          display: flex;
          margin-bottom: 20px;

          .commentChildItemContent {
            width: 100%;

            &:hover {
              .deleteComment {
                display: block;
              }
            }
          }

          .avatar {
            width: 45px;
            height: 45px;

            .image {
              width: 45px;
              height: 45px;
            }
          }

          &:last-child {
            margin-bottom: 0;
          }
        }

        .viewMore {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          cursor: pointer;
          font-size: 14px;
          .clickNoSelectText();

          .viewText {
            margin-right: 5px;
            padding-left: 55px;
          }
        }
      }
    }
  }
}
</style>
