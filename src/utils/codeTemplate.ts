export const JSONStringify = (option: string) => {
  return JSON.stringify(
    option,
    (key, val) => {
      // 处理函数丢失问题
      if (typeof val === 'function') {
        return `${val}`;
      }
      // 处理undefined丢失问题
      if (typeof val === 'undefined') {
        return 'undefined';
      }
      return val;
    },
    2,
  );
};

export const JSONParse = (objStr: string) => {
  return JSON.parse(objStr, (k, v) => {
    if (typeof v === 'string' && v.indexOf && v.indexOf('function') > -1) {
      // eslint-disable-next-line
      return eval(`(function(){return ${v}})()`);
    }
    return v;
  });
};

export const codeTemplate = (value: string) => {
  const code = value.replace('parent.document', 'window.disableParent');
  const template = `
    <body>
      <script>
        function rewriteConsole(type) {
          const origin = console[type];
          console[type] = (...args) => {
            window.parent.postMessage({ from: 'codeRunner', type, data: JSON.stringify(
              args,
              (key, val) => {
                // 处理函数丢失问题
                if (typeof val === 'function') {
                  return String(val);
                }
                // 处理undefined丢失问题
                if (typeof val === 'undefined') {
                  return 'undefined';
                }
                return val;
              },
              2,
            )}, '*');
            origin.apply(console, args);
          };
        }

        rewriteConsole('log');
        rewriteConsole('info');
        rewriteConsole('debug');
        rewriteConsole('warn');
        rewriteConsole('error');
        rewriteConsole('table');
        rewriteConsole('time');
        rewriteConsole('timeEnd');

        Object.defineProperty(window, 'disableParent', {
          get() {
            throw new Error('无法调用 window.parent 属性！');
          },
          set() {},
        });

        try {
          ${code}
        } catch(e) {
          console.error(e.name, e.message)
        }
      </script>
    </body>
  `;
  return template;
};

// 渲染html的模板
export const htmlTemplate = (code: string, { background }: { background: string }) => {
  return `
    <html>
      <head>
        <style>
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
            background-color: transparent;
          }
          ::-webkit-scrollbar-track {
            height: 6px;
          }
          ::-webkit-scrollbar-thumb {
            background-color: #c1c1c0;
          }
          body,html {
            padding: 0;
            margin: 0;
            background: ${background};
          }
        </style>
      </head>
      <body>${code}</body>
    </html>`;
};
