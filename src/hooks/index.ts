import { useRouter } from 'vue-router';
import { toRaw, onMounted, onUnmounted, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { loginStore, articleStore } from '@/store';
import { CommentParams } from '@/typings/common';

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
export const useCheckUserId = () => {
  const { userInfo } = loginStore;
  if (!userInfo?.userId) {
    ElMessage.warning('请先登录后再试');
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
