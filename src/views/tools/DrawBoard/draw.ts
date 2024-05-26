export class Rectangle {
  public color: string;
  public startX: number;
  public startY: number;
  public endX: number;
  public endY: number;
  ctx: any;

  constructor(ctx: any, color: string, startX: number, startY: number) {
    this.ctx = ctx;
    this.color = color;
    this.startX = startX;
    this.startY = startY;
    this.endX = startX;
    this.endY = startY;
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
    this.ctx.beginPath();
    this.ctx.moveTo(this.minX, this.minY);
    this.ctx.lineTo(this.maxX, this.minY);
    this.ctx.lineTo(this.maxX, this.maxY);
    this.ctx.lineTo(this.minX, this.maxY);
    this.ctx.lineTo(this.minX, this.minY);

    this.ctx.fillStyle = 'transparent';
    this.ctx.fill();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
}

export const onDrawRect = (ctx: any, startX: number, startY: number) => {
  const endX = startX;
  const endY = startY;
  const minX = () => Math.min(startX, endX);
  const minY = () => Math.min(startY, endY);
  const maxX = () => Math.min(startX, endX);
  const maxY = () => Math.min(startY, endY);

  ctx.beginPath();
  ctx.moveTo(minX, minY);
  ctx.lineTo(maxX, minY);
  ctx.lineTo(maxX, maxY);
  ctx.lineTo(minX, maxY);
  ctx.lineTo(minX, minY);

  ctx.fillStyle = 'transparent';
  ctx.fill();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();
}