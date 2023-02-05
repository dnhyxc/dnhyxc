import { useCommonStore } from './common';
import { useLoginStore } from './login';

// 公共store
export const commonStore = useCommonStore();

// 用户登录
export const loginStore = useLoginStore();
