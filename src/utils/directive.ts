import { nextTick, DirectiveBinding } from 'vue';

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

  app.directive('move', {
    // 绑定元素的父组件挂载时调用
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      nextTick(() => {
        const dragBox = el; // 获取当前元素
        const boundary = binding.value?.boundary ?? false; // 是否控制边界
        const x = el.getAttribute('move-x') !== 'false';
        const y = el.getAttribute('move-y') !== 'false';

        dragBox.style.position = 'absolute';
        const pdom = dragBox.parentNode as HTMLElement;
        boundary && (pdom.style.position = 'relative');
        // 父元素宽高
        const pw = pdom.offsetWidth;
        const ph = pdom.offsetHeight;
        // 本身宽高
        const sw = dragBox.offsetWidth;
        const sh = dragBox.offsetHeight;

        // 计算得到最大移动距离
        let maxw = pw - 60;
        let maxh = ph - 60;
        let minw = -sw + 60;
        let minh = -sh + 60;

        dragBox.onmousedown = (e) => {
          // 阻止默认事件，避免元素选中
          e.preventDefault();
          // 算出鼠标当前相对元素的位置
          const disX = e.x - dragBox.offsetLeft;
          const disY = e.y - dragBox.offsetTop;
          document.onmousemove = (e2) => {
            // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
            let left = e2.clientX - disX;
            let top = e2.clientY - disY;
            const { imgWidth, imgHeight } = binding.value;
            const maxWidth = Math.abs(pw - imgWidth) / 2;
            const maxHeight = Math.abs(ph - imgHeight) / 2;
            maxw = maxWidth + pw - 60;
            maxh = maxHeight + ph - 60;
            minw = -(maxWidth + pw - 60);
            minh = -(maxHeight + ph - 60);
            // 图片大小小于1倍时，禁止拖动
            if (binding?.value?.scale === 1) {
              left = 0;
              top = 0;
              return;
            }
            // 当传入true代表控制边界
            if (boundary) {
              left = left > maxw ? maxw : left < minw ? minw : left;
              top = top > maxh ? maxh : top < minh ? minh : top;
            }
            // 移动当前元素
            x && (dragBox.style.left = left + 'px');
            y && (dragBox.style.top = top + 'px');
          };
          document.onmouseup = (updom) => {
            // 鼠标弹起来的时候不再移动
            document.onmousemove = null;
            document.onmouseup = null;
          };
        };
      });
    },
  });
};
