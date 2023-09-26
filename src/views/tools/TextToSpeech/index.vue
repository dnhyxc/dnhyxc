<!--
 * 语音播报
 * @author: dnhyxc
 * @since: 2023-05-29
 * index.vue
-->
<template>
  <div class="speech-wrap">
    <div class="content">
      <div class="inp-wrap">
        <div class="label">
          <span class="left">输入文本转换</span>
          <span class="close" @click="onClose">关闭</span>
        </div>
        <el-input
          v-model="keyword"
          :autosize="{ minRows: 6, maxRows: 6 }"
          type="textarea"
          maxlength="800"
          resize="none"
          show-word-limit
          placeholder="请输入需要转换的文本"
          @input="onKeywordChange"
        />
      </div>
      <div class="speech-list">
        <div v-if="convertStore.convertList.length" class="history-title">
          <span class="left">最近转换</span>
          <el-button class="right" type="danger" link @click="onClearAll">清空历史</el-button>
        </div>
        <el-scrollbar
          v-if="convertStore.convertList.length"
          ref="scrollRef"
          max-height="calc(100vh - 380px)"
          wrap-class="scrollbar-wrapper"
        >
          <div class="list">
            <div v-for="(item, index) in convertStore.convertList" :key="index" class="item">
              <div :class="`${selectKeyword === item.keyword && speech && 'playing-keyword'} keyword`">
                {{ item.keyword }}
              </div>
              <div :class="`${selectKeyword === item.keyword && speech && 'playing-actions'} actions`">
                <span class="play">
                  <i
                    :class="`iconfont ${
                      selectKeyword === item.keyword && speech
                        ? 'icon-bofangzhong'
                        : speech
                        ? 'icon-pause-circle'
                        : 'icon-zanting'
                    } `"
                    @click="onPlay(item)"
                  />
                </span>
                <span class="delete">
                  <i class="iconfont icon-guanbi" @click="onDelete(item)" />
                </span>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div class="footer">
      <el-button
        :type="speech ? 'warning' : 'primary'"
        :disabled="!keyword.trim() && !selectKeyword"
        @click="onConvert"
        >{{ speech ? '重置' : '播放' }}</el-button
      >
      <el-button type="info" :disabled="(!keyword.trim() && !selectKeyword) || !speech" @click="onPause">
        暂停
      </el-button>
      <el-button type="success" :disabled="(!keyword.trim() && !selectKeyword) || !speech" @click="onResume">
        恢复
      </el-button>
      <el-popover placement="top" popper-class="speed-pop" trigger="hover">
        <div class="content">
          <el-slider v-model="volume" vertical height="176px" :step="0.05" :min="0" :max="1" :show-tooltip="false" />
        </div>
        <template #reference>
          <el-button :type="speech ? 'info' : 'primary'" class="spend-btn" :disabled="!!speech">
            音量 {{ (volume * 100).toFixed(0) }}%
          </el-button>
        </template>
      </el-popover>
      <el-popover placement="top" popper-class="speed-pop" trigger="hover">
        <div class="content">
          <el-slider v-model="speed" vertical height="176px" :step="0.25" :min="0.5" :max="3" :show-tooltip="false" />
        </div>
        <template #reference>
          <el-button :type="speech ? 'info' : 'primary'" class="spend-btn" :disabled="!!speech"
            >倍速 {{ speed }}</el-button
          >
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch, onMounted } from 'vue';
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
// 播放音量
const volume = ref<number>(0.5);
// 输入的文本
const keyword = ref<string>('');
// select keyword
const selectKeyword = ref<string>('');
// 语音播放实例
const speech = ref<SpeechPlayer | null>(null);

onMounted(() => {
  if (props.modalVisible) {
    convertStore.getConvertList();
  }
});

onUnmounted(() => {
  // 弹窗关闭，清空keyword
  keyword.value = '';
  selectKeyword.value = '';
  if (speech.value) {
    speech.value.cancel();
    speech.value = null;
  }
});

watch(volume, (newVal) => {
  speech.value?.setVolume(newVal);
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

// 关闭
const onClose = () => {
  emit('update:modalVisible', false);
};

// 输入框内容更改事件
const onKeywordChange = () => {
  selectKeyword.value = '';
};

// 转换
const onConvert = () => {
  if (!keyword.value.trim() && !selectKeyword.value) {
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
      text: selectKeyword.value || keyword.value.trim(),
      rate: speed.value,
      volume: volume.value,
      endEvent,
    });
    speech.value.start();
  }
  // 添加转换列表
  keyword.value && convertStore.createConvert(keyword.value);
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

// 播放
const onPlay = (item: ConvertParams) => {
  selectKeyword.value = item.keyword;
  onConvert();
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

.speech-wrap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  overflow: hidden;
  padding: 0 10px 10px;

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;

    .speech-list {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: auto;
    }

    :deep {
      .scrollbar-wrapper {
        flex: 1;
      }
    }

    .inp-wrap {
      .label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--font-1);
        font-size: 16px;
        height: 45px;

        .close {
          color: var(--theme-blue);
          cursor: pointer;

          &:hover {
            color: @active;
          }
        }
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
          .actions {
            display: flex;
          }
        }

        .keyword {
          flex: 1;

          &:hover {
            color: @font-success;
            cursor: pointer;
          }
        }

        .playing-keyword {
          color: @font-success;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          position: absolute;
          top: -1px;
          right: 0;
          display: none;

          & > :first-child {
            margin-right: 10px;
          }

          .delete,
          .play {
            width: 25px;
            height: 25px;
            line-height: 25px;
            text-align: center;
            border-radius: 5px;
            background-color: var(--to-top-bg-color);
            box-shadow: 0 0 3px var(--theme-blue);
            backdrop-filter: blur(3px);

            .icon-guanbi,
            .icon-zanting,
            .icon-pause-circle {
              color: @font-danger;
              font-size: 16px;
              cursor: pointer;
            }

            .icon-bofangzhong {
              color: var(--theme-blue);
            }

            .icon-pause-circle {
              color: @font-warning;
            }

            &:hover {
              .icon-guanbi {
                color: @font-warning;
              }
            }
          }

          .play {
            .icon-zanting {
              color: @active;
            }
          }
        }

        .playing-actions {
          display: flex;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .footer {
    position: relative;
    text-align: right;
    z-index: 99;
  }

  :deep {
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
}
</style>
