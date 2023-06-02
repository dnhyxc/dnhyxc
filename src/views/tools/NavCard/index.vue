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
          <el-image class="prew-img" :src="data?.iconUrl">
            <template #placeholder>
              <div class="image-slot">Loading...</div>
            </template>
            <template #error>
              <div class="image-slot">加载失败</div>
            </template>
          </el-image>
        </slot>
      </div>
      <div class="item-bottom">{{ data?.iconText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NavParams } from '@/typings/common';

interface IProps {
  data?: NavParams;
  onClick: () => void;
}

defineProps<IProps>();
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.nav-card-wrap {
  border-radius: 5px;
  box-sizing: border-box;
  width: 10%;
  padding: 5px;

  .navigation-item {
    box-shadow: 0 0 5px 0 var(--shadow-mack);
    cursor: pointer;
    overflow: hidden;
    border-radius: 5px;

    .item-top {
      padding: 5px;

      .prew-img {
        border-radius: 5px;
        display: block;
      }
    }

    .item-bottom {
      text-align: center;
      padding: 0 0 6px;
      .ellipsis();
      color: var(--font-1);
    }
  }

  &:hover {
    .navigation-item {
      box-shadow: 0 0 5px 0 var(--theme-blue);
    }
  }
}
</style>
