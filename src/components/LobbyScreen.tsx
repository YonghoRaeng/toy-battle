import { useState, useEffect } from 'react';
import type { Faction } from '../game/types';
import {
  randomCode,
  createRoom,
  updateHostFaction,
  joinRoom,
  subscribeToGuestJoined,
} from '../lib/roomService';

type Mode = 'home' | 'creating' | 'joining';

type Props = {
  onHostStart: (roomCode: string, myFaction: Faction, firstPlayer: Faction) => void;
  onGuestJoined: (roomCode: string, myFaction: Faction) => void;
};

export function LobbyScreen({ onHostStart, onGuestJoined }: Props) {
  const [mode, setMode] = useState<Mode>('home');
  const [roomCode, setRoomCode] = useState('');
  const [hostFaction, setHostFaction] = useState<Faction>('blue');
  const [firstPlayer, setFirstPlayer] = useState<Faction>('blue');
  const [guestJoined, setGuestJoined] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    const code = randomCode();
    await createRoom(code, hostFaction);
    setRoomCode(code);
    setMode('creating');
    setCreating(false);
  };

  // Host: update Firebase when faction changes after room creation
  const handleFactionChange = async (f: Faction) => {
    setHostFaction(f);
    if (roomCode) await updateHostFaction(roomCode, f);
  };

  // Host: watch for guest joining
  useEffect(() => {
    if (mode !== 'creating' || !roomCode) return;
    const unsub = subscribeToGuestJoined(roomCode, setGuestJoined);
    return unsub;
  }, [mode, roomCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    const code = joinInput.trim().toUpperCase();
    if (code.length !== 6) return;
    setJoinLoading(true);
    setJoinError('');
    const faction = await joinRoom(code);
    if (!faction) {
      setJoinError('방을 찾을 수 없거나 이미 가득 찼어요.');
      setJoinLoading(false);
      return;
    }
    onGuestJoined(code, faction);
  };

  if (mode === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl border border-gray-700">
          <h1 className="text-4xl font-bold text-white mb-2">🎮 Toy Battle</h1>
          <p className="text-gray-400 text-sm mb-8">친구와 1:1 온라인 대전</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl transition-all disabled:opacity-50"
            >
              🏠 방 만들기
            </button>
            <button
              onClick={() => setMode('joining')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition-all"
            >
              🚪 방 입장하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'creating') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">🏠 방 만들기</h1>

          <div className="bg-gray-900 rounded-xl p-4 mb-5 text-center">
            <p className="text-gray-400 text-xs mb-2">이 코드를 친구에게 알려주세요</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-mono font-bold text-yellow-400 tracking-widest">{roomCode}</span>
              <button
                onClick={handleCopy}
                className="text-xs bg-gray-700 px-3 py-1.5 rounded text-gray-300 hover:bg-gray-600"
              >
                {copied ? '✅ 복사됨' : '복사'}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-300 text-sm mb-2">내 색깔</p>
            <div className="flex gap-2">
              {(['blue', 'red'] as Faction[]).map(f => (
                <button
                  key={f}
                  onClick={() => handleFactionChange(f)}
                  disabled={guestJoined}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${
                    hostFaction === f
                      ? f === 'blue'
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : 'bg-red-600 text-white ring-2 ring-red-400'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {f === 'blue' ? '🔵 파랑' : '🔴 빨강'}
                </button>
              ))}
            </div>
            {guestJoined && (
              <p className="text-gray-500 text-xs mt-1">상대방이 입장해서 색깔을 바꿀 수 없어요</p>
            )}
          </div>

          <div className="mb-6">
            <p className="text-gray-300 text-sm mb-2">선공 (누가 먼저 시작?)</p>
            <div className="flex gap-2">
              {(['blue', 'red'] as Faction[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFirstPlayer(f)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    firstPlayer === f
                      ? f === 'blue'
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : 'bg-red-600 text-white ring-2 ring-red-400'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {f === 'blue' ? '🔵 파랑' : '🔴 빨강'}
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-1">선공 3장, 후공 4장으로 시작</p>
          </div>

          <div className={`text-center mb-4 py-2 rounded-lg text-sm ${guestJoined ? 'bg-green-900 text-green-300' : 'bg-gray-900 text-gray-400'}`}>
            {guestJoined ? '✅ 상대방 입장! 게임을 시작하세요.' : '⏳ 상대방이 방 코드를 입력하길 기다리는 중...'}
          </div>

          <button
            disabled={!guestJoined}
            onClick={() => onHostStart(roomCode, hostFaction, firstPlayer)}
            className={`w-full py-4 text-white font-bold text-lg rounded-xl transition-all ${
              guestJoined
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            🚀 게임 시작
          </button>

          <button
            onClick={() => { setMode('home'); setRoomCode(''); setGuestJoined(false); }}
            className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-300"
          >
            ← 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'joining') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">🚪 방 입장하기</h1>

          <div className="mb-4">
            <p className="text-gray-300 text-sm mb-2">방장에게 받은 코드를 입력하세요</p>
            <input
              type="text"
              value={joinInput}
              onChange={e => setJoinInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={6}
              placeholder="ABC123"
              className="w-full bg-gray-900 text-white text-3xl font-mono text-center rounded-xl py-3 border border-gray-600 focus:border-blue-400 outline-none tracking-widest uppercase"
            />
          </div>

          {joinError && (
            <p className="text-red-400 text-sm mb-4 text-center bg-red-950 rounded-lg py-2">{joinError}</p>
          )}

          <button
            onClick={handleJoin}
            disabled={joinLoading || joinInput.trim().length !== 6}
            className={`w-full py-4 text-white font-bold text-lg rounded-xl transition-all ${
              joinLoading || joinInput.trim().length !== 6
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {joinLoading ? '입장 중...' : '🚪 입장'}
          </button>

          <button
            onClick={() => { setMode('home'); setJoinInput(''); setJoinError(''); }}
            className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-300"
          >
            ← 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
}
