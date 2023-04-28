interface At extends Object {
  type: 'at';
  name: string;
}

interface Text extends Object {
  type: 'text';
  text: string;
}

interface Emoji extends Object {
  type: 'emoji';
}

interface FileData extends Object {
  type: 'file';
  isImage: boolean;
  file: File;
}

interface Reply extends Object {
  type: 'reply';
}

type Item = At | Text | FileData | Emoji | Reply;

export interface Config {
  submit?: {
    will(e: KeyboardEvent): boolean;
    done(values: Array<object>): void;
  };
  at: {
    find(keyword: string): Promise<object[]>;
    show(data: { users: object[]; left: number; bottom: number }): void;
    hide(): void;
  };
  emoji: {
    render(emoji: object): HTMLElement;
  };
  file: {
    format(data: FileData): Promise<FileData>;
    render(data: FileData): HTMLElement;
  };
  reply: {
    render(reply: object): HTMLElement;
  };
  onValidChange(isValid: boolean): void;
  onPaste(e: ClipboardEvent): void;
}

export default class PureEditor {
  config: Config;
  target: HTMLElement;
  range: Range;
  files: { [key: string]: FileData } = {};
  ating: boolean = false;

  constructor(target: HTMLElement, config: Config) {
    target.contentEditable = 'true';
    target.focus();

    target.oninput = this.handleInput.bind(this);
    target.onkeydown = this.handleKeyDown.bind(this);
    target.onpaste = this.handlePaste.bind(this);

    target.onblur = () => {
      this.range = getRange();
    };
    this.target = target;
    this.config = config;
    this.range = getRange();
  }

  // get set
  get valid() {
    const { innerText, innerHTML } = this.target;
    return /\S/.test(innerText) || innerHTML.includes('img');
  }

  submit() {
    const values = this.getValues();
    this.target.innerHTML = '';
    this.files = {};
    return values;
  }

  getValues() {
    return Array.from(this.target.childNodes)
      .filter((node) => node.nodeName !== 'BR')
      .filter((node) => !(node.nodeName === '#text' && ['', ' '].includes(node.textContent as string)))
      .map((node) => {
        const { nodeName, dataset, textContent } = node as HTMLElement;
        return nodeName === '#text'
          ? { type: 'text', text: textContent }
          : dataset.id
            ? this.files[dataset.id]
            : JSON.parse(dataset.data as string);
      });
  }

  // 事件处理
  // 当@后14字符以内，视为用户在@某人。@后的字符要作为搜索的关键词
  async handleInput() {
    const { at, onValidChange } = this.config;
    const { show, find, hide } = at;

    this.range = getRange();
    const lastText = this.range.endContainer.textContent as string;
    const atingSomeone = /@.{0,14}$/.test(lastText);

    if (atingSomeone) {
      this.ating = true;
      const keyword = (/@([^@]{0,14})$/.exec(lastText) || '')[1];
      const { x, y } = this.range.getBoundingClientRect();
      const users = await find(keyword).catch(() => {
        this.ating = false;
      });
      if (users && users.length) {
        show({ users, left: x, bottom: y });
      } else {
        this.ating = false;
        hide();
      }
    } else {
      this.ating = false;
      hide();
    }

    onValidChange(this.valid);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') e.preventDefault();
    // 用户在操作用户列表
    if (this.ating && ['Enter', 'ArrowUp', 'ArrowDown'].includes(e.key)) return e.preventDefault();

    const { submit } = this.config;

    const submiting = submit?.will(e);

    if (submiting === false) return;

    if (submiting && this.valid) return submit?.done(this.submit());

    if (e.key === 'Enter') {
      this.range = getRange();
      this.insertNode(document.createTextNode('\n'));
      this.insertNode(document.createElement('br'));
      const brs = Array.from(this.target.getElementsByTagName('br'));

      brs.forEach((br, index) => {
        br.previousSibling?.textContent === '' && index < brs.length - 1 && this.target.removeChild(br);
      });

      this.target.scrollTop = this.target.scrollHeight;
    }
  }

  private handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const { onPaste } = this.config;
    this.range = getRange();

    if (onPaste) {
      return onPaste(e);
    }

    // 只粘贴文本
    // @ts-ignore
    const items = [...(e.clipboardData?.items || [])].filter((x) => x.type === 'text/plain');
    // // 过滤html类型
    // const items = [...(e.clipboardData?.items || [])].filter(
    //   (x) => x.type !== "text/html"
    // );

    if (items?.length) {
      items[0].getAsString((text: any) => this.insert([{ type: 'text', text }]));
    }
    const files = e.clipboardData?.files;

    if (files?.length) {
      const data = Array.from(files).map((file) => ({ type: 'file', file }));
      this.insert(data as FileData[]);
    }
  }

  insertText(text: string) {
    this.insertNode(document.createTextNode(text));
  }

  insertAt(data: At) {
    const span = document.createElement('span');
    span.contentEditable = 'false';
    span.innerText = `@${data.name}`;
    span.dataset.data = JSON.stringify(data);

    const { endContainer } = this.range;
    if (endContainer.nodeName === '#text') {
      const lastText = endContainer.textContent as string;
      const offset = (/^.*@/.exec(lastText) || [''])[0].length;
      if (offset > 0) {
        this.range.setStart(endContainer, offset - 1);
        this.range.deleteContents();
      }
    }

    this.insertNode(span);
    this.insertNode(document.createTextNode(' '));
  }

  insert(data: Item[], replace = false) {
    if (replace) this.target.innerHTML = '';
    if (!this.range.collapsed) this.range.deleteContents();

    data.forEach((it) => {
      switch (it.type) {
        case 'at':
          this.insertAt(it);
          break;
        case 'emoji':
          this.insertEmoji(it);
          break;
        case 'file':
          this.insertFile(it);
          break;
        case 'reply':
          this.insertReply(it);
          break;
        default:
          this.insertText((it as Text).text || '');
      }
    });

    this.config.onValidChange(this.valid);
  }

  insertEmoji(data: Emoji) {
    const { render } = this.config.emoji;
    const node = render(data);
    node.dataset.data = JSON.stringify(data);

    this.insertNode(node);
  }

  async insertFile(fileData: FileData) {
    const { isImage = false } = fileData;
    const { render, format } = this.config.file;

    const data = await format(fileData);
    const id = Math.random().toString(36).slice(2);
    const node = render(data);

    node.style.display = 'inline-block';
    node.contentEditable = isImage ? 'true' : 'false';
    node.dataset.id = id;

    this.files[id] = data;

    this.insertNode(node);
    !isImage && this.insertNode(document.createTextNode(' '));
    this.config.onValidChange(true);
  }

  insertReply(data: Reply) {
    const { render } = this.config.reply;
    const node = render(data);
    const empty = this.target.childNodes.length === 0;

    const firstChild = this.target.firstChild as HTMLElement;
    const allreadyHasReplay = firstChild?.tagName === 'SECTION';

    if (allreadyHasReplay) {
      firstChild.dataset.data = JSON.stringify(data);
      firstChild.innerHTML = node.innerHTML;
      this.target.focus();
    } else {
      node.contentEditable = 'false';
      node.style.display = 'inline-block';
      node.style.verticalAlign = 'bottom';
      node.dataset.data = JSON.stringify(data);

      const childNodes = this.target.childNodes;
      if (childNodes.length) this.range.setEndBefore(childNodes[0]);

      this.insertNode(node);

      if (empty) {
        this.insertNode(document.createElement('br'));
        this.insertNode(document.createElement('br'));
      } else this.range.setStartAfter(this.target.lastChild as Node);
    }
  }

  // 插入
  insertNode(node: Node) {
    this.range.insertNode(node);
    this.range.setStartAfter(node);
    useRange(this.range);
    this.target.focus();
  }

  // 删除
  deleteReply() {
    const [reply, second] = Array.from(this.target.childNodes);
    this.target.removeChild(reply);
    second.nodeName === 'BR' && this.target.removeChild(second);
    this.range = getRange();
    this.target.focus();
    this.config.onValidChange(this.valid);
  }
}

function getRange(): Range {
  return getSelection()?.getRangeAt(0) as Range;
}

function useRange(range: Range) {
  const selection = getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
