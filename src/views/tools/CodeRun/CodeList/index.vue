<!--
 * 示例列表
 * @author: dnhyxc
 * @since: 2023-10-11
 * index.vue
-->
<template>
  <div class="container">
    <el-drawer v-model="visible" title="示例列表" size="380">
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
            class="pullup-content"
          >
            <div v-for="item in codeStore.codeList" :key="item.id" class="code-item">
              <div class="header">
                <span class="title">
                  {{ item.title }}
                </span>
                <div class="actions">
                  <el-button type="primary" link @click="onEdit(item.id)">编辑</el-button>
                  <el-button type="danger" link @click="onDelete(item.id)">删除</el-button>
                </div>
              </div>
              <div class="abstract">{{ item.abstract }}</div>
              <div class="code-info">
                <span class="date">{{ item.language }}</span>
                <span class="date">{{ formatDate(item.createTime) }}</span>
              </div>
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
import { computed } from 'vue';
import { codeStore } from '@/store';
import { formatDate, scrollTo } from '@/utils';
import { useScroller } from '@/hooks';

interface IProps {
  modelValue: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:modelValue']);

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

const { scrollRef, scrollTop } = useScroller();

// 获取代码示例列表
const onFetchData = () => {
  codeStore.getCodeList();
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};

// 编辑
const onEdit = (id: string) => {
  codeStore.clearCodeId();
  codeStore.getCodeById(id);
};

// 删除
const onDelete = (id: string) => {
  codeStore.deleteCode(id);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.container {
  .content {
    height: 100%;

    .code-item {
      margin-bottom: 10px;
      background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
      box-shadow: 0 0 3px var(--shadow-color);
      padding: 5px 5px 5px 7px;
      border-radius: 5px;
      box-sizing: border-box;

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title {
          font-size: 16px;
          font-weight: 700;
          color: var(--font-1);
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
      }
    }

    .no-more {
      text-align: center;
      padding-top: 8px;
    }
  }

  :deep {
    .el-drawer__header {
      margin-bottom: 0;
    }
  }
}
</style>
