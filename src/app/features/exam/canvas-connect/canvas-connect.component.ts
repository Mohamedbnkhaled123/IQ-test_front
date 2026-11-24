import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  input,
  output,
  signal
} from '@angular/core';
import {
  ColorNode,
  ConnectionPath,
  Point,
  buildCanvasNodes,
  findHitNode,
  segmentHitsWrongNode,
  segmentIntersectsPaths
} from './canvas-geometry.util';

@Component({
  selector: 'app-canvas-connect',
  templateUrl: './canvas-connect.component.html',
  styleUrl: './canvas-connect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasConnectComponent implements AfterViewInit {
  @ViewChild('boardCanvas') private canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly colors = input<string[]>(['blue', 'yellow', 'red', 'green']);
  readonly requiredPairs = input<number>(4);
  readonly solved = output<boolean>();

  readonly warningMessage = signal<string>('');
  readonly connectedCount = signal<number>(0);
  readonly isComplete = signal<boolean>(false);

  private nodes: ColorNode[] = [];
  private completedPaths: ConnectionPath[] = [];
  private activePoints: Point[] = [];
  private startNode: ColorNode | null = null;
  private isDrawing = false;

  ngAfterViewInit(): void {
    this.initBoard();
  }

  resetBoard(): void {
    this.completedPaths = [];
    this.activePoints = [];
    this.startNode = null;
    this.isDrawing = false;
    this.connectedCount.set(0);
    this.isComplete.set(false);
    this.redraw();
  }

  onPointerDown(event: PointerEvent): void {
    if (this.isComplete()) {
      return;
    }
    const pt = this.getCanvasPoint(event);
    const hit = findHitNode(pt, this.nodes);
    if (!hit || this.isColorAlreadyConnected(hit.color)) {
      return;
    }
    this.warningMessage.set('');
    this.startNode = hit;
    this.isDrawing = true;
    this.activePoints = [{ x: hit.x, y: hit.y }];
    (event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);
    this.redraw();
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDrawing || !this.startNode) {
      return;
    }
    const pt = this.getCanvasPoint(event);
    const prev = this.activePoints[this.activePoints.length - 1];
    if (Math.hypot(pt.x - prev.x, pt.y - prev.y) < 5) {
      return;
    }
    if (
      segmentHitsWrongNode(prev, pt, this.nodes, this.startNode.color) ||
      segmentIntersectsPaths(prev, pt, this.completedPaths)
    ) {
      this.triggerCollisionReset();
      return;
    }
    this.activePoints.push(pt);
    this.redraw();
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isDrawing || !this.startNode) {
      return;
    }
    const pt = this.getCanvasPoint(event);
    const hit = findHitNode(pt, this.nodes);
    const isValidTarget =
      hit !== null && hit.color === this.startNode.color && hit.row !== this.startNode.row;

    if (isValidTarget && hit) {
      this.activePoints.push({ x: hit.x, y: hit.y });
      this.completedPaths.push({ color: this.startNode.color, points: [...this.activePoints] });
      this.connectedCount.set(this.completedPaths.length);
      if (this.completedPaths.length >= this.requiredPairs()) {
        this.isComplete.set(true);
        this.solved.emit(true);
      }
    }
    this.isDrawing = false;
    this.startNode = null;
    this.activePoints = [];
    this.redraw();
  }

  private initBoard(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    this.nodes = buildCanvasNodes(this.colors(), canvas.width, canvas.height);
    this.redraw();
  }

  private triggerCollisionReset(): void {
    this.warningMessage.set('حدث تقاطع أو لمس لدائرة مخالفة! تمت إعادة اللوحة.');
    this.resetBoard();
  }

  private isColorAlreadyConnected(color: string): boolean {
    return this.completedPaths.some((p) => p.color === color);
  }

  private getCanvasPoint(event: PointerEvent): Point {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height
    };
  }

  private redraw(): void {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const path of this.completedPaths) {
      this.drawStroke(ctx, path.points, this.resolveColor(path.color));
    }
    if (this.activePoints.length > 1 && this.startNode) {
      this.drawStroke(ctx, this.activePoints, this.resolveColor(this.startNode.color));
    }
    for (const node of this.nodes) {
      this.drawNode(ctx, node);
    }
  }

  private drawStroke(ctx: CanvasRenderingContext2D, points: Point[], strokeColor: string): void {
    if (points.length < 2) {
      return;
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  private drawNode(ctx: CanvasRenderingContext2D, node: ColorNode): void {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.resolveColor(node.color);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.getCssToken('--bg-surface', 'white');
    ctx.stroke();
  }

  private resolveColor(colorName: string): string {
    const tokenMap: Record<string, string> = {
      blue: '--canvas-blue',
      yellow: '--canvas-yellow',
      red: '--canvas-red',
      green: '--canvas-green'
    };
    const token = tokenMap[colorName] ?? '--color-primary';
    return this.getCssToken(token, colorName);
  }

  private getCssToken(token: string, fallback: string): string {
    const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    return value || fallback;
  }
}
