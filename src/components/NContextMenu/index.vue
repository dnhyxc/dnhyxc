<!--
 * 右键菜单
 * @author: dnhyxc
 * @since: 2023-10-30
 * index.vue
-->
<template>
  <div ref="containerRef">
    <slot></slot>
    <Teleport to="body">
      <div
        v-if="showMenu"
        class="context-menu"
        :style="{
          left: x + 'px',
          top: y + 'px',
        }"
      >
        <div class="menu-list">
          <div v-for="item in menu" :key="item.label" class="menu-item" @click="onSelect(item)">
            {{ item.label }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useContextMenu } from '@/hooks';

interface IProps {
  menu: { label: string; value: any }[];
}

defineProps<IProps>();

const emit = defineEmits(['select']);

const containerRef = ref<HTMLElement | null>(null);
const { x, y, showMenu } = useContextMenu(containerRef);

const onSelect = (item: { label: string; value: any }) => {
  // 选中菜单后关闭菜单
  showMenu.value = false;
  // 并返回选中的菜单
  emit('select', item);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.context-menu {
  position: fixed;
  min-width: 88px;
  background: var(--modal-bg-color);
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 0 8px 0 var(--shadow-mack);
  z-index: 999;

  .menu-list {
    padding: 5px 0;
    font-size: 13px;
    color: var(--font-1);
    border-radius: 5px;

    .menu-item {
      padding: 5px;
      height: 20px;
      line-height: 20px;
      white-space: nowrap;
      cursor: pointer;

      &:hover {
        background: var(--border-color);
        color: var(--theme-blue);
      }
    }
  }
}
</style>
