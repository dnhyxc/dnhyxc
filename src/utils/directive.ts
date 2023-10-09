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

  app.directive('draggable', {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      let offsetX = 0;
      let offsetY = 0;
      let dragging = false;

      const handleMouseDown = (e: MouseEvent) => {
        dragging = true;
        offsetX = e.clientX - el.offsetLeft;
        offsetY = e.clientY - el.offsetTop;
        document.addEventListener('mousemove', handleMouseMove);
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (dragging) {
          el.style.left = e.clientX - offsetX + 'px';
          el.style.top = e.clientY - offsetY + 'px';
          binding.value({
            top: e.clientY - offsetY,
            left: e.clientX - offsetX,
          });
        }
      };

      const handleMouseUp = () => {
        dragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
      };

      el.addEventListener('mousedown', handleMouseDown);
      el.addEventListener('mouseup', handleMouseUp);
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
            if (binding?.value?.scale === 1 && binding?.value?.rotate === 0) {
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

  app.directive('drag', {
    // 绑定元素的父组件挂载时调用
    mounted(dragBox: HTMLElement, binding: DirectiveBinding) {
      nextTick(() => {
        dragBox.style.position = 'absolute';
        const pNode = dragBox.parentNode as HTMLElement;

        dragBox.addEventListener('mousedown', (e) => {
          console.log(e, 'eeeee');
          // 阻止默认事件，避免元素选中
          e.preventDefault();
          const disX = e.x - pNode.offsetLeft;
          console.log(disX, 'disX');

          const ondocumentMove = (e: MouseEvent) => {
            console.log(e, 'eee');
            const left = e.clientX - disX;

            console.log(left, 'left');

            const pNodeLeft = pNode.offsetLeft;
            console.log(pNodeLeft, 'pNodeLeft');
          };

          const onDocumentUp = (e: MouseEvent) => {
            document.removeEventListener('mousemove', ondocumentMove);
            document.removeEventListener('mouseup', onDocumentUp);
          };

          // const disY = e.y - dragBox.offsetTop;
          // document.onmousemove = (e2) => {
          //   // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
          //   let left = e2.clientX - disX;
          //   let top = e2.clientY - disY;
          document.addEventListener('mousemove', ondocumentMove);
          document.addEventListener('mouseup', onDocumentUp);
        });

        // dragBox.onmousedown = (e) => {
        //   console.log(e, 'eeeee');

        //   // 阻止默认事件，避免元素选中
        //   e.preventDefault();
        //   document.onmousemove = (e2) => {
        //     console.log(e2, 'e2');
        //   };
        //   document.onmouseup = (updom) => {
        //     // 鼠标弹起来的时候不再移动
        //     document.onmousemove = null;
        //     document.onmouseup = null;
        //   };
        // };
      });
    },
  });
};
