import { useCommonStore } from './common';
import { useLoginStore } from './login';
import { useCreateStore } from './create';
import { useArticleStore } from './article';
import { useCollectStore } from './collect';
import { useUploadStore } from './upload';
import { useClassifyStore } from './classify';
import { useTagStore } from './tag';
import { useTimelineStore } from './timeline';
import { useAuthorStore } from './author';

// 公共store
export const commonStore = useCommonStore();

// 用户登录
export const loginStore = useLoginStore();

// 创建页
export const createStore = useCreateStore();

// 文章列表
export const articleStore = useArticleStore();

// 收藏列表
export const collectStore = useCollectStore();

// 文件上传
export const uploadStore = useUploadStore();

// 文章分类
export const classifyStore = useClassifyStore();

// 文章标签
export const tagStore = useTagStore();

// 文章标签
export const timelineStore = useTimelineStore();

// 文章标签
export const authorStore = useAuthorStore();
