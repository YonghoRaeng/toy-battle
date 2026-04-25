import type { Headquarters } from '../../game/types';

type Props = {
  hq: Headquarters;
  isValidTarget: boolean;
  isAbilityTarget: boolean;
  onClick: () => void;
};

const SIZE = 30;

export function HQNode({ hq, isValidTarget, isAbilityTarget, onClick }: Props) {
  const { faction, position: { x, y }, captured, occupant } = hq;

  const canClick = isValidTarget || isAbilityTarget;

  // HQ not targeted and not captured: invisible (image shows HQ)
  if (!isValidTarget && !isAbilityTarget && !captured && !occupant) {
    return null;
  }

  const borderColor = faction === 'blue' ? '#60a5fa' : '#f87171';
  const strokeColor = isValidTarget ? '#22c55e' : isAbilityTarget ? '#a855f7' : borderColor;
  const strokeWidth = isValidTarget || isAbilityTarget ? 4 : 3;

  return (
    <g onClick={canClick ? onClick : undefined} style={{ cursor: canClick ? 'pointer' : 'default' }}>
      {(isValidTarget || isAbilityTarget) && (
        <rect
          x={x - SIZE - 8} y={y - SIZE - 8}
          width={(SIZE + 8) * 2} height={(SIZE + 8) * 2}
          rx={8}
          fill="transparent"
          stroke={isAbilityTarget ? '#a855f7' : '#22c55e'}
          strokeWidth={2}
          opacity={0.6}
        />
      )}

      <rect
        x={x - SIZE} y={y - SIZE}
        width={SIZE * 2} height={SIZE * 2}
        rx={6}
        fill={
          captured && occupant?.faction !== faction
            ? 'rgba(124,58,237,0.8)'
            : isValidTarget
            ? 'rgba(20,83,45,0.6)'
            : 'rgba(0,0,0,0.4)'
        }
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {occupant && (
        <text x={x} y={y + 6} textAnchor="middle" fontSize={18} style={{ userSelect: 'none' }}>
          {occupant.emoji}
        </text>
      )}
    </g>
  );
}
