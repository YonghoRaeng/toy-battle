import type { GameState } from '../game/types';
import { canDraw, canPlaceAny } from '../game/placement';

type Props = {
  game: GameState;
  onDraw: () => void;
  onSkipAbility: () => void;
};

export function ActionPanel({ game, onDraw, onSkipAbility }: Props) {
  const { phase, currentTurn, selectedTroopId, pendingAbility, players } = game;

  const drawEnabled = phase === 'playing' && canDraw(game, currentTurn);
  const placeEnabled = phase === 'playing' && canPlaceAny(game, currentTurn);
  const factionLabel = currentTurn === 'blue' ? '🔵 파랑' : '🔴 빨강';

  if (phase === 'ended') return null;

  if (phase === 'ability' && pendingAbility) {
    const { abilityKey } = pendingAbility;
    let title = '';
    let hint = '';

    if (abilityKey === 'extra-place') {
      title = '캡틴 능력: 추가 병정 배치';
      hint = '받침대에서 병정을 선택 후 거점을 클릭하거나, 건너뛰기.';
    } else if (abilityKey === 'ranged-discard') {
      title = '거인병 능력: 인접 병정 제거';
      hint = '제거할 상대 병정의 거점을 클릭하거나, 건너뛰기.';
    } else if (abilityKey === 'none') {
      const effectType = game.terrain.specialBaseEffect?.type;
      if (effectType === 'collect-from-terrain') {
        title = '특별 거점: 전장에서 병정 회수';
        hint = '회수할 내 병정의 거점을 클릭하거나, 건너뛰기.';
      } else if (effectType === 'collect-from-discard') {
        title = '특별 거점: 버림 더미에서 회수';
        hint = '회수할 병정을 선택하거나, 건너뛰기.';
      }
    }

    return (
      <div className="bg-purple-950 border border-purple-500 rounded-xl p-3">
        <h3 className="text-purple-300 font-bold mb-1">{title}</h3>
        <p className="text-gray-300 text-xs mb-2">{hint}</p>
        <button
          onClick={onSkipAbility}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-1.5 rounded text-sm"
        >
          건너뛰기 (능력 포기)
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-3 space-y-2">
      <div className="text-center text-sm font-bold text-white">
        {factionLabel}의 차례 (턴 {game.turnCount})
      </div>

      {selectedTroopId ? (
        <div className="text-center text-xs text-green-400">
          ✅ 병정 선택됨 — 배치할 거점(녹색)을 클릭하세요
        </div>
      ) : (
        <div className="text-xs text-gray-400 text-center">
          받침대에서 병정을 선택하거나 뽑기를 하세요
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onDraw}
          disabled={!drawEnabled}
          className={`py-2 rounded text-sm font-bold transition-all ${
            drawEnabled
              ? 'bg-blue-700 hover:bg-blue-600 text-white cursor-pointer'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          📦 2개 뽑기<br />
          <span className="text-xs font-normal">(공급처 {players[currentTurn].supply.length}개)</span>
        </button>

        <div className={`py-2 rounded text-sm text-center ${placeEnabled ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-600'}`}>
          🗺️ 병정 놓기<br />
          <span className="text-xs">{placeEnabled ? '병정 선택 후 클릭' : '놓을 곳 없음'}</span>
        </div>
      </div>

      {!drawEnabled && !placeEnabled && (
        <div className="text-yellow-400 text-xs text-center bg-yellow-950 rounded p-2">
          ⚠️ 가능한 행동이 없습니다
        </div>
      )}
    </div>
  );
}
