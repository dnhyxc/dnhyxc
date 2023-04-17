<!--
 * 收藏集弹窗
 * @author: dnhyxc
 * @since: 2023-03-08
 * index.vue
-->
<template>
  <div class="dialog-content">
    <el-dialog v-model="visible" width="500px" draggable>
      <template #header>
        <div class="header">
          <span class="title">选择收藏集</span>
          <span class="info">（创建或选择你想添加的收藏集）</span>
        </div>
      </template>
      <Loading :loading="collectStore?.loading" class="content">
        <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
          <div
            v-if="isMounted"
            v-infinite-scroll="onFetchData"
            :infinite-scroll-delay="300"
            :infinite-scroll-disabled="disabled"
            :infinite-scroll-distance="2"
          >
            <div v-for="i in collectStore?.collectList" :key="i.id" class="collect-list">
              <div class="left" @click.stop="onCheckedItem(i.id)">
                <div class="collect-name">{{ i.name }} <i v-if="i.status === 2" class="iconfont icon-33" /></div>
                <div class="collect-info">{{ i.articleIds?.length }} 篇文章</div>
              </div>
              <div class="right">
                <el-checkbox-group v-model="collectStore.checkedCollectIds" size="large">
                  <el-checkbox :label="i.id" />
                </el-checkbox-group>
              </div>
            </div>
          </div>
          <div v-if="noMore" class="no-more">没有更多了～～～</div>
        </el-scrollbar>
      </Loading>
      <template #footer>
        <div class="footer">
          <span class="build" @click="onBuildCollect">
            <i class="iconfont icon-add">&nbsp;新建收藏集</i>
          </span>
          <span class="actions">
            <el-button @click="onCancel">取消</el-button>
            <el-button type="primary" @click="onSubmit">确定</el-button>
          </span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { collectStore } from '@/store';
import Loading from '@/components/Loading/index.vue';

interface IProps {
  articleId: string;
  collectVisible: boolean;
  buildVisible?: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:collectVisible', 'update:buildVisible']);

// 计算v-model传过来的参数，防止出现值是可读的，无法修改的警告
const visible = computed({
  get() {
    return props.collectVisible;
  },
  set(visible: boolean) {
    emit('update:collectVisible', visible);
  },
});

// 选中的收藏集
const isMounted = ref<boolean>(false);
const noMore = computed(() => collectStore?.collectList.length >= collectStore?.total);
const disabled = computed(() => collectStore?.loading || noMore.value);

onMounted(() => {
  isMounted.value = true;
});

// 清除收藏集列表相关数据
onUnmounted(() => {
  collectStore?.clearCollectList();
});

watch(
  () => props.collectVisible,
  (newVal) => {
    if (!newVal) {
      // 窗口隐藏时，清除收藏集相关数据
      collectStore?.init();
    } else {
      // 当窗口显示时，请求收藏集列表
      onFetchData();
    }
  },
);

// 请求数据
const onFetchData = async () => {
  await collectStore.getCollectList();
};

// 选择需要加入的收藏夹
const onCheckedItem = (id: string) => {
  const findId = collectStore?.checkedCollectIds.find((i) => i === id);
  if (findId) {
    collectStore.checkedCollectIds = collectStore.checkedCollectIds.filter((i) => i !== id);
  } else {
    collectStore.checkedCollectIds = [...collectStore.checkedCollectIds, id];
  }
};

// 新建收藏集
const onBuildCollect = () => {
  emit('update:collectVisible', false);
  emit('update:buildVisible', true);
};

// 取消
const onCancel = () => {
  emit('update:collectVisible', false);
};

// 确定
const onSubmit = async () => {
  await collectStore?.collectArticles(props.articleId);
  emit('update:collectVisible', false);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.dialog-content {
  .header {
    display: flex;
    align-items: center;
    color: var(--font-1);

    .title {
      font-size: 18px;
    }

    .info {
      font-size: 13px;
      color: var(--font-2);
    }
  }

  .content {
    min-height: 130px;
    max-height: 300px;

    :deep {
      .scrollbar-wrapper {
        min-height: 130px;
        max-height: 300px;
      }
    }

    .collect-list {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 5px;
      margin-right: 5px;
      border-bottom: 1px solid var(--card-border);
      cursor: pointer;
      .clickNoSelectText();

      .left {
        flex: 1;
        color: var(--font-2);

        .collect-name {
          display: flex;
          align-items: center;
          font-size: 16px;
          margin-bottom: 8px;

          .icon-33 {
            font-size: 15px;
            margin-left: 5px;
          }
        }

        .collect-info {
          font-size: 13px;
        }
      }
    }

    .active {
      background-color: var(--theme-blue);
    }

    :deep {
      .el-checkbox__label {
        display: none;
      }
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .build {
      color: var(--theme-blue);
      cursor: pointer;
      .clickNoSelectText();

      .icon-add {
        font-size: 14px;
      }
    }
  }

  :deep {
    .el-dialog__body {
      padding: 15px 10px 15px 15px;
    }
  }

  .loading,
  .no-more {
    text-align: center;
    color: var(--font-4);
    padding-top: 15px;
  }
}
</style>
