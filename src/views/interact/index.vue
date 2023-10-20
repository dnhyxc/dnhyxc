<!--
 * 留言墙
 * @author: dnhyxc
 * @since: 2023-05-12
 * index.vue
-->
<template>
  <div class="barrage-wrap">
    <div class="barrage">
      <Barrage ref="barrageRef" />
    </div>
    <Loading class="comments-wrap" :loading="interactStore.loading && interactStore.pageNo > 1">
      <div class="title">
        <div class="text">
          留言列表
          <span v-if="loginStore.userInfo?.auth === 1" class="clear" @click.stop="onDelete()">清空</span>
        </div>
        <i
          :class="`font iconfont ${scrollTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
          @click="() => onScrollTo()"
        />
      </div>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
          v-if="isMounted"
          v-infinite-scroll="onFetchData"
          :infinite-scroll-delay="200"
          :infinite-scroll-disabled="disabled"
          :infinite-scroll-distance="1"
          class="comment-list"
        >
          <div
            v-for="danmu in interactStore.interactList"
            :key="danmu.id"
            :class="`item ${danmu.userId === loginStore.userInfo?.userId && 'active'}`"
          >
            <Image
              :url="danmu.avatar || HEAD_IMG"
              :transition-img="HEAD_IMG"
              class="avatar"
              :on-click="() => toPersonal(danmu.userId!)"
            />
            <div class="comment">
              <div class="user-info" @click="() => toPersonal(danmu.userId!)">
                <span class="username">
                  {{ danmu.username }}
                  <span v-if="authorStore.userInfo?.userId === danmu.userId" class="auth">[博主]: </span>
                </span>
                <span class="create-time">{{ formatDate(danmu.createTime!, 'YYYY/MM/DD') }}</span>
                <i
                  v-if="loginStore.userInfo?.auth === 1 || danmu.userId === loginStore.userInfo?.userId"
                  class="iconfont icon-shanchu"
                  @click.stop="onDelete(danmu)"
                />
              </div>
              <div class="comment-content">{{ danmu.comment }}</div>
            </div>
          </div>
        </div>
        <div v-if="noMore" class="no-more">共 {{ interactStore.total }} 条，没有更多了</div>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import vueDanmaku from 'vue3-danmaku';
import { loginStore, interactStore, authorStore } from '@/store';
import { scrollTo, uuid, formatDate } from '@/utils';
import { useScroller } from '@/hooks';
import { HEAD_IMG } from '@/constant';
import { BarrageItem } from '@/typings/common';
import AsyncLoading from '@/components/AsyncLoading/index.vue';
const Barrage = defineAsyncComponent({
  loader: () => import('@/components/Barrage/index.vue'),
  loadingComponent: AsyncLoading,
});

const router = useRouter();
const { scrollRef, scrollTop } = useScroller();

const barrageRef = ref<typeof vueDanmaku | null>(null);
const isMounted = ref<boolean>(false);
const keyword = ref<string>('');
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
  await interactStore.getInteracts(router);
  onFetchData();
  // 获取博主信息
  await authorStore.getUserInfo();
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
  barrageRef.value?.danmakuRef?.resize();
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
    id: uuid(),
    createTime: new Date().valueOf(),
  };
  // 将新增的弹幕插入弹幕组件中
  barrageRef.value?.danmakuRef?.add(params);
  // 调用创建留言的接口
  await interactStore.createInteract(target.value);
  target.value = '';
  interactStore.addInteract(onScrollTo);
};

// 去个人主页
const toPersonal = (authorId: string) => {
  router.push(`/personal?authorId=${authorId}`);
};

// 删除留言
const onDelete = async (item?: BarrageItem) => {
  await interactStore.delInteract(item ? item.id! : [], onScrollTo);
};

// 置顶
const onScrollTo = (to?: number, isDelete: boolean = false) => {
  const bottom = scrollRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  const height = scrollRef.value?.wrapRef?.offsetHeight || 0;
  if (isDelete) {
    scrollTo(scrollRef, scrollTop.value < height ? scrollTop.value : height);
  } else {
    scrollTo(scrollRef, to || (scrollTop.value > 0 ? 0 : bottom));
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.barrage-wrap {
  display: flex;
  justify-content: center;
  height: 100%;
  border-radius: 5px;
  padding-left: 5px;
  padding-right: 3px;
  width: calc(100% - 9px);

  .barrage {
    flex: 1;
    box-sizing: border-box;
    border-radius: 5px;
    padding: 18px 10px 10px;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--pre-hover-bg);
    margin-top: 3px;
  }

  .comments-wrap {
    display: flex;
    flex-direction: column;
    max-width: 260px;
    width: 30%;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--pre-hover-bg);
    margin-left: 10px;
    margin-top: 3px;
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

      .clear {
        margin-left: 5px;
        font-size: 16px;
        cursor: pointer;
        .textLg();

        &:hover {
          color: @font-danger;
        }
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
          display: flex;
          flex-direction: column;
          position: relative;
          flex: 1;
          background-color: var(--layer-2-2);
          padding: 5px;
          border-radius: 5px;
          word-break: break-all;

          .user-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
            color: var(--theme-blue);
            cursor: pointer;

            .username {
              .textLg();
              font-size: 13px;
              .ellipsisMore(1);
            }

            .create-time {
              font-size: 13px;
              color: var(--font-5);
            }
          }

          .icon-shanchu {
            position: absolute;
            right: 1px;
            top: 50%;
            transform: translateY(-50%);
            width: 25px;
            height: 25px;
            border-radius: 5px;
            line-height: 25px;
            text-align: center;
            color: @font-danger;
            font-size: 18px;
            background-color: var(--to-top-bg-color);
            box-shadow: 0 0 3px var(--theme-blue);
            cursor: pointer;
            display: none;
          }

          &:hover {
            .icon-shanchu {
              display: block;
            }
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
