<!--
 * 文章标签
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="tag-wrap">
    <WordCloud
      :data="[
        { value: 1, name: 'Vue3' },
        { value: 2, name: 'Electron' },
        { value: 3, name: 'React' },
        { value: 4, name: 'webpack' },
        { value: 5, name: 'node' },
        { value: 6, name: 'vite' },
      ]"
      class="word-cloud-wrap"
    />
    <div class="tag-list">
      <div class="title">文章标签列表</div>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div v-for="i in 100" :key="i" class="tag">tag - {{ i }}</div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import WordCloud from '@/components/WordCloud/index.vue';
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.tag-wrap {
  display: flex;
  justify-content: flex-start;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border-radius: 5px;

  .word-cloud-wrap {
    box-sizing: border-box;
    flex: 1;
    box-shadow: @shadow-mack;
    border-radius: 5px;
  }

  .tag-list {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    margin-left: 10px;
    padding: 10px 0 10px 13px;
    width: 220px;
    box-shadow: @shadow-mack;
    border-radius: 5px;

    :deep {
      .scrollbar-wrapper {
        flex: 1;
      }
    }

    .title {
      font-size: 18px;
      color: @active;
      border-bottom: 1px solid @card-border;
      margin-right: 13px;
      margin-bottom: 6px;
      padding-bottom: 9px;
      border-radius: 5px;
      .textLg();
    }

    .tag {
      margin-right: 13px;
    }
  }
}
</style>
