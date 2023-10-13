import store from './initStore';
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
import { usePictureStore } from './picture';
import { useConvertStore } from './convert';
import { useCodeStore } from './code';

// 公共store，传入 store 用于防止在使用时，出现 pinia 注册比 Vue app 注册早，导致使用 pinia 报错
export const commonStore = useCommonStore(store);

// 用户登录
export const loginStore = useLoginStore(store);

// 创建页
export const createStore = useCreateStore(store);

// 文章列表
export const articleStore = useArticleStore(store);

// 收藏列表
export const collectStore = useCollectStore(store);

// 文件上传
export const uploadStore = useUploadStore(store);

// 文章分类
export const classifyStore = useClassifyStore(store);

// 文章标签
export const tagStore = useTagStore(store);

// 时间轴
export const timelineStore = useTimelineStore(store);

// 博主主页
export const authorStore = useAuthorStore(store);

// 个人主页
export const personalStore = usePersonalStore(store);

// 高级搜索
export const searchStore = useSearchStore(store);

// 消息列表
export const messageStore = useMessageStore(store);

// 留言列表
export const interactStore = useInteractStore(store);

// 关注用户
export const followStore = useFollowStore(store);

// 工具列表
export const toolsStore = useToolsStore(store);

// 图片集列表
export const pictureStore = usePictureStore(store);

// 转换列表列表
export const convertStore = useConvertStore(store);

// 代码示例列表
export const codeStore = useCodeStore(store);
