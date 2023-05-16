<!--
 * 留言墙
 * @author: dnhyxc
 * @since: 2023-05-12
 * index.vue
-->
<template>
  <Loading :loading="interactStore.interactLoading" class="barrage-wrap">
    <div class="barrage">
      <vue-danmaku
        :key="danmuKey"
        ref="danmakuRef"
        v-model:danmus="interactStore.barrageList"
        use-slot
        loop
        :speeds="60"
        :top="10"
        :right="0"
        is-suspend
        style="height: 100%; width: 100%"
      >
        <template #dm="{ danmu }">
          <div :class="`item ${danmu.userId === loginStore.userInfo?.userId && 'active'}`">
            <Image
              :url="danmu.avatar || HEAD_IMG"
              :transition-img="HEAD_IMG"
              class="avatar"
              :on-click="() => toPersonal(danmu.userId!)"
            />
            <span>{{ danmu.username }}：{{ danmu.comment }}</span>
          </div>
        </template>
      </vue-danmaku>
    </div>
    <Loading class="comments-wrap" :loading="interactStore.loading && interactStore.pageNo > 1">
      <div class="title">
        <span class="text">留言列表</span>
        <i
          :class="`font iconfont ${scrollTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
          @click="onScrollTo"
        />
      </div>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
          v-if="isMounted"
          v-infinite-scroll="onFetchData"
          :infinite-scroll-delay="300"
          :infinite-scroll-disabled="disabled"
          :infinite-scroll-distance="2"
          class="comment-list"
        >
          <div
            v-for="(danmu, index) in interactStore.interactList"
            :key="index"
            :class="`item ${danmu.userId === loginStore.userInfo?.userId && 'active'}`"
          >
            <Image
              :url="danmu.avatar || HEAD_IMG"
              :transition-img="HEAD_IMG"
              class="avatar"
              :on-click="() => toPersonal(danmu.userId!)"
            />
            <span class="comment">{{ danmu.username }}：{{ danmu.comment }}</span>
          </div>
        </div>
        <div v-if="noMore" class="no-more">没有更多了～～～</div>
        <Empty v-if="showEmpty" />
      </el-scrollbar>
      <div class="actions">
        <el-input
          v-model="keyword"
          v-focus
          size="large"
          class="el-inp"
          placeholder="留下点什么吧（回车发布）"
          clearable
          @keyup.enter="onEnter"
        />
      </div>
    </Loading>
  </Loading>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import vueDanmaku from 'vue3-danmaku';
import { loginStore, interactStore } from '@/store';
import { scrollTo } from '@/utils';
import { useScroller } from '@/hooks';
import { HEAD_IMG } from '@/constant';
import { BarrageItem } from '@/typings/common';

const router = useRouter();
const { scrollRef, scrollTop } = useScroller();

const danmakuRef = ref<typeof vueDanmaku | null>(null);
const isMounted = ref<boolean>(false);
const keyword = ref<string>('');
const danmuKey = ref<number>();
const noMore = computed(() => {
  const { interactList, total } = interactStore;
  return interactList.length >= total && interactList.length;
});
const disabled = computed(() => interactStore.loading || noMore.value);
const showEmpty = computed(
  () => interactStore.loading !== null && !interactStore.loading && !interactStore.interactList?.length,
);

onMounted(async () => {
  isMounted.value = true;
  window.addEventListener('resize', onResize, false);
  await interactStore.getInteracts();
  onFetchData();
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize, false);
  interactStore.clearInteractList();
});

// 滚动加载留言列表
const onFetchData = async () => {
  await interactStore.getInteractList();
};

// 监听页面窗口大小变化，重新计算弹幕区域大小弹幕
const onResize = () => {
  danmakuRef.value?.resize();
};

// 添加弹幕
const onEnter = async (e: InputEvent) => {
  const target = e.target as HTMLInputElement;
  if (!target.value.trim()) return;
  keyword.value = target.value;
  const params = {
    avatar: loginStore.userInfo?.headUrl,
    username: loginStore.userInfo?.username,
    userId: loginStore.userInfo?.userId,
    comment: target.value,
  };
  // 将新增的弹幕插入弹幕组件中
  danmakuRef.value?.add(params);
  // 调用创建留言的接口
  await interactStore.createInteract(target.value);
  target.value = '';
  // 向留言列表中无感知的新增留言
  interactStore.addInteract(params as BarrageItem);
};

// 去个人主页
const toPersonal = (authorId: string) => {
  router.push(`/personal?authorId=${authorId}`);
};

// 置顶
const onScrollTo = () => {
  const bottom = scrollRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  scrollTo(scrollRef, scrollTop.value > 0 ? 0 : bottom);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.barrage-wrap {
  display: flex;
  justify-content: center;
  height: 100%;
  border-radius: 5px;

  .barrage {
    flex: 1;
    box-sizing: border-box;
    border-radius: 5px;
    padding: 18px 10px 10px;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--e-form-bg-color);

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

  .comments-wrap {
    display: flex;
    flex-direction: column;
    max-width: 260px;
    width: 30%;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--e-form-bg-color);
    margin-left: 10px;
    border-radius: 5px;

    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 50px;
      padding: 0 10px;
      color: var(--font-1);

      .text {
        font-size: 18px;
        .textLg();
      }

      .font {
        font-size: 20px;
        cursor: pointer;
        .textLg();
      }
    }

    .comment-list {
      flex: 1;
      box-sizing: border-box;
      padding: 0 10px;

      .item {
        display: flex;
        justify-content: flex-start;
        color: var(--font-1);
        margin-bottom: 10px;
        font-size: 14px;

        .comment {
          flex: 1;
          background-color: var(--layer-2-2);
          padding: 5px;
          border-radius: 5px;
          word-break: break-all;
          cursor: pointer;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }

      .active {
        color: var(--h-color);
      }
    }

    .actions {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;

      .el-inp {
        border-radius: 50px;

        :deep {
          .el-input__wrapper {
            color: var(--font-1);
            background-color: var(--input-bg-color);
          }

          .el-input__inner {
            color: var(--font-1);
            background-color: transparent;
          }
        }
      }
    }
  }

  .no-more {
    padding: 20px 0 12px;
    text-align: center;
    color: @font-4;
  }
}
</style>
