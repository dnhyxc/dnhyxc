interface Params {
  ctx: any;
  color: string;
  startX: number;
  startY: number;
  radius?: number;
  lineSize?: number;
}

export class DrawCircle {
  public color: string;
  public radius?: number;
  public startX: number;
  public startY: number;
  public endX: number;
  public endY: number;
  public lineSize: number;
  public ctx: any;

  constructor({ ctx, color, startX, startY, radius, lineSize }: Params) {
    this.ctx = ctx;
    this.color = color || '#000';
    this.startX = startX;
    this.startY = startY;
    this.endX = startX;
    this.endY = startY;
    this.radius = radius || 1;
    this.lineSize = lineSize || 2;
  }

  get absRadius() {
    return Math.sqrt(Math.pow(this.endX - this.startX, 2) + Math.pow(this.endY - this.startY, 2));
  }


  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineSize * devicePixelRatio;
    this.ctx?.save();
    this.ctx?.beginPath();
    this.ctx?.arc(this.startX * devicePixelRatio, this.startY * devicePixelRatio, this.absRadius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx?.clip();
    this.ctx?.restore();

    // // rect
    // this.ctx.fillStyle = this.color;
    // this.ctx.strokeStyle = this.color;
    // this.ctx.lineWidth = this.lineSize;
    // this.ctx.beginPath();
    // this.ctx.rect(this.startX, this.startY, this.endX - this.startX, this.endY - this.startY);
    // // this.ctx.fill();
    // this.ctx.stroke();
    // this.ctx.closePath();
  }
}