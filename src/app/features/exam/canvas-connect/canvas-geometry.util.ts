export interface Point {
  x: number;
  y: number;
}

export interface ColorNode {
  id: string;
  color: string;
  row: 'top' | 'bottom';
  x: number;
  y: number;
  radius: number;
}

export interface ConnectionPath {
  color: string;
  points: Point[];
}

export function ccw(a: Point, b: Point, c: Point): number {
  return (c.y - a.y) * (b.x - a.x) - (b.y - a.y) * (c.x - a.x);
}

export function onSegment(p: Point, q: Point, r: Point): boolean {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}

export function segmentsIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {
  const d1 = ccw(p1, q1, p2);
  const d2 = ccw(p1, q1, q2);
  const d3 = ccw(p2, q2, p1);
  const d4 = ccw(p2, q2, q1);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  if (d1 === 0 && onSegment(p1, p2, q1)) return true;
  if (d2 === 0 && onSegment(p1, q2, q1)) return true;
  if (d3 === 0 && onSegment(p2, p1, q2)) return true;
  if (d4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
}

export function distancePointToSegment(pt: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return Math.hypot(pt.x - a.x, pt.y - a.y);
  }
  const t = Math.max(0, Math.min(1, ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / lenSq));
  return Math.hypot(pt.x - (a.x + t * dx), pt.y - (a.y + t * dy));
}

export function segmentHitsWrongNode(
  a: Point,
  b: Point,
  nodes: ColorNode[],
  activeColor: string
): boolean {
  for (const node of nodes) {
    if (node.color === activeColor) {
      continue;
    }
    const dist = distancePointToSegment({ x: node.x, y: node.y }, a, b);
    if (dist <= node.radius + 4) {
      return true;
    }
  }
  return false;
}

export function segmentIntersectsPaths(
  a: Point,
  b: Point,
  paths: ConnectionPath[]
): boolean {
  for (const path of paths) {
    for (let i = 0; i < path.points.length - 1; i++) {
      if (segmentsIntersect(a, b, path.points[i], path.points[i + 1])) {
        return true;
      }
    }
  }
  return false;
}

export function buildCanvasNodes(
  colors: string[],
  width: number,
  height: number
): ColorNode[] {
  const topColors = colors.length > 0 ? colors : ['blue', 'yellow', 'red', 'green'];
  const bottomColors = [...topColors].reverse();
  const count = topColors.length;
  const stepX = width / (count + 1);
  const radius = Math.min(24, Math.max(16, stepX * 0.24));
  const topY = height * 0.18;
  const bottomY = height * 0.82;
  const nodes: ColorNode[] = [];

  for (let i = 0; i < count; i++) {
    const x = stepX * (i + 1);
    nodes.push({ id: `top-${topColors[i]}`, color: topColors[i], row: 'top', x, y: topY, radius });
    nodes.push({
      id: `bottom-${bottomColors[i]}`,
      color: bottomColors[i],
      row: 'bottom',
      x,
      y: bottomY,
      radius
    });
  }
  return nodes;
}

export function findHitNode(pt: Point, nodes: ColorNode[]): ColorNode | null {
  for (const node of nodes) {
    const dist = Math.hypot(pt.x - node.x, pt.y - node.y);
    if (dist <= node.radius + 8) {
      return node;
    }
  }
  return null;
}
