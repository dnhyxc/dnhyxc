<!--
 * 详情左侧操作条
 * @author: dnhyxc
 * @since: 2023-02-08
 * index.vue
-->
<template>
  <div class="multibar-wrap">
    <div class="action like-wrap">
      <i class="like-font iconfont icon-24gf-thumbsUp2" />
    </div>
    <div class="action comment-wrap" @click="toComment">
      <i class="comment-font iconfont icon-pinglun1" />
    </div>
    <div class="action collect-wrap">
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
  </div>
</template>

<script setup lang="ts">
import { HEAD_IMG } from '@/constant';
import { shareQQ, shareSinaWeiBo } from '@/utils';
import Qrcode from '@/components/Qrcode/index.vue';

interface IProps {
  onScrollTo: Function;
}

const props = defineProps<IProps>();

// 滚动到评论
const toComment = () => {
  props.onScrollTo();
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.multibar-wrap {
  display: flex;
  justify-content: space-between;
  .action {
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

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      color: @theme-blue;
    }

    .like-font {
      font-size: 20px;
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
