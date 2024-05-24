import { IMG1, BEAUTY, IMG3, IMG4, HEAD_IMG, CLOUD, SEA, FRESH, SUN, NIGHT } from '@/constant';

// 菜单图标样式
export const MENU_LG_DEFAULT_COLORS = `
  linear-gradient(45deg, #3f51b1 0%, #5a55ae 13%, #7b5fac 25%, #8f6aae 38%, #a86aa4 50%, #cc6b8e 62%, #f18271 75%, #f3a469 87%, #f7c978 100%)
`;

// 菜单图标选中样式
export const MENU_LG_ACTIVE_DEFAULT_COLORS = 'linear-gradient(-45deg, #30cfd0 0%, #330867 100%)';

// 菜单渐变颜色
const MENU_LG_COLORS = `
  linear-gradient(45deg, #89ff00, #acf500, #c7ea00, #dcdf00, #edd400, #f4c900, #fabd00, #ffb100, #ffa200, #ff9300, #ff8300, #ff7200)
`;

// 菜单选中颜色
const MENU_ACTIVE_LG_COLORS = 'linear-gradient(to left bottom, #ffa000, #ff9700, #ff8e00, #ff8500, #ff7b00)';

// 公共字体设置
const fontStyle = {
  '--font-1': '#252933',
  '--font-2': '#515767',
  '--font-3': '#4e5969',
  '--font-4': '#8a919f',
  '--font-5': '#999',
  '--font-6': '#cacaca',
};

// img 主题字体颜色
const imgThemeColor = {
  '--font-1': '#000',
  '--font-2': '#111',
  '--font-3': '#222',
  '--font-4': '#333',
  '--font-5': '#555',
  '--font-6': '#888',
};

// 公共需要去除的样式及图片背景公共样式
const commonStyle = {
  // 主题色
  '--theme-blue': '#089220',
  '--el-color-primary-dark-2': '#57a0ff',
  '--el-color-primary': '#089220',
  '--el-color-primary-light-3': '#40a700',
  '--el-color-primary-light-5': '#70c870',
  '--code-color': '#1cbc00',
  '--markdown-param-color': '#f8c555',
  // markdown return color
  '--markdown-return-color': '#37c26b',
  '--markdown-strong-color': '#ff9900',
  '--markdown-function-color': '#ff7f28',
  '--lg-colors': 'linear-gradient(-45deg, #68a235 0%, #377500 100%)',
  '--lg-active-colors': 'linear-gradient(-45deg, #00fdff 0%, #6303d6 100%)',
  '--card-btn-mark': 'rgba(255, 255, 255, 0.5)',
  '--font-weight': 'normal',
  '--search-border-color': '#fff',
  '--card-shadow': 'rgba(255, 255, 255, 0.85)',
  '--scroll-color': '#e4e6eb',
  '--text-shadow': '1px 1px 1px rgba(0, 0, 0, 0.5)',
  '--chat-text-area-bg': 'transparent',
  '--chat-border-color': '#ffffff52',
};

// 主题相关颜色
const themeColors = {
  // 主题色
  '--theme-blue': '#61dc00',
  '--el-color-primary': '#61dc00',
  '--el-color-primary-light-3': '#80c952',
  '--el-color-primary-light-5': '#9aea80',
  '--code-color': '#26ff00',
  '--markdown-strong-color': '#fbff00',
};

// 公共需要去除的样式
const removeStyle = {
  '--bg-animation': 'none',
  // 背景图片
  '--bg-image-url': 'none',
  // 富文本编辑器字体颜色
  '--e-edit-color': 'auto',
  // 图片背景兼容字体颜色
  '--font-color': '',
  // 详情代码块背景颜色
  '--pre-bg-color': '#fff',
  // editor 代码块颜色
  '--code-pre-bg': '#282c34',
  // 文章预览背景颜色
  '--pre-hover-bg': 'initial',
  // table 偶数项背景颜色
  '--table-even-bg': '#f6f8fa',
  // 右键菜单背景颜色
  '--shade-2': 'transparent',
  // 文章说明背景颜色
  '--shade-3': 'transparent',
  // 卡片操作字体颜色
  '--card-action-font-color': '#57a0ff',
  // 卡片操作背景颜色
  '--card-action-color': 'transparent',
  // 弹窗before背景颜色
  '--pop-before-bg-color': 'transparent',
  // 文章 h1、h2... 标题字体颜色
  '--h-color': '#00ca23',
  // 弹出菜单背景颜色
  '--pop-menu-color': '#fff',
  // 行内 code 字体颜色
  '--p-code-color': '#289f00',
  // 行内 code 背景颜色
  '--p-code-bg-color': 'rgba(27, 31, 35, 0.08)',
  // 登录背景
  '--login-bg-img': 'linear-gradient(to top, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%)',
  '--border-color': '#e4e6eb',
  '--login-bg': 'rgba(225, 225, 225, 0.1)',
  '--placeholder-color': '#a8abb2',
  '--loading-text-color': '#089220',
  ...commonStyle,
  '--card-shadow': 'rgba(129, 129, 129, 0.25)',
  '--icon-bg-color': 'rgba(0, 0, 0, 0.1)',
  '--green-1': 'rgb(225, 252, 201, 0.85)',
  '--green-2': 'rgb(225, 252, 201, 0.9)',
  '--hover-text-color': '#28bd27',
  '--card-bt-bg': 'transparent',
  '--text-shadow': '1px 1px 1px rgba(255, 255, 255, 0.5)',
  '--chat-border-color': 'rgb(86, 86, 86, 0.12)',
  '--chat-text-area-bg': 'transparent',
};

// 背景图片公共配置
const imageStyles = {
  '--green-1': 'rgb(225, 252, 201, 0.3)',
  '--green-2': 'rgb(225, 252, 201, 0.35)',
  '--hover-text-color': '#c5ff95',
  // 主题背景颜色
  '--background': 'transparent',
  // 弹窗背景颜色
  '--modal-bg-color': 'rgba(225, 225, 225, 0.2)',
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
  '--icon-bg-color': 'rgba(245, 250, 247, 0.2)',
  // 字体颜色
  '--font-1': '#fff',
  '--font-2': '#f2f2f2',
  '--font-3': '#ebebeb',
  '--font-4': '#e8e8e8',
  '--font-5': '#dfdfdf',
  '--font-6': '#959595',
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
  // 图片背景兼容字体颜色
  '--font-color': '#000',
  // 详情代码块背景颜色
  '--pre-bg-color': 'rgba(0, 0, 0, 0.3)',
  // editor 代码块颜色
  '--code-pre-bg': 'rgba(0, 0, 0, 0.3)',
  // 文章预览背景颜色
  '--pre-hover-bg': 'rgba(0, 0, 0, 0.15)',
  // table 偶数项背景颜色
  '--table-even-bg': 'rgba(0, 0, 0, 0.3)',
  // 右键菜单背景颜色
  '--shade-2': 'rgba(0, 0, 0, 0.3)',
  // 文章说明背景颜色
  '--shade-3': 'rgba(0, 0, 0, 0.1)',
  // 卡片操作字体颜色
  '--card-action-font-color': '#fff',
  // 卡片操作背景颜色
  '--card-action-color': 'rgba(0, 0, 0, 0.2)',
  // 弹窗before背景颜色
  '--pop-before-bg-color': 'rgba(0, 0, 0, 0.5)',
  // 详情文章 h1、h2... 标题颜色
  '--h-color': '#00d625',
  // 弹出菜单背景颜色
  '--pop-menu-color': 'rgba(0, 0, 0, 0.65)',
  // 行内 code 字体颜色
  '--p-code-color': '#dcffd6',
  // 行内 code 背景颜色
  '--p-code-bg-color': 'rgba(27, 31, 35, 0.08)',
  // border 颜色
  '--border-color': '#e4e6eb',
  '--placeholder-color': '#d6d6d6',
  '--loading-text-color': '#089220',
  // 主题色
  ...commonStyle,
  '--markdown-param-color': '#19dcc6',
  '--markdown-return-color': '#93e86a',
  '--scroll-color': 'rgba(255, 255, 255, 0.25)',
  '--el-color-primary-dark-2': '#00dcff',
  '--card-bt-bg': 'rgba(255, 255, 255, 0.1)',
};

// 炫彩背景公共配置
const colorfulStyles = {
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
  // loading 背景颜色
  '--loading-color': 'rgba(249, 255, 249, 0.8)',
  // 组件边框颜色
  '--card-border': '#ddf5ff',
  '--fff': '#fff',
  // 各组件外阴影
  '--shadow-mack': 'rgb(0 0 0 / 10%)',
  '--chat-border-color': 'rgb(0 0 0 / 10%)',
  // 系统设置快捷键显示背景颜色
  '--tab-color': '#f9fff9',
  // 滚动到顶部组件背景颜色
  '--to-top-bg-color': 'rgba(249, 255, 249, 0.9)',
  // 子级评论背景颜色
  '--layer-2-2': '#f9fff9',
  '--login-bg-img': 'linear-gradient(to bottom, #d7fffe, #f9fff9, #f8fded, #f9fff9, #d7fffe)',
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

const themeTypes = {
  light: {
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
    ...removeStyle,
    // 子级评论背景颜色
    '--layer-2-2': 'rgba(225, 225, 225, 0.3)',
  },
  black: {
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
    '--font-1': '#fff',
    '--font-2': '#f2f2f2',
    '--font-3': '#ebebeb',
    '--font-4': '#e8e8e8',
    '--font-5': '#dfdfdf',
    '--font-6': '#959595',
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
    '--chat-border-color': 'rgb(225, 225, 225, 0.12)',
    '--pre-bg-color': '#282828',
    // editor 代码块颜色
    '--code-pre-bg': '#282828',
    '--pop-menu-color': '#333',
    '--icon-bg-color': 'rgba(245, 250, 247, 0.2)',
    '--green-1': 'rgb(225, 252, 201, 0.5)',
    '--green-2': 'rgb(225, 252, 201, 0.55)',
    '--text-shadow': '1px 1px 1px rgba(0, 0, 0, 0.5)',
  },
  freshGreen,
  emeraldGreen: {
    ...freshGreen,
    // 主题背景颜色
    '--background': '#ceeaba',
    // 文章各种卡片渐变颜色
    '--bg-lg-color1': '#f2ffe9',
    '--bg-lg-color2': '#dcffc3',
    // 时间轴背景颜色
    '--timeline-lg-color1': '#f2ffe9',
    '--timeline-lg-color2': '#dcffc3',
    '--loading-color': 'rgba(249, 255, 249, 0.35)',
  },
  lightcyan: {
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
    '--loading-color': 'rgba(249, 255, 249, 0.35)',
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
    '--chat-text-area-bg': 'rgb(225, 225, 225, 0.58)',
  },
  danQingHuang: {
    // 字体颜色
    ...fontStyle,
    ...removeStyle,
    ...colorfulStyles,
    // 动态背景颜色
    '--bg-image-url': 'linear-gradient(126deg, #e0c3fc, #d7fffe, #f9fff9, #f8fded, #f9fff9, #d7fffe, #f5ccec)',
  },
  electrum: {
    ...freshGreen,
    // 主题背景颜色
    '--background': '#f5f5dc',
    // 文章各种卡片渐变颜色
    '--bg-lg-color1': '#fffff2',
    '--bg-lg-color2': '#ffffd8',
    // 时间轴背景颜色
    '--timeline-lg-color1': '#fffff2',
    '--timeline-lg-color2': '#ffffd8',
    '--loading-color': 'rgba(252, 255, 234, 0.35)',
  },
  skygray: {
    ...freshGreen,
    // 主题背景颜色
    '--background': '#d8e0e6',
    // 文章各种卡片渐变颜色
    '--bg-lg-color1': '#e7eff4',
    '--bg-lg-color2': '#d5e7f3',
    // 时间轴背景颜色
    '--timeline-lg-color1': '#e7eff4',
    '--timeline-lg-color2': '#d5e7f3',
    '--loading-color': 'rgba(216, 225, 230, 0.35)',
  },
  danQingBai: {
    // 字体颜色
    ...fontStyle,
    ...removeStyle,
    ...colorfulStyles,
    '--bg-image-url': 'linear-gradient(to top, #fffeff 0%, #d7fffe 100%)',
  },
  colorful: {
    // 字体颜色
    ...fontStyle,
    ...removeStyle,
    ...colorfulStyles,
    // 动态背景颜色
    '--bg-image-url': 'linear-gradient(126deg, #e0c3fc, #d7fffe, #f9fff9, #f8fded, #f9fff9, #d7fffe, #f5ccec)',
    '--bg-img-size': '200%',
    '--bg-animation': 'bgmove 15s infinite',
  },

  // 图片背景
  cloud: {
    ...imageStyles,
    '--backdrop-filter': 'blur(0px)',
    ...imgThemeColor,
    // 文章预览背景图片
    '--pre-hover-bg': 'rgba(255, 255, 255, 0.3)',
    '--pre-bg-color': 'rgb(255, 255, 255, 0.35)',
    // editor 代码块颜色
    '--code-pre-bg': 'rgb(255, 255, 255, 0.35)',
    // table 偶数项背景颜色
    '--table-even-bg': 'rgba(255, 255, 255, 0.25)',
    // 文章各种卡片渐变颜色
    '--bg-lg-color1': 'rgba(255, 255, 255, 0.5)',
    '--bg-lg-color2': 'rgba(255, 255, 255, 0.25)',
    // 时间轴背景颜色
    '--timeline-lg-color1': 'rgba(255, 255, 255, 0.85)',
    '--timeline-lg-color2': 'rgba(255, 255, 255, 0.25)',
    // 各组件阴影颜色
    '--shadow-color': 'rgba(255, 255, 242, 0.5)',
    '--shadow-mack': 'rgba(205, 205, 205, 0.5)',
    '--chat-border-color': '#ffffffba',
    '--fff': 'rgba(255, 255, 255, 0.3)',
    '--e-edit-color': '#000',
    '--layer-2-2': 'rgba(255, 255, 255, 0.3)',
    '--input-bg-color': 'rgba(255, 255, 255, 0.5)',
    // 文章说明背景颜色
    '--shade-3': 'rgba(255, 255, 255, 0.3)',
    '--tab-color': 'rgba(255, 255, 255, 0.5)',
    '--card-action-font-color': '#000',
    '--card-border': 'rgba(182, 182, 182, 0.5)',
    '--modal-bg-color': 'rgb(255, 255, 255, 0.5)',
    // 弹窗before背景颜色
    '--pop-before-bg-color': 'rgb(255, 255, 255, 0.3)',
    '--to-top-bg-color': 'rgba(255, 255, 255, 0.8)',
    '--pop-menu-color': 'rgba(255, 255, 255, 0.85)',
    '--h-color': '#089220',
    // 行内 code 字体颜色
    '--p-code-color': '#0f6600',
    '--p-code-bg-color': 'rgba(255, 255, 242, 0.5)',
    // loading 背景颜色
    '--loading-color': 'rgba(255, 255, 255, 0.5)',
    '--background': '#d6dfdf',
    '--chat-text-area-bg': 'rgba(255, 255, 255, 0.15)',
    '--bg-image-url': `url(${CLOUD})`,
    '--login-bg-img': `url(${CLOUD})`,
    '--login-bg': 'rgba(255, 255, 255, 0.1)',
    // border 颜色
    '--border-color': '#ffffffa1',
    '--placeholder-color': '#aeaeae',
    // markdown return color
    '--markdown-return-color': '#6e00ff',
    '--font-weight': '700',
    '--scroll-color': 'rgba(255, 255, 255, 0.69)',
    '--lg-colors': 'linear-gradient(-45deg, #7ab6de 0%, #6e5ef2 100%)',
    '--search-border-color': '#757de5',
    '--hover-text-color': '#28bd27',
    '--text-shadow': '1px 1px 1px rgba(255, 255, 255, 0.5)',
  },
  beauty: {
    ...imageStyles,
    '--bg-lg-color1': 'rgba(0, 0, 0, 0.5)',
    '--bg-lg-color2': 'rgba(0, 0, 0, 0.3)',
    '--backdrop-filter': 'blur(0)',
    // 图片背景兼容字体颜色
    '--font-color': '#fff',
    '--lg-colors': `${MENU_LG_DEFAULT_COLORS}`,
    '--search-border-color': '#a86aa5',
    '--font-weight': '700',
    '--h-color': '#61dc00',
    '--shade-3': 'rgba(255, 255, 255, 0.1)',
    '--pre-bg-color': 'rgb(255, 255, 255, 0.05)',
    // editor 代码块颜色
    '--code-pre-bg': 'rgb(255, 255, 255, 0.05)',
    '--pre-hover-bg': 'rgb(0, 0, 0, 0.35)',
    // table 偶数项背景颜色
    '--table-even-bg': 'rgba(255, 255, 255, 0.1)',
    '--placeholder-color': '#868686',
    // loading 背景颜色
    '--loading-color': 'rgba(0, 0, 0, 0.69)',
    '--loading-text-color': '#2aff00',
    '--background': '#050505',
    '--bg-image-url': `url(${BEAUTY})`,
    '--login-bg-img': `url(${BEAUTY})`,
    '--layer-2-2': 'rgb(255, 255, 255, 0.06)',
    '--card-border': 'rgba(182, 182, 182, 0.5)',
    '--card-btn-mark': 'rgba(0, 0, 0, 0.5)',
    '--markdown-function-color': '#fcf168',
    '--card-shadow': 'rgba(255, 255, 255, 0.35)',
    // 主题色
    ...themeColors,
    '--scroll-color': 'rgba(209, 209, 209, 0.15)',
    '--icon-bg-color': 'rgba(245, 250, 247, 0.15)',
    '--green-1': 'rgb(225, 252, 201, 0.1)',
    '--green-2': 'rgb(225, 252, 201, 0.15)',
    '--chat-border-color': '#ffffff30',
  },
  fresh: {
    ...imageStyles,
    '--background': '#9ba25a',
    '--bg-image-url': `url(${FRESH})`,
    '--login-bg-img': `url(${FRESH})`,
    '--backdrop-filter': 'blur(0px)',
    // 文章各种卡片渐变颜色
    '--bg-lg-color1': 'rgba(0, 0, 0, 0.25)',
    '--bg-lg-color2': 'rgba(0, 0, 0, 0.15)',
    // 文章预览背景图片
    '--pre-hover-bg': 'rgba(0, 0, 0, 0.3)',
    '--login-bg': 'rgba(0, 0, 0, 0.1)',
    '--placeholder-color': '#d2d2d2',
    '--h-color': '#61dc00',
    '--font-color': '#fff',
    '--font-weight': '700',
    '--loading-color': 'rgba(102, 151, 9, 0.2)',
    '--loading-text-color': '#2aff00',
    // 菜单字体渐变
    '--lg-colors': `${MENU_LG_COLORS}`,
    '--search-border-color': '#fabd00',
    '--lg-active-colors': `${MENU_ACTIVE_LG_COLORS}`,
    '--card-btn-mark': 'rgba(0, 0, 0, 0.5)',
    '--markdown-return-color': '#fbff00',
    '--chat-border-color': '#ffffff52',
    // 主题色
    ...themeColors,
  },
  lateralFace: {
    ...imageStyles,
    '--card-border': 'rgba(245, 250, 248, 0.2)',
    '--background': '#507090',
    // 字体颜色
    '--bg-image-url': `url(${HEAD_IMG})`,
    // 图片背景兼容字体颜色
    '--font-color': '#fff',
    '--pre-bg-color': 'rgba(0, 0, 0, 0.3)',
    // editor 代码块颜色
    '--code-pre-bg': 'rgba(0, 0, 0, 0.3)',
    // 文章预览背景图片
    '--pre-hover-bg': 'rgba(0, 0, 0, 0.3)',
    // table 偶数项背景颜色
    '--table-even-bg': 'rgba(0, 0, 0, 0.3)',
    '--login-bg-img': `url(${HEAD_IMG})`,
    '--chat-border-color': '#ffffff52',
    '--theme-blue': '#00d625',
    '--el-color-primary': '#00d625',
    '--card-btn-mark': 'rgba(0, 0, 0, 0.45)',
    '--card-shadow': 'rgba(255, 255, 255, 0.35)',
    '--lg-colors': 'linear-gradient(-45deg, #00d5ff 0%, #ffffff 100%)',
    '--search-border-color': '#91d1e7',
  },
  sun: {
    ...imageStyles,
    '--background': '#6c99ba',
    '--bg-image-url': `url(${SUN})`,
    '--h-color': '#a2ff00',
    '--backdrop-filter': 'blur(0)',
    '--login-bg-img': `url(${SUN})`,
    '--font-color': '#fff',
    '--card-btn-mark': 'rgba(0, 0, 0, 0.5)',
    // 主题色
    ...themeColors,
    '--lg-colors': 'linear-gradient(-45deg, #ffffff 0%, #8bd1ff 100%)',
    '--search-border-color': '#aed8f0',
  },
  night: {
    ...imageStyles,
    '--background': 'rgba(0, 24, 80, 0.25)',
    '--bg-image-url': `url(${NIGHT})`,
    '--backdrop-filter': 'blur(1px)',
    '--login-bg-img': `url(${NIGHT})`,
    // 文章各种卡片渐变颜色
    '--bg-lg-color1': 'rgba(0, 0, 0, 0.25)',
    '--bg-lg-color2': 'rgba(0, 0, 0, 0.15)',
    // loading 背景颜色
    '--loading-color': 'rgba(0, 0, 0, 0.3)',
    '--loading-text-color': '#2aff00',
    // 文章预览背景图片
    '--pre-hover-bg': 'rgba(0, 0, 0, 0.3)',
    '--placeholder-color': '#bfbfbf',
    '--h-color': '#61dc00',
    '--card-btn-mark': 'rgba(0, 0, 0, 0.5)',
    // 主题色
    ...themeColors,
    '--lg-colors': 'linear-gradient(-45deg, #45909f 0%, #9ce6ff 100%)',
    '--search-border-color': '#5cabd7',
  },
  ShaoSiming: {
    ...imageStyles,
    '--background': '#d1e6f9',
    '--bg-image-url': `url(${IMG1})`,
    '--h-color': '#a2ff00',
    '--login-bg-img': `url(${IMG1})`,
    '--lg-colors': 'linear-gradient(-45deg, #2f6600 0%, #000000 100%)',
    '--hover-text-color': '#28bd27',
    '--search-border-color': '#10421f',
  },
  locomotive: {
    ...imageStyles,
    '--backdrop-filter': 'blur(1.5px)',
    '--font-color': '#fff',
    '--lg-colors': 'linear-gradient(-45deg, #7e7474 0%, #252f36 100%)',
    '--background': '#b0aea1',
    '--bg-image-url': `url(${IMG3})`,
    '--login-bg-img': `url(${IMG3})`,
    '--loading-text-color': '#2aff00',
    '--card-btn-mark': 'rgba(0, 0, 0, 0.5)',
    // 主题色
    ...themeColors,
    '--search-border-color': '#767676',
  },
  island: {
    ...imageStyles,
    '--background': '#f8e8db',
    '--bg-image-url': `url(${IMG4})`,
    '--backdrop-filter': 'blur(3px)',
    '--h-color': '#a2ff00',
    '--login-bg-img': `url(${IMG4})`,
    '--card-btn-mark': 'rgba(255, 255, 255, 0.65)',
    '--hover-text-color': '#28bd27',
    '--lg-colors': 'linear-gradient(-45deg, #1a2534 0%, #7aaaac 100%)',
    '--search-border-color': '#627171',
  },
  sea: {
    ...imageStyles,
    '--card-border': 'rgba(245, 250, 248, 0.2)',
    '--background': '#5e88a0',
    // 字体颜色
    '--bg-image-url': `url(${SEA})`,
    // 图片背景兼容字体颜色
    '--font-color': '#fff',
    '--pre-bg-color': 'rgba(0, 0, 0, 0.3)',
    // editor 代码块颜色
    '--code-pre-bg': 'rgba(0, 0, 0, 0.3)',
    // 文章预览背景图片
    '--pre-hover-bg': 'rgba(0, 0, 0, 0.3)',
    '--login-bg-img': `url(${SEA})`,
    '--backdrop-filter': 'blur(1px)',
    '--lg-colors': 'linear-gradient(-45deg, #ff6a00 0%, #ffc983 100%)',
    '--search-border-color': '#ffb158',
  },
};

// 设置背景颜色
export const modifyTheme = (type: string) => {
  for (const style in themeTypes[type]) {
    document?.body?.style.setProperty(style, themeTypes[type][style]);
  }
};
