<!--
 * 草稿箱
 * @author: dnhyxc
 * @since: 2023-03-31
 * index.vue
-->
<template>
  <div class="draft-wrap">
    <el-dialog v-model="visible" :close-on-click-modal="false" title="草稿箱" align-center width="800px" draggable>
      <Loading :loading="createStore.loading" class="content">
        <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
          <div
            v-if="isMounted"
            v-infinite-scroll="onGetDraftList"
            :infinite-scroll-delay="300"
            :infinite-scroll-disabled="disabled"
            :infinite-scroll-distance="2"
            class="pullup-content"
          >
            <div class="list-wrap">
              <LineCard
                v-for="data in createStore.draftList"
                :key="data.id"
                :data="data"
                class="line-card"
                :to-edit="toEdit"
              >
                <template #title>
                  <div class="left">{{ data.title }}</div>
                  <div class="right">
                    <span class="edit" @click.stop="toEdit(data.id!)">编辑</span>
                    <span class="del" @click.stop="onReomve(data.id!)">删除</span>
                  </div>
                </template>
                <template #content>
                  <div class="art-info">
                    <div class="desc">
                      {{ data.abstract }}
                    </div>
                    <div class="tags">
                      <div class="author" @click.stop="toPersonal(data.authorId!)">{{ data.authorName }}</div>
                      <div class="right">
                        <el-tooltip
                          v-if="data.classify"
                          class="box-item"
                          effect="light"
                          :content="`分类：${data.classify}`"
                          placement="bottom"
                        >
                          <div class="classify" @click.stop="toClassify(data.classify!)">
                            {{ data.classify }}
                          </div>
                        </el-tooltip>
                        <el-tooltip
                          v-if="data.tag"
                          class="box-item"
                          effect="light"
                          :content="`标签：${data.tag}`"
                          placement="bottom"
                        >
                          <div class="tag" @click.stop="toTag(data.tag!)">{{ data.tag }}</div>
                        </el-tooltip>
                      </div>
                    </div>
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
      <template #footer>
        <span class="dialog-footer"></span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { createStore } from '@/store';
import { scrollTo, Message } from '@/utils';
import Loading from '@/components/Loading/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';
import Empty from '@/components/Empty/index.vue';

const router = useRouter();
const route = useRoute();

const isMounted = ref<boolean>(false);
const scrollRef = ref<any>(null);
const scrollTop = ref<number>(0);
const noMore = computed(() => {
  const { draftList, total } = createStore;
  return draftList.length >= total && draftList.length;
});
const disabled = computed(() => createStore.loading || noMore.value);
const showEmpty = computed(
  () => createStore.loading !== null && !createStore.loading && !createStore.draftList?.length,
);

interface IProps {
  draftVisible: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:draftVisible']);

const visible = computed({
  get() {
    return props.draftVisible;
  },
  set(visible: boolean) {
    emit('update:draftVisible', visible);
  },
});

onMounted(() => {
  isMounted.value = true;
});

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
      // 清空拉取草稿数据相关缓存
      createStore.clearDraftListInfo();
      onGetDraftList();
    } else {
      scrollRef.value?.wrapRef.removeEventListener('scroll', onScroll);
    }
  },
);

onUnmounted(() => {
  scrollRef.value?.wrapRef.removeEventListener('scroll', onScroll);
});

// 获取草稿列表
const onGetDraftList = () => {
  createStore.getDraftList();
};

// 编辑
const toEdit = (id: string) => {
  // 保存草稿id
  createStore.draftArticleId = id;
  emit('update:draftVisible', false);
};

// 删除
const onReomve = (id: string) => {
  Message('', '确定删除该草稿吗？').then(async () => {
    // 调用接口，移除收藏集中收藏的文章
    await createStore?.deleteDraft(id);
    // 删除之后，自动跳转到原来所在位置
    onScrollTo(scrollTop.value);
  });
};

// 去作者主页
const toPersonal = (id: string) => {
  router.push(`/personal?authorId=${id}`);
};

// 去分类页
const toClassify = (classify: string) => {
  router.push(`/classify?classify=${classify}`);
};

// 去标签
const toTag = (tag: string) => {
  if (route.path !== '/tag/list') {
    router.push(`/tag/list?tag=${tag}`);
  }
};

// 置顶
const onScrollTo = (to?: number) => {
  scrollTo(scrollRef, to || 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.draft-wrap {
  :deep {
    .el-dialog__header {
      -webkit-app-region: no-drag;
    }
    .el-dialog__title {
      color: var(--font-1);
    }
    .el-dialog__body {
      padding: 5px 10px;
    }

    .el-dialog__footer {
      padding: 6px 20px 5px;
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
      font-weight: 700;
      .ellipsisMore(1);
    }

    .right {
      display: flex;
      align-items: center;
      font-size: 14px;

      .edit {
        margin-right: 10px;
        color: @theme-blue;
      }

      .del {
        color: @font-danger;
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
    height: 565px;

    .list-wrap {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      padding: 5px 10px;

      .line-card {
        width: calc(50% - 5px);
        padding: 10px 10px;
        box-shadow: 0 0 5px var(--shadow-mack);
        background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
        margin-bottom: 10px;
        border-radius: 5px;
        margin-right: 10px;

        :deep {
          .art-info {
            flex: 1;
            margin-right: 0;

            .desc {
              .ellipsisMore(1);
              margin-bottom: 10px;
              font-size: 14px;
            }

            .tags {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 14px;
              margin-bottom: 0;

              .author {
                flex: 0.5;
                .ellipsisMore(1);
                margin-right: 15px;
                min-width: 100px;
                cursor: pointer;
                &:hover {
                  color: @sub-2-blue;
                }
              }

              .right {
                flex: 0.5;
                display: flex;
                justify-content: flex-end;

                .classify,
                .tag {
                  background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
                  box-shadow: 0 0 3px var(--shadow-color);
                  padding: 1px 5px 3px;
                  border-radius: 5px;
                  min-width: 28px;
                  .ellipsisMore(1);
                  cursor: pointer;

                  &:hover {
                    color: @sub-2-blue;
                  }
                }

                .tag {
                  margin-left: 10px;
                }
              }
            }
          }
        }

        &:nth-child(even) {
          margin-right: 0;
          &:last-child {
            margin-bottom: 0;
          }
        }

        &:nth-child(odd) {
          &:nth-last-child(2) {
            margin-bottom: 0;
          }
          &:last-child {
            margin-bottom: 0;
          }
        }
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
