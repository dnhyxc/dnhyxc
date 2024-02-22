<!--
 * 弹幕
 * @author: dnhyxc
 * @since: 2023-05-18
 * index.vue
-->
<template>
  <vue-danmaku
    ref="danmakuRef"
    v-model:danmus="interactStore.barrageList"
    use-slot
    :loop="loop"
    :speeds="speeds"
    :top="top"
    :right="right"
    :is-suspend="isSuspend"
    :style="style"
  >
    <template #dm="{ danmu }">
      <div :class="`item ${danmu.userId === loginStore.userInfo?.userId && 'active'}`">
        <Image
          :url="danmu.avatar || HEAD_IMG"
          :transition-img="HEAD_IMG"
          class="avatar"
          :on-click="() => toPersonal(danmu.userId!)"
        />
        <span class="comment">
          <span v-if="authorStore.userInfo?.userId === danmu.userId" class="auth">[博主]: </span>
          {{ danmu.comment }}
        </span>
      </div>
    </template>
  </vue-danmaku>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import vueDanmaku from 'vue3-danmaku';
import { loginStore, interactStore, authorStore } from '@/store';
import { HEAD_IMG } from '@/constant';

interface IProps {
  loop?: boolean;
  speeds?: number;
  top?: number;
  right?: number;
  isSuspend?: boolean;
  style?: any;
}

withDefaults(defineProps<IProps>(), {
  loop: true,
  speeds: 60,
  top: 10,
  right: 0,
  isSuspend: true,
  style: 'height: 100%; width: 100%',
});

const router = useRouter();

const danmakuRef = ref<typeof vueDanmaku | null>(null);

// 去个人主页
const toPersonal = (authorId: string) => {
  router.push(`/personal?authorId=${authorId}`);
};

defineExpose({
  danmakuRef,
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  color: var(--font-1);
}

.active {
  color: var(--h-color);
}

.avatar {
  width: 28px;
  height: 28px;
  min-width: 28px;
  margin-right: 5px;
  cursor: pointer;

  :deep {
    .image-item {
      border-radius: 28px;
    }
  }
}

.comment {
  display: flex;
  align-items: center;
  font-size: 15px;

  .auth {
    color: @font-warning;
  }
}
</style>
