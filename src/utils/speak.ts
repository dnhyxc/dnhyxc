/**
 * @description 文字转语音方法
 * @public
 * @param { text, rate, lang, volume, pitch, startEvent, endEvent } object
 * @param text 要合成的文字内容，字符串
 * @param rate 读取文字的语速 0.1~10 正常1
 * @param lang 读取文字时的语言
 * @param volume 读取时声音的音量 0~1 正常1
 * @param pitch 读取时声音的音高 0~2 正常1
 * @param startEvent 播放开始时间
 * @param endEvent 播放结束时间
 * @returns SpeechSynthesisUtterance
 */
interface SpeakParams {
  text: string;
  rate?: number;
  lang?: string;
  volume?: number;
  pitch?: number;
  endEvent?: Function;
  startEvent?: Function;
}

export class SpeechPlayer {
  private utterance: SpeechSynthesisUtterance;
  private isPlaying: boolean;

  constructor({ text, rate = 1, lang = 'zh-CN', volume = 0.5, pitch = 1, endEvent, startEvent }: SpeakParams) {
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.rate = rate;
    this.utterance.lang = lang;
    this.utterance.volume = volume;
    this.utterance.pitch = pitch;
    this.isPlaying = false;
    this.utterance.onstart = (e): void => startEvent && startEvent(e);
    this.utterance.onend = (e): void => endEvent && endEvent(e);
  }

  // 设置音量
  public setVolume(value: number): void {
    this.utterance.volume = value;
  }

  // 设置语音类型
  public setVoice(name = 'Yaoyao'): void {
    const voices = speechSynthesis.getVoices();
    const findVoice = voices.find((i) => i.name.includes(name));
    findVoice && (this.utterance.voice = findVoice);
  }

  // 切换播放速度
  public setRate(speed: number) {
    this.pause();
    this.utterance.rate = speed;
    this.resume();
  }

  // 开始播放
  public start(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.setVoice();
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
