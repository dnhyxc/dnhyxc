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
  },
  {
    name: '文章分类',
    key: 'classify',
    path: '/classify',
    icon: 'icon-fenlei1',
    active: 'icon-fenlei4',
  },
  {
    name: '文章标签',
    key: 'tag',
    path: '/tag',
    icon: 'icon-biaoqianku',
    active: 'icon-24gf-tags',
  },
  {
    name: '时间轴线',
    key: 'timeline',
    path: '/timeline',
    icon: 'icon-timeAxis',
    active: 'icon-a-Frame174',
  },
  {
    name: '发布文章',
    key: 'create',
    path: '/create',
    icon: 'icon-fankuitianxie',
    active: 'icon-xieboke',
  },
  {
    name: '关于博主',
    key: 'author',
    path: '/author',
    icon: 'icon-yonghuID',
    active: 'icon-yonghuziliao',
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

export { MINSVG, RESTORESVG, MAXSVG, CLOSESVG, HOMESVG, PAGESVG };
