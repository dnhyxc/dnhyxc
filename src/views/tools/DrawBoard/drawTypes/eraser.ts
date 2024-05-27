import { DrawLine } from './line';

interface Params {
  ctx: any;
  color: string;
  startX: number;
  startY: number;
  lineSize: number;
}

export class DrawEraser extends DrawLine {
  public color: string;
  public radius?: number;

  constructor({ ctx, color, startX, startY, lineSize }: Params) {
    super({ ctx, color, startX, startY, lineSize });
    this.color = color || '#fff';
  }
}
