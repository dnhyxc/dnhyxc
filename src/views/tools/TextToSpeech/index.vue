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
        <div class="history-title">最近转换</div>
        <el-scrollbar ref="scrollRef" max-height="300px" wrap-class="scrollbar-wrapper">
          <div class="list">
            <div v-for="(item, index) in convertStore.convertList" :key="index" class="item">{{ item.keyword }}</div>
          </div>
        </el-scrollbar>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :disabled="!keyword.trim()" @click="onConvert">播放</el-button>
          <el-button type="info" :disabled="!keyword.trim() || !speech" @click="onPause">暂停</el-button>
          <el-button type="success" :disabled="!keyword.trim() || !speech" @click="onResume">恢复</el-button>
          <el-button type="warning" :disabled="!keyword.trim()" @click="onRefresh">重置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { SpeechPlayer } from '@/utils';
import { convertStore } from '@/store';

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
// 语音播放实例
const speech = ref<SpeechPlayer | null>(null);
// 保存最新的五条转换
const convertList = ref<string[]>([]);

const visible = computed({
  get() {
    return props.modalVisible;
  },
  set(visible: boolean) {
    emit('update:modalVisible', visible);
  },
});

// 当转换弹窗关闭时，停止播放语音
watch(visible, (newVal) => {
  if (!newVal) {
    // 弹窗关闭，清空keyword
    keyword.value = '';
    if (speech.value) {
      speech.value.cancel();
      speech.value = null;
    }
  } else {
    convertStore.getConvertList();
  }
});

onUnmounted(() => {
  if (speech.value) {
    speech.value.cancel();
    speech.value = null;
  }
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

  // 播放结束事件
  const endEvent = () => {
    speech.value = null;
    if (convertList.value.length > 5) {
      convertList.value = [keyword.value, ...convertList.value].slice(0, 4);
    } else {
      convertList.value = [keyword.value, ...convertList.value];
    }
    convertStore.createConvert(keyword.value);
  };

  speech.value = new SpeechPlayer({
    text: keyword.value.trim(),
    rate: 10,
    endEvent,
  });

  // 每次播放前，清除播放列表
  speech.value.cancel();
  speech.value.start();
};

// 暂停
const onPause = () => {
  if (speech.value) {
    speech.value.pause();
  }
};

// 恢复
const onResume = () => {
  if (speech.value) {
    speech.value.resume();
  }
};

// 重置
const onRefresh = () => {
  console.log('重置');
  keyword.value = '';
  if (speech.value) {
    speech.value.cancel();
    speech.value = null;
  }
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

    .history-title {
      font-size: 16px;
      margin: 20px 0 10px;
      color: var(--font-1);
    }

    .list {
      background-color: var(--pop-before-bg-color);
      padding: 10px;
      box-sizing: border-box;
      border-radius: 5px;
      margin-top: 10px;

      .item {
        position: relative;
        font-size: 16px;
        color: var(--font-1);
        width: 100%;
        margin-bottom: 10px;

        &:hover {
          color: @font-success;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
