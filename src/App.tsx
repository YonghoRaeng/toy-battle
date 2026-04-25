import { useGameStore } from './store/gameStore';
import { SetupScreen } from './components/SetupScreen';
import { WinScreen } from './components/WinScreen';
import { Board } from './components/Board/Board';
import { Rack } from './components/Rack/Rack';
import { MedalTrack } from './components/MedalTrack';
import { ActionPanel } from './components/ActionPanel';
import { GameLog } from './components/GameLog';
import { AbilityPanel } from './components/AbilityPanel';
import { getValidTargets } from './game/placement';

export default function App() {
  const { game, startGame, onSelectTroop, onDraw, onPlaceTroop, onResolveAbility, onSkipAbility, resetGame } = useGameStore();

  if (!game) {
    return <SetupScreen onStart={(tid, fp) => startGame(tid, fp)} />;
  }

  if (game.phase === 'ended') {
    return <WinScreen game={game} onRestart={resetGame} />;
  }

  const { currentTurn, phase, pendingAbility } = game;

  const handleBoardClick = (targetId: string) => {
    if (phase === 'ability' && pendingAbility) {
      if (pendingAbility.abilityKey === 'extra-place' && game.selectedTroopId) {
        onResolveAbility(game.selectedTroopId + ':' + targetId);
        return;
      }
      if (pendingAbility.targets.includes(targetId)) {
        onResolveAbility(targetId);
      }
      return;
    }

    if (phase === 'playing' && game.validTargets.includes(targetId)) {
      onPlaceTroop(targetId);
    }
  };

  const handleAbilitySelect = (id: string) => {
    if (!pendingAbility) return;
    if (pendingAbility.abilityKey === 'extra-place') {
      const validNow = getValidTargets(game, id, currentTurn);
      useGameStore.setState(s => ({
        game: s.game ? { ...s.game, selectedTroopId: id, validTargets: validNow } : s.game,
      }));
    } else {
      onResolveAbility(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex flex-col xl:flex-row gap-0 h-screen overflow-hidden">

        {/* LEFT: Board + Game Log */}
        <div className="flex flex-col flex-shrink-0 overflow-auto">
          {/* Top bar over board */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700">
            <h1 className="text-lg font-bold text-yellow-400">🎮 Toy Battle</h1>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-400">{game.terrain.name}</span>
              <button onClick={resetGame} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
                🔄 메뉴
              </button>
            </div>
          </div>

          <Board game={game} onClickTarget={handleBoardClick} />

          {/* Game log below board */}
          <div className="bg-gray-900 border-t border-gray-700 px-3 py-2">
            <GameLog log={game.log} />
          </div>
        </div>

        {/* RIGHT: Control panel */}
        <div className="flex flex-col gap-2 flex-1 p-3 overflow-y-auto bg-gray-850 border-l border-gray-700 min-w-0" style={{ background: '#111827' }}>

          {/* Medal Track */}
          <MedalTrack game={game} />

          {/* Red Rack */}
          <Rack
            player={game.players.red}
            isCurrentTurn={currentTurn === 'red'}
            selectedTroopId={currentTurn === 'red' ? game.selectedTroopId : null}
            onSelectTroop={currentTurn === 'red' ? onSelectTroop : () => {}}
            hideCards={currentTurn === 'blue'}
          />

          {/* Blue Rack */}
          <Rack
            player={game.players.blue}
            isCurrentTurn={currentTurn === 'blue'}
            selectedTroopId={currentTurn === 'blue' ? game.selectedTroopId : null}
            onSelectTroop={currentTurn === 'blue' ? onSelectTroop : () => {}}
            hideCards={currentTurn === 'red'}
          />

          {/* Action / Ability Panel */}
          <ActionPanel game={game} onDraw={onDraw} onSkipAbility={onSkipAbility} />

          {phase === 'ability' && pendingAbility && (
            <AbilityPanel game={game} onSelectTarget={handleAbilitySelect} onSkip={onSkipAbility} />
          )}

          {/* Troop guide */}
          <div className="bg-gray-800 rounded-xl p-3 text-xs mt-auto">
            <h3 className="text-gray-400 font-bold mb-2">병정 가이드</h3>
            <div className="space-y-0.5 text-gray-400">
              <div>🦆 꽉스 — 조커 (항상 이기고 항상 짐)</div>
              <div>💀 해골이(1) — 2개 뽑기</div>
              <div>🧟 캡틴(2) — 추가 배치</div>
              <div>🤖 거인병(3) — 인접 제거</div>
              <div>🐒 코코(4) — 연결 무시</div>
              <div>🔮 XB-42(5) — 상대 랜덤 버리기</div>
              <div>🦄 레인보우(6) — 1개 뽑기</div>
              <div>🦖 렉시(7) — 능력 없음</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
