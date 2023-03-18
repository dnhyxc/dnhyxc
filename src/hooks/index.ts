import { useRouter } from 'vue-router';
import { toRaw, onMounted, onUnmounted, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { loginStore, articleStore, commonStore, classifyStore } from '@/store';
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
  tagName, // 标签页选中的标签
  authorId, // 我的主页作者id
  accessUserId, // 我的主页登录人id
  authorPage, // 代表博主页面
  authorLike, // 代表博主页面博主点赞列表
  getCollectionTotal, // 获取收藏集总数的方法
  getCollectedTotal, // 获取收藏集中收藏的文章总数的方法
  removeConfirmStyle, // confirm 样式
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
          classify: classifyStore.currentClassify || classifyStore.classifys[0]?.name!, // 文章分类页面搜索条件
          tagName,
          userId: authorId,
          accessUserId,
          delType,
          authorPage,
          authorLike,
          filterList,
          pageType,
        };

        // 如果没有分类，则删除参数中的classify属性
        if (!classifyStore.currentClassify && !classifyStore.classifys[0]?.name!) {
          delete params.classify;
        }

        await articleStore.deleteArticle(params);
      } else {
        // res = await delCollection(articleId);
      }
    });
  };

  // 删除收藏集
  // const delCollection = async (id: string) => {
  //   const res = normalizeResult<ArticleListResult>(
  //     await Service.delCollection({
  //       id,
  //       userId: getUserInfo?.userId,
  //       pageNo,
  //       pageSize: PAGESIZE,
  //     }),
  //   );
  //   if (res.success) {
  //     const nextPageOne = res?.data?.list[0] || '';
  //     const list = articleList.list.filter((i) => i.id !== id);
  //     listRef.current = nextPageOne ? [...list, nextPageOne] : list;
  //     setArticleList({
  //       ...articleList,
  //       total: articleList.total - 1,
  //       list: listRef.current,
  //     });
  //     // 如果是收藏集tab，getCollectionTotal有值，需要实时获取删除后的收藏集总条数
  //     getCollectionTotal && getCollectionTotal();
  //     getCollectedTotal && getCollectedTotal();
  //   }
  //   return res;
  // };

  return { deleteArticle };
};
