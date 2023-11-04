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
          left: pos.posX + 'px',
          top: pos.posY + 'px',
        }"
      >
        <div v-ob-size="onSizeChange" class="menu-list">
          <div v-for="item in menu" :key="item.label" class="menu-item" @click="onSelect(item)">
            {{ item.label }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref } from 'vue';
import { useContextMenu, useViewPort } from '@/hooks';

interface IProps {
  menu: { label: string; value: any }[];
  noMenu?: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits(['select']);

const containerRef = ref<HTMLElement | null>(null);
const w = ref<number>(0);
const h = ref<number>(0);

const { x, y, showMenu } = useContextMenu(containerRef as Ref<HTMLElement>, props?.noMenu);
const { vw, vh } = useViewPort();

const pos = computed(() => {
  let posX = x.value;
  let posY = y.value;

  if (x.value > vw.value - w.value) {
    posX = x.value - w.value;
  }

  if (y.value > vh.value - h.value) {
    posY = vh.value - h.value;
  }

  return {
    posX,
    posY,
  };
});

const onSelect = (item: { label: string; value: any }) => {
  // 选中菜单后关闭菜单
  showMenu.value = false;
  // 并返回选中的菜单
  emit('select', item);
};

const onSizeChange = (size: { width: number; height: number }) => {
  w.value = size.width;
  h.value = size.height;
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
    backdrop-filter: blur(3px);

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
