<!--
 * 导航卡片
 * @author: dnhyxc
 * @since: 2023-06-02
 * index.vue
-->
<template>
  <div class="nav-card-wrap">
    <div class="navigation-item" @click="() => onClick()">
      <div class="item-top">
        <slot>
          <Image :url="data?.toolUrl || TOOL_SVG" :transition-img="TOOL_SVG" class="prew-img" />
        </slot>
      </div>
      <div class="item-bottom" :title="data?.toolName">{{ data?.toolName }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ToolsItem } from '@/typings/common';
import { TOOL_SVG } from '@/constant';

interface IProps {
  data?: ToolsItem;
  onClick: () => void;
}

defineProps<IProps>();
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.nav-card-wrap {
  border-radius: 5px;
  box-sizing: border-box;
  width: 100%;
  padding: 5px;

  .navigation-item {
    box-shadow: 0 0 5px 0 var(--shadow-mack);
    cursor: pointer;
    overflow: hidden;
    border-radius: 5px;
    background-color: var(--pre-hover-bg);

    .item-top {
      padding: 5px;

      .prew-img {
        display: block;
        transition: all 0.3s;

        :deep {
          .image-item {
            max-height: 80px;
            border-radius: 5px;
          }
        }
      }
    }

    .item-bottom {
      text-align: center;
      padding: 0 5px 6px;
      .ellipsis();
      color: var(--font-1);
    }
  }

  &:hover {
    .navigation-item {
      box-shadow: 0 0 5px 0 var(--theme-blue);

      .prew-img {
        transform: scale(1.1);
      }
    }
  }
}
</style>
