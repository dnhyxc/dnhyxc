import HOMESVG from '@/assets/svg/home.svg';
import MAXSVG from '@/assets/svg/max.svg';
import MINSVG from '@/assets/svg/min.svg';
import CLOSESVG from '@/assets/svg/close.svg';
import RESTORESVG from '@/assets/svg/restore.svg';
import PAGESVG from '@/assets/svg/page_icon.svg';
import EMPTY from '@/assets/svg/empty.svg';
import HEAD_IMG from '@/assets/images/face.jpg';
import IMG1 from '@/assets/images/1.jpg';
import IMG3 from '@/assets/images/3.jpg';
import IMG4 from '@/assets/images/4.jpg';
import SEA from '@/assets/images/sea.jpg';
import CYWL from '@/assets/images/cywl.jpg';
import CLOUD from '@/assets/images/cloud.jpeg';
import FRESH from '@/assets/images/fresh.jpeg';
import SUN from '@/assets/images/sun.jpg';
import SNOW from '@/assets/images/snow.jpg';
import BEAUTY from '@/assets/images/beauty.jpg';
import * as API from '@/server/api';
import GITHUB_SVG from '@/assets/svg/github.svg';
import COMPRESS_SVG from '@/assets/svg/compress.svg';
import TOOL_SVG from '@/assets/svg/tool.svg';
import YUYIN_SVG from '@/assets/svg/yuyin.svg';
import MARK_SVG from '@/assets/svg/mark.svg';
import CROP_SVG from '@/assets/svg/crop.svg';
import BOARD_SVG from '@/assets/svg/board.svg';
import CODE_SVG from '@/assets/svg/code.svg';
import NO_DATA_SVG from '@/assets/svg/no_data.svg';
import BOOK_SVG from '@/assets/svg/book.svg';
import PDF_SVG from '@/assets/svg/pdf.svg';
import TRANSCRIBE_SVG from '@/assets/svg/transcribe.svg';
import HTTP from '@/assets/images/http.jpg';

export {
  EMPTY,
  MINSVG,
  RESTORESVG,
  MAXSVG,
  CLOSESVG,
  HOMESVG,
  PAGESVG,
  HEAD_IMG,
  IMG1,
  IMG3,
  SEA,
  FRESH,
  SUN,
  SNOW,
  BEAUTY,
  IMG4,
  CYWL,
  CLOUD,
  GITHUB_SVG,
  COMPRESS_SVG,
  TOOL_SVG,
  YUYIN_SVG,
  MARK_SVG,
  CROP_SVG,
  BOARD_SVG,
  NO_DATA_SVG,
  BOOK_SVG,
  HTTP,
};

// 工具列表
export const TOOL_LIST = [
  { toolName: '图片压缩', key: 'compress', id: 'compress', toolUrl: COMPRESS_SVG },
  { toolName: '图片裁剪', key: 'cropper', id: 'cropper', toolUrl: CROP_SVG },
  { toolName: '水印设置', key: 'watermark', id: 'watermark', toolUrl: MARK_SVG },
  { toolName: '语音播报', key: 'textToSpeech', id: 'textToSpeech', toolUrl: YUYIN_SVG },
  { toolName: '画板', key: 'board', id: 'board', toolUrl: BOARD_SVG },
  { toolName: '代码测试', key: 'codeRun', id: 'codeRun', toolUrl: CODE_SVG },
  { toolName: '览电子书', key: 'epub', id: 'epub', toolUrl: BOOK_SVG },
  { toolName: 'PDF 预览', key: 'pdf', id: 'pdf', toolUrl: PDF_SVG },
  { toolName: '屏幕录制', key: 'transcribe', id: 'transcribe', toolUrl: TRANSCRIBE_SVG },
];

// 常用图片截取比例
export const IMG_ROPORTIONS = [
  {
    key: '1 : 1',
    value: [1, 1],
  },
  {
    key: '4 : 3',
    value: [4, 3],
  },
  {
    key: '16 : 9',
    value: [16, 9],
  },
  {
    key: '3 : 2',
    value: [3, 2],
  },
  {
    key: '2 : 1',
    value: [2, 1],
  },
];

export const BOARD_ACTIONS = [
  {
    key: 'brush',
    icon: 'icon-huabi',
    name: '画笔',
  },
  {
    key: 'eraser',
    icon: 'icon-a-xiangpicachuxiangpica',
    name: '橡皮',
  },
  {
    key: 'undo',
    icon: 'icon-chehuisekuai',
    name: '撤销',
  },
  {
    key: 'clear',
    icon: 'icon-qingchu',
    name: '清空',
  },
  {
    key: 'save',
    icon: 'icon-baocun',
    name: '保存',
  },
];

export const BOARD_COLORS = [
  '#000',
  '#fff',
  '#FF0000',
  '#FFA500',
  '#FFFF00',
  '#008000',
  '#00FFFF',
  '#0000FF',
  '#800080',
];

// 线上域名
export const DOMAIN_URL = '43.143.27.249';

// web端域名
export const WEB_DOMAIN_URL = 'http://43.143.27.249:9216';

// 表情资源路径域名
export const EMOJI_HOST = `http://${location.hostname === DOMAIN_URL ? DOMAIN_URL : '127.0.0.1:9112'}/image/`;

// 表情图片链接
export const EMOJI_URLS = {
  1: `${EMOJI_HOST}24b6f805c6687e5694cbee718.gif`, // weixiao,
  2: `${EMOJI_HOST}24b6f805c6687e5694cbee703.gif`, // baiyan,
  4: `${EMOJI_HOST}24b6f805c6687e5694cbee71f.gif`, // ziya,
  3: `${EMOJI_HOST}24b6f805c6687e5694cbee704.gif`, // bishi,
  5: `${EMOJI_HOST}24b6f805c6687e5694cbee706.gif`, // fannao,
  6: `${EMOJI_HOST}24b6f805c6687e5694cbee707.gif`, // fendou,
  7: `${EMOJI_HOST}24b6f805c6687e5694cbee709.gif`, // haixiu,
  8: `${EMOJI_HOST}24b6f805c6687e5694cbee708.gif`, // guzhang,
  9: `${EMOJI_HOST}24b6f805c6687e5694cbee70a.gif`, // haose,
  11: `${EMOJI_HOST}24b6f805c6687e5694cbee70c.gif`, // huaji,
  10: `${EMOJI_HOST}24b6f805c6687e5694cbee70b.gif`, // huaixiao,
  12: `${EMOJI_HOST}24b6f805c6687e5694cbee70d.gif`, // kelian,
  13: `${EMOJI_HOST}24b6f805c6687e5694cbee70e.gif`, // ku,
  14: `${EMOJI_HOST}24b6f805c6687e5694cbee70f.gif`, // kun,
  15: `${EMOJI_HOST}24b6f805c6687e5694cbee710.gif`, // kuxiao,
  16: `${EMOJI_HOST}24b6f805c6687e5694cbee711.gif`, // liulei,
  17: `${EMOJI_HOST}24b6f805c6687e5694cbee712.gif`, // shengqi,
  18: `${EMOJI_HOST}24b6f805c6687e5694cbee713.gif`, // shuai,
  19: `${EMOJI_HOST}24b6f805c6687e5694cbee714.gif`, // tushe,
  20: `${EMOJI_HOST}24b6f805c6687e5694cbee715.gif`, // tuxie,
  21: `${EMOJI_HOST}24b6f805c6687e5694cbee716.gif`, // wabi,
  22: `${EMOJI_HOST}24b6f805c6687e5694cbee717.gif`, // weiqu,
  23: `${EMOJI_HOST}24b6f805c6687e5694cbee702.gif`, // azhe,
  24: `${EMOJI_HOST}24b6f805c6687e5694cbee719.gif`, // wuzui,
  25: `${EMOJI_HOST}24b6f805c6687e5694cbee71a.gif`, // xia,
  26: `${EMOJI_HOST}24b6f805c6687e5694cbee71b.gif`, // yun,
  27: `${EMOJI_HOST}24b6f805c6687e5694cbee71c.gif`, // zaijian,
  28: `${EMOJI_HOST}24b6f805c6687e5694cbee71d.gif`, // zhayan,
  29: `${EMOJI_HOST}24b6f805c6687e5694cbee71e.gif`, // zhoumei,
  30: `${EMOJI_HOST}24b6f805c6687e5694cbee705.gif`, // dabing,
};

// 表情列表
export const EMOJI_TEXTS = [
  '微笑',
  '白眼',
  '鄙视',
  '龇牙',
  '烦恼',
  '奋斗',
  '害羞',
  '鼓掌',
  '好色',
  '坏笑',
  '滑稽',
  '可怜',
  '酷',
  '困',
  '哭笑',
  '流泪',
  '生气',
  '衰',
  '吐舌',
  '吐血',
  '挖鼻',
  '委屈',
  '啊这',
  '捂嘴',
  '吓',
  '晕',
  '再见',
  '眨眼',
  '皱眉',
  '大兵',
];

// 主题类型
export const THEME_TYPES = [
  {
    key: 'light',
    name: '晶莹白',
  },
  {
    key: 'black',
    name: '暗夜黑',
  },
  {
    key: 'freshGreen',
    name: '清新绿',
  },
  {
    key: 'emeraldGreen',
    name: '护眼绿',
  },
  {
    key: 'lightcyan',
    name: '极光绿',
  },
  {
    key: 'danQingHuang',
    name: '丹青黄',
  },
  {
    key: 'electrum',
    name: '琥珀金',
  },
  {
    key: 'skygray',
    name: '天空灰',
  },
  {
    key: 'danQingZi',
    name: '丹青白',
  },
  {
    key: 'colorful',
    name: '炫彩',
  },
];

// 背景图片主题
export const IMG_THEME_TYPES = [
  {
    key: 'cloud',
    name: '云间',
  },
  {
    key: 'snow',
    name: '雪山',
  },
  {
    key: 'lateralFace',
    name: '侧脸',
  },
  {
    key: 'ShaoSiming',
    name: '少司命',
  },
  {
    key: 'beauty',
    name: '动漫',
  },
  {
    key: 'locomotive',
    name: '智子',
  },
  {
    key: 'island',
    name: '海岛',
  },
  {
    key: 'sea',
    name: '岛屿',
  },
  {
    key: 'fresh',
    name: '小清新',
  },
  {
    key: 'sun',
    name: '日出',
  },
];

// 菜单渐变颜色
export const MENU_LG_COLORS = `linear-gradient(
    to right bottom,
    #89ff00,
    #acf500,
    #c7ea00,
    #dcdf00,
    #edd400,
    #f4c900,
    #fabd00,
    #ffb100,
    #ffa200,
    #ff9300,
    #ff8300,
    #ff7200
  )`;

// 菜单选中颜色
export const MENU_ACTIVE_LG_COLORS = 'linear-gradient (to right top, #ffb200, #fc9f00, #f88b00, #f27708, #eb6312)';

// 生成的验证码长度
export const CODE_LENGTH = 4;
// 随机生成的字符集
export const CHARACTERS = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789abcdefghijklmnpqrstuvwxyz';

// 滚动加载每页加载数量
export const PAGESIZE = 20;

export const ACTION_SVGS = [
  {
    title: '最小化',
    svg: MINSVG,
    icon: 'icon-winfo-icon-zuixiaohua',
  },
  {
    title: '最大化',
    svg: MAXSVG,
    icon: 'icon-3zuidahua-1',
  },
  {
    title: '关闭',
    svg: CLOSESVG,
    icon: 'icon-guanbi1',
  },
];

// 账号设置顶部菜单
export const SETTING_MENU = [
  {
    name: '个人资料',
    key: 'profile',
    path: '/profile',
    show: false,
  },
  {
    name: '账号设置',
    key: 'account',
    path: '/account',
    show: false,
  },
  {
    name: '系统设置',
    key: 'system',
    path: '/system',
    show: true,
  },
  {
    name: '主题设置',
    key: 'theme',
    path: '/theme',
    show: true,
  },
];

// 高级搜索过滤项
export const SEARCH_TYPE = [
  {
    label: '全部',
    type: 'all',
    key: '1',
  },
  {
    label: '文章标题',
    type: 'title',
    key: '2',
  },
  {
    label: '文章标签',
    type: 'tag',
    key: '3',
  },
  {
    label: '文章分类',
    type: 'classify',
    key: '4',
  },
  {
    label: '文章摘要',
    type: 'abstract',
    key: '5',
  },
  {
    label: '文章内容',
    type: 'content',
    key: '6',
  },
  {
    label: '我点赞的',
    type: 'isLike',
    key: '7',
  },
  {
    label: '作者名称',
    type: 'authorName',
    key: '8',
  },
  {
    label: '最多评论',
    type: 'replyCount',
    key: '9',
  },
  {
    label: '最多点赞',
    type: 'likeCount',
    key: '10',
  },
];

// 左侧菜单配置
export const MENULIST = [
  {
    name: '文章列表',
    key: 'home',
    path: '/home',
    icon: 'icon-home',
    fillIcon: 'icon-home',
    active: 'icon-home',
    show: true,
  },
  {
    name: '文章分类',
    key: 'classify',
    path: '/classify',
    icon: 'icon-fenlei1',
    fillIcon: 'icon-fenlei3',
    active: 'icon-fenlei4',
    show: true,
  },
  {
    name: '文章标签',
    key: 'tag',
    path: '/tag',
    icon: 'icon-biaoqianku',
    fillIcon: 'icon-24gf-tags3',
    active: 'icon-24gf-tags',
    show: true,
  },
  {
    name: '时间轴线',
    key: 'timeline',
    path: '/timeline',
    icon: 'icon-timeAxis',
    fillIcon: 'icon-timeAxis',
    active: 'icon-a-Frame174',
    show: false,
  },
  {
    name: '发布文章',
    key: 'create',
    path: '/create',
    icon: 'icon-fankuitianxie',
    fillIcon: 'icon-sign-review-full',
    active: 'icon-xieboke',
    show: false,
  },
  {
    name: '留言一角',
    key: 'interact',
    path: '/interact',
    icon: 'icon-b-chat',
    fillIcon: 'icon-b-chat',
    active: 'icon-xieboke',
    show: false,
  },
  {
    name: '实用工具',
    key: 'tools',
    path: '/tools',
    icon: 'icon-outline-designtools',
    fillIcon: 'icon-outline-designtools',
    active: 'icon-outline-designtools',
    show: false,
  },
  {
    name: '图片合集',
    key: 'picture',
    path: '/picture',
    icon: 'icon-luoxuan',
    fillIcon: 'icon-luoxuan',
    active: 'icon-luoxuan',
    authorWiew: true,
  },
  {
    name: '关于博主',
    key: 'author',
    path: '/author',
    icon: 'icon-shenfenzheng',
    fillIcon: 'icon-id-card-full',
    active: 'icon-yonghuziliao',
    show: true,
  },
];

// 需要登陆权限的路由
export const WITH_AUTH_ROUTES = ['/create', '/timeline', '/personal', '/interact', '/tools', '/chat'];

// 只能博主才能访问的页面
export const AUTHOR_ROUTES = ['tools', 'picture'];

// 需要头部搜索的页面
export const NEED_HEAD_SEARCH = ['/home', '/classify', '/tag/list'];

// 需要清除上下页搜索条件的路由
export const CLEAR_PARAMS_LIST_ROUTES = ['/home', '/seach'];

// 二次确认弹窗配置
export const MSG_CONFIG = (type = 'warning') => ({
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  type,
  center: true,
  draggable: true,
  showClose: false,
  customClass: 'MSG_CONFIG',
  customStyle: { width: 'auto', padding: '20px 20px 40px', minWidth: '300px' },
});

// 首页展示的文章类型
export const ATRICLE_TYPE = {
  1: '推荐文章',
  2: '最热文章',
};

// 文章标签
export const ARTICLE_TAG = [
  {
    label: '前端',
    key: '1',
  },
  {
    label: '后端',
    key: '2',
  },
  {
    label: 'JavaScript',
    key: '3',
  },
  {
    label: 'Node.js',
    key: '4',
  },
  {
    label: 'TypeScript',
    key: '5',
  },
  {
    label: '前端框架',
    key: '6',
  },
  {
    label: 'React',
    key: '7',
  },
  {
    label: 'Vue',
    key: '8',
  },
  {
    label: 'Preact',
    key: '9',
  },
  {
    label: 'Webpack',
    key: '10',
  },
  {
    label: 'Koa.js',
    key: '11',
  },
  {
    label: '面试',
    key: '12',
  },
  {
    label: 'Java',
    key: '13',
  },
  {
    label: '架构',
    key: '14',
  },
  {
    label: 'CSS',
    key: '15',
  },
  {
    label: 'HTML',
    key: '16',
  },
  {
    label: '数据结构',
    key: '17',
  },
  {
    label: '算法',
    key: '18',
  },
  {
    label: 'GitHub',
    key: '19',
  },
  {
    label: 'Git',
    key: '20',
  },
  {
    label: '设计模式',
    key: '21',
  },
  {
    label: '数据库',
    key: '22',
  },
  {
    label: '项目部署',
    key: '23',
  },
  {
    label: 'Docker',
    key: '24',
  },
  {
    label: 'Nginx',
    key: '25',
  },
  {
    label: '其它',
    key: '26',
  },
];

// 博主主页tab类型
export const AUTHOR_TABS = [
  {
    name: '博主文章',
    value: '1',
  },
  {
    name: '博主点赞',
    value: '2',
  },
  {
    name: '博主关注',
    value: '3',
  },
  {
    name: '时间轴',
    value: '4',
  },
];

// 我的主页tabs
export const ABOUT_ME_TABS = [
  {
    name: '我的文章',
    value: '1',
  },
  {
    name: '我的收藏',
    value: '2',
  },
  {
    name: '我的关注',
    value: '3',
  },
  {
    name: '关注我的',
    value: '4',
  },
  {
    name: '点赞文章',
    value: '5',
  },
];

// 他人的主页tabs
export const ABOUT_TABS = [
  {
    name: '他的文章',
    value: '1',
  },
  {
    name: '他的收藏',
    value: '2',
  },
  {
    name: '他的关注',
    value: '3',
  },
];

// 允许上传的文件类型
export const FILE_TYPE = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
// 上传文件提示
export const FILE_UPLOAD_MSG = '请上传 png、jpg、jpeg、gif、webp、svg 格式的图片';

// 我的主页链接图标
export const ICONLINKS = [
  {
    name: 'icon-juejin',
    className: 'juejin',
    label: 'juejin',
    title: '掘金',
  },
  {
    name: 'icon-github-fill',
    className: 'adsIcon',
    label: 'github',
    title: 'github',
  },
  {
    name: 'icon-zhihu-circle-fill',
    className: 'adsIcon',
    label: 'zhihu',
    title: '知乎',
  },
  {
    name: 'icon-wangzhi',
    className: 'blog-icon',
    label: 'blog',
    title: '其它',
  },
];

// 账号设置类别
export const SETTING_TYPE = [
  { label: '个人掘金', type: 'juejin', placeholder: '请填写个人掘金网址' },
  { label: '个人知乎', type: 'zhihu', placeholder: '请填写个人知乎网址' },
  { label: '个人github', type: 'github', placeholder: '请填写个人github网址' },
  { label: '其它网址', type: 'blog', placeholder: '请填写其它网址' },
];

// 原始快捷键默认值
export const INIT_SHOTCUT_KEYS = [
  {
    label: '唤起应用',
    value: 1,
    shortcut: 'Shift + Alt + Q',
    key: 'OPEN_SHORTCUT',
  },
  {
    label: '全屏/还原',
    value: 2,
    shortcut: 'Shift + Alt + R',
    key: 'FULL_SHORTCUT',
  },
  {
    label: '最小化',
    value: 3,
    shortcut: 'Shift + Alt + M',
    key: 'MINIMIZE_SHORTCUT',
  },
  {
    label: '退出',
    value: 4,
    shortcut: 'Shift + Alt + T',
    key: 'OUT_SHORTCUT',
  },
];

// 快捷键控制
export const STSTEM_CONFIG = {
  shortcut: JSON.parse(JSON.stringify(INIT_SHOTCUT_KEYS)) as typeof INIT_SHOTCUT_KEYS,
  fileConfig: [
    {
      label: '文件存储路径',
      value: 5,
      path: '',
    },
  ],
};

// 快捷键key值
export const SHORTCUT_KEYS = {
  1: 'OPEN_SHORTCUT',
  2: 'FULL_SHORTCUT',
  3: 'MINIMIZE_SHORTCUT',
  4: 'OUT_SHORTCUT',
};

// 开机自启store存储key
export const OPEN_CONFIG = 'OPEN_CONFIG';

// 系统设置关闭应用store存储key
export const CLOSE_CONFIG = 'CLOSE_CONFIG';

// 系统设置不再提示store存储key
export const CLOSE_PROMPT = 'CLOSE_PROMPT';

// 消息提醒store存储key
export const MSG_STATUS = 'MSG_STATUS';

// 阻止按下这些键设置为快捷键
export const CODE_CONTROL = [
  'Shift',
  'Process',
  'ShiftLeft',
  'ShiftRight',
  'Control',
  'ControlLeft',
  'ControlRight',
  'Alt',
  'AltLeft',
  'AltRight',
  'Backspace',
  'Tab',
  'Enter',
]; // ShiftKey Control(Ctrl) Alt

// 保存草稿、编辑草稿api
export const ARTICLE_DRAFT = {
  1: API.CREATE_DRAFT,
  2: API.UPDATE_DRAFT,
};

// 关于博主页面接口path
export const AUTHOR_API_PATH = {
  0: API.GET_AUTHOR_ARTICLE_LIST,
  1: API.GET_AUTHOR_LIKE_ARTICLES,
};

// 我的主页页面API
export const ABOUT_ME_API_PATH = {
  0: API.GET_MY_ARTICLE_LIST,
  1: API.GET_COLLECTION_LIST,
  2: API.GET_FOLLOW_LIST,
  3: API.GET_FOLLOW_ME_LIST,
  4: API.GET_LIKE_ARTICLE_LIST,
};

// 更新用户信息api
export const UPDATE_INFO_API_PATH = {
  1: API.UPDATE_INFO,
  2: API.RESET_PASSWORD,
};

// 消息类型
export const MESSAGE_ACTIONS = {
  LIKE_ARTICLE: '给你的文章点赞了',
  CANCEL_LIKE_ARTICLE: '取消了给你的文章点赞',
  COMMENT: '评论了你的文章',
  COLLECT: '收藏了你的文章',
  CANCEL_COLLECT: '取消收藏了你的文章',
  FOLLOWED: '关注了你',
  CANCEL_FOLLOWED: '取消了对你的关注',
  CHAT: '私信',
};

// 关注/取消关注标题
export const FOLLOWED_INFO = {
  FOLLOWED: '关注信息',
  CANCEL_FOLLOWED: '取消关注信息',
  CHAT: '私信',
};

// monaco-editor 语言列表
export const MONACO_EDITOR_LANGUAGES = [
  'markdown',
  'javascript',
  'typescript',
  'html',
  'json',
  'less',
  'scss',
  'css',
  'go',
  'java',
  'php',
  'rust',
  'c',
  'ruby',
  'sql',
  'xml',
  'yaml',
  'shell',
];

// code run monaco-editor 语言列表
export const CODE_RUN_LANGUAGES = ['javascript', 'html'];

export const SEA_BASE64 =
  'data:image/png;base64,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';

export const LOADING_SVG = `
<svg t="1677748747940" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="34693" width="32" height="32"><path d="M512 448c-57.152 0-192-149.952-192-256a192 192 0 0 1 384 0c0 106.048-134.848 256-192 256z m64 64c0-57.152 149.952-192 256-192a192 192 0 0 1 0 384c-106.048 0-256-134.848-256-192zM448 512c0 57.152-149.952 192-256 192a192 192 0 0 1 0-384c106.048 0 256 134.848 256 192z m64 64c57.152 0 192 149.952 192 256a192 192 0 0 1-384 0c0-106.048 134.848-256 192-256z" fill="#29ee02" p-id="34694"></path></svg>
`;

// 匹配链接
export const MATCH_LINK_REG = /<dnhyxc,(https?:\/\/[^><]+)>/;

// 联系人右键菜单
export const CONTACT_MENU = (isTop: boolean, isDisturb: boolean) => [
  { label: isTop ? '取消置顶' : '消息置顶', value: 1 },
  { label: isDisturb ? '开启消息提醒' : '消息免打扰', value: 2 },
  { label: '不显示聊天', value: 3 },
  { label: '删除聊天', value: 4 },
  { label: '进入其主页', value: 5 },
];

// 聊天消息右键菜单
export const CHAT_MENU = (save?: boolean) => {
  const menus = [
    { label: '删除', value: 1 },
    { label: '复制', value: 2 },
    { label: '回复', value: 4 },
  ];
  if (save) {
    menus.push({ label: '另存为', value: 3 });
  }
  return menus;
};

// vscode 快捷键说明
export const VS_CODE_SHORTCUT_KEYS = [
  {
    name: 'Ctrl + X',
    desc: '剪切行（空选定） Cut line (empty selection)',
  },
  {
    name: 'Ctrl + C',
    desc: '复制行（空选定）Copy line (empty selection)',
  },
  {
    name: 'Alt + ↑ / ↓',
    desc: '向上/向下移动行 Move line up/down',
  },
  {
    name: 'Shift + Alt + ↓ / ↑',
    desc: '向上/向下复制行 Copy line up/down',
  },
  {
    name: 'Ctrl + Shift + K',
    desc: '删除行 Delete line',
  },
  {
    name: 'Ctrl + Enter',
    desc: '在下面插入行 Insert line below',
  },
  {
    name: 'Ctrl + Shift + Enter',
    desc: '在上面插入行 Insert line above',
  },
  {
    name: 'Ctrl + Shift + \\',
    desc: '跳到匹配的括号 Jump to matching bracket',
  },
  {
    name: 'Ctrl + ] / [',
    desc: '增加/减少缩进行 Indent/outdent line',
  },
  {
    name: 'Ctrl + Home',
    desc: '转到文件开头 Go to beginning of file',
  },
  {
    name: 'Ctrl + End',
    desc: '转到文件末尾 Go to end of file',
  },
  {
    name: 'Ctrl + ↑ / ↓',
    desc: '向上/向下滚动行 Scroll line up/down',
  },
  {
    name: 'Ctrl + /',
    desc: '切换行注释 Toggle line comment',
  },
  {
    name: 'Ctrl + F',
    desc: '查找 Find',
  },
  {
    name: 'Alt + C / R / W',
    desc: '切换区分大小写/正则表达式/整个词 Toggle case-sensitive / regex / whole word',
  },
  {
    name: 'Alt + 单击',
    desc: '插入光标 Insert cursor',
  },
  {
    name: 'Ctrl + Alt + ↑ / ↓',
    desc: '在上/下插入光标 Insert cursor above / below',
  },
  {
    name: 'Ctrl + U',
    desc: '撤消上一个光标操作 Undo last cursor operation',
  },
  {
    name: 'Shift + Alt + I',
    desc: '在选定的每一行的末尾插入光标 Insert cursor at end of each line selected',
  },
  {
    name: 'Ctrl + I',
    desc: '选择当前行 Select current line',
  },
  {
    name: 'Ctrl + Shift + L',
    desc: '选择当前选择的所有出现 Select all occurrences of current selection',
  },
  {
    name: 'Ctrl + F2',
    desc: '选择当前字的所有出现 Select all occurrences of current word',
  },
  {
    name: 'Shift + Alt + →',
    desc: '展开选择 Expand selection',
  },
  {
    name: 'Shift + Alt + ←',
    desc: '缩小选择 Shrink selection',
  },
  {
    name: 'Shift + Alt + （拖动鼠标）',
    desc: '列（框）选择 Column (box) selection',
  },
  {
    name: 'Ctrl + Shift + Alt +（箭头键）',
    desc: '列（框）选择 Column (box) selection',
  },
  {
    name: 'Ctrl + Shift + Alt + PgUp / PgDown',
    desc: '列（框）选择页上/下 Column (box) selection page up/down',
  },
];

// epub 主题
export const EPUB_THEMES = [
  {
    name: '默认',
    key: 'light',
    style: {
      body: {
        color: '#000',
        background: '#fff',
      },
    },
  },
  {
    name: '护眼',
    key: 'emeraldGreen',
    style: {
      body: {
        color: '#000',
        background: '#ceeaba',
      },
    },
  },
  {
    name: '暗夜',
    key: 'black',
    style: {
      body: {
        color: '#fff',
        background: '#050505',
      },
    },
  },
  {
    name: '淡绿',
    key: 'freshGreen',
    style: {
      body: {
        color: '#000',
        background: '#eefbee',
      },
    },
  },
  {
    name: '松石绿',
    key: 'lightcyan',
    style: {
      body: {
        color: '#000',
        background: '#d7fffe',
      },
    },
  },
  {
    name: '明黄',
    key: 'danQingHuang',
    style: {
      body: {
        color: '#000',
        background: '#feffed',
      },
    },
  },
  {
    name: '米黄',
    key: 'beige',
    style: {
      body: {
        color: '#000',
        background: '#f5f5dc',
      },
    },
  },
  {
    name: '浅灰',
    key: 'gray',
    style: {
      body: {
        color: '#000',
        background: '#d8e0e6',
      },
    },
  },
  {
    name: '透明白',
    key: 'tw',
    style: {
      body: {
        color: '#fff',
        background: 'transparent',
      },
    },
  },
  {
    name: '透明黑',
    key: 'tb',
    style: {
      body: {
        color: '#000',
        background: 'transparent',
      },
    },
  },
];

export const BOOK_THEME = {
  light: 'light',
  black: 'black',
  freshGreen: 'freshGreen',
  emeraldGreen: 'emeraldGreen',
  lightcyan: 'lightcyan',
  danQingHuang: 'danQingHuang',
  electrum: 'beige',
  skygray: 'gray',
  cloud: 'tb',
  snow: 'tw',
  lateralFace: 'tw',
  ShaoSiming: 'tw',
  beauty: 'tw',
  locomotive: 'tw',
  island: 'tw',
  sea: 'tw',
  fresh: 'tw',
  sun: 'tw',
};
