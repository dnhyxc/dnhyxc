import { useRouter } from 'vue-router';
import { toRaw, onMounted, onUnmounted, ref, computed, watchEffect, nextTick } from 'vue';
import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  loginStore,
  articleStore,
  commonStore,
  classifyStore,
  tagStore,
  personalStore,
  authorStore,
  searchStore,
} from '@/store';
import { AUTHOR_ROUTES } from '@/constant';
import { CommentParams, useDeleteArticleParams, DeleteArticleParams } from '@/typings/common';
import { Message, getStoreUserInfo } from '@/utils';

const router = useRouter();

export const useGetRoutePath = () => {
  return toRaw(router).currentRoute.value.fullPath;
};

// 监听滚动条事件hooks，消除存在多个滚动条时不相互影响
export const useChildScroller = () => {
  const scrollChildRef = ref<any>();
  const scrollChildTop = ref<number>(0);

  onMounted(() => {
    // 监听滚动条滚动事件
    watchEffect(() => {
      if (scrollChildRef.value?.wrapRef) {
        scrollChildRef.value?.wrapRef?.addEventListener('scroll', onScroll);
      }
    });
  });

  onUnmounted(() => {
    // 卸载滚动条滚动事件
    scrollChildRef.value?.wrapRef.removeEventListener('scroll', onScroll);
  });

  // 滚动事件
  const onScroll = (e: any) => {
    scrollChildTop.value = e.target.scrollTop;
  };

  return { scrollChildRef, scrollChildTop };
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
    // 滚动时隐藏右侧菜单，清除选中文章
    if (commonStore.showContextmenu && commonStore.currentArticleId) {
      commonStore.clearContentmenuInfo();
    }
  };

  return { scrollRef, scrollTop };
};

// 判断是否存在userId的hooks
export const useCheckUserId = (needMsg: boolean = true) => {
  // 获取存储在localstorage中的登录信息
  const { userInfo: storeUserInfo } = getStoreUserInfo();
  const { userInfo } = loginStore;
  if (!userInfo?.userId && !storeUserInfo?.userId && needMsg) {
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
  pageType, // 用于区分个分页列表数据
  classify, // 文章分类
  tagName, // 标签页选中的标签
  authorId, // 我的主页作者id
  accessUserId, // 我的主页登录人id
  router, // 路由
  scrollbar, // 滚动容器
}: useDeleteArticleParams) => {
  const deleteArticle = (articleId: string) => {
    Message('', '确定下架该文章吗？').then(async () => {
      const params: DeleteArticleParams = {
        articleId,
        classify: classifyStore.currentClassify || classify || classifyStore.classifys[0]?.name!, // 文章分类页面搜索条件
        tagName: tagStore.currentTag || tagName || tagStore.tags[0]?.name,
        userId: authorId,
        accessUserId,
        pageType,
      };

      // 头部搜索关键词
      if (commonStore.keyword) {
        params.keyword = commonStore.keyword;
      }

      // 高级搜索关键字
      if (searchStore.keyword) {
        params.keyword = searchStore.keyword;
      }

      // 高级搜索列表
      if (pageType === 'search') {
        params.filterList = searchStore.filterList;
      }

      // 如果没有分类，则删除参数中的classify属性
      if (!classifyStore.currentClassify && !classify && !classifyStore.classifys[0]?.name!) {
        delete params.classify;
      }

      // 如果没有选中tag，则删除tagName属性
      if (!tagStore.currentTag && !tagName && !tagStore.tags[0]?.name) {
        delete params.tagName;
      }

      // 判断是否是我的主页点赞文章
      if (pageType === 'personal' && personalStore.currentTabKey === '2') {
        params.delType = true;
      }

      // 判断是否是博主主页的博主文章tab
      if (pageType === 'author' && authorStore.currentTabKey === '0') {
        params.authorPage = true;
      }

      // 判断是否是博主主页的博主点赞文章tab
      if (pageType === 'author' && authorStore.currentTabKey === '1') {
        params.authorLike = true;
      }

      await articleStore.deleteArticle(params, router, scrollbar as unknown as Ref<HTMLDivElement>);
    });
  };

  return { deleteArticle };
};

// 判断页面是否有权限
export const useGetRouteAuthInfo = () => {
  const router = useRouter();
  const { menus } = loginStore;
  const name = location.pathname.slice(1); // tools
  // 判断是否具备该菜单权限
  const noAuthMenus = AUTHOR_ROUTES.filter((i) => !menus?.some((j) => j === i));
  if (noAuthMenus?.includes(name as string)) {
    router.push('/404');
  }
};

export const useContextMenu = (containerRef: Ref<HTMLElement>) => {
  const showMenu = ref<boolean>(false);
  const x = ref<number>(0);
  const y = ref<number>(0);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showMenu.value = true;
    x.value = e.clientX;
    y.value = e.clientY;
  };

  const closeMenu = () => {
    showMenu.value = false;
  };

  onMounted(() => {
    nextTick(() => {
      if (!showMenu.value) {
        const div = containerRef.value;
        div.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('click', closeMenu, true);
        window.addEventListener('contextmenu', closeMenu, true);
        window.addEventListener('scroll', closeMenu, true);
      }
    });
  });

  onUnmounted(() => {
    nextTick(() => {
      if (showMenu.value) {
        const div = containerRef.value;
        div.removeEventListener('contextmenu', handleContextMenu);
        window.removeEventListener('click', closeMenu, true);
        window.removeEventListener('contextmenu', closeMenu, true);
        window.removeEventListener('scroll', closeMenu, true);
      }
    });
  });

  return {
    showMenu,
    x,
    y,
  };
};
