interface Params {
  ctx: any;
  color: string;
  startX: number;
  startY: number;
  lineSize?: number;
  type?: string;
  isSelected?: boolean;
  fillStyle?: string;
  needsArrow?: boolean;
}

export class DrawLine {
  public color: string;
  public startX: number;
  public startY: number;
  public endX: number;
  public endY: number;
  public ctx: any;
  public lineSize?: number;
  public type?: string;
  public isSelected?: boolean;
  public fillStyle?: string;
  public needsArrow?: boolean;

  constructor({
    ctx,
    color,
    startX,
    startY,
    lineSize,
    type = 'line',
    isSelected = false,
    fillStyle,
    needsArrow = false,
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
    this.fillStyle = fillStyle;
    this.needsArrow = needsArrow;
  }

  draw() {
    this.ctx?.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = this.fillStyle || this.color;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineSize! * devicePixelRatio;
    // 用于设置线条的端点样式，有round、butt、square三种样式可供选择
    this.ctx.lineCap = 'round';
    // 用于设置两条线相交时，所创建的拐角类型，有round、bevel、miter三种样式可供选择
    this.ctx.lineJoin = 'round';
    this.ctx.moveTo(this.startX * devicePixelRatio, this.startY * devicePixelRatio);
    this.ctx.lineTo(this.endX * devicePixelRatio, this.endY * devicePixelRatio);
    // 判断是否需要绘制箭头
    if (this.needsArrow) {
      const headlen = 10; // 自定义箭头线的长度
      const theta = 25; // 自定义箭头线与直线的夹角，个人觉得45°刚刚好
      let arrowX, arrowY; // 箭头线终点坐标
      // 计算各角度和对应的箭头终点坐标
      const angle = (Math.atan2(this.startY - this.endY, this.startX - this.endX) * 180) / Math.PI;
      const angle1 = ((angle + theta) * Math.PI) / 180;
      const angle2 = ((angle - theta) * Math.PI) / 180;
      const topX = headlen * Math.cos(angle1);
      const topY = headlen * Math.sin(angle1);
      const botX = headlen * Math.cos(angle2);
      const botY = headlen * Math.sin(angle2);
      arrowX = this.endX + topX;
      arrowY = this.endY + topY;
      // 画上边箭头线
      this.ctx.moveTo(arrowX * devicePixelRatio, arrowY * devicePixelRatio);
      this.ctx.lineTo(this.endX * devicePixelRatio, this.endY * devicePixelRatio);
      arrowX = this.endX + botX;
      arrowY = this.endY + botY;
      // 画下边箭头线
      this.ctx.lineTo(arrowX * devicePixelRatio, arrowY * devicePixelRatio);
    }

    this.ctx.stroke();
    this.ctx.closePath();
  }
}
