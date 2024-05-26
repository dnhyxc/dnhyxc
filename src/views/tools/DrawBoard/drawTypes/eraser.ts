import { DrawLine } from './line'

interface Params {
  ctx: any;
  color: string;
  startX: number;
  startY: number;
  radius: number;
}


export class DrawEraser extends DrawLine {
  public color: string;
  public radius?: number;

  constructor({ ctx, color, startX, startY, radius }: Params) {
    super({ ctx, color, startX, startY, lineSize: radius });
    this.color = color || '#fff';
    this.radius = radius;
  }
}