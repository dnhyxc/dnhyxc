// 上传文件
export const UPLOAD = '/api/upload';

/* ==========用户信息相关========== */
// 登录
export const LOGIN = '/api/login';
// 用户注册
export const REGISTER = '/api/register';
// 获取用户信息
export const GET_USER_INFO = '/api/getUserInfo';
// 更新用户信息
export const UPDATE_INFO = '/api/updateInfo';
// 重置密码
export const RESET_PASSWORD = '/api/resetPassword';

/* ==========文章相关========== */
// 创建文章
export const CREATE_ARTICLE = '/api/createArticle';
// 更新文章
export const UPDATE_ARTICLE = '/api/updateArticle';
// 获取文章列表
export const ARTICLE_LIST = '/api/articleList';
// 获取文章详情
export const ARTICLE_DETAIL = '/api/articleDetail';
// 删除文章
export const DELETE_ARTICLE = '/api/deleteArticle';
// 文章搜索
export const SEARCH_ARTICLE = '/api/searchArticle';
// 随机获取文章
export const GET_ARTICLE_BY_RANDOM = '/api/getArticleByRandom';
// 文章草稿
export const CREATE_DRAFT = '/api/createDraft';
// 更新文章草稿
export const UPDATE_DRAFT = '/api/updateDraft';
// 获取草稿列表
export const GET_DRAFT_LIST = '/api/getDraftList';
// 获取草稿详情
export const GET_DRAFT_BY_ID = '/api/getDraftById';
// 获取草稿详情
export const DELETE_DRAFT = '/api/deleteDraft';
// 高级搜索
export const ADVANCED_SEARCH = '/api/advancedSearch';
// 获取文章分类
export const GET_TIMELINE_LIST = '/api/getTimelineList';

// 获取上一篇文章
export const GET_PREV_ARTICLE = '/api/getPrevArticle';
// 获取下一篇文章
export const GET_NEXT_ARTICLE = '/api/getNextArticle';

// 获取评论
export const GET_COMMENT_LIST = '/api/getCommentList';

/* ==========文章操作相关========== */
// 文章点赞
export const LIKE_ARTICLE = '/api/likeArticle';
// 发布评论
export const COMMENTS = '/api/comments';
// 评论点赞
export const GIVE_COMMENT_LIKE = '/api/giveLike';
// 评论点赞
export const DELETE_COMMENT = '/api/deleteComment';
// 创建收藏集
export const CREATE_COLLECTION = '/api/createCollection';
// 创建收藏集
export const UPDATE_COLLECTION = '/api/updateCollection';
// 获取收藏集列表
export const GET_COLLECTION_LIST = '/api/getCollectionList';
// 收藏集详情
export const GET_COLLECT_INFO = '/api/getCollectInfo';
// 获取收藏集中收藏的文章列表
export const GET_COLLECT_ARTICLES = '/api/getCollectArticles';
// 移除收藏集中的文章
export const REMOVE_COLLECT_ARTICLE = '/api/removeCollectArticle';
// 删除收藏集
export const DEL_COLLECTION = '/api/delCollection';
// 收藏文章
export const COLLECT_ARTICLES = '/api/collectArticles';
// 获取收藏状态
export const CHECK_COLLECTION_STATUS = '/api/checkCollectionStatus';
// 取消收藏
export const CANCEL_COLLECTED = '/api/cancelCollected';

// 获取文章标签
export const GET_TAG_LIST = '/api/getTagList';
// 获取文章分类
export const GET_CLASSIFY_LIST = '/api/getClassifyList';

// 获取我点赞的文章列表
export const GET_AUTHOR_ARTICLE_LIST = '/api/getAuthorArticleList';
// 获取博主点赞的文章列表
export const GET_AUTHOR_LIKE_ARTICLES = '/api/getAuthorLikeArticles';
// 获取博主点赞的文章列表
export const GET_AUTHOR_TIMELINE = '/api/getAuthorTimeline';

// 获取我发布的文章列表
export const GET_MY_ARTICLE_LIST = '/api/getMyArticleList';
// 获取我点赞的文章列表
export const GET_LIKE_ARTICLE_LIST = '/api/getLikeArticleList';

// 获取收藏文章总条数
export const GET_COLLECTED_TOTAL = '/api/getCollectedTotal';

// 获取收藏集总数
export const GET_COLLECT_TOTAL = '/api/getCollectTotal';
