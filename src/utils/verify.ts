// 检验是否是数字
export function checkNumber(params: { value: string; callback: Function }) {
  const { value, callback } = params;
  if (value && /[^\d]/g.test(value)) {
    callback(new Error('只能输入整数'));
    return;
  }
  return 'next';
}

// 校验最小值
export function checkMin(params: { value: number; callback: Function; minSize: number }) {
  const { value, callback, minSize = 100 } = params;
  if (value && value < minSize) {
    callback(new Error(`不能小于 ${minSize}`));
    return;
  }
  return 'next';
}

// 校验最大值
export function checkMax(params: { value: number; callback: Function; maxSize: number }) {
  const { value, callback, maxSize = 5000 } = params;
  if (value && value > maxSize) {
    callback(new Error(`不能大于 ${maxSize}`));
    return;
  }
  return 'next';
}

// 校验内容是否为空
export const verifyEmpty = (params: { value: number; callback: Function; keyword?: string }) => {
  const { value, callback, keyword = '' } = params;
  if (!value) {
    callback(new Error(`${keyword}不能为空`));
    return;
  }
  return 'next';
};

// 校验长度
export const verifyLength = (params: {
  value: number;
  callback: Function;
  maxLength?: number;
  keyword?: number; // 字段名称
  limitStr?: string; // 限制文字（超过、小于等等）
}) => {
  const { value, callback, maxLength = 20, keyword = '', limitStr = '' } = params;
  if (value > maxLength) {
    callback(new Error(`${keyword}不能${limitStr} ${maxLength} 位`));
    return;
  }
  return 'next';
};

// 检验是否包含特殊字符
export const verfiySpecialCharacters = (params: { value: string; callback: Function; keyword?: string }) => {
  const { value, callback, keyword = '用户名' } = params;
  const usrRegex = /^((?!\\|\/|\(|\)|\+|-|=|~|～|`|!|！|:|\*|\?|<|>|\||'|%|#|&|\$|\^|&|\*).){1,20}$/;
  if (!usrRegex.test(value)) {
    callback(new Error(`${keyword}不能包含特殊字符`));
    return;
  }
  return 'next';
};

// 检验是否包含某些字符
export const verifyContainSpecialCharacters = (params: {
  value: string;
  callback: Function;
  keyword?: string;
  regExp?: RegExp;
}) => {
  const pwdRegex = /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,20}/;
  const { value, callback, keyword = '必须包含字母、数字、特称字符', regExp = pwdRegex } = params;
  if (!regExp.test(value)) {
    callback(new Error(keyword));
    return;
  }
  return 'next';
};

// 检验两次输入是否一致
export const verfiyIsConsistent = (params: {
  value: string;
  callback: Function;
  newValue?: string;
  keyword?: string;
}) => {
  const { value, callback, newValue, keyword = '密码' } = params;
  if (value !== newValue) {
    callback(new Error(`两次输入的${keyword}不一致`));
    return;
  }
  return 'next';
};

export class Verify {
  private nextRule: Verify | { check: Function } | null;
  private checkRule?: Function;
  // 图片压缩最小尺寸
  private minSize?: number;
  // 图片压缩最大尺寸
  private maxSize?: number;
  // 最大长度
  private maxLength?: number;
  // 最小长度
  private minLength?: number;
  // 最小长度
  private keyword?: string;

  constructor(params?: {
    fn?: Function;
    maxSize?: number;
    minSize?: number;
    minLength?: number;
    maxLength?: number;
    keyword?: string;
  }) {
    this.checkRule = params?.fn;
    this.nextRule = null;
    this.minSize = params?.minSize;
    this.maxSize = params?.maxSize;
    this.maxLength = params?.maxLength;
    this.minLength = params?.minLength;
    this.keyword = params?.keyword;
  }

  addRule(nextRule: Function): Verify {
    this.nextRule = new Verify({
      fn: nextRule,
      minSize: this.minSize,
      maxSize: this.maxSize,
      maxLength: this.maxLength,
      minLength: this.minLength,
      keyword: this.keyword,
    });
    return this.nextRule as Verify;
  }

  check(value: string | number, callback: Function) {
    if (this.checkRule) {
      // this?.checkRule 就是各种检验函数
      this?.checkRule?.({
        value,
        callback,
        minSize: this.minSize,
        maxSize: this.maxSize,
        maxLength: this.maxLength,
        minLength: this.minLength,
        keyword: this.keyword,
      }) === 'next'
        ? this.nextRule?.check(value, callback)
        : null;
    } else {
      this.nextRule?.check(value, callback);
    }
  }

  end(callback: Function) {
    this.nextRule = {
      check: () => {
        callback();
        return 'end';
      },
    };
  }
}
