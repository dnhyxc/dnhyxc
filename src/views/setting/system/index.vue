<!--
 * 系统设置
 * @author: dnhyxc
 * @since: 2023-02-22
 * index.vue
-->
<template>
  <div class="system-wrap">
    <div class="content">
      <div class="shortcuts">
        <div class="label">快捷键</div>
        <div v-for="item in STSTEM_CONFIG.shortcut" :key="item.value" class="item">{{ item.label }}</div>
      </div>
      <div class="file-config">
        <div class="label">文件存储</div>
        <div v-for="item in STSTEM_CONFIG.fileConfig" :key="item.label" class="item">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STSTEM_CONFIG } from '@/constant';
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
