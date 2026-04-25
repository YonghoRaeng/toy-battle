import type { GameState } from '../../game/types';
import { BaseNode } from './BaseNode';
import { HQNode } from './HQNode';

type Props = {
  game: GameState;
  onClickTarget: (id: string) => void;
};

const W = 582;
const H = 613;

export function Board({ game, onClickTarget }: Props) {
  const { terrain, validTargets, currentTurn, phase } = game;

  // Region centers for medal overlay
  const allNodes = [
    ...terrain.bases.map(b => ({ id: b.id, pos: b.position })),
    ...terrain.headquarters.map(h => ({ id: h.id, pos: h.position })),
  ];

  return (
    <div className="relative rounded-xl overflow-hidden flex-shrink-0" style={{ width: W, height: H }}>
      <img
        src="/map-castle-plain.png"
        width={W}
        height={H}
        className="absolute inset-0 select-none"
        alt="game board"
        draggable={false}
        style={{ objectFit: 'fill' }}
      />

      <svg
        width={W}
        height={H}
        className="absolute inset-0"
        style={{ background: 'transparent' }}
      >
        {/* Region medal overlays */}
        {terrain.regions.map(region => {
          if (region.medals === 0) return null;
          const baseIds = region.surroundingBaseIds;
          const xs = baseIds.map(id => allNodes.find(n => n.id === id)?.pos.x ?? 0);
          const ys = baseIds.map(id => allNodes.find(n => n.id === id)?.pos.y ?? 0);
          const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
          const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
          return (
            <g key={region.id}>
              <circle cx={cx} cy={cy} r={18} fill="rgba(0,0,0,0.55)" stroke="#eab308" strokeWidth={1.5} />
              <text x={cx} y={cy + 5} textAnchor="middle" fontSize={13} fill="#fde047" fontWeight="bold">
                ★{region.medals}
              </text>
            </g>
          );
        })}

        {terrain.headquarters.map(hq => (
          <HQNode
            key={hq.id}
            hq={hq}
            isValidTarget={validTargets.includes(hq.id)}
            isAbilityTarget={phase === 'ability' && (game.pendingAbility?.targets ?? []).includes(hq.id)}
            onClick={() => onClickTarget(hq.id)}
          />
        ))}

        {terrain.bases.map(base => (
          <BaseNode
            key={base.id}
            base={base}
            isValidTarget={validTargets.includes(base.id)}
            isAbilityTarget={phase === 'ability' && (game.pendingAbility?.targets ?? []).includes(base.id)}
            isSelected={false}
            currentTurn={currentTurn}
            onClick={() => onClickTarget(base.id)}
          />
        ))}
      </svg>
    </div>
  );
}
