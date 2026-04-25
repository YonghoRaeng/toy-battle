import { useState } from 'react';
import type { Faction } from '../game/types';

type Props = {
  onStart: (terrainId: string, firstPlayer: Faction) => void;
};

export function SetupScreen({ onStart }: Props) {
  const [firstPlayer, setFirstPlayer] = useState<Faction>('blue');

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl border border-gray-700">
        <h1 className="text-4xl font-bold text-white mb-2">🎮 Toy Battle</h1>
        <p className="text-gray-400 text-sm mb-6">토이 배틀 — 영역 장악 전략 게임</p>

        <div className="bg-gray-900 rounded-xl p-4 mb-6 text-left">
          <h2 className="text-yellow-400 font-bold mb-2 text-sm">🗺️ 전장: 성채 평원</h2>
          <ul className="text-gray-300 text-xs space-y-1">
            <li>• 목표 훈장: <span className="text-yellow-300 font-bold">7개</span></li>
            <li>• 거점 12개 + 특별 거점 2개</li>
            <li>• 영토 4개 (총 훈장 7개)</li>
            <li>• 특별 효과: 전장의 내 병정 1개를 받침대로 회수</li>
          </ul>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 text-sm mb-3">선공 플레이어</p>
          <div className="flex gap-3 justify-center">
            {(['blue', 'red'] as Faction[]).map(f => (
              <button
                key={f}
                onClick={() => setFirstPlayer(f)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  firstPlayer === f
                    ? (f === 'blue' ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-red-600 text-white ring-2 ring-red-400')
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {f === 'blue' ? '🔵 파랑 (3장)' : '🔴 빨강 (3장)'}
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-2">선공 3장, 후공 4장으로 시작</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 mb-6 text-left">
          <h2 className="text-gray-300 font-bold mb-2 text-xs">📖 간단 규칙</h2>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• 매 턴: <b className="text-white">뽑기(2개)</b> 또는 <b className="text-white">병정 1개 배치</b></li>
            <li>• 배치는 <b className="text-white">본부와 연결된 경로</b>에만 가능</li>
            <li>• 강한 병정으로 약한 병정 위에 쌓기 가능</li>
            <li>• 영토 4면을 내 병정으로 둘러싸면 훈장 획득</li>
            <li>• 상대 본부 점령 또는 훈장 트랙 중앙 도달 시 승리</li>
          </ul>
        </div>

        <button
          onClick={() => onStart('castle-plain', firstPlayer)}
          className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl transition-all"
        >
          🚀 게임 시작
        </button>
      </div>
    </div>
  );
}
