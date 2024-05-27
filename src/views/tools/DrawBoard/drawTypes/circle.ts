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
  public startX: number;
  public startY: number;
  public endX: number;
  public endY: number;
  public lineSize: number;
  public ctx: any;
  public radius?: number;
  public type: string = 'circle';

  constructor({ ctx, color, startX, startY, radius, lineSize }: Params) {
    this.ctx = ctx;
    this.color = color || '#000';
    this.startX = startX;
    this.startY = startY;
    this.endX = startX;
    this.endY = startY;
    this.radius = radius || 1;
    this.lineSize = lineSize || 2;
    this.type = 'circle';
  }

  get _radius() {
    return Math.sqrt(Math.pow(this.endX - this.startX, 2) + Math.pow(this.endY - this.startY, 2));
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineSize * devicePixelRatio;
    this.ctx?.save();
    this.ctx?.beginPath();
    this.ctx?.arc(
      this.startX * devicePixelRatio,
      this.startY * devicePixelRatio,
      this._radius * devicePixelRatio,
      0,
      Math.PI * 2,
    );
    this.ctx.stroke();
    this.ctx?.clip();
    this.ctx?.restore();
  }
}
