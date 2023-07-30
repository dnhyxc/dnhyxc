// 上传文件
export const UPLOAD = '/api/upload';
// 删除文件
export const REMOVE_FILE = '/api/removeFile';

/* ==========用户信息相关========== */
// 登录
export const LOGIN = '/api/login';
// 用户注册
export const REGISTER = '/api/register';
// 账号注销
export const LOGOUT = '/api/logout';
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

// 获取相似的文章
export const GET_LIKENESS_ARTICLES = '/api/getLikenessArticles';

// 获取评论
export const GET_COMMENT_LIST = '/api/getCommentList';

/* ==========文章操作相关========== */
// 文章点赞
export const LIKE_ARTICLE = '/api/likeArticle';
// 校验文章点赞状态
export const CHECK_ARTICLE_LIKE_STATUS = '/api/checkArticleLikeStatus';
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
// 获取后台添加的文章分类
export const GET_ADDED_CLASSIFYS = '/api/getAddedClassifys';

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

// 获取消息列表
export const GET_MESSAGE_LIST = '/api/getMessageList';

// 设置消息阅读状态
export const SET_READ_STATUS = '/api/setReadStatus';

// 获取未读消息数量
export const GET_NO_READ_MSG_COUNT = '/api/getNoReadMsgCount';

// 删除消息
export const DELETE_MESSAGE = '/api/deleteMessage';

// 删除全部消息
export const DELETE_ALL_MESSAGE = '/api/deleteAllMessage';

// 创建留言
export const CREATE_INTERACT = '/api/createInteract';

// 获取留言列表
export const GET_INTERACTS = '/api/getInteracts';

// 分页获取留言列表
export const GET_INTERACT_LIST = '/api/getInteractList';

// 移除留言
export const REMOVE_INTERACTS = '/api/removeInteracts';

// 关注/取消关注用户
export const MANAGE_FOLLOW = '/api/manageFollow';

// 关注/取消关注用户
export const GET_FOLLOW_LIST = '/api/getFollowList';

// 查询是否关注了该用户
export const FIND_FOLLOWED = '/api/findFollowed';

// 获取工具列表
export const GET_TOOL_LIST = '/api/getToolList';

// 更新工具
export const UPDATE_TOOLS = '/admin/updateTools';

// 创建工具排序
export const CREATE_TOOL_SORT = '/admin/createToolSort';

// 更新工具排序
export const UPDATE_TOOLSORT = '/admin/updateToolSort';

// 添加收藏集图片
export const ADD_ATLAS_IMAGES = '/api/addAtlasImages';

// 获取收藏集图片
export const GET_ATLAS_LIST = '/api/getAtlasList';

// 删除收藏集图片
export const DELETE_ATLAS_IMAGES = '/api/deleteAtlasImages';
