<!--
 * 图片压缩弹窗
 * @author: dnhyxc
 * @since: 2023-05-29
 * index.vue
-->
<template>
  <div class="modal-wrap">
    <el-dialog v-model="visible" :close-on-click-modal="false" title="文本转语音" align-center width="850px">
      <div class="content">
        <el-scrollbar ref="scrollRef" max-height="75vh" wrap-class="scrollbar-wrapper">
          <div class="inp-wrap">
            <div class="label">输入文本转换</div>
            <el-input
              v-model="keyword"
              :autosize="{ minRows: 5, maxRows: 8 }"
              type="textarea"
              maxlength="300"
              show-word-limit
              placeholder="请输入需要转换的文本"
            />
          </div>
        </el-scrollbar>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :disabled="!keyword.trim()" @click="onConvert">转换</el-button>
          <el-button type="primary" @click="onDownload">下载</el-button>
          <el-button type="warning" @click="onRefresh">重置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import { onSpeak } from '@/utils';

interface IProps {
  modalVisible: boolean;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

const props = withDefaults(defineProps<IProps>(), {
  modalVisible: false,
});

const emit = defineEmits<Emits>();

// 输入的文本
const keyword = ref<string>('');

const visible = computed({
  get() {
    return props.modalVisible;
  },
  set(visible: boolean) {
    emit('update:modalVisible', visible);
  },
});

// 转换
const onConvert = () => {
  if (!keyword.value.trim()) {
    ElMessage({
      message: '请先输入需要转换的文本',
      type: 'warning',
      offset: 80,
    });
    return;
  }
  console.log(keyword.value.trim(), '转换');
  const value = keyword.value.trim();

  const startEvent = (value: any) => {
    console.log(value, 'startEvent');
  };
  const endEvent = (value: any) => {
    console.log(value, 'endEvent');
  };

  const res = onSpeak({ text: value, speechRate: 2, startEvent, endEvent });
  console.log(res, 'res');
};

// 下载
const onDownload = () => {
  console.log('下载');
};

// 重置
const onRefresh = () => {
  console.log('重置');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.modal-wrap {
  overflow: hidden;

  :deep {
    .el-dialog__body {
      padding: 10px 20px 0 !important;
    }
    .el-upload-dragger {
      padding: 10px 0 20px 0;
      background-color: var(--input-bg-color);
    }

    .el-input__wrapper {
      background-color: var(--input-bg-color);
    }

    .el-textarea__inner {
      color: var(--font-1);
      background-color: var(--input-bg-color);
    }

    .el-textarea .el-input__count {
      background-color: transparent;
    }

    .el-slider__button {
      width: 16px;
      height: 16px;
    }

    .el-form-item__label {
      color: var(--font-1);
    }
  }

  .content {
    .inp-wrap {
      .label {
        color: var(--font-1);
        font-size: 16px;
        margin-bottom: 10px;
      }
    }
  }
}
</style>
