<!--
 * 详情左侧操作条
 * @author: dnhyxc
 * @since: 2023-02-08
 * index.vue
-->
<template>
  <div class="multibar-wrap">
    <div class="action like-wrap" @click="likeArticle">
      <i :class="`like-font iconfont ${articleStore?.articleDetail?.isLike && 'is-like'} icon-24gf-thumbsUp2`" />
      <span v-if="articleStore?.detailArtLikeCount > 0" class="count">{{
        articleStore?.detailArtLikeCount > 999
          ? `${String(articleStore?.detailArtLikeCount).slice(0, 3)}+`
          : articleStore?.detailArtLikeCount
      }}</span>
    </div>
    <div class="action comment-wrap" @click="toComment">
      <i class="comment-font iconfont icon-pinglun1" />
      <span v-if="commentCount > 0" class="count">{{
        commentCount > 999 ? `${String(commentCount).slice(0, 3)}+` : commentCount
      }}</span>
    </div>
    <div class="action collect-wrap" @click="onCollect">
      <i class="collect-font iconfont icon-31shoucangxuanzhong" />
    </div>
    <el-popover placement="top-start" :width="130" trigger="hover" popper-style="min-width: 130px">
      <template #default>
        <div class="pop-content">
          <el-popover
            placement="left-start"
            trigger="hover"
            :width="120"
            popper-style="min-width: 120px; padding: 5px;"
          >
            <template #reference>
              <div class="pop-item">
                <i class="font iconfont icon-weixin1">
                  <span class="text">微信</span>
                </i>
              </div>
            </template>
            <Qrcode />
          </el-popover>
          <div class="pop-item" @click="shareSinaWeiBo('dnhyxc', HEAD_IMG)">
            <i class="font iconfont icon-xinlangweibo">
              <span class="text">新浪微博</span>
            </i>
          </div>
          <div class="pop-item" @click="shareQQ('dnhyxc-qq', HEAD_IMG)">
            <i class="font iconfont icon-qq">
              <span class="text">QQ</span>
            </i>
          </div>
        </div>
      </template>
      <template #reference>
        <div class="action share-wrap">
          <i class="share-font iconfont icon-tiaoguofenxiang" />
        </div>
      </template>
    </el-popover>
    <CollectModel v-model:collect-visible="collectVisible" v-model:build-visible="buildVisible" />
    <BuildCollectModel v-model:collect-visible="collectVisible" v-model:build-visible="buildVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { HEAD_IMG } from '@/constant';
import { shareQQ, shareSinaWeiBo } from '@/utils';
import { articleStore } from '@/store';
import { useCommentCount } from '@/hooks';
import Qrcode from '@/components/Qrcode/index.vue';
import CollectModel from '@/components/CollectModel/index.vue';
import BuildCollectModel from '@/components/BuildCollectModel/index.vue';

interface IProps {
  id: string;
  onScrollTo: Function;
}

const props = defineProps<IProps>();

// 收藏集弹窗显隐状态
const collectVisible = ref<boolean>(false);

// 创建收藏集弹窗显隐状态
const buildVisible = ref<boolean>(false);

const commentCount = useCommentCount;

// 文章点赞
const likeArticle = async () => {
  await articleStore?.likeArticle({ id: props.id });
};

// 滚动到评论
const toComment = () => {
  props.onScrollTo();
};

// 收藏
const onCollect = () => {
  collectVisible.value = true;
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.multibar-wrap {
  display: flex;
  justify-content: space-between;
  .action {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    border-radius: 5px;
    margin-right: 10px;
    box-shadow: @shadow-mack;
    color: @font-3;
    cursor: pointer;

    .count {
      position: absolute;
      top: 5px;
      right: 10px;
      font-size: 12px;
    }

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      color: @theme-blue;
    }

    .like-font {
      font-size: 20px;
    }

    .is-like {
      color: @theme-blue;
    }

    .comment-font {
      margin-top: 5px;
      font-size: 19px;
    }

    .collect-font {
      font-size: 25px;
    }

    .share-font {
      font-size: 26px;
    }
  }
}

.pop-content {
  .pop-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 45px;
    line-height: 45px;
    font-size: 14px;
    text-align: center;
    cursor: pointer;

    &:hover {
      color: @theme-blue;
    }

    .text {
      margin-left: 15px;
    }
  }
}
</style>
