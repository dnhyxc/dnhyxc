// 公共字体设置
const fontStyle = {
  '--font-1': '#252933',
  '--font-2': '#515767',
  '--font-3': '#4e5969',
  '--font-4': '#8a919f',
  '--font-5': '#c2c8d1',
  '--font-6': '#f2f3f5',
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
  // 去除炫彩背景设置
  '--bg-image': 'none',
  '--bg-size': 'auto',
  '--bg-animation': 'none',
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
  // 去除炫彩背景设置
  '--bg-image': 'none',
  '--bg-size': 'auto',
  '--bg-animation': 'none',
};

// 亮青色
const lightcyan = {
  // 主题背景颜色
  // '--background': '#83ccd2',
  // '--background': '#fbf4ef',
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
  // 去除炫彩背景设置
  '--bg-image': 'none',
  '--bg-size': 'auto',
  '--bg-animation': 'none',
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
  // 去除炫彩背景设置
  '--bg-image': 'none',
  '--bg-size': 'auto',
  '--bg-animation': 'none',
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
  '--tab-color': '#f5f7fa',
  // 滚动到顶部组件背景颜色
  '--to-top-bg-color': 'rgba(249, 255, 249, 0.9)',
  // 子级评论背景颜色
  '--layer-2-2': 'rgba(247, 248, 250, 0.7)',
  // 动态背景颜色
  '--bg-image': 'linear-gradient(126deg, #e0c3fc, #d7fffe, #f9fff9, #f8fded, #f9fff9, #d7fffe, #f5ccec)',
  // '--bg-image': 'linear-gradient(126deg, #e0c3fc, #d7fffe, #f9fff9, #fefffa, #f9fff9, #d7fffe, #f5ccec)',
  // '--bg-image': 'linear-gradient(126deg, #e0c3fc, #d7fffe, #f9fff9, #fbfcdb, #f9fff9, #d7fffe, #f5ccec)',
  '--bg-size': '180%',
  '--bg-animation': 'bgmove 10s infinite',
};

const themeTypes = {
  freshGreen,
  black,
  lightcyan,
  light,
  colorful,
};

// 设置背景颜色
export const modifyTheme = (type: string) => {
  for (const style in themeTypes[type]) {
    document?.body?.style.setProperty(style, themeTypes[type][style]);
  }
};
