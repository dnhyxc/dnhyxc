import { useCommonStore } from './common';
import { useLoginStore } from './login';
import { useCreateStore } from './create';

// 公共store
export const commonStore = useCommonStore();

// 用户登录
export const loginStore = useLoginStore();

// 创建页
export const createStore = useCreateStore();
