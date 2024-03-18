<!--
 * 预览工具头部
 * @author: dnhyxc
 * @since: 2024-03-12
 * index.vue
-->
<template>
  <div :class="`header ${hideHeader && 'hide-header'}`">
    <div class="left">
      <div class="actions">
        <span v-if="!hideHeader" class="title">{{ title }}</span>
        <div class="btns">
          <el-button type="primary" link class="book-btn" @click="showBookList">
            {{ loadLineText }}
          </el-button>
          <el-upload
            class="uploader"
            :accept="accept"
            :disabled="loading"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="onUpload"
          >
            <el-button
              :disabled="loading"
              type="primary"
              link
              :class="`book-btn upload-text ${loading && 'disabled-btn'}`"
            >
              {{ url ? '重新选择' : '选择文件' }}
            </el-button>
          </el-upload>
          <el-button
            v-if="loginStore.userInfo.auth === 1 && loadType === 'upload' && url"
            type="primary"
            link
            :disabled="saveLoading"
            :class="`upload-btn ${saveLoading && 'disabled-btn'}`"
            @click="onSave"
          >
            {{ !saveLoading ? (saveStatus ? '重新保存' : '保存 Word') : '正在保存' }}
          </el-button>
          <span class="name">{{ fileName }}</span>
        </div>
      </div>
    </div>
    <span v-if="!hideHeader" class="close" @click="onClose">关闭</span>
  </div>
</template>

<script setup lang="ts">
import { loginStore } from '@/store';

interface IProps {
  title: string;
  loadLineText: string;
  accept: string;
  fileName: string;
  saveLoading: boolean;
  saveStatus: boolean;
  loading: boolean;
  url: any;
  loadType: string;
  onClose: () => void;
  onSave: () => void;
  beforeUpload: Function;
  onUpload: ({ file }: { file: File }) => Promise<void> | void;
  showBookList: () => void;
  hideHeader?: boolean;
}

defineProps<IProps>();
</script>

<style scoped lang="less">
@import '@/styles/index.less';

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
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .actions {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;

      .title {
        color: var(--font-1);
        margin-right: 10px;
      }

      .btns {
        flex: 1;
        display: flex;
        align-items: center;

        .book-btn,
        .upload-btn {
          color: var(--theme-blue);
          font-size: 16px;

          &:hover {
            color: var(--el-color-primary-light-5);
          }
        }

        .upload-btn {
          margin-left: 10px;
        }

        .uploader {
          margin-left: 10px;
          font-size: 14px;

          .upload-text {
            padding: 0;
            margin-left: 0;
            .icon-upload {
              margin-right: 5px;
              font-size: 18px;
            }
          }
        }

        .disabled-btn {
          color: var(--el-color-primary-light-5);
        }
      }
    }

    .name {
      font-size: 16px;
      margin: 0 10px 0 13px;
      color: var(--font-1);
      padding-top: 1px;
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

.hide-header {
  border-top: 1px solid var(--card-border);
  border-bottom: none;
}
</style>
