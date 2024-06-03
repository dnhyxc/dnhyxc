interface Params {
  ctx: any;
  color: string;
  startX: number;
  startY: number;
  fillStyle?: string;
  lineSize?: number;
  type?: string;
  isSelected?: boolean;
  width?: number;
  height?: number;
  fill?: boolean;
  dash?: boolean;
}

export class DrawRect {
  public color: string;
  public startX: number;
  public startY: number;
  public endX: number;
  public endY: number;
  public ctx: any;
  public fillStyle?: string;
  public lineSize?: number;
  public type?: string;
  public isSelected?: boolean;
  public width?: number;
  public height?: number;
  public fill?: boolean;
  public dash?: boolean;

  constructor({
    ctx,
    color, // 线条颜色
    fillStyle, // 填充颜色
    startX,
    startY,
    lineSize,
    type = 'rect',
    isSelected = false,
    width,
    height,
    fill,
    dash,
  }: Params) {
    this.ctx = ctx;
    this.color = color || '#000';
    this.startX = startX;
    this.startY = startY;
    this.endX = startX;
    this.endY = startY;
    this.lineSize = lineSize || 2;
    this.type = type;
    this.isSelected = isSelected;
    this.isSelected = isSelected;
    this.width = width;
    this.height = height;
    this.fill = fill;
    this.fillStyle = fillStyle;
    this.dash = dash;
  }

  get minX() {
    return Math.min(this.startX, this.endX);
  }

  get minY() {
    return Math.min(this.startY, this.endY);
  }

  get maxX() {
    return Math.max(this.startX, this.endX);
  }

  get maxY() {
    return Math.max(this.startY, this.endY);
  }

  draw() {
    this.ctx.fillStyle = this.fillStyle;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineSize! * devicePixelRatio;

    // 绘制虚线
    if (this.dash) {
      this.ctx.setLineDash([5, 3]);
    } else {
      this.ctx.setLineDash([]);
    }
    this.ctx.beginPath();
    this.ctx.rect(
      this.minX * devicePixelRatio,
      this.minY * devicePixelRatio,
      (this.width || this.maxX - this.minX) * devicePixelRatio,
      (this.height || this.maxY - this.minY) * devicePixelRatio,
    );
    if (this.fill) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
    this.ctx.closePath();
  }
}
