import type { Base, Faction } from '../../game/types';

type Props = {
  base: Base;
  isValidTarget: boolean;
  isAbilityTarget: boolean;
  isSelected: boolean;
  currentTurn: Faction;
  onClick: () => void;
};

const RADIUS = 26;

export function BaseNode({ base, isValidTarget, isAbilityTarget, onClick }: Props) {
  const { occupant, position: { x, y } } = base;

  const canClick = isValidTarget || isAbilityTarget;
  const hasOccupant = occupant !== null;
  const stackCount = base.stack.length;

  // Empty + no highlight: invisible, let image show through
  if (!hasOccupant && !isValidTarget && !isAbilityTarget) {
    return null;
  }

  const factionFill = hasOccupant
    ? (occupant!.faction === 'blue' ? 'rgba(29,78,216,0.88)' : 'rgba(185,28,28,0.88)')
    : 'transparent';

  const factionStroke = hasOccupant
    ? (occupant!.faction === 'blue' ? '#93c5fd' : '#fca5a5')
    : 'transparent';

  let strokeColor = factionStroke;
  let strokeWidth = hasOccupant ? 2 : 0;
  let fillColor = factionFill;

  if (isValidTarget) {
    strokeColor = '#22c55e';
    strokeWidth = 4;
    if (!hasOccupant) fillColor = 'rgba(20,83,45,0.65)';
  }
  if (isAbilityTarget) {
    strokeColor = '#a855f7';
    strokeWidth = 4;
  }

  return (
    <g
      onClick={canClick ? onClick : undefined}
      style={{ cursor: canClick ? 'pointer' : 'default' }}
    >
      {/* Glow ring for targets */}
      {(isValidTarget || isAbilityTarget) && (
        <circle
          cx={x} cy={y}
          r={RADIUS + 8}
          fill="transparent"
          stroke={isAbilityTarget ? '#a855f7' : '#22c55e'}
          strokeWidth={2}
          opacity={0.55}
        />
      )}

      {/* Stack depth — offset circles behind main */}
      {hasOccupant && stackCount > 2 && (
        <circle
          cx={x + 6} cy={y + 6}
          r={RADIUS}
          fill={factionFill}
          stroke={factionStroke}
          strokeWidth={1}
          opacity={0.35}
        />
      )}
      {hasOccupant && stackCount > 1 && (
        <circle
          cx={x + 3} cy={y + 3}
          r={RADIUS}
          fill={factionFill}
          stroke={factionStroke}
          strokeWidth={1.5}
          opacity={0.55}
        />
      )}

      {/* Main circle */}
      <circle
        cx={x} cy={y}
        r={RADIUS}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {hasOccupant && (
        <>
          <text x={x} y={y + 6} textAnchor="middle" fontSize={20} style={{ userSelect: 'none' }}>
            {occupant!.emoji}
          </text>
          <text x={x} y={y + 20} textAnchor="middle" fontSize={9} fill="white" fontWeight="bold" style={{ userSelect: 'none' }}>
            {occupant!.isJoker ? '조커' : occupant!.power}
          </text>
          {/* Stack count badge */}
          {stackCount > 1 && (
            <g>
              <circle cx={x + 20} cy={y - 20} r={9} fill="#f59e0b" stroke="#1f2937" strokeWidth={1.5} />
              <text x={x + 20} y={y - 16} textAnchor="middle" fontSize={9} fill="white" fontWeight="bold" style={{ userSelect: 'none' }}>
                ×{stackCount}
              </text>
            </g>
          )}
        </>
      )}
    </g>
  );
}
