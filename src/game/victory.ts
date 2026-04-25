import type { GameState, Faction } from './types';
import { canDraw, canPlaceAny } from './placement';

export function checkHQCapture(state: GameState, faction: Faction): GameState {
  for (const hq of state.terrain.headquarters) {
    if (hq.faction !== faction && hq.occupant?.faction === faction) {
      return {
        ...state,
        phase: 'ended',
        winner: faction,
        winReason: 'hq-captured',
        log: [...state.log, `🏆 ${faction === 'blue' ? '🔵 파랑' : '🔴 빨강'}이 상대 본부 점령으로 즉시 승리!`],
      };
    }
  }
  return state;
}

export function checkNoMoves(state: GameState): GameState {
  const current = state.currentTurn;
  const canDoSomething = canDraw(state, current) || canPlaceAny(state, current);

  if (!canDoSomething) {
    const blue = state.players.blue.medalsOnTrack;
    const red = state.players.red.medalsOnTrack;

    let winner: Faction;
    if (blue > red) winner = 'blue';
    else if (red > blue) winner = 'red';
    else winner = current === 'blue' ? 'red' : 'blue'; // 동점: 현재 턴 플레이어 패배

    return {
      ...state,
      phase: 'ended',
      winner,
      winReason: 'no-moves',
      log: [...state.log, `⚖️ 행동 불가! 훈장 비교 — 파랑:${blue} 빨강:${red} → ${winner === 'blue' ? '🔵 파랑' : '🔴 빨강'} 승리!`],
    };
  }
  return state;
}
