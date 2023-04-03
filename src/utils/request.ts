import fetch from 'isomorphic-fetch';
import Store from 'electron-store';
import { ElMessage } from 'element-plus';
import { stringify } from 'query-string';
import { addGatewayPattern } from './urlTool';
import { ssnSetItem, locGetItem } from './storage';

const store = new Store();

export interface ICheckStatusProps {
  response: Response;
  options?: any;
  url?: string;
}
interface ErrorWithResponse extends Error {
  response?: Response;
}

// 设置重定向路径
function setRedirectPath(value: string) {
  ssnSetItem('redirectUrl', JSON.stringify(value));
}

function checkRedirection(response: Response): boolean {
  const url = response.headers.get('location');
  if (!url) return false;
  try {
    const redirectUrl = new URL(url);
    if (redirectUrl.hostname !== window.location.hostname) {
      window.location.href = url;
      return true;
    }
  } catch (err) {
    ElMessage.error('redirect url error');
  }

  return false;
}

function getErrorWithResponse(response: Response): ErrorWithResponse {
  const error: ErrorWithResponse = new Error(response.statusText);
  error.response = response;
  error.message = JSON.stringify(response);
  return error;
}

function checkStatus({ response }: ICheckStatusProps): Response {
  if (checkRedirection(response)) {
    throw getErrorWithResponse(response);
  } else if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    throw getErrorWithResponse(response);
  }
}

/**
 * 给 URL 加上 _t=时间戳
 * @param {string} url 完整 url 或者 path
 */
function addTimestamp(url: string): string {
  const t = `_t=${Date.now()}`;
  const sep = url.includes('?') ? '&' : '?';
  return url + sep + t;
}

function parseJSON(response: Response) {
  return response.json();
}

function onRedirect(pathname: string, search: string) {
  if (pathname !== '/login') {
    location.href = '/login';
  }
}

export type FetchResult = Promise<{ err: Error | null; data: any }>;

/**
 * Requests a URL, returning a promise.
 * @param  {string} url The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {Promise<{ data: any, err: Error }>} An object containing either "data" or "err"
 */
export default function request(_url: string, options?: any): FetchResult {
  const url = addTimestamp(_url?.startsWith('http') ? _url : addGatewayPattern(_url));
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT' || newOptions.method === 'GET') {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${
          locGetItem('token') || (store.get('token') && JSON.parse(store.get('token')! as string))
        }`,
        ...newOptions.headers,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // NewOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${
          locGetItem('token') || (store.get('token') && JSON.parse(store.get('token')! as string))
        }`,
        ...newOptions.headers,
      };
    }
  }
  return fetch(url, newOptions)
    .then((response: any) =>
      checkStatus({
        response,
        options: newOptions,
        url: _url,
      }),
    )
    .then(parseJSON)
    .then((data: any) => {
      const { code } = data;
      if (code === 201) {
        // setRedirectPath({ hasAuth: true, noLogin: false });
      }
      return {
        data,
        err: null,
      };
    })
    .catch((err: any) => {
      if (err && err.response) {
        const { pathname, search } = window.location;

        return err.response.json().then((data: any) => {
          if (err.response.status === 401 || err.response.status === 403) {
            setRedirectPath(`${pathname}${search}`);
            onRedirect(pathname, search);
            return {
              err: new Error(data.message || '系统异常'),
              code: err.response.status,
            };
          }
          if (err.response.status === 409) {
            setRedirectPath(`${pathname}${search}`);
            return {
              err: new Error(data.message || '系统异常'),
              code: err.response.status,
            };
          }
          if (err.response.status === 406) {
            return {
              err: new Error(data.message || '系统异常'),
              code: err.response.status,
            };
          }
          if (err.response.status === 200) {
            return null;
          }
          return {
            err: new Error(data.message || '系统异常'),
          };
        });
      }
      return {
        err: new Error('系统异常'),
      };
    });
}

export function get(url: string, params: any = {}) {
  const newUrl = `${url}?${stringify(params, {
    arrayFormat: 'comma',
    skipEmptyString: true,
  })}`;
  return request(newUrl, {
    method: 'GET',
  });
}

export function post(url: string, params: any = {}, form = false) {
  let body;
  if (form) {
    const formData = new FormData();
    Object.keys(params).forEach((key) => params[key] && formData.append(key, params[key]));
    body = formData;
  } else {
    body = params;
  }
  return request(url, {
    method: 'POST',
    body,
  });
}

export function put(url: string, params: any = {}) {
  return request(url, {
    method: 'PUT',
    body: params,
  });
}

export function del(url: string, params: any = {}) {
  const newUrl = `${url}?${stringify(params, { arrayFormat: 'comma' })}`;

  return request(newUrl, {
    method: 'DELETE',
  });
}
