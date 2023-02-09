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
    <div class="action comment-wrap">
      <i class="comment-font iconfont icon-pinglun1" />
    </div>
    <div class="action collect-wrap">
      <i class="collect-font iconfont icon-31shoucangxuanzhong" />
    </div>
    <el-popover placement="right" title="Title" :width="200" trigger="hover">
      <template #default>
        <div class="content">
          <div class="wechart">
            <i class="wechart iconfont" />
            微信
          </div>
          <div class="wechart">
            <i class="wechart iconfont" />
            微信
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

<script setup lang="ts"></script>

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
</style>
