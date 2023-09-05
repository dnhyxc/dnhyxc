/**
 * @description 文字转语音方法
 * @public
 * @param { text, rate, lang, volume, pitch } object
 * @param  text 要合成的文字内容，字符串
 * @param  rate 读取文字的语速 0.1~10  正常1
 * @param  lang 读取文字时的语言
 * @param  volume  读取时声音的音量 0~1  正常1
 * @param  pitch  读取时声音的音高 0~2  正常1
 * @returns SpeechSynthesisUtterance
 */
interface SpeakParams {
  text: string;
  speechRate?: number;
  lang?: string;
  volume?: number;
  pitch?: number;
  endEvent?: Function;
  startEvent?: Function;
}

export class SpeechPlayer {
  private utterance: SpeechSynthesisUtterance;
  private isPlaying: boolean;

  constructor({ text, speechRate = 1, lang = 'zh-CN', volume = 1, pitch = 1, endEvent, startEvent }: SpeakParams) {
    this.utterance = new SpeechSynthesisUtterance();
    this.utterance.text = text;
    this.utterance.rate = speechRate;
    this.utterance.lang = lang;
    this.utterance.volume = volume;
    this.utterance.pitch = pitch;
    this.isPlaying = false;
  }

  // 开始播放
  public start(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;
      speechSynthesis.speak(this.utterance);
    }
  }

  // 暂停
  public pause(): void {
    if (this.isPlaying) {
      this.isPlaying = false;
      speechSynthesis.pause();
    }
  }

  // 恢复播放
  public resume(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;
      speechSynthesis.resume();
    }
  }

  // 清空播放列表
  public cancel(): void {
    this.isPlaying = false;
    speechSynthesis.cancel();
  }
}
