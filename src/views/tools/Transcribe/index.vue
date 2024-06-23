<!--
 * 屏幕录制
 * @author: dnhyxc
 * @since: 2024-01-21
 * index.vue
-->
<template>
  <div class="transcribe-wrap">
    <div v-if="!hideHeader" class="header">
      <div class="left">
        <span class="title">屏幕录制</span>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <Loading :loading="loading" load-text="正在准备中，请稍等..." class="content">
      <Empty v-if="!screenStream && !blobUrl" text="暂无录制" />
      <div class="video-preview">
        <video v-if="!blobUrl" ref="videoPreviewRef" :srcObject="screenStream" autoplay muted />
        <video v-if="blobUrl" ref="videoRef" :src="mp4VideoInfo.url || blobUrl" autoplay controls />
      </div>
    </Loading>
    <div class="footer">
      <div class="left">
        <el-radio-group v-model="needAudio" :disabled="transcribeStatus || disabled">
          <el-radio label="仅录制屏幕" />
          <el-radio label="录制声音及屏幕" />
        </el-radio-group>
      </div>
      <div class="right">
        <el-button v-if="blobUrl" type="primary" link @click="onDownload"> WEBM 下载 {{ videoSize }}</el-button>
        <el-popover v-if="blobUrl" placement="top-start" :width="312" trigger="hover">
          <div class="mp4-popover">
            <div class="slider">
              <span>CRF 质量：</span>
              <el-slider v-model="translateInfo.crf" :step="1" :min="18" :max="28" show-stops />
            </div>
          </div>
          <template #reference>
            <el-button type="primary" link :loading="downloadLoading" class="mp4-btn" @click="onTranslateForMp4">
              {{
                mp4VideoInfo.url
                  ? `MP4 下载 ${mp4VideoInfo.size}`
                  : `${downloadLoading ? 'MP4 转换中...' : '转为 MP4 下载'}`
              }}
            </el-button>
          </template>
        </el-popover>
        <el-button
link :type="transcribeStatus ? 'warning' : blobUrl ? 'info' : 'primary'" class="start-btn"
          :disabled="!!blobUrl" @click="onTranscribe">
          <span class="text" :title="activeSource.name">
            {{
              transcribeStatus
                ? `停止录制 ${formatDuration(elapsedTime)}`
                : blobUrl
                  ? `录制完毕 ${formatDuration(elapsedTime)}`
                  : '开始录制'
            }}
            -
            {{ activeSource.name }}
          </span>
        </el-button>
        <el-dropdown
type="primary" class="select-btn" :disabled="transcribeStatus || disabled"
          popper-class="custom-dropdown-styles">
          <i :class="`iconfont icon-mulu ${(transcribeStatus || disabled) && 'disabled-menu'}`" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="source in mediaSources" :key="source.id" @click="createMedia(source.id, source)">
                {{ source.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button :disabled="!blobUrl" type="danger" link @click="onRestore">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DesktopCapturerSource, ipcRenderer } from 'electron';
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { formatDuration, onDownloadFile, translateWebmToMp4 } from '@/utils';

interface IProps {
  hideHeader?: boolean;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

const props = defineProps<IProps>();

const emit = defineEmits<Emits>();

const loading = ref<boolean>(false);
const downloadLoading = ref<boolean>(false);
const mediaSources = ref<DesktopCapturerSource[]>([]);
const activeSource = reactive<{
  id: string;
  name: string;
}>({
  id: 'screen:0:0',
  name: '屏幕 1',
});
const mediaRecorder = ref<MediaRecorder | null>(null);
const chunks = ref<Blob[]>([]);
const screenStream = ref<MediaStream | null>(null);
const transcribeStatus = ref<boolean>(false);
const blobUrl = ref<string>('');
const videoPreviewRef = ref<HTMLVideoElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const disabled = ref<boolean>(false);
const needAudio = ref<string>('仅录制屏幕');
const startTime = ref<number>(0);
const elapsedTime = ref<number>(0);
const videoSize = ref<string>('');
const mp4VideoInfo = reactive<{ url: string; size: string }>({ url: '', size: '' });
const translateInfo = reactive({
  crf: 20,
  threads: navigator.hardwareConcurrency || 2,
});

let timer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  ipcRenderer.send('load-transcribe', props.hideHeader ? 'tools_transcribe' : '');
  ipcRenderer.on('share-screen-sources', getSources);
});

onUnmounted(() => {
  ipcRenderer.removeListener('share-screen-sources', getSources);
  onRestore();
});

const getSources = async (e: any, sources: DesktopCapturerSource[]) => {
  mediaSources.value = sources;
};

// 创建媒体流
const createMedia = async (id: string, source?: DesktopCapturerSource) => {
  // 设置活动源的ID和名称
  activeSource.id = id;
  activeSource.name = source?.name || activeSource.name;
  // 获取用户媒体流
  const stream = await navigator.mediaDevices.getUserMedia({
    // 这里设置 audio: true 录制声音会崩溃
    audio: false,
    video: {
      // @ts-ignore
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: id, // 如果id为空，如果有分屏，会把主屏和分屏录制在同一个画面
        maxFrameRate: 30, // 设置最大帧率为 30 帧/秒
        minWidth: 1920, // 设置视频宽度为 1920 像素（4K: 3840 像素）
        minHeight: 1080, // 设置视频高度为 1080 像素（4K: 2160 像素）
      },
    },
  });

  loading.value = false;

  // 录制音频
  const combinedSource = await transcribeWithAudio(stream);

  screenStream.value = combinedSource;

  mediaRecorder.value = new MediaRecorder(combinedSource, { mimeType: 'video/webm' });

  // 监听录制流
  mediaRecorder.value.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) {
      chunks.value.push(event.data);
    }
  });

  // 开始录制
  mediaRecorder.value.start();

  // 设置视频预览宽度
  videoPreviewRef.value!.style.width = '100%';

  // 设置录制开始时间
  startTime.value = Date.now();
  timer = setInterval(() => {
    elapsedTime.value = Math.round((Date.now() - startTime.value) / 1000); // 录制时长，单位为秒
  }, 1000);

  transcribeStatus.value = true;

  // 监听停止录制事件
  mediaRecorder.value.addEventListener('stop', () => {
    const completeBlob = new Blob(chunks.value, {
      type: 'video/webm',
    });
    videoSize.value = `${(completeBlob.size / 1024 / 1024).toFixed(2)} MB`;
    blobUrl.value = URL.createObjectURL(completeBlob);
    // 停止录制中的视频预览播放
    videoPreviewRef.value?.pause();
    nextTick(() => {
      videoRef.value!.style.width = '100%';
    });
    transcribeStatus.value = false;
  });
};

const transcribeWithAudio = async (stream: MediaStream): Promise<MediaStream> => {
  if (needAudio.value === '录制声音及屏幕') {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const audioCtx = new AudioContext();
    const micSoundSource = audioCtx.createMediaStreamSource(mediaStream);
    const systemSoundDestination = audioCtx.createMediaStreamDestination();
    micSoundSource.connect(systemSoundDestination);
    // 合并音频流与视频流
    return new MediaStream([...stream.getVideoTracks(), ...systemSoundDestination.stream.getAudioTracks()]);
  }
  return stream;
};

// 开始录制
const onTranscribe = () => {
  loading.value = true;
  if (!transcribeStatus.value) {
    createMedia(activeSource.id);
  } else {
    onStopTranscribe();
  }
};

// 停止录制
const onStopTranscribe = () => {
  loading.value = false;
  disabled.value = true;
  mediaRecorder.value?.stop();
  // 停止屏幕共享的流并关闭所有的轨道
  screenStream.value?.getTracks().forEach((track) => track.stop());
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  screenStream.value = null;
  mediaRecorder.value = null;
  chunks.value = [];
};

// 重置
const onRestore = () => {
  // 停止录制好的视频预览播放器
  videoRef.value?.pause();
  blobUrl.value = '';
  disabled.value = false;
  needAudio.value = '仅录制屏幕';
  startTime.value = 0;
  elapsedTime.value = 0;
  videoSize.value = '';
  activeSource.id = 'screen:0:0';
  activeSource.name = '屏幕 1';
  mp4VideoInfo.url = '';
  mp4VideoInfo.size = '';
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const onDownload = () => {
  onDownloadFile({ url: blobUrl.value, type: 'blob', fileName: 'download.webm' });
};

// 将视频转为MP4
const onTranslateForMp4 = async () => {
  if (mp4VideoInfo.url) {
    onDownloadFile({ url: mp4VideoInfo.url, type: 'blob', fileName: 'video.mp4' });
  } else {
    downloadLoading.value = true;
    const { url, size } = await translateWebmToMp4({
      blobUrl: blobUrl.value,
      crf: String(translateInfo.crf),
      threads: String(translateInfo.threads)
    });
    mp4VideoInfo.url = url;
    mp4VideoInfo.size = size;
    downloadLoading.value = false;
  }
}

// 关闭屏幕录制页面
const onClose = () => {
  emit('update:modalVisible', false);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.transcribe-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    height: 45px;
    min-height: 45px;
    padding: 0 10px;
    box-sizing: border-box;
    color: var(--font-1);

    .left {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
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
    overflow: hidden;
    border-radius: 0;
    box-sizing: border-box;
    border-top: 1px solid var(--card-border);

    .empty {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      box-sizing: border-box;

      .empty-text {
        color: var(--font-3);
        font-size: 50px;
      }
    }

    .video-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
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

    .left {
      flex: 1;
      min-width: 250px;

      :deep {
        .el-radio {
          margin-right: 18px;
        }

        .el-radio__label {
          margin-top: -3px;
        }

        .el-radio__input {
          margin-top: -2px;
        }
      }

      .toggle {
        height: 32px;
      }
    }

    .right {
      flex: 1;
      display: flex;
      justify-content: flex-end;

      .select-btn {
        margin: 0 10px 0 2px;
      }

      .start-btn {
        .text {
          max-width: 450px;
          .ellipsis();
        }
      }

      .icon-mulu {
        color: var(--theme-blue);
        font-size: 18px;
        cursor: pointer;
      }

      .disabled-menu {
        color: @info-text-color;
        cursor: not-allowed;
      }
    }
  }
}

.mp4-popover {
  .slider {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
}
</style>
