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
import { usePersonalStore } from './personal';
import { useSearchStore } from './search';
import { useMessageStore } from './message';
import { useInteractStore } from './interact';
import { useFollowStore } from './follow';
import { useToolsStore } from './tools';

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

// 时间轴
export const timelineStore = useTimelineStore();

// 博主主页
export const authorStore = useAuthorStore();

// 个人主页
export const personalStore = usePersonalStore();

// 高级搜索
export const searchStore = useSearchStore();

// 消息列表
export const messageStore = useMessageStore();

// 留言列表
export const interactStore = useInteractStore();

// 关注用户
export const followStore = useFollowStore();

// 工具列表
export const toolsStore = useToolsStore();
