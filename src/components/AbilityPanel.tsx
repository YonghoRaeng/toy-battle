import type { GameState } from '../game/types';

type Props = {
  game: GameState;
  onSelectTarget: (id: string) => void;
  onSkip: () => void;
};

export function AbilityPanel({ game, onSelectTarget, onSkip }: Props) {
  const { pendingAbility, terrain, players, currentTurn } = game;
  if (!pendingAbility) return null;

  const { abilityKey, targets } = pendingAbility;

  // For extra-place: show rack troops to select
  if (abilityKey === 'extra-place') {
    const rack = players[currentTurn].rack;
    return (
      <div className="bg-purple-950 border-2 border-purple-500 rounded-xl p-4 mt-2">
        <h3 className="text-purple-300 font-bold mb-2 text-sm">🧟 캡틴 능력: 추가 병정 배치</h3>
        <p className="text-gray-300 text-xs mb-3">받침대에서 배치할 병정을 선택하세요 (그 후 거점 클릭)</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {rack.map(troop => (
            <button
              key={troop.id}
              onClick={() => onSelectTarget(troop.id)}
              className="bg-purple-800 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs flex flex-col items-center"
            >
              <span className="text-xl">{troop.emoji}</span>
              <span>{troop.name}</span>
              <span className="text-purple-300">{troop.isJoker ? '조커' : `힘${troop.power}`}</span>
            </button>
          ))}
          {rack.length === 0 && <span className="text-gray-500 text-xs">배치할 병정이 없습니다</span>}
        </div>
        <button onClick={onSkip} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm">
          건너뛰기
        </button>
      </div>
    );
  }

  // For ranged-discard: highlight on board (handled via board click)
  if (abilityKey === 'ranged-discard') {
    const targetBases = terrain.bases.filter(b => targets.includes(b.id));
    return (
      <div className="bg-purple-950 border-2 border-purple-500 rounded-xl p-4 mt-2">
        <h3 className="text-purple-300 font-bold mb-2 text-sm">🤖 거인병 능력: 인접 병정 제거</h3>
        <p className="text-gray-300 text-xs mb-3">보드에서 보라색 거점을 클릭해 상대 병정을 버리세요</p>
        {targetBases.length === 0 && <p className="text-yellow-400 text-xs">대상이 없습니다</p>}
        <button onClick={onSkip} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm mt-2">
          건너뛰기
        </button>
      </div>
    );
  }

  // Special base effect with choices
  if (abilityKey === 'none') {
    const effectType = terrain.specialBaseEffect?.type;

    if (effectType === 'collect-from-terrain') {
      const targetBases = terrain.bases.filter(b => targets.includes(b.id));
      return (
        <div className="bg-yellow-950 border-2 border-yellow-500 rounded-xl p-4 mt-2">
          <h3 className="text-yellow-300 font-bold mb-2 text-sm">★ 특별 거점: 전장에서 병정 회수</h3>
          <p className="text-gray-300 text-xs mb-3">보드에서 보라��� 거점을 클릭해 내 병정을 받침대로 회수하세요</p>
          {targetBases.length === 0 && <p className="text-yellow-400 text-xs">회수 가능한 병정이 없습니다</p>}
          <button onClick={onSkip} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm mt-2">
            건너뛰기
          </button>
        </div>
      );
    }

    if (effectType === 'collect-from-discard') {
      const { discard } = game;
      const myDiscard = discard.filter(t => t.faction === currentTurn && targets.includes(t.id));
      return (
        <div className="bg-yellow-950 border-2 border-yellow-500 rounded-xl p-4 mt-2">
          <h3 className="text-yellow-300 font-bold mb-2 text-sm">★ 특별 거점: 버림 더미에서 회수</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {myDiscard.map(t => (
              <button
                key={t.id}
                onClick={() => onSelectTarget(t.id)}
                className="bg-yellow-800 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs flex flex-col items-center"
              >
                <span className="text-xl">{t.emoji}</span>
                <span>{t.name}</span>
              </button>
            ))}
            {myDiscard.length === 0 && <span className="text-gray-500 text-xs">버림 더미에 내 병정 없음</span>}
          </div>
          <button onClick={onSkip} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm">
            ���너뛰기
          </button>
        </div>
      );
    }
  }

  return null;
}
