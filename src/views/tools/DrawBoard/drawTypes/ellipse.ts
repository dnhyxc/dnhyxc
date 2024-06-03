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

export class DrawEllipse {
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

  constructor({ ctx, color, startX, startY, radius, lineSize, type = 'ellipse', isSelected = false }: Params) {
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

  get centerX() {
    return (this.startX + this.endX) / 2;
  }

  get centerY() {
    return (this.startY + this.endY) / 2;
  }

  get radiusX() {
    return Math.abs(this.endX - this.startX) / 2;
  }

  get radiusY() {
    return Math.abs(this.endY - this.startY) / 2;
  }

  /**
   * ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
   * x：椭圆圆心的 x 轴坐标。
   * y：椭圆圆心的 y 轴坐标。
   * radiusX：椭圆长轴的半径。
   * radiusY：椭圆短轴的半径。
   * rotation：椭圆的旋转角度，以弧度表示(非角度度数)。
   * startAngle：将要绘制的起始点角度，从 x 轴测量，以弧度表示(非角度度数)。
   * endAngle：椭圆将要绘制的结束点角度，以弧度表示(非角度度数)。
   */
  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineSize * devicePixelRatio;
    this.ctx.beginPath();
    this.ctx.ellipse(
      this.centerX * devicePixelRatio,
      this.centerY * devicePixelRatio,
      this.radiusX * devicePixelRatio,
      this.radiusY * devicePixelRatio,
      0,
      0,
      Math.PI * 2,
    );
    // 绘制当前路径的描边的方法。它会根据当前的绘图样式（如线条颜色、宽度等）来绘制路径的描边。
    this.ctx.stroke();
    this.ctx.closePath();
  }
}
