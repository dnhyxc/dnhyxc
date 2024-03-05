<!--
 * 电子书预览
 * @author: dnhyxc
 * @since: 2023-12-28
 * index.vue
-->
<template>
  <div class="epub-wrap">
    <div class="header">
      <div class="left">
        <div class="actions">
          <span class="title">电子书预览</span>
          <el-button
            type="primary"
            link
            :class="`book-btn ${checkOS() !== 'mac' && 'mac-book-btn'}`"
            @click="showBookList"
            >在线书籍列表</el-button
          >
          <el-upload
            class="uploader"
            :disabled="loading"
            accept=".epub,.epub.zip"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="onUpload"
          >
            <el-button :disabled="loading" type="primary" link class="book-btn upload-text">
              {{ bookName ? '重新从本地选择' : '选择本地书籍' }}
            </el-button>
          </el-upload>
        </div>
        <span class="book-name">
          {{ bookName }}
        </span>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <Loading
      :loading="loading"
      :load-text="`${loadBookName ? `正在快马加鞭的加载《${loadBookName}》` : '正在快马加鞭的加载'}`"
      class="loading"
    >
      <template #abort>
        <div v-if="loadType === 'line' && progress < 100" class="abort" @click="onAbort">停止加载</div>
      </template>
      <template #loadInfo>
        <div v-if="loadType === 'line' && progress < 100" class="load-info">
          <el-progress :show-text="false" :stroke-width="12" :percentage="progress" class="progress-bar" />
          <div class="load-time">
            <span class="progress">
              已加载 {{ progress }}% ({{ loadBookSize.toFixed(2) }}MB / {{ bookSize.toFixed(2) }}MB)
            </span>
            <span v-if="progress >= 99" class="duration">，耗时 {{ loadTime }} 秒</span>
          </div>
        </div>
      </template>
      <div v-if="!bookName" class="content">
        <DragUpload
          class="drag-upload"
          accept=".epub,.epub+zip"
          file-type="epub"
          :on-upload="onUpload"
          upload-info-text="epub 格式的文件"
        />
      </div>
      <div v-else class="content">
        <div ref="previewRef" :class="`preview-wrap ${checkOS() === 'mac' && 'mac-preview-wrap'}`">
          <div id="preview" />
        </div>
        <div :class="`toc-list-wrap ${checkOS() === 'mac' && 'mac-toc-list-wrap'}`">
          <div v-if="tocList.length > 0" class="toc-title">
            <span>目录总览</span>
            <i
              :class="`font iconfont ${scrollChildTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
              @click="onScrollTo"
            />
          </div>
          <el-scrollbar ref="scrollChildRef" wrap-class="scrollbar-wrapper">
            <div class="toc-wrap">
              <TreeNode
                :node-list="tocList"
                :on-selected="onSelected"
                :default-selected-toc-id="defaultSelectedTocId"
              />
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div v-if="bookName" class="footer">
        <div class="themes">
          <div class="font-set">
            <el-popover
              placement="top-start"
              popper-class="msg-popover"
              :show-arrow="false"
              :width="250"
              trigger="hover"
            >
              <template #reference>
                <i class="set-icon iconfont icon-zitidaxiao" />
              </template>
              <div class="font-list">
                <span class="font-info" :style="{ color: fontColor }">字体大小</span>
                <el-slider v-model="fontSize" class="slider" :min="12" :max="30" />
              </div>
              <div class="font-list">
                <span class="font-info" :style="{ color: fontColor }">行间距离</span>
                <el-slider v-model="lineHeight" class="slider" :min="18" :max="50" />
              </div>
            </el-popover>
            <el-popover
              placement="top-start"
              popper-class="msg-popover"
              :show-arrow="false"
              width="auto"
              trigger="hover"
            >
              <template #reference>
                <i class="set-icon star-icon iconfont icon-a-huaban2fuben9" />
              </template>
              <div class="themes-list">
                <span class="theme-info" :style="{ color: fontColor }">主题</span>
                <div v-for="theme in EPUB_THEMES" :key="theme.name" class="theme-item">
                  <el-tooltip placement="top" popper-class="custom-dropdown-styles">
                    <template #content>
                      <span>{{ theme.name }}</span>
                    </template>
                    <span
                      class="theme"
                      :style="{ background: theme.style.body.background }"
                      @click="onThemeChange(theme.style.body)"
                    />
                  </el-tooltip>
                </div>
              </div>
            </el-popover>
          </div>
        </div>
        <div class="book-actions">
          <el-button type="primary" link class="btn" @click="onPrev">上一章</el-button>
          <el-button type="primary" link class="btn" @click="onNext">下一章</el-button>
        </div>
      </div>
    </Loading>
    <BookList v-model:visible="visible" v-model:loadStatus="loading" :read-book="readBook" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick, computed, reactive } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import type { UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import ePub from 'epubjs';
import { useChildScroller } from '@/hooks';
import { scrollTo, debounce, getTheme, calculateLoadProgress, Message, checkOS, getUniqueFileName } from '@/utils';
import { EPUB_THEMES, BOOK_THEME, DOMAIN_URL } from '@/constant';
import { uploadStore, bookStore, loginStore, toolsStore } from '@/store';
import { AtlasItemParams, BookTocItem, BookTocList, BookRecord } from '@/typings/common';
import BookList from '../BookList/index.vue';

interface IProps {
  modalVisible: boolean;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

const previewRef = ref<HTMLElement | null>(null);
const tocList = ref<BookTocList[]>([]);
// 初始化默认选中的id
const defaultSelectedTocId = ref<string>('');
// 当权选中背景颜色
const themeColor = ref<string>('');
const fontColor = ref<string>('var(--font-1)');
const fontSize = ref<number>(16);
const lineHeight = ref<number>(25);
const visible = ref<boolean>(false);
const loading = ref<boolean>(false);
// 加载进度
const progress = ref<number>(0);
// 加载时间
const loadTime = ref<string>('0');
// 选择渠道
const loadType = ref<string>('upload');
// 选中的书名
const bookName = ref<string>('');
// 当前选择的书籍大小
const bookSize = ref<number>(0);
// 当前加载书籍的大小
const loadBookSize = ref<number>(0);
// 当前目录位置
const currentTocInfo = reactive<{ tocId: string; tocName: string; tocHref: string; bookId: string }>({
  tocId: '',
  tocHref: '',
  bookId: '',
  tocName: '',
});

// ePub 实例
let book: any = null;
// 渲染元素
let rendition: any = null;
// 全部目录
const allTocs: BookTocList[] = [];
// 定时器
let timer: ReturnType<typeof setTimeout> | null = null;
// 用于存储上一个 ReadableStreamDefaultReader 对象
let previousReader: any = null;

const { scrollChildRef, scrollChildTop } = useChildScroller();

defineProps<IProps>();

const emit = defineEmits<Emits>();

const loadBookName = computed(() => {
  return bookName.value.length > 20 ? `${bookName.value.slice(0, 20)}...` : bookName.value;
});

// 设置字体大小
watch(fontSize, () => {
  setFontSize(`${fontSize.value}px`);
});

// 设置行间距
watch(lineHeight, () => {
  setLineHeight(`${lineHeight.value}px`);
});

onMounted(() => {
  window.addEventListener('resize', debounce(onResize, 100));
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  window.removeEventListener('keydown', onKeydown);
});

onBeforeRouteLeave(async (to, from, next) => {
  // 页面离开时时，保存上一次阅读书籍的位置
  if (
    !currentTocInfo.bookId ||
    !currentTocInfo.tocId ||
    !currentTocInfo.tocName ||
    !currentTocInfo.tocHref ||
    (progress.value < 100 && loadType.value !== 'upload')
  ) {
    // 页面离开时停止加载资源
    onAbort();
    next();
  } else {
    const scrollNode = previewRef.value?.firstElementChild?.firstElementChild;
    // 页面离开时停止加载资源
    onAbort();
    await bookStore.createReadBookRecords({
      bookId: currentTocInfo.bookId,
      tocHref: currentTocInfo.tocHref,
      tocId: currentTocInfo.tocId,
      tocName: currentTocInfo.tocName?.trim(),
      position: scrollNode?.scrollTop || 0,
    });
    next();
  }
});

const onResize = () => {
  nextTick(() => {
    if (previewRef.value) {
      rendition?.resize(previewRef.value?.clientWidth, previewRef.value?.clientHeight);
    }
  });
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    if (event.keyCode === 38) {
      onPrev();
    }
    if (event.keyCode === 40) {
      onNext();
    }
  }
};

const createRecord = (top?: boolean) => {
  if (
    !currentTocInfo.bookId ||
    !currentTocInfo.tocId ||
    !currentTocInfo.tocName ||
    !currentTocInfo.tocHref ||
    (progress.value < 100 && loadType.value !== 'upload')
  )
    return;
  const params: BookRecord = {
    bookId: currentTocInfo.bookId,
    tocHref: currentTocInfo.tocHref,
    tocId: currentTocInfo.tocId,
    tocName: currentTocInfo.tocName?.trim(),
  };
  if (top) {
    const scrollNode = previewRef.value?.firstElementChild?.firstElementChild;
    params.position = scrollNode?.scrollTop || 0;
  }
  return bookStore.createReadBookRecords(params);
};

// 上传校验
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  loadType.value = 'upload';
  if (!rawFile.type.includes('epub')) {
    ElMessage.error('只允许上传 epub 格式的文件');
    return false;
  }
  return true;
};

// 自定义上传
const onUpload = (event: { file: File }) => {
  // 选择其它书籍时，保存上一次阅读书籍的位置
  createRecord(true);
  resetRendition();
  loading.value = true;
  bookName.value = event.file.name.replace(/\.epub$/, '');
  const reader = new FileReader();
  reader.onload = async (e: Event) => {
    const buffer = (e.target as FileReader).result as string;
    const { auth } = loginStore?.userInfo;
    // 只有博主才能上传
    if (auth === 1) {
      const res = await uploadStore.uploadOtherFile(event.file);
      if (res) {
        await bookStore.addBook(res.filePath, event.file);
        currentTocInfo.bookId = bookStore.currentUploadId;
        renderBook(buffer);
      } else {
        renderBook(buffer);
      }
    } else {
      const { newFile } = await getUniqueFileName(event.file);
      const filePath = getFilePath(newFile.name);
      await bookStore.addBook(filePath, event.file);
      currentTocInfo.bookId = bookStore.currentUploadId;
      renderBook(buffer);
    }
  };
  reader.readAsArrayBuffer(event.file);
};

const getFilePath = (fileName: string) => {
  const isDev = import.meta.env.DEV;
  const filePath = isDev ? `http://localhost:9112/files/${fileName}` : `http://${DOMAIN_URL}/files/${fileName}`;
  return filePath;
};

// 重置阅读属性设置
const resetRendition = () => {
  // 重新选择电子书时清空目录
  tocList.value = [];
  // 重新选择电子书时重置原来的电子书
  rendition?.destroy();
  book = null;
  rendition = null;
  bookName.value = '';
  fontColor.value = 'var(--font-1)';
  fontSize.value = 16;
  lineHeight.value = 25;
  loading.value = false;
  progress.value = 0;
  loadTime.value = '0';
  loadBookSize.value = 0;
  bookSize.value = 0;
};

// 渲染电子书
const renderBook = (buffer: ArrayBuffer | string) => {
  nextTick(() => {
    book = ePub(buffer);
    // 获取目录
    rendition = book.renderTo('preview', {
      width: previewRef.value!.clientWidth,
      height: previewRef.value!.clientHeight,
      flow: 'scrolled', // 'paginated' 横向滚动阅读 | 'scrolled' 纵向滚动阅读
      resizeOnOrientationChange: true, // 是否在窗口 resize 时调整内容尺寸
      overflow: 'scroll', // 设置视图的 CSS overflow 属性
      snap: true, // 是否支持翻页
    });
    // 渲染电子书
    rendition?.display();
    setFontSize('16px');
    setLineHeight('25px');
    book.ready
      .then(() => {
        tocList.value = book?.navigation?.toc || [];
        defaultSelectedTocId.value = book?.navigation?.toc?.[0].id;
        flattenItems(book?.navigation?.toc || []);
        loading.value = false;
      })
      .then(() => {
        getReadBookRecords();
      });
    const theme = getTheme();
    const findTheme = EPUB_THEMES.find((i) => i.key === BOOK_THEME[theme]) || EPUB_THEMES[0];
    onThemeChange(findTheme!.style.body);
  });
};

// 获取读书记录
const getReadBookRecords = async () => {
  if (!currentTocInfo.bookId) return;
  await bookStore.getReadBookRecords(currentTocInfo.bookId);
  if (bookStore.bookRecordInfo) {
    const { tocName, tocId, tocHref, position, bookId } = bookStore.bookRecordInfo;
    currentTocInfo.tocHref = tocHref!;
    currentTocInfo.tocId = tocId!;
    currentTocInfo.tocName = tocName!;
    currentTocInfo.bookId = bookId!;
    const res = await Message(`${tocName}`, '是否跳转到历史阅读目录？', 'info');
    if (res === 'confirm') {
      onJumpTo(tocHref!);
      setActiveToc(tocId!);
      const scrollNode = previewRef.value?.firstElementChild?.firstElementChild;
      if (scrollNode) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        timer = setTimeout(() => {
          scrollNode.scrollTo({
            top: position,
            behavior: 'smooth',
          });
        }, 500);
      }
    }
  }
};

// 获取加载进度
const getProgress = (num: number) => {
  progress.value = num;
  loadBookSize.value = bookSize.value * (num / 100);
};

const addPreviousReader = (render: any) => {
  previousReader = render;
};

// 停止加载
const onAbort = () => {
  if (previousReader) {
    previousReader.cancel();
  }
};

// 加载书籍数据
const loadBookBuffer = async (id: string, url: string) => {
  // 获取加载进度
  const start = performance.now();
  const arrayBuffer = await calculateLoadProgress({
    url,
    getProgress,
    previousReader,
    addPreviousReader,
  }).catch(() => {
    loading.value = false;
  });
  if (arrayBuffer) {
    // 保存buffer
    toolsStore.saveArrayBuffer({
      buffer: arrayBuffer,
      id,
    });
    const end = performance.now();
    const duration = ((end - start) / 1000).toFixed(2);
    loadTime.value = duration;
    renderBook(arrayBuffer);
  } else {
    resetRendition();
  }
};

// 阅读
const readBook = async (data: AtlasItemParams) => {
  if (loading.value) return;
  // 选择其它书籍时，保存上一次阅读书籍的位置
  createRecord(true);
  resetRendition();
  const { url, size, fileName, id } = data;
  currentTocInfo.bookId = id;
  bookSize.value = size / 1024 / 1024;
  loadType.value = 'line';
  loading.value = true;
  bookName.value = fileName.replace('.epub', '');
  // 如果从缓存中找到了该书籍的数据，则不从线上加载
  const findOne = toolsStore.arrayBuffers.find((i) => i.id === id);
  if (findOne) {
    renderBook(findOne.buffer);
  } else {
    console.log(id, url, 'id, url');
    loadBookBuffer(id, url);
  }
  visible.value = false;
};

// 将目录扁平化
const flattenItems = (items: BookTocList[]) => {
  for (const item of items) {
    allTocs.push(item);
    if (item.subitems.length > 0) {
      flattenItems(item.subitems);
    }
  }
};

// 设置字体大小
const setFontSize = (size: string) => {
  // 设置字体大小
  rendition?.themes.fontSize(size);
};

// 设置行间距
const setLineHeight = (height: string) => {
  rendition?.themes.override('line-height', height);
};

// 设置主题
const onThemeChange = (body: { background: string; color: string }) => {
  const { background, color } = body;
  themeColor.value = background;
  fontColor.value = color;
  rendition?.themes.override('color', color);
  rendition?.themes.override('background', background);
};

// 显示书籍列表
const showBookList = () => {
  visible.value = true;
};

// 上一页
const onPrev = () => {
  const index = allTocs.findIndex((item) => item.id === defaultSelectedTocId.value);
  if (index > 0) {
    const currentToc = allTocs[index - 1];
    setActiveToc(currentToc.id);
    currentTocInfo.tocHref = currentToc.href;
    currentTocInfo.tocId = currentToc.id;
    currentTocInfo.tocName = currentToc.label;
  }
  rendition?.prev();
  createRecord();
};

// 下一页
const onNext = () => {
  const index = allTocs.findIndex((item) => item.id === defaultSelectedTocId.value);
  const currentToc = allTocs[index + 1];
  if (index < allTocs.length - 1) {
    setActiveToc(currentToc.id);
    currentTocInfo.tocHref = currentToc.href;
    currentTocInfo.tocId = currentToc.id;
    currentTocInfo.tocName = currentToc.label;
  }
  rendition?.next();
  createRecord();
};

// 选择菜单
const onSelected = (node: BookTocItem) => {
  const { id, href, label } = node;
  setActiveToc(id);
  currentTocInfo.tocHref = href;
  currentTocInfo.tocId = id;
  currentTocInfo.tocName = label;
  onJumpTo(href);
  createRecord();
};

// 设置选中目录类名
const setActiveToc = (id: string) => {
  const tocs = document.querySelectorAll('.title');
  tocs.forEach((toc) => {
    (toc as HTMLElement)?.classList?.remove('active');
  });
  const active = document.querySelector(`#${id}`) as HTMLElement;
  defaultSelectedTocId.value = id;
  active?.classList?.add('active');
};

// 跳转到指定章节
const onJumpTo = (href: string) => {
  rendition?.display(href);
};

const onClose = () => {
  createRecord(true);
  // 关闭时停止加载资源
  onAbort();
  emit('update:modalVisible', false);
};

// 滚动到某位置
const onScrollTo = () => {
  const bottom = scrollChildRef.value?.wrapRef?.firstElementChild?.firstElementChild?.offsetHeight;
  scrollTo(scrollChildRef, scrollChildTop.value > 0 ? 0 : bottom);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.epub-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: v-bind(themeColor);

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    height: 45px;
    min-height: 45px;
    padding: 0 10px;
    border-bottom: 1px solid var(--card-border);
    box-sizing: border-box;
    color: var(--font-1);

    .left {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;

      .actions {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .title {
          color: var(--font-1);
          min-width: 100px;
        }

        .book-btn {
          color: var(--theme-blue);
          font-size: 16px;
          padding-top: 2px;

          &:hover {
            color: var(--el-color-primary-light-5);
          }
        }

        .mac-book-btn {
          padding-top: 5px;
        }

        .uploader {
          margin-left: 10px;
          font-size: 14px;
          padding-top: 2px;

          .upload-text {
            padding: 0;
            margin-left: 0;
            .icon-upload {
              margin-right: 5px;
              font-size: 18px;
            }
          }
        }
      }

      .book-name {
        font-size: 16px;
        margin: 0 10px 0 13px;
        padding-top: 1px;
        color: var(--font-1);
        .ellipsisMore(1);
      }
    }

    .close {
      color: var(--theme-blue);
      font-size: 16px;
      cursor: pointer;

      &:hover {
        color: @active;
      }
    }
  }

  .loading {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 0;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;

    :deep {
      .async-loading {
        border-radius: 0;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;

        .loader-wrapper {
          border-radius: 0;
          border-bottom-left-radius: 5px;
          border-bottom-right-radius: 5px;
        }
      }

      .load-text {
        margin-top: 15px;
      }
    }

    .abort {
      font-size: 15px;
      margin-top: 20px;
      cursor: pointer;
      color: var(--active);

      &:hover {
        color: @font-danger;
      }
    }

    .load-info {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      align-items: center;
      margin-top: 10px;
      color: var(--loading-text-color);

      .progress-bar {
        width: 230px;
      }

      .load-time {
        font-size: 12px;
        margin-top: 9px;
      }
    }

    .content {
      flex: 1;
      display: flex;
      justify-content: space-between;

      .drag-upload {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        padding: 0;

        &:hover {
          border: 1px dashed var(--theme-blue);
        }

        :deep {
          .el-upload-dragger {
            border: none;
            border-radius: 0;
            background-color: transparent;

            &:hover {
              background-color: var(--upload-hover-bg-color);
            }
          }
        }
      }

      .preview-wrap {
        flex: 1;
        box-sizing: border-box;
        border-right: 1px solid var(--card-border);
        box-sizing: border-box;
        height: calc(100vh - 172px);

        #preview {
          width: calc(100vw - 356px);
        }
      }

      .mac-preview-wrap {
        height: calc(100vh - 185px);
      }

      .toc-list-wrap {
        width: 260px;
        min-width: 260px;
        height: calc(100vh - 172px);
        color: v-bind(fontColor);

        :deep {
          .scrollbar-wrapper {
            overflow-x: hidden;
            height: calc(100vh - 212px);
          }
        }

        .toc-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 40px;
          line-height: 40px;
          padding: 3px 9px 3px 5px;
          font-size: 18px;
          border-bottom: 1px solid var(--card-border);
          box-sizing: border-box;

          .font {
            font-size: 20px;
            cursor: pointer;

            &:hover {
              color: var(--active);
            }
          }
        }

        .toc-wrap {
          box-sizing: border-box;
          color: v-bind(fontColor);
        }
      }

      .mac-toc-list-wrap {
        height: calc(100vh - 185px);

        :deep {
          .scrollbar-wrapper {
            overflow-x: hidden;
            height: calc(100vh - 225px);
          }
        }
      }
    }

    .footer {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 45px;
      padding: 0 10px;
      border-top: 1px solid var(--card-border);
      box-sizing: border-box;

      .themes {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .font-set {
          .set-icon {
            font-size: 20px;
            cursor: pointer;
            margin-right: 15px;
            color: v-bind(fontColor);

            &:hover {
              color: var(--theme-blue);
            }
          }

          .star-icon {
            font-size: 21px;
          }
        }
      }

      .book-actions {
        .btn {
          font-size: 18px;
        }
      }
    }
  }
}

.themes-list,
.font-list {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;

  .theme-info {
    font-size: 16px;
    margin-right: 10px;
    min-width: 32px;
  }

  .theme-item {
    width: 35px;
    height: 35px;
    margin-right: 10px;
    box-sizing: border-box;

    .theme {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 35px;
      box-shadow: 0 0 10px var(--card-border);
      cursor: pointer;
    }

    &:last-child {
      margin-right: 0;
    }
  }
}

.font-list {
  padding: 0 20px 0 10px;
  .font-info {
    font-size: 16px;
    margin-right: 10px;
    min-width: 32px;
  }

  .slider {
    flex: 1;
  }
}
</style>
