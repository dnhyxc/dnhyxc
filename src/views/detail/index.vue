<!--
 * 文章详情
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="detail-wrap">
    <div class="content">
      <div class="article">
        <Scrollbar :show-list="false" class="scrollbar">
          <template #scroll>
            <Preview v-if="mackdown" :mackdown="mackdown" class="preview-content" />
          </template>
          <template #list></template>
        </Scrollbar>
      </div>
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
import Preview from '@/components/Preview/index.vue';
import Multibar from '@/components/Multibar/index.vue';
import Toc from '@/components/Toc/index.vue';
import Scrollbar from '@/components/Scrollbar/index.vue';

const route = useRoute();

const mackdown = ref<string | undefined>(route.params.id as string);
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.detail-wrap {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  .content {
    flex: 1;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    margin-right: 10px;
    height: calc(100vh - 62px);
    .article {
      flex: 1;
      box-sizing: border-box;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: @shadow-mack;
      .scrollbar {
        box-sizing: border-box;
        height: 100%;
      }
      .preview-content {
        max-width: 100%;
        overflow-x: auto;
        border-radius: 5px;
      }
    }
  }
  .right {
    width: 260px;

    .action-list {
      margin-bottom: 10px;
    }
  }
}
</style>
