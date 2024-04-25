<!--
 * 表情组件
 * @author: dnhyxc
 * @since: 2023-04-13
 * index.vue
-->
<template>
  <div id="EMOJI" class="emoji-wrap">
    <div v-if="visible" id="_EMOJI_">
      <div
        v-for="value in EMOJI_NAME"
        id="EMOJI_ITEM"
        :key="value"
        class="emoji-item"
        @click="addEmoji(value)"
      >
        <img :id="value" :src="EMOJI_HOST + EMOJI_MAP[value]" class="emoji" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { EMOJI_HOST, EMOJI_MAP, EMOJI_NAME } from '@/constant';

interface IProps {
  showEmoji: boolean;
  addEmoji: (value: string) => void;
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

// 添加表情
const addEmoji = (key: string) => {
  props.addEmoji?.(key);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.emoji-wrap {
  .emoji-item {
    display: inline-block;
    height: 35px;
    width: 35px;

    .emoji {
      height: auto;
      width: 30px;
      cursor: pointer;
    }
  }
}
</style>
