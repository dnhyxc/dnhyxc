<template>
  <div class="container">
    <v-md-editor v-model="mackdown" :height="height" autofocus placeholder="编辑内容"></v-md-editor>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';

interface IProps {
  height?: string;
  mackdown?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  height: 'calc(100vh - 63px)',
  mackdown: '',
});

const mackdown = ref<string>('');

watchEffect(() => {
  console.log('mackdown', props.mackdown);

  if (props.mackdown) {
    mackdown.value = props.mackdown;
  }
});
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.container {
  background-color: @fff;

  :deep {

    .v-md-textarea-editor pre,
    .v-md-textarea-editor textarea {
      background-color: @fff;
    }

    .vuepress-markdown-body:not(.custom) {
      padding: 16px 20px;
    }
  }
}
</style>
