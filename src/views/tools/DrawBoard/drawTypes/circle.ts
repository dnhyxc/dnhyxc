interface Params {
  ctx: any;
  color: string;
  startX: number;
  startY: number;
  radius?: number;
  lineSize?: number;
  type?: string;
  isSelected?: boolean;
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
  public type?: string;
  public isSelected?: boolean;

  constructor({ ctx, color, startX, startY, radius, lineSize, type = 'circle', isSelected = false }: Params) {
    this.ctx = ctx;
    this.color = color || '#000';
    this.startX = startX;
    this.startY = startY;
    this.endX = startX;
    this.endY = startY;
    this.radius = radius || 1;
    this.lineSize = lineSize || 2;
    this.type = type;
    this.isSelected = isSelected;
  }

  get _radius() {
    return Math.sqrt(Math.pow(this.endX - this.startX, 2) + Math.pow(this.endY - this.startY, 2));
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
    this.ctx.lineWidth = this.lineSize * devicePixelRatio;
    this.ctx?.save();
    this.ctx?.beginPath();
    this.ctx?.arc(
      this.minX * devicePixelRatio,
      this.minY * devicePixelRatio,
      this._radius * devicePixelRatio,
      0,
      Math.PI * 2,
    );
    this.ctx.stroke();
    this.ctx?.clip();
    this.ctx?.restore();
  }
}
