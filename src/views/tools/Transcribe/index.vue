<!--
 * 屏幕录制
 * @author: dnhyxc
 * @since: 2024-01-21
 * index.vue
-->
<template>
  <div class="transcribe-wrap">
    <div class="header">
      <div class="left">
        <span class="title">屏幕录制</span>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <Loading :loading="loading" load-text="正在准备中，请稍等..." class="content">
      <Empty v-if="!screenStream && !blobUrl" text="暂无录制" />
      <div class="video-preview">
        <video v-if="!blobUrl" ref="videoPreviewRef" :srcObject="screenStream" autoplay muted></video>
        <video v-if="blobUrl" ref="videoRef" :src="blobUrl" autoplay controls></video>
      </div>
    </Loading>
    <div class="footer">
      <div class="left">
        <el-radio-group v-model="needAudio" :disabled="transcribeStatus || disabled">
          <el-radio label="仅录制屏幕" link />
          <el-radio label="录制声音及屏幕" link />
        </el-radio-group>
      </div>
      <div class="right">
        <el-button v-if="blobUrl" type="primary" link @click="onDownload">下载 {{ videoSize }}</el-button>
        <el-button
          :disabled="disabled"
          :type="transcribeStatus ? 'warning' : blobUrl ? 'info' : 'primary'"
          link
          @click="onTrancribe"
        >
          {{
            transcribeStatus
              ? `停止录制 ${formatDuration(elapsedTime)}`
              : blobUrl
              ? `录制完毕 ${formatDuration(elapsedTime)}`
              : '开始录制'
          }}
        </el-button>
        <el-button :disabled="!blobUrl" type="danger" link @click="onRestore">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import { onDownloadFile, formatDuration } from '@/utils';

interface IProps {
  modalVisible: boolean;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

defineProps<IProps>();

const emit = defineEmits<Emits>();

const loading = ref<boolean>(false);
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

let timer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  ipcRenderer.on('share-screen-sources', getSources);
});

onUnmounted(() => {
  ipcRenderer.removeListener('share-screen-sources', getSources);
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

const getSources = async (e: any, sources: any[]) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    // 这里设置 audio: true 录制声音会崩溃
    audio: false,
    video: {
      // @ts-ignore
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: 'screen:0:0',
      },
    },
  });

  loading.value = false;

  // 录制音频
  const combinedSource = await transcribeWithAudio(stream);

  screenStream.value = combinedSource;

  videoPreviewRef.value!.style.width = '100%';

  mediaRecorder.value = new MediaRecorder(combinedSource, { mimeType: 'video/webm' });

  // 监听录制流
  mediaRecorder.value.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) {
      chunks.value.push(event.data);
    }
  });
  // 开始录制
  mediaRecorder.value.start();
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
    videoSize.value = `${(completeBlob.size / 1024 / 1024).toFixed(2)} M`;
    const url = URL.createObjectURL(completeBlob);
    blobUrl.value = url;
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
    const combinedSource = new MediaStream([
      ...stream.getVideoTracks(),
      ...systemSoundDestination.stream.getAudioTracks(),
    ]);

    return combinedSource;
  }

  return stream;
};

// 开始录制
const onTrancribe = () => {
  loading.value = true;
  if (!transcribeStatus.value) {
    ipcRenderer.send('load-transcribe');
  } else {
    onStopTrancribe();
  }
};

// 停止录制
const onStopTrancribe = () => {
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
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const onDownload = () => {
  onDownloadFile({ url: blobUrl.value, type: 'blob' });
};

// 关闭屏幕录制页面
const onClose = () => {
  onRestore();
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
  height: 100%;

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
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
