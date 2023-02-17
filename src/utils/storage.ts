class Storage {
  locSetItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  locGetItem(key: string) {
    return localStorage.getItem(key);
  }

  locRemoveItem(key: string) {
    localStorage.removeItem(key);
  }

  ssnSetItem(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }

  ssnGetItem(key: string) {
    return sessionStorage.getItem(key);
  }

  ssnRemoveItem(key: string) {
    sessionStorage.removeItem(key);
  }
}

const storage = new Storage();

export const locSetItem = storage.locSetItem;
export const locGetItem = storage.locGetItem;
export const locRemoveItem = storage.locRemoveItem;
export const ssnSetItem = storage.ssnSetItem;
export const ssnGetItem = storage.ssnGetItem;
export const ssnRemoveItem = storage.ssnRemoveItem;
