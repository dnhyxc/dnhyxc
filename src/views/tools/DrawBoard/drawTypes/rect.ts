interface Params {
  ctx: any;
  color: string;
  startX: number;
  startY: number;
  lineSize?: number;
  type?: string;
  isSelected?: boolean;
}

export class DrawRect {
  public color: string;
  public startX: number;
  public startY: number;
  public endX: number;
  public endY: number;
  public ctx: any;
  public lineSize?: number;
  public type?: string;
  public isSelected?: boolean;

  constructor({ ctx, color, startX, startY, lineSize, type = 'rect', isSelected = false }: Params) {
    this.ctx = ctx;
    this.color = color || '#000';
    this.startX = startX;
    this.startY = startY;
    this.endX = startX;
    this.endY = startY;
    this.lineSize = lineSize || 2;
    this.type = type;
    this.isSelected = isSelected;
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
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineSize! * devicePixelRatio;
    // 绘制虚线
    // this.ctx.setLineDash([5, 3]);
    this.ctx.beginPath();
    this.ctx.rect(
      this.minX * devicePixelRatio,
      this.minY * devicePixelRatio,
      (this.maxX - this.minX) * devicePixelRatio,
      (this.maxY - this.minY) * devicePixelRatio,
    );
    // this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
  }
}
