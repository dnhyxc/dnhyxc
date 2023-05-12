import type { Ref } from 'vue';

// 菜单类型
export interface MenuListParams {
  name: string;
  key: string;
  path: string;
  icon?: string;
  active?: string;
  fillIcon?: string;
  show?: boolean;
}

// user store 属性声明
export interface LoginParams {
  username: string;
  password: string;
}

// 用户信息属性声明
export interface UserLoginParams {
  token: string | null;
  username: string | null;
  userId: string | null;
  auth: number | null;
  registerTime: number;
  bindUsernames?: string[];
  bindUserIds?: string[];
}

// auth store 属性声明
export interface AuthParams {
  redirectUrl: string;
}

// 用户注册返回参数
export interface registerRes {
  username: string;
  userId: string;
  token?: string;
  job?: string;
  motto?: string;
  introduce?: string;
  headUrl?: string;
  github?: string;
  juejin?: string;
  zhihu?: string;
  blog?: string;
  mainCover?: string;
}

// 用户信息
export interface UserInfoParams {
  userId?: string;
  username?: string;
  token?: string;
  job?: string;
  motto?: string;
  introduce?: string;
  headUrl?: string;
  github?: string;
  juejin?: string;
  zhihu?: string;
  blog?: string;
  mainCover?: string;
  articleTotal?: string;
  registerTime?: number;
  bindUserIds?: string[];
  isDelete?: boolean;
  auth?: number;
  password?: string;
}

// 用户列表相应参数
export interface UserListRes {
  list: UserInfoParams[];
  total: number;
}

// 获取用户列表参数
export interface Params {
  pageNo: number;
  pageSize: number;
  userId?: string;
}

// 发布文章参数
export interface CreateArticleParams {
  authorId?: string;
  title?: string;
  content?: string;
  classify?: string;
  tag?: string;
  createTime?: number;
  coverImage?: string;
  abstract?: string;
  articleId?: string;
  originalArticleId?: string;
  draftId?: string;
}

// 创建收藏集返回值
export interface AddCollectionRes {
  id: string;
  name?: string;
  createTime?: number;
  count?: number;
  status?: number;
  desc?: string;
  articleIds?: string[];
}

// 获取文章列表参数
export interface GetArticleListParams {
  pageNo: number;
  pageSize: number;
  filter?: any;
  userId?: string;
  hot?: boolean;
}

// 文章列表返回数据
export interface ArticleItem extends AddCollectionRes {
  abstract?: string;
  authorId?: string;
  authorName?: string;
  classify?: string;
  content?: string;
  headUrl?: string;
  coverImage?: string;
  createTime?: number;
  id: string;
  isLike?: boolean;
  likeCount?: number;
  replyCount?: number;
  readCount?: number;
  tag?: string;
  title?: string;
  commentCount?: number;
  isDelete?: boolean;
  collectCount?: number;
  toUserId?: string;
  action?: string;
  fromUsername?: string;
  fromUserId?: string;
  isReaded?: boolean;
  pushDate?: number;
  articleId?: number;
}

// 文章列表返回值
export interface ArticleListResult {
  list: ArticleItem[];
  total: number;
  count: number;
}

// 时间轴参数
export interface TimelineArticles {
  id?: string;
  title?: string;
  abstract?: string;
  createTime?: number;
  authorId?: string;
  authorName?: string;
  coverImage?: string;
  isLike?: boolean;
  tag?: string;
  classify?: string;
  likeCount?: number;
  replyCount?: number;
  readCount?: number;
  commentCount?: number;
}

// 时间轴返回参数
export interface TimelineResult {
  date: string;
  articles: TimelineArticles[];
  count?: number;
}

// 重置密码表单参数
export interface ResetFormParams {
  username: string;
  newPwd?: string;
  confirmPwd?: string;
}

// 重置密码表单参数
export interface FormData<T> {
  formRef: T;
  resetForm: ResetFormParams;
}

// header 面包屑
export interface CrumbsInfo {
  crumbsName: string;
  crumbsPath: string;
}

// 文章目录
export interface TocTitlesParams {
  title: string;
  lineIndex: string | null;
  indent: number;
}

/**
 * 第一层区别方式
 *  - id: 0，formContent: ''
 *
 * 第二层：
 *  - id: 第一层comment，formContent: ''
 *
 * 第三层：
 *  - id: 第二层comment，fromContent: 第二层回复内容
 */
export interface CommentParams {
  articleId?: string;
  username?: string;
  date?: number;
  commentId?: string;
  userId?: string;
  content?: string;
  fromUserId?: string;
  likeCount?: number;
  replyCount?: number;
  headUrl?: string;
  fromUsername?: string;
  formContent?: string;
  replyList?: CommentParams[];
  fromCommentId?: string;
  isLike?: boolean;
}

// 回复评论参数
export interface ReplayComment {
  articleId: string;
  keyword: string;
  selectComment: CommentParams;
  isThreeTier?: boolean;
}

// 事件总线类型
export interface Events {
  events: Object;
  emit: <T>(eventName: string, data?: T) => void;
  on: (eventName: string, fn: Function) => void;
  off: (eventName: string, fn: Function) => void;
}

// 创建收藏集返回值
export interface CollectListRes {
  total: number;
  list: AddCollectionRes[];
}

// 删除文章、收藏夹等类型
export interface useDeleteArticleParams {
  pageType: string;
  articleList?: ArticleListResult;
  pageNo?: number;
  classify?: string;
  tagName?: string;
  authorId?: string;
  accessUserId?: string;
  authorPage?: boolean;
  authorLike?: boolean;
  filterList?: string[];
  router?: any;
  scrollbar?: Ref<HTMLDivElement>;
}

// 删除文章参数
export interface DeleteArticleParams {
  articleId: string;
  pageType?: string; // 用户区分页面列表数据
  pageNo?: number;
  pageSize?: number;
  type?: string;
  keyword?: string;
  classify?: string;
  userId?: string;
  tagName?: string;
  accessUserId?: string;
  delType?: boolean;
  authorPage?: boolean;
  authorLike?: boolean;
  filterList?: string[];
  authorId?: string;
  router?: any;
}

// 分类、标签信息查询
export interface Classifys {
  value: number;
  name: string;
}

// 文章搜索参数
export interface SearchArticleParams {
  keyword?: string | undefined | null;
  tagName?: string | undefined | null;
  pageNo: number;
  pageSize: number;
  userId?: string;
}

// 我的主页获取列表数据的参数定义
export interface PerGetArticlesParams {
  pageNo: number;
  pageSize: number;
  userId: string;
  accessUserId: string;
  isVisitor?: boolean;
}

// 收藏集信息
export interface CollectParams {
  name: string;
  desc: string;
  status: string | number;
  id?: string;
}

// 高级搜索参数
export interface AdvancedSearchParams {
  keyword: string;
  pageNo: number;
  pageSize: number;
  userId?: string;
  filterList?: string[];
}

// 保存草稿参数
export interface CreateDraftParamsResult {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createTime: number;
}

// 草稿详情
export interface ArticleDetailParams {
  id?: string;
  title?: string;
  content?: string;
  classify?: string;
  tag?: string;
  coverImage?: string;
  headUrl?: string;
  abstract?: string;
  createTime?: number;
  comments?: CommentParams[];
  authorName?: string;
  authorId?: string;
  replyCount?: number;
  likeCount?: number;
  readCount?: number;
  isLike?: boolean;
  originalArticleId?: string | number;
  isDelete?: boolean;
}

// 弹幕类型
export interface BarrageItem {
  avatar: string;
  userId?: string;
  username: string;
  comment: string;
}

export interface InteractListRes {
  list: BarrageItem[];
  total: number;
}
