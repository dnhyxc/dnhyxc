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
            resize="none"
            show-word-limit
            placeholder="请输入需要转换的文本"
          />
        </div>
        <div v-if="convertStore.convertList.length" class="history-title">
          <span class="left">最近转换</span>
          <el-button class="right" type="danger" link @click="onClearAll">清空历史</el-button>
        </div>
        <el-scrollbar
          v-if="convertStore.convertList.length"
          ref="scrollRef"
          max-height="300px"
          wrap-class="scrollbar-wrapper"
        >
          <div class="list">
            <div v-for="(item, index) in convertStore.convertList" :key="index" class="item">
              <div class="keyword" @click="onSelect(item)">{{ item.keyword }}</div>
              <span class="delete">
                <i class="iconfont icon-guanbi" @click="onDelete(item)" />
              </span>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button :type="speech ? 'warning' : 'primary'" :disabled="!keyword.trim()" @click="onConvert">{{
            speech ? '重置' : '播放'
          }}</el-button>
          <el-button type="info" :disabled="!keyword.trim() || !speech" @click="onPause">暂停</el-button>
          <el-button type="success" :disabled="!keyword.trim() || !speech" @click="onResume">恢复</el-button>
          <el-popover placement="top" popper-class="speed-pop" trigger="hover">
            <div class="content">
              <el-slider
                v-model="speed"
                vertical
                height="176px"
                :step="0.25"
                :min="0.5"
                :max="3"
                :show-tooltip="false"
              />
            </div>
            <template #reference>
              <el-button :type="speech ? 'info' : 'primary'" class="spend-btn" :disabled="speech"
                >倍速 {{ speed }}</el-button
              >
            </template>
          </el-popover>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { SpeechPlayer } from '@/utils';
import { convertStore } from '@/store';
import { ConvertParams } from '@/typings/common';

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

// 播放语速
const speed = ref<number>(1.25);
// 输入的文本
const keyword = ref<string>('');
// 语音播放实例
const speech = ref<SpeechPlayer | null>(null);

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

watch(speed, (newVal) => {
  if (speech.value) {
    speech.value.setRate(newVal);
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
  };

  if (speech.value) {
    speech.value.cancel();
    speech.value = null;
  } else {
    speech.value = new SpeechPlayer({
      text: keyword.value.trim(),
      rate: speed.value,
      endEvent,
    });
    speech.value.start();
  }
  // 添加转换列表
  convertStore.createConvert(keyword.value);
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

// 选择历史转换
const onSelect = (item: ConvertParams) => {
  keyword.value = item.keyword;
};

// 删除选中历史转换
const onDelete = (item: ConvertParams) => {
  convertStore.deleteConvert(item.id);
};

// 清空所有
const onClearAll = () => {
  convertStore.deleteConvert();
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

    .spend-btn {
      width: 80px;
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      margin: 20px 0 10px;
      color: var(--font-1);
    }

    .list {
      padding: 10px;
      box-sizing: border-box;
      border-radius: 5px;
      margin-top: 10px;
      background-color: var(--pre-bg-color);

      .item {
        position: relative;
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        color: var(--font-1);
        width: 100%;
        margin-bottom: 15px;

        &:hover {
          .delete {
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }

        .keyword {
          flex: 1;

          &:hover {
            color: @font-success;
            cursor: pointer;
          }
        }

        .delete {
          position: absolute;
          top: -1px;
          right: 0;
          width: 24px;
          height: 24px;
          border-radius: 5px;
          background-color: var(--to-top-bg-color);
          box-shadow: 0 0 3px var(--theme-blue);
          backdrop-filter: blur(3px);
          display: none;

          .icon-guanbi {
            color: @font-danger;
            font-size: 16px;
            cursor: pointer;
          }

          &:hover {
            .icon-guanbi {
              color: @font-warning;
            }
          }
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
