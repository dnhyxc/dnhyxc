import { useRouter } from 'vue-router';
import { toRaw, onMounted, onUnmounted, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { loginStore, articleStore, commonStore, classifyStore, tagStore } from '@/store';
import { CommentParams, useDeleteArticleParams, DeleteArticleParams } from '@/typings/common';
import { Message } from '@/utils';

const router = useRouter();

export const useGetRoutePath = () => {
  return toRaw(router).currentRoute.value.fullPath;
};

// 监听滚动条事件hooks
export const useScroller = () => {
  const scrollRef = ref<any>();
  const scrollTop = ref<number>(0);

  onMounted(() => {
    // 监听滚动条滚动事件
    scrollRef.value?.wrapRef?.addEventListener('scroll', onScroll);
  });

  onUnmounted(() => {
    // 卸载滚动条滚动事件
    scrollRef.value?.wrapRef.removeEventListener('scroll', onScroll);
  });

  // 滚动事件
  const onScroll = (e: any) => {
    scrollTop.value = e.target.scrollTop;
  };

  return { scrollRef, scrollTop };
};

// 判断是否存在userId的hooks
export const useCheckUserId = (needMsg: boolean = true) => {
  const { userInfo } = loginStore;
  if (!userInfo?.userId && needMsg) {
    console.log(needMsg, 'needMsg');

    ElMessage({
      message: '请先登录后再操作哦！',
      type: 'warning',
      offset: 80,
    });
    return false;
  }
  return true;
};

// 计算评论数
export const useCommentCount = computed(() => {
  // 计算详情评论数的hooks
  const getCount = (comments: CommentParams[]) => {
    let count = 0;
    comments.forEach((i) => {
      const length: number = i.replyList?.length || 0;
      count += length + 1;
    });
    return count;
  };

  return getCount(articleStore?.commentList);
});

// 删除文章hooks
export const useDeleteArticle = ({
  delType,
  pageType, // 用于区分个分页列表数据
  filterList, // 高级搜索列表
  classify, // 文章分类
  tagName, // 标签页选中的标签
  authorId, // 我的主页作者id
  accessUserId, // 我的主页登录人id
  router, // 路由
  getCollectionTotal, // 获取收藏集总数的方法
  getCollectedTotal, // 获取收藏集中收藏的文章总数的方法
}: useDeleteArticleParams) => {
  const deleteArticle = (articleId: string) => {
    Message(
      delType === '3' ? '删除收藏集同时会移除收藏集中的文章' : '',
      delType !== '3' ? '确定删除该文章吗？' : '确定删除该收藏集吗？',
    ).then(async () => {
      if (delType !== '3') {
        const params: DeleteArticleParams = {
          articleId,
          keyword: commonStore.keyword, // 头部搜索关键词
          classify: classifyStore.currentClassify || classify || classifyStore.classifys[0]?.name!, // 文章分类页面搜索条件
          tagName: tagStore.currentTag || tagName || tagStore.tags[0]?.name,
          userId: authorId,
          accessUserId,
          delType,
          filterList,
          pageType,
          router,
        };

        // 如果没有分类，则删除参数中的classify属性
        if (!classifyStore.currentClassify && !classify && !classifyStore.classifys[0]?.name!) {
          delete params.classify;
        }

        // 如果没有选中tag，则删除tagName属性
        if (!tagStore.currentTag && !tagName && !tagStore.tags[0]?.name) {
          delete params.tagName;
        }

        await articleStore.deleteArticle(params);
      } else {
        // res = await delCollection(articleId);
      }
    });
  };

  return { deleteArticle };
};
