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
        <span class="title">电子书预览</span>
        <el-upload
          class="uploader"
          accept=".epub"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :http-request="onUpload"
        >
          <el-button type="primary" link class="upload-text">
            {{ currentBook ? '重新选择电子书' : '选择电子书' }}
          </el-button>
        </el-upload>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <div v-if="!currentBook" class="content">
      <DragUpload class="drag-upload" :on-upload="onUpload" upload-info-text="epub 格式的文件" />
    </div>
    <div v-else class="content">
      <div ref="previewRef" class="preview-wrap">
        <div id="preview" />
      </div>
      <div class="toc-list-wrap">
        <div v-if="tocList.length > 0" class="toc-title">
          <span>目录总览</span>
          <i
            :class="`font iconfont ${scrollChildTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
            @click="onScrollTo"
          />
        </div>
        <el-scrollbar ref="scrollChildRef" wrap-class="scrollbar-wrapper">
          <div class="toc-wrap">
            <TreeNode :node-list="tocList" :on-selected="onSelected" :default-selected-toc-id="defaultSelectedTocId" />
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div v-if="currentBook" class="footer">
      <div class="themes">
        <div class="font-set">
          <el-popover placement="top-start" popper-class="msg-popover" :show-arrow="false" :width="250" trigger="hover">
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
          <el-popover placement="top-start" popper-class="msg-popover" :show-arrow="false" width="auto" trigger="hover">
            <template #reference>
              <i class="set-icon star-icon iconfont icon-a-huaban2fuben9" />
            </template>
            <div class="themes-list">
              <span class="theme-info" :style="{ color: fontColor }">主题</span>
              <span
                v-for="theme in EPUB_THEMES"
                :key="theme.name"
                class="theme"
                :style="{ background: theme.style.body.background }"
                @click="onThemeChange(theme.style.body)"
              />
            </div>
          </el-popover>
        </div>
      </div>
      <div class="book-actions">
        <el-button type="primary" @click="onPrev">上一章</el-button>
        <el-button type="primary" @click="onNext">下一章</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import type { UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import ePub, { Rendition } from 'epubjs';
import { useChildScroller } from '@/hooks';
import { scrollTo, debounce } from '@/utils';
import { EPUB_THEMES } from '@/constant';
import { BookTocItem, BookTocList } from '@/typings/common';

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
const lineHeight = ref<number>(28);
// 选中的电子书
const currentBook = ref<File | null>(null);
// ePub 实例
let book: any = null;
// 渲染元素
let rendition: Rendition | null = null;
// 全部目录
const allTocs: BookTocList[] = [];

const { scrollChildRef, scrollChildTop } = useChildScroller();

defineProps<IProps>();

const emit = defineEmits<Emits>();

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
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});

const onResize = () => {
  rendition?.resize(previewRef.value!.clientWidth, previewRef.value!.clientHeight);
};

// 上传校验
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'application/epub') {
    ElMessage.error('只允许上传 epub 格式的文件');
    return false;
  }
  return true;
};

// 自定义上传
const onUpload = (event: { file: File }) => {
  resetRendition();
  currentBook.value = event.file;
  const reader = new FileReader();
  reader.onload = (e: Event) => {
    const buffer = (e.target as FileReader).result as string;
    renderBook(buffer);
  };
  reader.readAsArrayBuffer(event.file);
};

// 重置阅读属性设置
const resetRendition = () => {
  // 重新选择电子书时清空目录
  tocList.value = [];
  // 重新选择电子书时重置原来的电子书
  rendition?.destroy();
  fontColor.value = 'var(--font-1)';
  fontSize.value = 16;
  lineHeight.value = 28;
};

// 渲染电子书
const renderBook = (buffer: Buffer | string) => {
  // 在Vue组件中的某个方法中
  book = ePub(buffer);
  rendition = book.renderTo('preview', {
    width: previewRef.value!.clientWidth,
    height: previewRef.value!.clientHeight,
    flow: 'scrolled',
    resizeOnOrientationChange: true,
    overflow: 'scroll',
    snap: true,
    defaultDirection: 'ltr',
  });
  console.log(rendition, 'rendition');
  // 渲染电子书
  rendition?.display();
  setFontSize('16px');
  setLineHeight('28px');
  // 获取目录
  book.ready.then(() => {
    console.log(book.navigation.toc, 'ook.navigation.toc', book.navigation);
    tocList.value = book?.navigation?.toc || [];
    defaultSelectedTocId.value = book?.navigation?.toc?.[0].id;
    flattenItems(book?.navigation?.toc || []);
  });
  onThemeChange(EPUB_THEMES[0].style.body);
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
  // if (background === 'transparent') {
  //   rendition?.themes.override('color', getComputedStyle(document.body).getPropertyValue('--font-1'));
  // } else {
  // }
  rendition?.themes.override('color', color);
  rendition?.themes.override('background', background);
};

// 上一页
const onPrev = () => {
  const index = allTocs.findIndex((item) => item.id === defaultSelectedTocId.value);
  if (index > 0) {
    const currentToc = allTocs[index - 1];
    setActiveToc(currentToc.id);
  }
  rendition?.prev();
};

// 下一页
const onNext = () => {
  const index = allTocs.findIndex((item) => item.id === defaultSelectedTocId.value);
  const currentToc = allTocs[index + 1];
  if (index < allTocs.length - 1) {
    setActiveToc(currentToc.id);
  }
  rendition?.next();
};

// 选择菜单
const onSelected = (node: BookTocItem) => {
  const { id, href } = node;
  setActiveToc(id);
  onJumpTo(href);
};

// 设置选中目录类名
const setActiveToc = (id: string) => {
  const tocs = document.querySelectorAll('.title');
  tocs.forEach((toc) => {
    (toc as HTMLElement).classList.remove('active');
  });
  const active = document.querySelector(`#${id}`) as HTMLElement;
  defaultSelectedTocId.value = id;
  active.classList.add('active');
};

// 跳转到指定章节
const onJumpTo = (href: string) => {
  rendition?.display(href);
};

const onClose = () => {
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
    padding: 0 10px;
    border-bottom: 1px solid var(--card-border);
    box-sizing: border-box;
    color: var(--font-1);

    .left {
      display: flex;
      align-items: center;

      .title {
        color: v-bind(fontColor);
      }

      .uploader {
        margin-left: 10px;
        font-size: 14px;

        .upload-text {
          padding: 0;
          .icon-upload {
            margin-right: 5px;
            font-size: 18px;
          }
        }
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

      #preview {
        width: calc(100vw - 342px);
        height: calc(100vh - 172px);
      }
    }

    :deep {
      .scrollbar-wrapper {
        overflow-x: hidden;
        height: calc(100vh - 212px);
      }
    }

    .toc-list-wrap {
      width: 260px;
      min-width: 260px;
      height: calc(100vh - 172px);
      color: v-bind(fontColor);

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
          font-size: 25px;
          cursor: pointer;
          margin-right: 15px;
          color: v-bind(fontColor);

          &:hover {
            color: var(--theme-blue);
          }
        }

        .star-icon {
          font-size: 26px;
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

  .theme {
    display: block;
    width: 35px;
    height: 35px;
    border-radius: 35px;
    margin-right: 10px;
    box-shadow: 0 0 10px var(--card-border);
    box-sizing: border-box;
    cursor: pointer;

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
