<!--
 * 详情左侧操作条
 * @author: dnhyxc
 * @since: 2023-02-08
 * index.vue
-->
<template>
  <div class="multibar-wrap">
    <div class="action like-wrap" @click="likeArticle">
      <i
        :class="`like-font iconfont ${
          (articleStore?.articleDetail?.isLike || articleStore?.articleLikeStatus) && 'is-like'
        } icon-24gf-thumbsUp2`"
      />
      <span v-if="articleStore?.detailArtLikeCount > 0" class="count">
        {{
          articleStore?.detailArtLikeCount > 999
            ? `${String(articleStore?.detailArtLikeCount).slice(0, 3)}+`
            : articleStore?.detailArtLikeCount
        }}
      </span>
    </div>
    <div class="action comment-wrap" @click="toComment">
      <i class="comment-font iconfont icon-pinglun1" />
      <span v-if="commentCount > 0" class="count">
        {{ commentCount > 999 ? `${String(commentCount).slice(0, 3)}+` : commentCount }}
      </span>
    </div>
    <div class="action collect-wrap" @click="onCollect">
      <i :class="`collect-font iconfont ${collectStore?.collectStatus && 'active-collect'} icon-31shoucangxuanzhong`" />
      <span v-if="articleStore?.articleDetail?.collectCount! > 0" class="count">
        {{
          articleStore?.articleDetail?.collectCount! > 999
            ? `${String(articleStore?.articleDetail?.collectCount).slice(0, 3)}+`
            : articleStore?.articleDetail?.collectCount
        }}
      </span>
    </div>
    <el-popover
      placement="top-start"
      :width="130"
      trigger="hover"
      popper-style="min-width: 130px"
      popper-class="custom-dropdown-styles"
    >
      <template #default>
        <div class="pop-content">
          <el-popover
            placement="left-start"
            trigger="hover"
            :width="120"
            popper-style="min-width: 120px; padding: 5px;"
            popper-class="custom-dropdown-styles"
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
    <CollectModel v-model:collect-visible="collectVisible" v-model:build-visible="buildVisible" :article-id="id" />
    <AddCollectModel v-model:collect-visible="collectVisible" v-model:build-visible="buildVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { HEAD_IMG } from '@/constant';
import { shareQQ, shareSinaWeiBo, getStoreUserInfo } from '@/utils';
import { articleStore, collectStore, loginStore } from '@/store';
import { useCommentCount } from '@/hooks';
import Qrcode from '@/components/Qrcode/index.vue';
import CollectModel from '@/components/CollectModel/index.vue';
import AddCollectModel from '@/components/AddCollectModel/index.vue';

interface IProps {
  id: string;
  onScrollTo: Function;
}

const props = defineProps<IProps>();

const timer = ref<boolean>(false);

// 收藏集弹窗显隐状态
const collectVisible = ref<boolean>(false);

// 创建收藏集弹窗显隐状态
const buildVisible = ref<boolean>(false);

const commentCount = useCommentCount;

onMounted(() => {
  // 获取收藏状态
  collectStore?.getCollectStatus(props.id);
  // 从 article 页面进入时检验文章点赞状态
  articleStore.checkArticleLikeStatus(props.id);
});

// 文章点赞
const likeArticle = async () => {
  if (timer.value) return;
  timer.value = true;
  await articleStore?.likeArticle({ id: props.id });
  timer.value = false;
};

// 滚动到评论
const toComment = () => {
  props.onScrollTo();
};

// 收藏
const onCollect = () => {
  // 获取存储在硬盘store中的登录信息
  const { userInfo } = getStoreUserInfo();
  if (!loginStore?.userInfo?.userId && !userInfo?.userId) {
    return ElMessage({
      message: '请先登录后再操作哦！',
      type: 'warning',
      offset: 80,
    });
  }
  // 如果当前文章收藏状态为true，则取消收藏，否则就唤起收藏弹窗
  if (collectStore?.collectStatus) {
    collectStore?.cancelCollected(props.id);
  } else {
    collectVisible.value = true;
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.multibar-wrap {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  .action {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    border-radius: 5px;
    margin-right: 10px;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    color: var(--font-3);
    cursor: pointer;
    background-color: var(--pre-hover-bg);

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
      color: var(--active-color);

      .is-like,
      .active-collect {
        color: var(--active-color);
      }
    }

    .like-font {
      font-size: 20px;
    }

    .is-like {
      color: var(--theme-blue);
    }

    .comment-font {
      margin-top: 5px;
      font-size: 19px;
    }

    .collect-font {
      font-size: 25px;
    }

    .active-collect {
      color: var(--theme-blue);
    }

    .share-font {
      font-size: 26px;
    }
  }

  .share-wrap {
    margin-right: 0;
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
      color: var(--theme-blue);
    }

    .text {
      margin-left: 15px;
    }
  }
}
</style>
