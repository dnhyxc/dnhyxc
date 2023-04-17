<!--
 * 上下篇文章切换组件
 * @author: dnhyxc
 * @since: 2023-03-01
 * index.vue
-->
<template>
  <div
    v-if="articleStore.anotherArticleList[0]?.id || articleStore.anotherArticleList[1]?.id"
    class="another-article-wrap"
  >
    <div class="list">
      <div
        v-for="(i, index) in articleStore.anotherArticleList"
        v-show="i?.id"
        :key="i.id || index"
        class="article"
        @click="toDetail(i?.id)"
      >
        <div class="item">
          <div class="prev">
            <span class="left">
              {{ index === 0 ? '上一篇' : '下一篇' }}
            </span>
            <span class="right">
              <i v-if="index === 0 && i?.id" class="font-top iconfont icon-shuangjiantouzuo" />
              <i v-if="index > 0 && i?.id" class="font iconfont icon-shuangjiantouyou" />
            </span>
          </div>
          <div class="header">
            <span class="title">{{ i?.title }}</span>
            <span class="date">{{ formatGapTime(i?.createTime!) }}</span>
          </div>
          <div class="tag-list">
            <span class="classify" @click.stop="onJump(i?.classify!, 'classify')">分类：{{ i?.classify }}</span>
            <span class="tag" @click.stop="onJump(i?.tag!, 'tag')">标签：{{ i?.tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { onMounted, inject, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { articleStore } from '@/store';
import { formatGapTime, locGetItem, getParamListFromStore, getStoreUserInfo } from '@/utils';
import { AnotherParams } from '@/typings/common';

const reload = inject<Function>('reload');

interface IProps {
  id: string; // 文章id
}

const router = useRouter();
const route = useRoute();

const timer = ref<ReturnType<typeof setTimeout> | null>(null);

const props = defineProps<IProps>();

onMounted(() => {
  // 获取从哪个页面跳转到详情的参数
  const firstParam = getParamListFromStore(route.query.from as string);
  const params: AnotherParams = (locGetItem('params') && JSON.parse(locGetItem('params')!)) || firstParam || {};
  articleStore.getAnotherArticles({ id: props.id, ...params });
});

// 跳转详情
const toDetail = (id: string) => {
  // 如果是/detail，则说明是当前页打开，直接在当前页访问下一篇即可，否则新窗口打开
  if (route.path.includes('detail')) {
    router.push(`/detail/${id}`);
    timer.value = setTimeout(() => {
      if (timer.value) {
        clearTimeout(timer.value);
        timer.value = null;
      }
      reload && reload();
    }, 100);
  } else {
    const { userInfo, token } = getStoreUserInfo();
    ipcRenderer.send(
      'new-win',
      `article/${id}?from=${route.query.from}`,
      id,
      JSON.stringify({ userInfo, token }), // 用户信息;
      props.id,
    );
  }
};

// 去分类或者标签列表
const onJump = (name: string, type: string) => {
  if (type === 'tag') {
    router.push(`/tag/list?tag=${name}`);
  } else {
    router.push(`/classify?classify=${name}`);
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.another-article-wrap {
  .list {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    border-radius: 5px;

    .article {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      width: 100%;
      margin-top: 10px;
      border-radius: 5px;
      box-shadow: @shadow-mack;

      &:hover {
        background-image: @card-lg-2;
      }

      &:last-child {
        padding: 10px;
      }

      .item {
        flex: 1;
        margin-right: 10px;
        cursor: pointer;

        .prev {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          color: var(--font-4);

          .right {
            transform: rotate(90deg);
          }
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .title {
            flex: 0.7;
            .ellipsisMore(1);
          }

          .date {
            flex: 0.3;
            .ellipsisMore(1);
            text-align: right;
          }
        }

        .tag-list {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 5px;
          font-size: 14px;
          color: var(--theme-blue);

          .classify,
          .tag {
            flex: 1;
            .ellipsisMore(1);

            &:hover {
              color: var(--active-color);
            }
          }

          .tag {
            text-align: right;
          }
        }
      }
    }

    &:last-child {
      .article {
        margin-bottom: 0;
      }
    }
  }
}
</style>
