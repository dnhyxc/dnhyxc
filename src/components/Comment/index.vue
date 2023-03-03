<!--
 * 详情评论组件
 * @author: dnhyxc
 * @since: 2023-03-03
 * index.vue
-->
<template>
  <div ref="commentRef" class="Comments">
    <div class="draftInputWrap">
      <DraftInput :get-comment-list="getCommentList" :on-jump="() => toPersonal('authorId')" :focus="false" />
    </div>
    <div v-if="comments.length > 0" class="title">
      全部评论
      <span class="replyCount">{{ getCommentCount }}</span>
    </div>
    <div v-for="i in comments" v-show="comments?.length > 0" :key="i.commentId" class="commentWrap">
      <div class="avatar" @click.stop="toPersonal(i.userId)">
        <img :src="i.headUrl || HEAD_IMG" alt="头像" class="image" />
      </div>
      <div class="commentContent">
        <div class="commentMain">
          <div class="userInfo">
            <span class="name">{{ i.username }}</span>
            <span class="date">{{ formatGapTime(i.date) }}</span>
          </div>
          <div class="desc">{{ i.content }}</div>
          <div class="action">
            <div class="actionContent">
              <div class="likeAndReplay">
                <i
                  :class="`font iconWrap iconfont ${i.isLike ? 'icon-24gf-thumbsUp2' : 'icon-24gl-thumbsUp2'} ${
                    i.isLike && 'isLike'
                  }`"
                  @click="onGiveLike(i)"
                >
                  <span class="icon-text">{{ i.likeCount! > 0 ? i.likeCount : '点赞' }}</span>
                </i>

                <i
                  id="ON_REPLAY"
                  :class="`font iconWrap iconfont icon-comment ${
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
              :show-avatar="false"
              class="draftContent"
              :select-comment="selectComment"
              :on-replay="onReplay"
              :get-comment-list="getCommentList"
              :on-hide-input="onHideInput"
            />
          </div>
        </div>
        <div v-if="i.replyList && i.replyList.length > 0" class="commentChild">
          <div v-for="j in checkReplyList(i.replyList, i.commentId!)" :key="j.commentId" class="commentChildItem">
            <div class="avatar" @click.stop="toPersonal(j.userId)">
              <img :src="j.headUrl || HEAD_IMG" alt="头像" class="image" />
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
                      :class="`font iconWrap iconfont ${j.isLike ? 'icon-24gf-thumbsUp2' : 'icon-24gl-thumbsUp2'} ${
                        j.isLike && 'isLike'
                      }`"
                      @click.stop="onGiveLike(j, true)"
                    >
                      <span class="icon-text">{{ j.likeCount! > 0 ? j.likeCount : '点赞' }}</span>
                    </i>
                    <i
                      id="ON_REPLAY"
                      :class="`font iconWrap iconfont icon-comment ${
                        selectComment?.commentId === j.commentId && 'cancelReplay'
                      }`"
                      @click="onReplay(j, selectComment?.commentId === j.commentId)"
                    >
                      <span v-if="selectComment?.commentId === j.commentId" class="cancelReplay icon-text"
                        >取消回复</span
                      >
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
                  :show-avatar="false"
                  class="draftContent"
                  :select-comment="selectComment"
                  is-three-tier
                  :on-replay="onReplay"
                  :get-comment-list="getCommentList"
                  :on-hide-input="onHideInput"
                />
              </div>
            </div>
          </div>
          <div
            v-if="checkReplyList(i.replyList, i.commentId!).length !== i.replyList.length"
            class="viewMore"
            @click.stop="onViewMoreReply(i.commentId!)"
          >
            <span class="viewText"> 查看更多（{{ i.replyList && i.replyList.length - 2 }}条）回复 </span>
            <i class="font iconWrap iconfont icon-xiajiantou" @click.stop="onViewMoreReply(i.commentId!)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watchEffect, ref, computed } from 'vue';
import { CommentParams } from '@/typings/common';
import { HEAD_IMG } from '@/constant';
import { loginStore } from '@/store';
import { formatGapTime } from '@/utils';
import DraftInput from '@/components/DraftInput/index.vue';

const dataCommom = [
  {
    articleId: '63fdab2ae2d6bf53efaa6db7',
    userId: '63e24c3be2d6bf53efaa69a9',
    username: 'dnhyxc',
    date: 1677828789164,
    content: '111',
    headUrl: HEAD_IMG,
    replyList: [
      {
        userId: '63e24c3be2d6bf53efaa69a9',
        username: 'dnhyxc',
        date: 1677828791924,
        content: 'dasda',
        likeCount: 1,
        isLike: true,
        headUrl: HEAD_IMG,
        commentId: '6401a2b6e2d6bf53efaa6ed5',
      },
      {
        userId: '63e24c3be2d6bf53efaa69a9',
        username: 'dnhyxc',
        date: 1677828795435,
        fromUserId: '63e24c3be2d6bf53efaa69a9',
        fromUsername: 'dnhyxc',
        formContent: 'dasda',
        content: 'dasda ',
        isLike: false,
        fromCommentId: '6401a2b6e2d6bf53efaa6ed5',
        headUrl: HEAD_IMG,
        commentId: '6401a2bae2d6bf53efaa6eee',
      },
    ],
    isLike: false,
    commentId: '6401a2b4e2d6bf53efaa6ecb',
  },
  {
    articleId: '63fdab2ae2d6bf53efaa6db7',
    userId: '63e24c3be2d6bf53efaa69a9',
    username: 'dnhyxc',
    date: 1677828799214,
    content: 'dasda \n',
    headUrl: HEAD_IMG,
    replyList: [
      {
        userId: '63e24c3be2d6bf53efaa69a9',
        username: 'dnhyxc',
        date: 1677828804255,
        content: 'dasdas',
        isLike: false,
        headUrl: HEAD_IMG,
        commentId: '6401a2c3e2d6bf53efaa6f15',
      },
      {
        userId: '63e24c3be2d6bf53efaa69a9',
        username: 'dnhyxc',
        date: 1677828806775,
        fromUserId: '63e24c3be2d6bf53efaa69a9',
        fromUsername: 'dnhyxc',
        formContent: 'dasdas',
        content: 'das ',
        isLike: false,
        fromCommentId: '6401a2c3e2d6bf53efaa6f15',
        headUrl: HEAD_IMG,
        commentId: '6401a2c5e2d6bf53efaa6f24',
      },
      {
        userId: '63e24c3be2d6bf53efaa69a9',
        username: 'dnhyxc',
        date: 1677828808815,
        content: 'dasdas',
        isLike: false,
        headUrl: HEAD_IMG,
        commentId: '6401a2c7e2d6bf53efaa6f34',
      },
      {
        userId: '63e24c3be2d6bf53efaa69a9',
        username: 'dnhyxc',
        date: 1677828811246,
        content: 'dasdas',
        isLike: false,
        headUrl: HEAD_IMG,
        commentId: '6401a2cae2d6bf53efaa6f45',
      },
    ],
    isLike: false,
    commentId: '6401a2bee2d6bf53efaa6efb',
  },
  {
    articleId: '63fdab2ae2d6bf53efaa6db7',
    userId: '63e24c3be2d6bf53efaa69a9',
    username: 'dnhyxc',
    date: 1677828801434,
    content: '222',
    headUrl: HEAD_IMG,
    replyList: [],
    isLike: false,
    commentId: '6401a2c0e2d6bf53efaa6f08',
  },
];

interface IProps {
  authorId: string;
  getCommentLength?: Function;
}

defineProps<IProps>();

const commentRef = ref<HTMLDivElement | null>(null);
// 评论列表
const comments = ref<CommentParams[]>(dataCommom as any);
// 选中的评论
const selectComment = ref<CommentParams>();
// 显示更多评论状态
const viewMoreComments = ref<string[]>([]);

// 初始化获取评论
const getCommentList = () => {
  console.log('获取评论列表');
};

onMounted(() => {
  watchEffect(() => {
    getCommentList();
  });
});

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
  return getCount(comments.value);
});

// 去个人主页
const toPersonal = (authorId: string) => {
  console.log(authorId, 'toPersonal');
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
const onGiveLike = async (comment: CommentParams, isThreeTier?: boolean) => {
  console.log(comment, 'comment', 'isThreeTier');

  // if (loading) return;
  // if (!getUserInfo) {
  //   setAlertStatus && setAlertStatus(true);
  //   return;
  // }
  // const params = isThreeTier
  //   ? {
  //       commentId: comment.commentId!,
  //       fromCommentId: comment.commentId!,
  //       userId: getUserInfo?.userId,
  //     }
  //   : {
  //       commentId: comment.commentId!,
  //       userId: getUserInfo?.userId,
  //     };
  // setLoading(true);
  // const res = normalizeResult<GiveLikeResult>(await Service.giveLike(params));
  // setLoading(false);
  // if (res.success) {
  //   getCommentList && getCommentList();
  // }
  // if (!res.success && res.code === 409) {
  //   setAlertStatus && setAlertStatus(true);
  // }
  // if (!res.success && res.code !== 409 && res.code !== 401) {
  //   error(res.message);
  // }
};

// 删除评论
const onDeleteComment = (comment: CommentParams, isThreeTier?: boolean) => {
  console.log(comment, 'comment', isThreeTier, 'isThreeTier');

  // const params = isThreeTier
  //   ? {
  //       commentId: comment.commentId!,
  //       fromCommentId: comment.commentId!,
  //       articleId: id,
  //     }
  //   : {
  //       commentId: comment.commentId!,
  //       articleId: id,
  //     };
  // Modal.confirm(modalConfig(params));
};

// 隐藏回复输入框
const onHideInput = () => {
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
    font-size: 18px;
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
      margin-right: 20px;

      .image {
        width: 50px;
        height: 50px;
        border-radius: 50px;
      }
    }

    .iconWrap {
      margin-right: 25px;

      &:hover {
        color: @active;
      }
      cursor: pointer;
      .clickNoSelectText();

      .icon-text {
        margin-left: 5px;
      }
    }

    .isLike {
      color: @active;
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
        margin-bottom: 10px;

        .name {
          font-size: 16px;
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

        .draftContent {
          padding-left: 0;
        }

        .cancelReplay {
          color: @active;
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
            width: 35px;
            height: 35px;

            .image {
              width: 35px;
              height: 35px;
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
