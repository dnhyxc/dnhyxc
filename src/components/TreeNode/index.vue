<!--
 * 树形递归组件
 * @author: dnhyxc
 * @since: 2023-12-28
 * index.vue
-->
<template>
  <div v-for="node in nodeList" :key="node.id" class="parent-wrap">
    <div :id="node.id" :class="`title ${node.id === defaultSelectedTocId && 'active'}`" @click="onSelected(node)">
      {{ node[titleName] }}
    </div>
    <div v-show="node[childrenName]" class="sub-wrap">
      <TreeNode :node-list="node[childrenName]" :on-selected="onSelected" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookTocItem, BookTocList } from '@/typings/common';

interface IProps {
  nodeList: BookTocList[];
  onSelected: (node: BookTocItem) => void;
  defaultSelectedTocId?: string;
  titleName?: string;
  childrenName?: string;
}

withDefaults(defineProps<IProps>(), {
  defaultSelectedTocId: '',
  titleName: 'label',
  childrenName: 'subitems',
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.parent-wrap {
  .sub-wrap {
    text-indent: 14px;
  }

  .title {
    height: 30px;
    line-height: 30px;
    padding: 0 5px;
    .ellipsisMore(1);
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary-light-5);
    }
  }

  .active {
    color: var(--theme-blue);
  }
}
</style>
