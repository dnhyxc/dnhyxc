<!--
 * 表情组件
 * @author: dnhyxc
 * @since: 2023-04-13
 * index.vue
-->
<template>
  <div class="">
    <div v-show="visible">
      <span v-for="(value, key, index) in emojiList" :key="index" class="emoji-item" @click="addEmoji(key)">
        <img class="emoji" :src="value" :title="key" width="24px" height="24px" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { EMOJI_TEXTS } from '@/constant';
import q1 from '@/assets/gif/q1.gif';
import q2 from '@/assets/gif/q2.gif';
import q3 from '@/assets/gif/q3.gif';
import q4 from '@/assets/gif/q4.gif';
import q5 from '@/assets/gif/q5.gif';

const IMOJI_URLS = {
  1: q1,
  2: q2,
  3: q3,
  4: q4,
  5: q5,
};

interface IProps {
  showEmoji: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  showEmoji: false,
});

const emit = defineEmits(['update:showEmoji']);

const visible = computed({
  get() {
    return props.showEmoji;
  },
  set(visible: boolean) {
    emit('update:showEmoji', visible);
  },
});

// 处理表情数据
const emojiList = computed(() => {
  const result = {};
  EMOJI_TEXTS.forEach((i) => {
    const emojiName = '[' + EMOJI_TEXTS[i] + ']';
    result[emojiName] = IMOJI_URLS[i + 1];
  });
  return result;
});

// 添加表情
const addEmoji = (key: string) => {
  console.log(key, 'key');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
