import type { GameState, Faction } from './types';

export function checkRegionCapture(state: GameState, faction: Faction): GameState {
  let newState = { ...state };
  const player = { ...newState.players[faction] };
  const terrain = { ...newState.terrain };
  const regions = terrain.regions.map(r => ({ ...r }));
  const log = [...newState.log];

  let totalMedalsGained = 0;

  for (const region of regions) {
    if (region.medals === 0) continue;

    const allOccupiedByFaction = region.surroundingBaseIds.every(baseId => {
      const base = terrain.bases.find(b => b.id === baseId);
      return base?.occupant?.faction === faction;
    });

    if (allOccupiedByFaction) {
      const gained = region.medals;
      totalMedalsGained += gained;
      region.medals = 0;
      log.push(`${faction === 'blue' ? '🔵 파랑' : '🔴 빨강'}이 영토 ${region.id}를 확보해 훈장 ${gained}개 획득!`);
    }
  }

  if (totalMedalsGained > 0) {
    player.medalsOnTrack += totalMedalsGained;
    newState = {
      ...newState,
      terrain: { ...terrain, regions },
      players: {
        ...newState.players,
        [faction]: player,
      },
      log,
    };

    if (player.medalsOnTrack >= terrain.medalGoal) {
      newState = {
        ...newState,
        phase: 'ended',
        winner: faction,
        winReason: 'medal-track-center',
        log: [...newState.log, `🏆 ${faction === 'blue' ? '🔵 파랑' : '🔴 빨강'}이 훈장 트랙 중앙 달성으로 승리!`],
      };
    }
  }

  return newState;
}
