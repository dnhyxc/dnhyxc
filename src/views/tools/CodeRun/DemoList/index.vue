<!--
 * 示例列表
 * @author: dnhyxc
 * @since: 2023-10-11
 * index.vue
-->
<template>
  <div class="container">
    <el-drawer v-model="visible" size="380" :show-close="false">
      <template #header="{ titleId, titleClass }">
        <h3 :id="titleId" :class="titleClass">示例列表</h3>
      </template>
      <div class="content">实例列表</div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface IProps {
  modelValue: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:modelValue']);

const visible = computed({
  get() {
    return props.modelValue;
  },
  set(visible: boolean) {
    emit('update:modelValue', visible);
  },
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
