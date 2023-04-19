import { IMG1, IMG2, IMG4, IMG5, HEAD_IMG } from '@/constant';

// 公共字体设置
const fontStyle = {
  '--font-1': '#252933',
  '--font-2': '#515767',
  '--font-3': '#4e5969',
  '--font-4': '#8a919f',
  '--font-5': '#c2c8d1',
  '--font-6': '#f2f3f5',
};

// 公共需要去除的样式
const removeStyle = {
  '--bg-animation': 'none',
  // 背景图片
  '--bg-image-url': 'none',
  // 富文本编辑器字体颜色
  '--e-edit-color': 'auto',
  // 系统设置表单背景颜色
  '--e-form-bg-color': 'initial',
  // 图片背景兼容字体颜色
  '--font-color': '',
  // 详情代码块背景颜色
  '--pre-bg-color': '#282c34',
};

// 背景图片公共配置
const imageStyles = {
  // 主题背景颜色
  '--background': 'transparent',
  // 弹窗背景颜色
  '--modal-bg-color': 'rgba(245, 250, 248, 0.2)',
  // 输入框背景颜色
  '--input-bg-color': 'transparent',
  // 文章各种卡片渐变颜色
  '--bg-lg-color1': 'rgba(245, 250, 248, 0.1)',
  '--bg-lg-color2': 'rgba(0, 0, 0, 0.3)',
  // 时间轴背景颜色
  '--timeline-lg-color1': 'rgba(245, 250, 248, 0.1)',
  '--timeline-lg-color2': 'rgba(0, 0, 0, 0.3)',
  // 各组件阴影颜色
  '--shadow-color': 'rgba(245, 250, 248, 0.2)',
  // 字体颜色
  '--font-1': '#fff',
  '--font-2': '#fff',
  '--font-3': '#fff',
  '--font-4': '#fff',
  '--font-5': '#fff',
  '--font-6': '#fff',
  // loading 背景颜色
  '--loading-color': 'rgba(0, 0, 0, 0.1)',
  // 组件边框颜色
  '--card-border': 'rgba(245, 250, 248, 0.5)',
  '--fff': 'rgba(0, 0, 0, 0.3)',
  // 各组件外阴影
  '--shadow-mack': 'rgba(245, 250, 248, 0.5)',
  // 系统设置快捷键显示背景颜色
  '--tab-color': 'rgba(0, 0, 0, 0.3)',
  // 滚动到顶部组件背景颜色
  '--to-top-bg-color': 'rgba(0, 0, 0, 0.65)',
  // 子级评论背景颜色
  '--layer-2-2': 'rgba(0, 0, 0, 0.3)',
  // 动态背景颜色
  '--bg-img-size': 'cover',
  '--bg-animation': 'none',
  // '--bg-animation': 'bgmove 10s infinite',
  '--backdrop-filter': 'blur(2px)',
  // 富文本编辑器字体颜色
  '--e-edit-color': '#fff',
  // 系统设置表单背景颜色
  '--e-form-bg-color': 'rgba(0, 0, 0, 0.3)',
  // 图片背景兼容字体颜色
  '--font-color': '#000',
  // 详情代码块背景颜色
  '--pre-bg-color': 'rgba(0, 0, 0, 0.3)',
};

// 清新绿（默认主题）
const freshGreen = {
  // 主题背景颜色
  '--background': '#f9fff9',
  // 弹窗背景颜色
  '--modal-bg-color': '#f9fff9',
  // 输入框背景颜色
  '--input-bg-color': '#fff',
  // 文章各种卡片渐变颜色
  '--bg-lg-color1': '#fffeff',
  '--bg-lg-color2': '#d7fffe',
  // 时间轴背景颜色
  '--timeline-lg-color1': '#fffeff',
  '--timeline-lg-color2': '#d7fffe',
  // 各组件阴影颜色
  '--shadow-color': '#b8eaff',
  // 字体颜色
  ...fontStyle,
  // loading 背景颜色
  '--loading-color': 'rgba(249, 255, 249, 0.8)',
  // 组件边框颜色
  '--card-border': '#ddf5ff',
  '--fff': '#fff',
  // 各组件外阴影
  '--shadow-mack': 'rgb(0 0 0 / 10%)',
  // 系统设置快捷键显示背景颜色
  '--tab-color': '#f5f7fa',
  // 滚动到顶部组件背景颜色
  '--to-top-bg-color': 'rgba(249, 255, 249, 0.9)',
  // 子级评论背景颜色
  '--layer-2-2': 'rgba(247, 248, 250, 0.7)',
  ...removeStyle,
};

// 黑色主题
const black = {
  // 主题背景颜色
  '--background': '#171718',
  // 弹窗背景颜色
  '--modal-bg-color': '#282828',
  // 输入框背景颜色
  '--input-bg-color': '#282828',
  // 文章各种卡片渐变颜色
  '--bg-lg-color1': '#333',
  '--bg-lg-color2': '#1e1e20',
  // 时间轴背景颜色
  '--timeline-lg-color1': '#333',
  '--timeline-lg-color2': '#1e1e20',
  // 各组件阴影颜色
  '--shadow-color': '#555',
  // 字体颜色
  '--font-1': '#f2f3f5',
  '--font-2': '#f2f3f5',
  '--font-3': '#f2f3f5',
  '--font-4': '#f2f3f5',
  '--font-5': '#f2f3f5',
  '--font-6': '#f2f3f5',
  // loading 背景颜色
  '--loading-color': 'rgba(0, 0, 0, 0.65)',
  // 组件边框颜色
  '--card-border': '#555',
  '--fff': '#1e1e20',
  // 各组件外阴影
  '--shadow-mack': 'rgba(225, 225, 225, 0.28)',
  // 系统设置快捷键显示背景颜色
  '--tab-color': '#555',
  // 滚动到顶部组件背景颜色
  '--to-top-bg-color': 'rgba(38, 42, 51, 0.28)',
  // 子级评论背景颜色
  '--layer-2-2': 'rgba(38, 42, 51, 0.98)',
  ...removeStyle,
};

// 亮青色
const lightcyan = {
  // 主题背景颜色
  '--background': '#d7fffe',
  // 弹窗背景颜色
  '--modal-bg-color': '#d7fffe',
  // 输入框背景颜色
  '--input-bg-color': '#fffeff',
  // 文章各种卡片渐变颜色
  '--bg-lg-color1': '#fffeff',
  '--bg-lg-color2': '#d7fffe',
  // 时间轴背景颜色
  '--timeline-lg-color1': '#fffeff',
  '--timeline-lg-color2': '#d7fffe',
  // 各组件阴影颜色
  '--shadow-color': '#efefef',
  // 各组件外阴影
  '--shadow-mack': 'rgba(225, 225, 225, 0.58)',
  // 字体颜色
  ...fontStyle,
  // loading 背景颜色
  '--loading-color': 'rgba(249, 255, 249, 0.8)',
  // 组件边框颜色
  '--card-border': '#efefef',
  '--fff': '#fffeff',
  // 系统设置快捷键显示背景颜色
  '--tab-color': '#fffeff',
  // 滚动到顶部组件背景颜色
  '--to-top-bg-color': 'rgba(249, 255, 249, 0.9)',
  // 子级评论背景颜色
  '--layer-2-2': 'rgba(240, 255, 255, 0.6)',
  ...removeStyle,
};

// 晶莹白
const light = {
  // 主题背景颜色
  '--background': '#fff',
  // 弹窗背景颜色
  '--modal-bg-color': '#fff',
  // 输入框背景颜色
  '--input-bg-color': '#fff',
  // 文章各种卡片渐变颜色
  '--bg-lg-color1': '#fff',
  '--bg-lg-color2': '#ebfcfc',
  // 时间轴背景颜色
  '--timeline-lg-color1': '#fff',
  '--timeline-lg-color2': '#ebfcfc',
  // 各组件阴影颜色
  '--shadow-color': '#b8eaff',
  // 字体颜色
  ...fontStyle,
  // loading 背景颜色
  '--loading-color': 'rgba(255, 255, 255, 0.8)',
  // 组件边框颜色
  '--card-border': '#ddf5ff',
  '--fff': '#fff',
  // 各组件外阴影
  '--shadow-mack': 'rgb(0 0 0 / 10%)',
  // 系统设置快捷键显示背景颜色
  '--tab-color': '#f5f7fa',
  // 滚动到顶部组件背景颜色
  '--to-top-bg-color': 'rgba(255, 255, 255, 0.9)',
  // 子级评论背景颜色
  '--layer-2-2': 'rgba(255, 255, 255, 0.7)',
  ...removeStyle,
};

// 炫彩
const colorful = {
  // 主题背景颜色
  '--background': '#f9fff9',
  // 弹窗背景颜色
  '--modal-bg-color': '#f9fff9',
  // 输入框背景颜色
  '--input-bg-color': '#fff',
  // 文章各种卡片渐变颜色
  '--bg-lg-color1': '#fffeff',
  '--bg-lg-color2': '#d7fffe',
  // 时间轴背景颜色
  '--timeline-lg-color1': '#fffeff',
  '--timeline-lg-color2': '#d7fffe',
  // 各组件阴影颜色
  '--shadow-color': '#b8eaff',
  // 字体颜色
  ...fontStyle,
  // loading 背景颜色
  '--loading-color': 'rgba(249, 255, 249, 0.8)',
  // 组件边框颜色
  '--card-border': '#ddf5ff',
  '--fff': '#fff',
  // 各组件外阴影
  '--shadow-mack': 'rgb(0 0 0 / 10%)',
  // 系统设置快捷键显示背景颜色
  '--tab-color': '#f9fff9',
  // 滚动到顶部组件背景颜色
  '--to-top-bg-color': 'rgba(249, 255, 249, 0.9)',
  // 子级评论背景颜色
  '--layer-2-2': '#f9fff9',
  // 动态背景颜色
  '--bg-image-url': 'linear-gradient(126deg, #e0c3fc, #d7fffe, #f9fff9, #f8fded, #f9fff9, #d7fffe, #f5ccec)',
  '--bg-img-size': '180%',
  '--bg-animation': 'bgmove 10s infinite',
  // 富文本编辑器字体颜色
  '--e-edit-color': 'auto',
  // 系统设置表单背景颜色
  '--e-form-bg-color': 'initial',
  // 图片背景兼容字体颜色
  '--font-color': '',
  '--pre-bg-color': '#282c34',
};

// 侧脸
const lateralFace = {
  ...imageStyles,
  '--bg-image-url': `url(${HEAD_IMG})`,
  // 系统设置表单背景颜色
  '--e-form-bg-color': 'initial',
  // 图片背景兼容字体颜色
  '--font-color': '#fff',
  '--pre-bg-color': 'rgba(0, 0, 0, 0.3)',
};

// 少司命
const ShaoSiming = {
  ...imageStyles,
  '--bg-image-url': `url(${IMG1})`,
};

// 动漫
const beauty = {
  ...imageStyles,
  '--bg-image-url': `url(${IMG2})`,
};

// 海岛
const island = {
  ...imageStyles,
  '--bg-image-url': `url(${IMG5})`,
  '--backdrop-filter': 'blur(5px)',
};

// 侧脸
const locomotive = {
  ...imageStyles,
  '--bg-image-url': `url(${IMG4})`,
};

const themeTypes = {
  freshGreen,
  black,
  lightcyan,
  light,
  colorful,
  ShaoSiming,
  lateralFace,
  beauty,
  island,
  locomotive,
};

// 设置背景颜色
export const modifyTheme = (type: string) => {
  for (const style in themeTypes[type]) {
    document?.body?.style.setProperty(style, themeTypes[type][style]);
  }
};
