<!--
 * 二维码生成
 * @author: dnhyxc
 * @since: 2023-02-26
 * index.vue
-->
<template>
  <div class="Qrcode">
    <div ref="qrcodeRef" />
    <div>微信扫码分享</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import QRCode from 'qrcode';
import { WEB_DOMAIN_URL } from '@/constant';

const qrcodeRef = ref<HTMLDivElement | null>(null);

const path = window.location.href.replace(window.origin, WEB_DOMAIN_URL);

onMounted(() => {
  nextTick(() => {
    QRCode.toCanvas(
      path,
      {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 100,
        // color: {
        //   dark: '#010599FF',
        //   light: '#FFBF60FF',
        // },
      },
      (err: any, canvas: any) => {
        if (err) throw err;
        qrcodeRef.value?.appendChild(canvas);
      },
    );
  });
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.Qrcode {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
</style>
