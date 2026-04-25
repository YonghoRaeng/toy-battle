import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { LobbyScreen } from './components/LobbyScreen';
import { WinScreen } from './components/WinScreen';
import { Board } from './components/Board/Board';
import { Rack } from './components/Rack/Rack';
import { MedalTrack } from './components/MedalTrack';
import { ActionPanel } from './components/ActionPanel';
import { GameLog } from './components/GameLog';
import { AbilityPanel } from './components/AbilityPanel';
import { getValidTargets } from './game/placement';
import { subscribeToGameState } from './lib/roomService';
import type { Faction } from './game/types';

export default function App() {
  const {
    game, roomCode, myFaction,
    setRoom, syncFromFirebase, startGame,
    onSelectTroop, onDraw, onPlaceTroop,
    onResolveAbility, onSkipAbility, resetGame,
  } = useGameStore();

  const [hasRoom, setHasRoom] = useState(false);

  // Subscribe to Firebase game state updates
  useEffect(() => {
    if (!roomCode) return;
    const unsub = subscribeToGameState(roomCode, (state) => {
      if (state) syncFromFirebase(state);
    });
    return unsub;
  }, [roomCode]);

  const handleHostStart = async (code: string, faction: Faction, firstPlayer: Faction) => {
    setRoom(code, faction);
    setHasRoom(true);
    await startGame('castle-plain', firstPlayer);
  };

  const handleGuestJoined = (code: string, faction: Faction) => {
    setRoom(code, faction);
    setHasRoom(true);
  };

  // --- Lobby ---
  if (!hasRoom) {
    return (
      <LobbyScreen
        onHostStart={handleHostStart}
        onGuestJoined={handleGuestJoined}
      />
    );
  }

  // --- Waiting for host to start (guest side) ---
  if (!game) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm text-center border border-gray-700">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-white text-lg font-bold mb-2">입장 완료!</p>
          <p className="text-gray-400 text-sm mb-3">방장이 게임을 시작하길 기다리는 중...</p>
          <p className="text-gray-500 text-xs">
            내 색깔:{' '}
            <span className={myFaction === 'blue' ? 'text-blue-400 font-bold' : 'text-red-400 font-bold'}>
              {myFaction === 'blue' ? '🔵 파랑' : '🔴 빨강'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // --- End screen ---
  if (game.phase === 'ended') {
    return <WinScreen game={game} onRestart={resetGame} />;
  }

  const { currentTurn, phase, pendingAbility } = game;
  const isMyTurn = currentTurn === myFaction;

  const handleBoardClick = (targetId: string) => {
    if (!isMyTurn) return;
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
    if (!pendingAbility || !isMyTurn) return;
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
          <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700">
            <h1 className="text-lg font-bold text-yellow-400">🎮 Toy Battle</h1>
            <div className="flex gap-2 items-center">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${isMyTurn ? 'bg-green-800 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                {isMyTurn ? '내 턴' : '상대 턴'}
              </span>
              <span className="text-xs text-gray-500">방 코드: {roomCode}</span>
              <button onClick={resetGame} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
                🔄 메뉴
              </button>
            </div>
          </div>

          <Board game={game} onClickTarget={handleBoardClick} />

          <div className="bg-gray-900 border-t border-gray-700 px-3 py-2">
            <GameLog log={game.log} />
          </div>
        </div>

        {/* RIGHT: Control panel */}
        <div className="flex flex-col gap-2 flex-1 p-3 overflow-y-auto border-l border-gray-700 min-w-0" style={{ background: '#111827' }}>

          <MedalTrack game={game} />

          {/* Red Rack */}
          <Rack
            player={game.players.red}
            isCurrentTurn={currentTurn === 'red'}
            selectedTroopId={currentTurn === 'red' ? game.selectedTroopId : null}
            onSelectTroop={myFaction === 'red' && currentTurn === 'red' ? onSelectTroop : () => {}}
            hideCards={myFaction !== 'red'}
          />

          {/* Blue Rack */}
          <Rack
            player={game.players.blue}
            isCurrentTurn={currentTurn === 'blue'}
            selectedTroopId={currentTurn === 'blue' ? game.selectedTroopId : null}
            onSelectTroop={myFaction === 'blue' && currentTurn === 'blue' ? onSelectTroop : () => {}}
            hideCards={myFaction !== 'blue'}
          />

          <ActionPanel
            game={game}
            onDraw={isMyTurn ? onDraw : () => {}}
            onSkipAbility={isMyTurn ? onSkipAbility : () => {}}
          />

          {phase === 'ability' && pendingAbility && isMyTurn && (
            <AbilityPanel game={game} onSelectTarget={handleAbilitySelect} onSkip={onSkipAbility} />
          )}

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
