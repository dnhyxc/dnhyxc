import Store from 'electron-store';

const store = new Store();

// 处理各页面存储在store的数据
export const setParamsToStore = (from: string, data: any) => {
  const paramList = (store.get('paramList') && JSON.parse(store.get('paramList') as string)) || [];
  const params = {
    from,
    data,
  };
  const index = paramList.findIndex((i: any) => i.from === from);
  if (index > -1) {
    // 先删除原来的数据，然后再向最前面添加，保持最新添加的始终在最前面
    paramList.splice(index, 1);
    paramList.unshift(params);
  } else {
    paramList.unshift(params);
  }
  store.set('paramList', JSON.stringify(paramList));
};

// 清除保存在store中的paramList
export const clearParamListFromStore = () => {
  store.delete('paramList');
};

// 获取保存在store中的paramList
export const getParamListFromStore = (from: string) => {
  const data = store.get('paramList');
  if (data && JSON.parse(data as string)) {
    const findData = JSON.parse(data as string).find((i: any) => i.from === from);
    return findData?.data;
  } else {
    return {};
  }
};

// 返回 electron-store 的实例
export const eStore = store;

// 保存主题
export const setTheme = (type: string) => {
  store.set('theme', type);
};

// 获取主题
export const getTheme = (): string => {
  return (store.get('theme') as string) || '';
};

// 清除主题
export const removeTheme = () => {
  store.delete('theme');
};
