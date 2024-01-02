<!--
 * 书籍列表
 * @author: dnhyxc
 * @since: 2024-01-01
 * index.vue
-->
<template>
  <div class="book-list-wrap">
    <el-drawer v-model="visible" size="350" :before-close="onClose">
      <template #header="{ titleId, titleClass }">
        <h3 :id="titleId" :class="titleClass">书籍列表</h3>
      </template>
      <Loading :loading="bookStore.loading" class="content">
        <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
          <div
            v-infinite-scroll="onGetBookList"
            :infinite-scroll-delay="300"
            :infinite-scroll-disabled="disabled"
            :infinite-scroll-distance="2"
            class="pullup-content"
          >
            <div class="list-wrap">
              <LineCard
                v-for="data in bookStore.bookList"
                :key="data.id"
                :data="data"
                :class="`line-card ${false && 'active-line-card'}`"
                :to-edit="onRead"
              >
                <template #title>
                  <div class="left" :title="data.fileName">{{ data.fileName }}</div>
                  <div class="right">
                    <span class="edit" @click.stop="toEdit(data.id!)">编辑</span>
                    <span class="del" @click.stop="onReomve(data.id!)">删除</span>
                  </div>
                </template>
                <template #content>
                  <div class="art-info">
                    <div class="desc">添加时间：{{ formatDate(data.createTime, 'YYYY-DD-MM') }}</div>
                    <div class="desc">书籍大小：{{ (data.size / 1024 / 1024).toFixed(2) }} MB</div>
                    <div v-if="data.type" class="desc">书籍类型：{{ data.type.split('/')[1] }}</div>
                  </div>
                </template>
              </LineCard>
            </div>
            <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
          </div>
          <div v-if="noMore" class="no-more">没有更多了～～～</div>
          <Empty v-if="showEmpty" />
        </el-scrollbar>
      </Loading>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onUnmounted } from 'vue';
import { bookStore } from '@/store';
import { scrollTo, Message, formatDate } from '@/utils';
import Loading from '@/components/Loading/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';
import Empty from '@/components/Empty/index.vue';

interface IProps {
  visible: boolean;
  readBook: (data: any) => void;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:visible']);

// const isMounted = ref<boolean>(false);
const scrollRef = ref<any>(null);
const scrollTop = ref<number>(0);

const visible = computed({
  get() {
    return props.visible;
  },
  set(visible: boolean) {
    emit('update:visible', visible);
  },
});

const noMore = computed(() => {
  const { bookList, total } = bookStore;
  return bookList.length >= total && bookList.length;
});
const disabled = computed(() => bookStore.loading || noMore.value);
const showEmpty = computed(() => bookStore.loading !== null && !bookStore.loading && !bookStore.bookList?.length);

// 滚动事件
const onScroll = (e: any) => {
  scrollTop.value = e.target.scrollTop;
};

// 监听弹窗显示状态，实时拉取草稿列表
watch(
  () => visible.value,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        scrollRef.value?.wrapRef?.addEventListener('scroll', onScroll);
      });
      bookStore.clearBookInfo();
      onGetBookList();
    } else {
      scrollRef.value?.wrapRef.removeEventListener('scroll', onScroll);
    }
  },
);

onUnmounted(() => {
  scrollRef.value?.wrapRef.removeEventListener('scroll', onScroll);
});

// 获取草稿列表
const onGetBookList = () => {
  bookStore.getBookList();
};

// 阅读
const onRead = (url: string, data: any) => {
  props.readBook && props.readBook(data);
};

// 编辑书名
const toEdit = (id: string) => {
  console.log(id, '编辑书名');
};

// 删除
const onReomve = (id: string) => {
  Message('', '确定删除该书籍吗？').then(async () => {
    await bookStore.deleteBook({ id });
    // 删除之后，自动跳转到原来所在位置
    onScrollTo(scrollTop.value);
  });
};

const onClose = () => {
  emit('update:visible', false);
};

// 置顶
const onScrollTo = (to?: number) => {
  scrollTo(scrollRef, to || 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.book-list-wrap {
  :deep {
    .el-drawer__header {
      position: relative;
      margin-bottom: 0;
      padding: 20px 12px 0 24px;
    }

    .el-drawer__body {
      padding: 16px 18px 20px;
    }
  }
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: 16px;
    margin-bottom: 10px;
    color: var(--font-1);

    .left {
      flex: 1;
      font-weight: 700;
      margin-right: 10px;
      .ellipsisMore(1);
    }

    .right {
      display: flex;
      align-items: center;
      font-size: 14px;

      .edit {
        color: var(--theme-blue);
      }

      .del {
        color: @font-danger;
        margin-left: 10px;
      }

      .edit,
      .del {
        &:hover {
          color: @active;
        }
      }
    }
  }

  .content {
    position: relative;
    height: 100%;

    .list-wrap {
      padding: 5px 0;

      .line-card {
        padding: 10px 10px;
        box-shadow: 0 0 5px var(--shadow-mack);
        background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
        border-radius: 5px;
        margin: 0 5px 10px 5px;

        :deep {
          .art-info {
            flex: 1;
            margin-right: 0;

            .desc {
              .ellipsisMore(1);
              margin-bottom: 10px;
              font-size: 14px;
              color: var(--font-5);

              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          box-shadow: 0 0 5px var(--el-color-primary-light-5);
        }
      }

      .active-line-card {
        box-shadow: 0 0 5px var(--active);
      }
    }
  }

  .no-more {
    text-align: center;
    color: var(--font-4);
    margin: 15px 0 6px;
    .clickNoSelectText();
  }
}
</style>
