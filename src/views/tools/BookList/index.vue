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
              <div
                v-for="data in bookStore.bookList"
                :key="data.id"
                :data="data"
                :class="`line-card ${(loadStatus || data.id === bookId) && 'disabled-line-card'} ${
                  data.id === bookId && 'active-line-card'
                }`"
                @click="() => onRead(data)"
              >
                <div class="cover">
                  <Image :url="data?.coverImg" :transition-img="COVER" class="img" />
                </div>
                <div class="book-info">
                  <div class="title">
                    <div class="left" :title="data.fileName.replace(/\.epub$/, '')">
                      {{ data.fileName.replace(/\.epub$/, '') }}
                    </div>
                    <div v-if="loginStore.userInfo.auth === 1" class="right">
                      <span class="edit" @click.stop="onEdit(data)">编辑</span>
                      <span class="del" @click.stop="onReomve(data.id!)">删除</span>
                    </div>
                  </div>
                  <div class="book-desc">
                    <div class="desc">作者：{{ data.author || '-' }}</div>
                    <div class="desc">语言：{{ data.language || '-' }}</div>
                    <div class="desc">书籍大小：{{ `${(data.size / 1024 / 1024).toFixed(2)} MB` || '-' }}</div>
                    <div class="desc">添加时间：{{ formatDate(data.createTime, 'YYYY/MM/DD') }}</div>
                  </div>
                </div>
              </div>
            </div>
            <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
          </div>
          <div v-if="noMore" class="no-more">没有更多了～～～</div>
          <Empty v-if="showEmpty" />
        </el-scrollbar>
        <div class="edit-wrap">
          <el-dialog v-model="editVisible" title="编辑书籍" draggable width="400px">
            <el-form ref="formRef" :model="bookForm" class="form-wrap" @submit.native.prevent>
              <el-form-item prop="coverImg" label="书籍封面" class="form-item">
                <div class="cover-img-wrap">
                  <Upload v-model:file-path="bookForm.coverImg" :need-cropper="false">
                    <template #preview>
                      <img :src="bookForm.coverImg" class="img" />
                    </template>
                  </Upload>
                </div>
              </el-form-item>
              <el-form-item prop="fileName" label="书籍名称" class="form-item">
                <el-input v-model="bookForm.fileName" placeholder="请输入书籍名称" />
              </el-form-item>
              <el-form-item prop="author" label="书籍作者" :title="bookForm.author" class="form-item">
                <el-input v-model="bookForm.author" placeholder="请输入书籍作者" />
              </el-form-item>
              <el-form-item prop="language" label="书籍语言" class="form-item">
                <el-input v-model="bookForm.language" placeholder="请输入书籍语言" />
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="onCancel">取消</el-button>
                <el-button type="primary" @click="onSubmit">确定</el-button>
              </span>
            </template>
          </el-dialog>
        </div>
      </Loading>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, nextTick, onUnmounted } from 'vue';
import type { FormInstance } from 'element-plus';
import { bookStore, loginStore } from '@/store';
import { COVER } from '@/constant';
import { scrollTo, Message, formatDate } from '@/utils';
import { AtlasItemParams } from '@/typings/common';
import Loading from '@/components/Loading/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';
import Empty from '@/components/Empty/index.vue';

interface IProps {
  visible: boolean;
  loadStatus: boolean;
  readBook: (data: any) => void;
  bookId: string;
  loadType?: 'epub' | 'pdf' | 'word'; // 需要加载的类型，epub、pdf
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:visible']);

const formRef = ref<FormInstance>();
const scrollRef = ref<any>(null);
const scrollTop = ref<number>(0);
const editVisible = ref<boolean>(false);
const bookForm = reactive<{
  fileName: string;
  coverImg: string;
  id: string;
  author: string;
  language: string;
}>({
  id: '',
  fileName: '',
  coverImg: '',
  author: '',
  language: '',
});

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

// 监听弹窗显示状态，实时拉取书籍列表
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

// 获取书籍列表
const onGetBookList = () => {
  bookStore.getBookList(props.loadType);
};

// 阅读
const onRead = (data: AtlasItemParams) => {
  if (props.bookId === data.id) return;
  props.readBook && props.readBook(data);
};

const resetForm = () => {
  bookForm.id = '';
  bookForm.fileName = '';
  bookForm.coverImg = '';
  bookForm.author = '';
  bookForm.language = '';
};

// 编辑
const onEdit = (data: AtlasItemParams) => {
  bookForm.id = data.id;
  bookForm.fileName = data.fileName;
  bookForm.coverImg = data.coverImg || '';
  bookForm.author = data.author || '';
  bookForm.language = data.language || '';
  editVisible.value = true;
};

const onCancel = () => {
  resetForm();
  editVisible.value = false;
};

const onSubmit = async () => {
  await bookStore.updateBookInfo({
    id: bookForm.id,
    fileName: bookForm.fileName,
    coverImg: bookForm.coverImg,
    author: bookForm.author,
    language: bookForm.language,
  });
  resetForm();
  editVisible.value = false;
};

// 删除
const onReomve = (id: string) => {
  Message('', '确定删除该书籍吗？').then(async () => {
    await bookStore.deleteBook({ id, searchBookType: props.loadType });
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

  .content {
    position: relative;
    height: 100%;

    .list-wrap {
      padding: 5px 0;

      .line-card {
        display: flex;
        justify-content: space-around;
        padding: 10px 10px;
        box-shadow: 0 0 5px var(--shadow-mack);
        background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
        border-radius: 5px;
        margin: 0 5px 10px 5px;
        cursor: pointer;

        .cover {
          width: 30%;
          height: auto;
          max-height: 120px;
          margin: auto 10px auto 0;

          :deep {
            .image-item {
              border-radius: 0;
              max-height: 120px;
            }
          }
        }

        .book-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

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
              display: none;
              align-items: center;
              font-size: 14px;

              .del {
                color: @font-danger;
                margin-left: 10px;
              }

              .edit {
                color: var(--theme-blue);
              }

              .edit,
              .del {
                &:hover {
                  color: @active;
                }
              }
            }
          }

          &:hover {
            .title {
              .right {
                display: flex;
              }
            }
          }

          .book-desc {
            .desc {
              .ellipsisMore(1);
              margin-bottom: 5px;
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

      .disabled-line-card {
        position: relative;

        &::after {
          content: '';
          height: 100%;
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
          cursor: not-allowed;
        }

        &:hover {
          box-shadow: 0 0 5px var(--active);
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

  .edit-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;

    :deep {
      .el-form-item__label {
        color: var(--font-3);
      }
      .el-dialog__body {
        padding: 20px 20px 0 20px !important;
      }
    }

    .book-cover,
    .book-name {
      display: block;
      font-size: 14px;
      color: var(--font-3);
      margin-bottom: 10px;
    }

    .cover-img-wrap {
      width: 120px;
      height: 175px;

      .img {
        width: 100%;
        height: auto;
        max-height: 175px;
      }
    }
  }
}
</style>
