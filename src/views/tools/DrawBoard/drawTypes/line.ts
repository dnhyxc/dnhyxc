interface Params {
  ctx: any;
  color: string;
  startX: number;
  startY: number;
  lineSize?: number;
}

export class DrawLine {
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
    this.ctx.beginPath();
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = this.color;
    // this.ctx.shadowColor = this.color;
    // this.ctx.shadowBlur = (this.lineSize! * 0.6) * devicePixelRatio;
    this.ctx.lineWidth = this.lineSize! * devicePixelRatio;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.moveTo(this.startX * devicePixelRatio, this.startY * devicePixelRatio);
    this.ctx.lineTo(this.endX * devicePixelRatio, this.endY * devicePixelRatio);
    this.ctx.stroke();
    this.ctx.closePath();
  }
}
