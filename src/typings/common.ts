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
  coverImg?: string;
  abstract?: string;
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
}

// 文章列表返回数据
export interface ArticleItem extends AddCollectionRes {
  abstract?: string;
  authorId?: string;
  authorName?: string;
  classify?: string;
  content?: string;
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
  count: number;
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
