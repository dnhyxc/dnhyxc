<!--
 * 退出提醒
 * @author: dnhyxc
 * @since: 2023-04-26
 * index.vue
-->
<template>
  <div class="exit-reminder-wrap">
    <div class="message">
      <div class="info">该账号已在别处登录，当前账号已被强制退出</div>
      <div class="button" @click="onQuit()">前往登录</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { loginStore } from '@/store';
import { ipcRenderers } from '@/utils';

const router = useRouter();

// 前往登录
const onQuit = () => {
  // 退出登陆前通知主进程清空缓存
  ipcRenderers.clearCache();
  loginStore.onQuit();
  loginStore.logoutStatus = false;
  router.push('/login');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.exit-reminder-wrap {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--pop-before-bg-color);
  z-index: 102;

  .message {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 350px;
    height: 220px;
    border-radius: 5px;
    margin-top: -30px;
    padding: 10px;
    box-shadow: 0 0 10px var(--shadow-mack);
    background-image: linear-gradient(to bottom, var(--timeline-lg-color1) 50%, var(--timeline-lg-color2) 100%);

    .title {
      color: var(--font-1);
      font-size: 18px;
      margin-bottom: 20px;
    }

    .info {
      margin-bottom: 50px;
      color: var(--font-1);
      text-align: center;
      font-size: 16px;
    }

    .button {
      width: 60%;
      height: 38px;
      line-height: 38px;
      text-align: center;
      box-shadow: 0 0 5px var(--shadow-mack);
      border-radius: 5px;
      cursor: pointer;
      .clickNoSelectText();
      .bgMoveColor(135deg);
      .bgKeyframes(bgmove);
    }
  }
}
</style>
