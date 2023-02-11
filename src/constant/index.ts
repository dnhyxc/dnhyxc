import HOMESVG from '@/assets/svg/home.svg';
import MAXSVG from '@/assets/svg/max.svg';
import MINSVG from '@/assets/svg/min.svg';
import CLOSESVG from '@/assets/svg/close.svg';
import RESTORESVG from '@/assets/svg/restore.svg';
import PAGESVG from '@/assets/svg/page_icon.svg';

// 左侧菜单配置
export const MENULIST = [
  {
    name: '文章列表',
    key: 'home',
    path: '/home',
    icon: 'icon-shouye',
    active: 'icon-icon',
    show: true,
  },
  {
    name: '文章分类',
    key: 'classify',
    path: '/classify',
    icon: 'icon-fenlei1',
    active: 'icon-fenlei4',
    show: true,
  },
  {
    name: '文章标签',
    key: 'tag',
    path: '/tag',
    icon: 'icon-biaoqianku',
    active: 'icon-24gf-tags',
    show: true,
  },
  {
    name: '时间轴线',
    key: 'timeline',
    path: '/timeline',
    icon: 'icon-timeAxis',
    active: 'icon-a-Frame174',
    show: true,
  },
  {
    name: '发布文章',
    key: 'create',
    path: '/create',
    icon: 'icon-fankuitianxie',
    active: 'icon-xieboke',
    show: true,
  },
  {
    name: '关于博主',
    key: 'author',
    path: '/author',
    icon: 'icon-yonghuID',
    active: 'icon-yonghuziliao',
    show: true,
  },
  {
    name: '我的主页',
    key: 'personal',
    path: '/personal',
    show: false,
  },
  {
    name: '文章详情',
    key: 'detail',
    path: '/detail',
    show: false,
  },
];

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
  },
  {
    name: '账号设置',
    key: 'account',
    path: '/account',
  },
];

// 二次确认弹窗配置
export const MSG_CONFIG = {
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  type: 'warning',
  center: true,
  draggable: true,
  showClose: false,
  customStyle: { width: 'auto', padding: '0 30px 20px 30px' },
};

// 首页展示的文章类型
export const ATRICLE_TYPE = {
  1: '推荐文章',
  2: '最新文章',
  3: '最热文章',
};

// URL host
export const GATEWAY_HOST = '';

// 文章分类
export const ARTICLE_CLASSIFY = [
  '前端',
  '后端',
  '架构',
  '数据库',
  '设计模式',
  '数据结构',
  '算法',
  '开发工具',
  '代码人生',
  '前端框架',
  '计算机',
  '网络协议',
  '可视化',
  '移动端',
  '阅读',
  '其它',
];

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
];

// 允许上传的文件类型
export const FILE_TYPE = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

export { MINSVG, RESTORESVG, MAXSVG, CLOSESVG, HOMESVG, PAGESVG };
