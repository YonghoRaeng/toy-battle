import type { GameState } from '../game/types';

type Props = {
  game: GameState;
  onRestart: () => void;
};

const WIN_REASON_TEXT: Record<string, string> = {
  'hq-captured': '상대 본부 점령으로 승리!',
  'medal-track-center': '훈장 트랙 중앙 도달로 승리!',
  'no-moves': '행동 불가 — 훈장 비교 승리!',
};

export function WinScreen({ game, onRestart }: Props) {
  const { winner, winReason, players } = game;
  if (!winner) return null;

  const isBlue = winner === 'blue';
  const bgClass = isBlue ? 'from-blue-950 to-blue-900' : 'from-red-950 to-red-900';
  const textClass = isBlue ? 'text-blue-300' : 'text-red-300';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className={`bg-gradient-to-b ${bgClass} rounded-2xl p-8 w-full max-w-md text-center shadow-2xl border border-gray-700`}>
        <div className="text-6xl mb-4">🏆</div>
        <h1 className={`text-3xl font-bold mb-2 ${textClass}`}>
          {isBlue ? '🔵 파랑' : '🔴 빨강'} 승리!
        </h1>
        <p className="text-gray-300 mb-6">{winReason ? WIN_REASON_TEXT[winReason] : ''}</p>

        <div className="bg-gray-900 bg-opacity-50 rounded-xl p-4 mb-6">
          <h3 className="text-yellow-400 font-bold mb-3 text-sm">최종 점수</h3>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-2xl">🔵</div>
              <div className="text-xl font-bold text-blue-300">{players.blue.medalsOnTrack}</div>
              <div className="text-xs text-gray-400">훈장</div>
            </div>
            <div className="text-gray-500 text-2xl">vs</div>
            <div className="text-center">
              <div className="text-2xl">🔴</div>
              <div className="text-xl font-bold text-red-300">{players.red.medalsOnTrack}</div>
              <div className="text-xs text-gray-400">훈장</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 bg-opacity-50 rounded-xl p-3 mb-6 text-left">
          <h3 className="text-gray-400 text-xs font-bold mb-2">마지막 로그</h3>
          {game.log.slice(-5).map((entry, i) => (
            <div key={i} className="text-gray-300 text-xs">{entry}</div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl transition-all"
        >
          🔄 다시 플레이
        </button>
      </div>
    </div>
  );
}
