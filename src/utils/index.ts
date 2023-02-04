import { ElMessageBox } from 'element-plus';
import type { ElMessageBoxOptions } from 'element-plus';
import { MSG_CONFIG } from '@/constant';

// 判断系统类型
export const checkOS = () => {
  const agent = navigator.userAgent.toLowerCase();
  const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  if (agent.indexOf('win32') >= 0 || agent.indexOf('wow32') >= 0) {
    return 'win32';
  }
  if (agent.indexOf('win64') >= 0 || agent.indexOf('wow64') >= 0) {
    return 'win64';
  }
  if (isMac) {
    return 'mac';
  }
};

// 二次确认弹窗
export const Message = (title: string = '确定下架该文章吗？', content: string = '下架文章') => {
  return ElMessageBox.confirm(title, content, MSG_CONFIG as ElMessageBoxOptions);
};
