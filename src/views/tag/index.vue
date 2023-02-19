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
      :callback="onCheckTag"
    />
    <div class="tag-list">
      <div class="title">
        <span>文章标签列表</span>
        <i
          :class="`font iconfont ${scrollTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
          @click="onScrollTo"
        />
      </div>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
          v-for="i in [
            { value: 1, name: 'Vue3' },
            { value: 2, name: 'Electron' },
            { value: 3, name: 'React' },
            { value: 4, name: 'webpack' },
            { value: 5, name: 'node' },
            { value: 6, name: 'vite' },
          ]"
          :key="i.name"
          :class="`${currentTag === i.name && 'active'} tag`"
          @click="onCheckTag(i.name)"
        >
          tag - {{ i.name }}
        </div>
      </el-scrollbar>
    </div>
  </div>
  <RouterView />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { scrollTo } from '@/utils';
import { useScroller } from '@/hooks';
import WordCloud from '@/components/WordCloud/index.vue';

const router = useRouter();
const { scrollRef, scrollTop } = useScroller();

const currentTag = ref<string>();

// 滚动到某位置
const onScrollTo = () => {
  const bottom = scrollRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  scrollTo(scrollRef, scrollTop.value > 0 ? 0 : bottom);
};

// 选中标签
const onCheckTag = (tag: string) => {
  console.log(tag, 'tag');

  currentTag.value = tag;

  router.push(`/tag/list?tag=${tag}`);
};
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
    padding: 10px 0;
    width: 220px;
    box-shadow: @shadow-mack;
    border-radius: 5px;

    :deep {
      .scrollbar-wrapper {
        flex: 1;
      }
    }

    .title {
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      color: @active;
      border-bottom: 1px solid @card-border;
      margin-left: 13px;
      margin-right: 13px;
      margin-bottom: 6px;
      padding-bottom: 9px;
      border-radius: 5px;
      .textLg();

      .font {
        font-size: 18px;
        cursor: pointer;
      }
    }

    .tag {
      position: relative;
      margin-right: 13px;
      padding: 3px 0 3px 13px;
      cursor: pointer;

      &:hover {
        color: @active;
      }
    }

    .active {
      color: @active;
      &::before {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        content: '';
        width: 4px;
        height: 60%;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        background-color: @active;
      }
    }
  }
}
</style>
