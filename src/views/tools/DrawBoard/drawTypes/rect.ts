interface Params {
  ctx: any;
  color: string;
  startX: number;
  startY: number;
  lineSize?: number;
}

export class DrawRect {
  public color: string;
  public startX: number;
  public startY: number;
  public endX: number;
  public endY: number;
  public ctx: any;
  public lineSize?: number;


  constructor({ ctx, color, startX, startY, lineSize }: Params) {
    this.ctx = ctx;
    this.color = color || '#000';
    this.startX = startX;
    this.startY = startY;
    this.endX = startX;
    this.endY = startY;
    this.lineSize = lineSize || 2;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineSize! * devicePixelRatio;
    // 绘制虚线
    // this.ctx.setLineDash([5, 3]);
    this.ctx.beginPath();
    this.ctx.rect(this.startX * devicePixelRatio, this.startY * devicePixelRatio, (this.endX - this.startX) * devicePixelRatio, (this.endY - this.startY) * devicePixelRatio);
    // this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
  }
}