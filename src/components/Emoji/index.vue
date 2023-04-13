<!--
 * 表情组件
 * @author: dnhyxc
 * @since: 2023-04-13
 * index.vue
-->
<template>
  <div class="emoji-wrap">
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
import azhe from '@/assets/gif/azhe.gif'; // 啊这
import baiyan from '@/assets/gif/baiyan.gif'; // 白眼
import bishi from '@/assets/gif/bishi.gif'; // 鄙视
import dabing from '@/assets/gif/dabing.gif'; // 大兵
import fannao from '@/assets/gif/fannao.gif'; // 烦恼
import fendou from '@/assets/gif/fendou.gif'; // 奋斗
import haixiu from '@/assets/gif/haixiu.gif';  // 害羞
import guzhang from '@/assets/gif/guzhang.gif';  // 鼓掌
import haose from '@/assets/gif/haose.gif'; // 好色
import huaixiao from '@/assets/gif/huaixiao.gif'; // 坏笑
import huaji from '@/assets/gif/huaji.gif'; // 滑稽
import kelian from '@/assets/gif/kelian.gif'; // 可怜
import ku from '@/assets/gif/ku.gif'; // 哭
import kun from '@/assets/gif/kun.gif'; // 困
import kuxiao from '@/assets/gif/kuxiao.gif'; // 哭笑
import liulei from '@/assets/gif/liulei.gif'; // 流泪
import shengqi from '@/assets/gif/shengqi.gif'; // 生气
import shuai from '@/assets/gif/shuai.gif'; // 衰
import tushe from '@/assets/gif/tushe.gif'; // 吐舌
import tuxie from '@/assets/gif/tuxie.gif'; // 吐血
import wabi from '@/assets/gif/wabi.gif'; // 挖鼻
import weiqu from '@/assets/gif/weiqu.gif'; // 委屈
import weixiao from '@/assets/gif/weixiao.gif'; // 微笑
import wuzui from '@/assets/gif/wuzui.gif'; // 捂嘴
import xia from '@/assets/gif/xia.gif'; // 吓
import yun from '@/assets/gif/yun.gif'; // 晕
import zaijian from '@/assets/gif/zaijian.gif'; // 再见
import zhayan from '@/assets/gif/zhayan.gif'; // 眨眼
import zhoumei from '@/assets/gif/zhoumei.gif'; // 皱眉
import ziya from '@/assets/gif/ziya.gif'; // 龇牙

const IMOJI_URLS = {
  1: azhe,
  2: baiyan,
  3: bishi,
  4: dabing,
  5: fannao,
  6: fendou,
  7: haixiu,
  8: guzhang,
  9: haose,
  10: huaixiao,
  11: huaji,
  12: kelian,
  13: ku,
  14: kun,
  15: kuxiao,
  16: liulei,
  17: shengqi,
  18: shuai,
  19: tushe,
  20: tuxie,
  21: wabi,
  22: weiqu,
  23: weixiao,
  24: wuzui,
  25: xia,
  26: yun,
  27: zaijian,
  28: zhayan,
  29: zhoumei,
  30: ziya,
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
  EMOJI_TEXTS.forEach((i, index) => {
    console.log(i, index + 1);

    result[`[${i}]`] = IMOJI_URLS[index + 1];
  });

  console.log(result, '>>>>', IMOJI_URLS[5]);

  return result;
});

// 添加表情
const addEmoji = (key: string) => {
  console.log(key, 'key');
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
