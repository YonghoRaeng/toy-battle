import type { PlayerState } from '../../game/types';
import { ABILITY_DESCRIPTIONS } from '../../data/troops';

type Props = {
  player: PlayerState;
  isCurrentTurn: boolean;
  selectedTroopId: string | null;
  onSelectTroop: (id: string) => void;
  hideCards: boolean;
};

export function Rack({ player, isCurrentTurn, selectedTroopId, onSelectTroop, hideCards }: Props) {
  const { faction, rack, supply, medalsOnTrack } = player;
  const isBlue = faction === 'blue';
  const label = isBlue ? '🔵 파랑' : '🔴 빨강';
  const borderClass = isCurrentTurn
    ? (isBlue ? 'border-blue-400 ring-2 ring-blue-400' : 'border-red-400 ring-2 ring-red-400')
    : 'border-gray-600';

  return (
    <div className={`rounded-xl border-2 p-3 ${borderClass} ${isBlue ? 'bg-blue-950' : 'bg-red-950'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-white">
          {label} {isCurrentTurn && '← 현재 차례'}
        </span>
        <div className="flex gap-3 text-xs text-gray-300">
          <span>📦 공급처: {supply.length}</span>
          <span>⭐ 훈장: {medalsOnTrack}</span>
        </div>
      </div>

      {hideCards ? (
        <div className="flex gap-1 flex-wrap">
          {rack.map((_, i) => (
            <div key={i} className="w-10 h-14 rounded bg-gray-700 border border-gray-500 flex items-center justify-center text-gray-400 text-xs">
              ?
            </div>
          ))}
          {rack.length === 0 && <span className="text-gray-500 text-xs">병정 없음</span>}
        </div>
      ) : (
        <div className="flex gap-1 flex-wrap">
          {rack.map(troop => {
            const isSelected = selectedTroopId === troop.id;
            const bgColor = isSelected
              ? (isBlue ? 'bg-blue-500' : 'bg-red-500')
              : (isBlue ? 'bg-blue-800 hover:bg-blue-700' : 'bg-red-800 hover:bg-red-700');
            const borderSel = isSelected ? 'border-yellow-400 border-2' : 'border border-gray-500';

            return (
              <button
                key={troop.id}
                onClick={() => onSelectTroop(troop.id)}
                className={`w-14 h-20 rounded ${bgColor} ${borderSel} flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer`}
                title={`${troop.name} — ${ABILITY_DESCRIPTIONS[troop.abilityKey]}`}
              >
                <span className="text-2xl">{troop.emoji}</span>
                <span className="text-white text-xs font-bold">
                  {troop.isJoker ? '조커' : troop.power}
                </span>
                <span className="text-gray-300 text-[9px] leading-tight text-center px-0.5">
                  {troop.name}
                </span>
              </button>
            );
          })}
          {rack.length === 0 && <span className="text-gray-500 text-xs">받침대 비어있음</span>}
        </div>
      )}
    </div>
  );
}
