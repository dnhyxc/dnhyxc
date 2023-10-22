<!--
 * 示例列表
 * @author: dnhyxc
 * @since: 2023-10-11
 * index.vue
-->
<template>
  <div class="container">
    <el-drawer v-model="visible" size="350">
      <template #header="{ titleId, titleClass }">
        <h3 :id="titleId" :class="titleClass">示例列表</h3>
      </template>
      <Loading :loading="codeStore.loading" class="content">
        <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
          <div
            v-infinite-scroll="onFetchData"
            :infinite-scroll-delay="300"
            :infinite-scroll-disabled="disabled"
            :infinite-scroll-distance="2"
          >
            <div v-for="item in codeStore.codeList" :key="item.id" class="code-item">
              <div class="header">
                <span class="title" :title="item.title">
                  {{ item.title }}
                </span>
                <div class="actions">
                  <el-button type="primary" link @click="onEdit(item.id)">编辑</el-button>
                  <el-button type="danger" link @click="onDelete(item.id)">删除</el-button>
                </div>
              </div>
              <div class="abstract">{{ item.abstract }}</div>
              <div class="code-info">
                <span class="language">{{ item.language }}</span>
                <span class="date">{{ formatDate(item.createTime) }}</span>
              </div>
            </div>
            <ToTopIcon v-if="scrollTop >= 100" :on-scroll-to="onScrollTo" />
          </div>
          <div v-if="noMore" class="no-more">没有更多了～～～</div>
          <Empty v-if="showEmpty" />
        </el-scrollbar>
      </Loading>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { codeStore } from '@/store';
import { formatDate, scrollTo, Message } from '@/utils';
import { nextTick } from 'process';

interface IProps {
  modelValue: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:modelValue']);
const scrollRef = ref<any>(null);
const scrollTop = ref<number>(0);

const visible = computed({
  get() {
    return props.modelValue;
  },
  set(visible: boolean) {
    emit('update:modelValue', visible);
  },
});

const noMore = computed(() => {
  const { codeList, total } = codeStore;
  return codeList.length >= total && codeList.length;
});
const disabled = computed(() => codeStore.loading || noMore.value);
const showEmpty = computed(() => codeStore.loading !== null && !codeStore.loading && !codeStore.codeList?.length);

onMounted(() => {
  nextTick(() => {
    scrollRef.value?.wrapRef?.addEventListener('scroll', onScroll);
  });
});

onUnmounted(() => {
  scrollRef.value?.wrapRef.removeEventListener('scroll', onScroll);
});

// 滚动事件
const onScroll = (e: any) => {
  scrollTop.value = e.target.scrollTop;
};

// 获取代码示例列表
const onFetchData = () => {
  codeStore.getCodeList();
};

// 置顶
const onScrollTo = (to?: number) => {
  scrollTo(scrollRef, to || 0);
};

// 编辑
const onEdit = (id: string) => {
  codeStore.clearCodeId();
  codeStore.getCodeById(id);
};

// 删除
const onDelete = (id: string) => {
  Message('', '确定删除该示例吗？').then(async () => {
    await codeStore.deleteCode(id);
    onScrollTo(scrollTop.value);
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.container {
  .content {
    height: 100%;

    .code-item {
      background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
      box-shadow: 0 0 5px var(--shadow-mack);
      padding: 5px 5px 5px 7px;
      border-radius: 5px;
      box-sizing: border-box;
      margin: 0 7px 10px 5px;

      &:first-child {
        margin-top: 5px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title {
          flex: 1;
          font-size: 16px;
          font-weight: 700;
          color: var(--font-1);
          .ellipsisMore(1);
        }
      }

      .abstract {
        margin: 10px 0;
        font-size: 14px;
        color: var(--font-3);
      }

      .code-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        color: var(--font-3);
        padding-right: 2px;
        box-sizing: border-box;

        .date {
          font-size: 13px;
        }
      }
    }

    .no-more {
      text-align: center;
      color: var(--font-4);
      margin: 20px 0 2px;
      .clickNoSelectText();
    }
  }

  :deep {
    .el-drawer__header {
      margin-bottom: 0;
    }

    .el-drawer__body {
      padding: 15px 15px 20px;
    }
  }
}
</style>
