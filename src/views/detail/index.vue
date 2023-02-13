<!--
 * 文章详情
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="detail-wrap">
    <div class="content">
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <Preview v-if="mackdown" :mackdown="mackdown" class="preview-content" />
      </el-scrollbar>
      <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
    </div>
    <div class="right">
      <Multibar class="action-list" />
      <Toc />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useScroller } from '@/hooks';
import { scrollTo } from '@/utils';
import Preview from '@/components/Preview/index.vue';
import Multibar from '@/components/Multibar/index.vue';
import Toc from '@/components/Toc/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';

const route = useRoute();

const mackdown = ref<string | undefined>(route.params.id as string);

// scrollRef：el-scrollbar ref，scrollTop：滚动距离
const { scrollRef, scrollTop } = useScroller();

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.detail-wrap {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  .content {
    position: relative;
    flex: 1;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    margin-right: 10px;
    .pageHeight();
    border-radius: 5px;
    box-shadow: @shadow-mack;
    :deep {
      .el-scrollbar {
        width: 100%;
        border-radius: 5px;
      }
      .scrollbar-wrapper {
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        border-radius: 5px;
      }
    }
    .preview-content {
      height: 100px;
    }
  }
  .right {
    width: 260px;
    height: calc(100vh - 62px);
    box-sizing: border-box;
    border-radius: 5px;
    .action-list {
      margin-bottom: 10px;
    }
  }
}
</style>
