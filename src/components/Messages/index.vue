<!--
 * 消息列表
 * @author: dnhyxc
 * @since: 2023-04-06
 * index.vue
-->
<template>
  <Loading :loading="false" class="message-wrap">
    <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
      <div
        v-if="isMounted"
        v-infinite-scroll="onGetMsgList"
        :infinite-scroll-delay="300"
        :infinite-scroll-disabled="disabled"
        :infinite-scroll-distance="2"
        class="pullup-content"
      >
        <div class="list-wrap">
          <LineCard v-for="data in messageStore.msgList" :key="data.id" :data="data" class="line-card">
            <template #title>
              <div class="left">{{ data.title }}</div>
              <div class="right">
                <span class="del" @click.stop="onDelete(data.id!)">删除</span>
              </div>
            </template>
            <template #content>
              <div class="art-info">
                <div class="desc">
                  <span class="username">{{ data?.fromUsername }}</span>
                  <span class="action-type">{{ MESSAGE_ACTIONS[data?.action!] }}</span>
                </div>
              </div>
            </template>
          </LineCard>
        </div>
        <ToTopIcon v-if="scrollTop >= 500" class="msg-to-top" :on-scroll-to="onScrollTo" />
      </div>
      <div v-if="noMore" class="no-more">没有更多了～～～</div>
      <Empty v-if="showEmpty" />
    </el-scrollbar>
  </Loading>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { messageStore } from '@/store';
import { useScroller } from '@/hooks';
import { scrollTo } from '@/utils';
import { MESSAGE_ACTIONS } from '@/constant';

const { scrollRef, scrollTop } = useScroller();

const isMounted = ref<boolean>(false);
const noMore = computed(() => {
  const { msgList, total } = messageStore;
  return msgList.length >= total && msgList.length;
});
const disabled = computed(() => messageStore.loading || noMore.value);
const showEmpty = computed(
  () => messageStore.loading !== null && !messageStore.loading && !messageStore.msgList?.length,
);

onMounted(() => {
  isMounted.value = true;
  onGetMsgList();
});

// 获取消息列表
const onGetMsgList = () => {
  console.log('获取消息列表');
};

// 删除消息
const onDelete = (id: string) => {
  console.log(id, 'id');
};

// 置顶
const onScrollTo = (to?: number) => {
  scrollTo(scrollRef, to || 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.message-wrap {
  display: flex;
  flex-direction: column;
  height: 300px;
  overflow: auto;

  .list-wrap {
    display: flex;
    flex-direction: column;
    padding: 5px 3px;

    .left {
      font-weight: 700;
      color: @font-3;
      .ellipsisMore(1);
    }

    .right {
      display: flex;
      align-items: center;
      font-size: 14px;

      .del {
        color: @font-danger;
      }

      .del {
        &:hover {
          color: @active;
        }
      }
    }

    .line-card {
      width: 100%;
      padding: 5px;
      box-shadow: 0 0 5px @shadow-color;
      background-image: @bg-lg-2;
      margin-bottom: 10px;
      border-radius: 5px;

      :deep {
        .art-info {
          flex: 1;
          margin-right: 0;

          .desc {
            .ellipsisMore(1);
            font-size: 14px;

            .username {
              margin-right: 5px;
              color: @theme-blue;
            }
          }

          .tags {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            margin-bottom: 0;
          }
        }
      }
    }
  }

  :deep {
    .msg-to-top {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 6px;
      height: 40px;
      box-sizing: border-box;
    }
  }

  .no-more {
    text-align: center;
    color: @font-4;
    margin: 0 0 5px;
    .clickNoSelectText();
  }
}
</style>
