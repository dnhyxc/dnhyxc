import { nextTick } from 'vue';

export const mountDirectives = <T>(app: T | any) => {
  app.directive('focus', {
    mounted(el: HTMLElement) {
      nextTick(() => {
        if (el.tagName.toLocaleLowerCase() === 'input') {
          el.focus();
        } else if (el.getElementsByTagName('input')) {
          el.getElementsByTagName('input')[0]?.focus();
        } else if (el.getElementsByTagName('textarea')) {
          el.getElementsByTagName('textarea')[0]?.focus();
        }
      });
    },
  });
};
