import HOMESVG from '@/assets/svg/home.svg';
import MAXSVG from '@/assets/svg/max.svg';
import MINSVG from '@/assets/svg/min.svg';
import CLOSESVG from '@/assets/svg/close.svg';
import RESTORESVG from '@/assets/svg/restore.svg';

// 左侧菜单配置
export const MENULIST = [
  {
    name: '文章列表',
    key: 'home',
    path: '/home',
    icon: HOMESVG,
  },
  {
    name: '文章分类',
    key: 'classify',
    path: '/classify',
    icon: HOMESVG,
  },
  {
    name: '文章标签',
    key: 'tag',
    path: '/tag',
    icon: HOMESVG,
  },
  {
    name: '时间轴线',
    key: 'timeline',
    path: '/timeline',
    icon: HOMESVG,
  },
  {
    name: '发布文章',
    key: 'create',
    path: '/create',
    icon: HOMESVG,
  },
  {
    name: '关于博主',
    key: 'author',
    path: '/author',
    icon: HOMESVG,
  },
  {
    name: '发布文章',
    key: 'create',
    path: '/create',
    icon: HOMESVG,
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

export { MINSVG, RESTORESVG, MAXSVG, CLOSESVG, HOMESVG };
