import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface TranslateWebmToMp4Options {
  blobUrl: string;
  crf?: string;
  threads?: string;
  callback?: (data: any) => void;
}

const ffmpeg = new FFmpeg();

// 定义一个全局变量来存储当前的转换任务
let currentConversion: Promise<number> | null | undefined = null;

export const loadFFmpeg = async (updateLoadedFFmpegStatus?: (status: boolean) => void) => {
  const res = await ffmpeg.load({
    coreURL: await toBlobURL('./ffmpeg-core.js', 'text/javascript'),
    wasmURL: await toBlobURL('./ffmpeg-core.wasm', 'application/wasm'),
  });
  updateLoadedFFmpegStatus?.(res);
};

export const translateWebmToMp4 = async ({
  blobUrl,
  threads = '2',
  crf = '18',
  callback,
}: TranslateWebmToMp4Options) => {
  /**
   * frame=2292：表明已经处理了 2292 帧视频。
   * fps=9.4：当前处理速度为每秒 9.4 帧（frames per second）。这个数值表示 FFmpeg 当前的处理效率。
   * q=29.0：这是当前帧的质量因子（quantization parameter），通常范围是 1 到 31。数值越低，质量越高，文件也会越大。29.0 表示当前帧的质量比较低。
   * size=3328kB：到目前为止生成的输出文件的大小为 3328KB（千字节）。
   * time=00:01:17.07：表示已经处理到输入视频的时间戳 1 分 17.07 秒处。这是输入文件中的时间位置，而不是执行时间。
   * bitrate=353.7kbits/s：当前处理视频的比特率为 353.7 kbps（千比特每秒）。这是输出视频的平均数据传输速率。
   * dup=1228：表示处理过程中出现了 1228 个重复帧。重复帧通常是由于输入视频源中的某些部分没有变化或是视频编码中的策略。
   * drop=0：表示到目前为止没有丢弃任何帧。
   * speed=0.318x：FFmpeg 的处理速度相对于实时的比率。0.318x 意味着当前处理速度为实时处理速度的 31.8%。换句话说，处理 1 秒的视频需要大约 3.14 秒的实际时间。
   */
  ffmpeg?.on('log', (e) => {
    console.log(e.message);
    if (e.message && callback) {
      callback(e.message);
    }
  });

  await ffmpeg?.writeFile('input.webm', await fetchFile(blobUrl));

  // 执行转换
  currentConversion = ffmpeg?.exec([
    '-threads',
    threads, // 设置并行处理线程数为 4
    '-i',
    'input.webm',
    '-c:v',
    'libx264',
    '-preset',
    'fast', // 设置预设为 fast，以提高编码速度
    '-crf',
    crf,
    'output.mp4',
  ]);

  try {
    // 等待转换完成
    await currentConversion;
    // 读取输出文件并处理
    const data = await ffmpeg?.readFile('output.mp4');
    // 将字节转换为兆字节
    const exportPath = URL.createObjectURL(new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' }));
    return {
      size: ((data as Uint8Array).byteLength / 1024 / 1024).toFixed(2) + ' MB',
      url: exportPath,
    };
  } catch (error) {
    // 处理转换失败或终止时的逻辑
    console.error('Conversion failed or was terminated:', error);
    throw error; // 可以选择抛出错误或者返回适当的错误信息
  }
};

// 添加一个方法来终止当前的转换任务
export const terminateConversion = () => {
  if (ffmpeg?.loaded && currentConversion) {
    ffmpeg?.terminate(); // 停止 ffmpeg 进程
    currentConversion = null; // 清除当前转换任务
  }
};
