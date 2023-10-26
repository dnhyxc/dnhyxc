import { nextTick, DirectiveBinding, computed } from 'vue';
import { debounce } from '@/utils';

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
    mounted(dragBox: HTMLElement) {
      nextTick(() => {
        // 拖动元素的父元素
        const pNode = dragBox.parentNode as HTMLElement;
        // 拖动元素的父元素的上一个兄弟元素
        const pSiblingNode = pNode.previousSibling as HTMLElement;
        // 外层父元素
        const pSiblingNodeParent = pSiblingNode.parentNode as HTMLElement;
        // html运行结果的iframe元素
        let iframe: HTMLIFrameElement | null = null;
        // 获取html运行结果的iframe元素
        dragBox.addEventListener('mousedown', (e) => {
          e.preventDefault();
          // 当前位置
          const disX = e.x - pNode.offsetLeft;
          const pNodeWidth = pNode.offsetWidth;
          const pSiblingNodeWidth = pSiblingNode.offsetWidth;
          const pNodeLeft = pNode.offsetLeft;
          iframe = pNode.querySelector('#__HTML_RESULT__');
          if (iframe) {
            iframe.style.display = 'none';
          }
          const ondocumentMove = (e: MouseEvent) => {
            // 拖动轴左侧偏移量
            const offsetL = e.clientX - disX;
            // 偏移位置
            const left = pNodeLeft - offsetL;
            // 控制拖动边界
            if (offsetL <= 10 || pSiblingNodeParent.offsetWidth - 10 <= offsetL) return;
            // 根据offsetL判断移动
            if (left < 0) {
              pSiblingNode.style.width = `${pSiblingNodeWidth + Math.abs(left)}px`;
              pNode.style.width = `${pNodeWidth - Math.abs(left)}px`;
            } else {
              pSiblingNode.style.width = `${pSiblingNodeWidth - Math.abs(left)}px`;
              pNode.style.width = `${pNodeWidth + Math.abs(left)}px`;
            }
          };
          const onDocumentUp = () => {
            document.removeEventListener('mousemove', ondocumentMove);
            document.removeEventListener('mouseup', onDocumentUp);
          };
          document.addEventListener('mousemove', ondocumentMove);
          document.addEventListener('mouseup', onDocumentUp);
          const onResize = () => {
            pSiblingNode.style.width = '65%';
            pNode.style.width = '35%';
          };
          window.addEventListener('resize', debounce(onResize, 100));
        });
        dragBox.addEventListener('mouseup', (e) => {
          if (iframe) {
            iframe.style.display = 'block';
          }
        });
      });
    },
  });

  // observe 监听元素，加载数据
  app.directive('load', {
    // 绑定元素的父组件挂载时调用
    mounted(observeNode: HTMLElement, binding: DirectiveBinding) {
      nextTick(() => {
        const parentNode = observeNode.parentNode as HTMLElement;
        (observeNode as any).ob = new IntersectionObserver(async (entries) => {
          const noMore = computed(() => {
            const { chatList, total } = binding.value.chatStore;
            return chatList.length >= total && chatList.length;
          });
          const disabled = computed(() => binding.value.chatStore.loading || noMore.value);

          const wrapRef = parentNode.parentNode!.parentNode;

          const scrollHeight = wrapRef.scrollHeight;
          const clientHeight = wrapRef.clientHeight;
          const hasScroll = scrollHeight > clientHeight;
          console.log(hasScroll, 'hasScroll');

          console.log(binding.value.chatStore.hasScroll, 'binding.value.chatStore.hasScroll');

          if (entries[0].isIntersecting && !disabled.value && hasScroll) {
            const beforeHeight = parentNode.scrollHeight;
            console.log(beforeHeight, 'beforeHeight');

            await binding.value.loadChatList();
            const afterHeight = parentNode.scrollHeight;
            console.log(afterHeight, 'afterHeight');

            const height = afterHeight - beforeHeight;

            (parentNode.parentNode!.parentNode! as HTMLElement).scrollTop = height < 100 ? height + 200 : height;
          }
        });
        (observeNode as any).ob.observe(observeNode);
      });
    },
    beforeUnmount(observeNode: HTMLElement) {
      (observeNode as any).ob.unobserve(observeNode);
    },
  });
};
