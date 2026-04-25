import type { Terrain } from '../../game/types';

type Props = {
  terrain: Terrain;
  allNodes: Array<{ id: string; pos: { x: number; y: number } }>;
};

export function Paths({ terrain, allNodes }: Props) {
  const drawn = new Set<string>();
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number; key: string }> = [];

  const addEdge = (aId: string, bId: string) => {
    const key = [aId, bId].sort().join('-');
    if (drawn.has(key)) return;
    drawn.add(key);
    const a = allNodes.find(n => n.id === aId);
    const b = allNodes.find(n => n.id === bId);
    if (a && b) lines.push({ x1: a.pos.x, y1: a.pos.y, x2: b.pos.x, y2: b.pos.y, key });
  };

  for (const base of terrain.bases) {
    for (const connId of base.connectedTo) addEdge(base.id, connId);
  }
  for (const hq of terrain.headquarters) {
    for (const connId of hq.connectedTo) addEdge(hq.id, connId);
  }

  return (
    <g>
      {lines.map(l => (
        <line
          key={l.key}
          x1={l.x1} y1={l.y1}
          x2={l.x2} y2={l.y2}
          stroke="#6b7280"
          strokeWidth={3}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}
