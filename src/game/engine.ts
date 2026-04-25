import type { GameState, Faction } from './types';
import { getTerrain } from '../data/terrains';
import { generateFactionDeck } from '../data/troops';
import { checkRegionCapture } from './regions';
import { checkHQCapture, checkNoMoves } from './victory';
import { getValidTargets } from './placement';
import {
  executeAbility,
  getAbilityTargets,
  getSpecialBaseTargets,
  executeSpecialBaseEffect,
} from './abilities';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function setupGame(terrainId: string, firstPlayer: Faction): GameState {
  const terrain = getTerrain(terrainId);

  const makePlayer = (faction: Faction, isFirst: boolean) => {
    const full = shuffle(generateFactionDeck(faction));
    const supply = full.slice(4); // remove first 4 (simulating "return to box")
    const drawCount = isFirst ? 3 : 4;
    const rack = supply.splice(0, drawCount);
    return { faction, supply, rack, medalsOnTrack: 0, isFirstPlayer: isFirst };
  };

  const blue = makePlayer('blue', firstPlayer === 'blue');
  const red = makePlayer('red', firstPlayer === 'red');

  return {
    terrain,
    players: { blue, red },
    currentTurn: firstPlayer,
    turnCount: 1,
    discard: [],
    phase: 'playing',
    winner: null,
    winReason: null,
    log: [`🎮 게임 시작! ${firstPlayer === 'blue' ? '🔵 파랑' : '🔴 빨강'} 선공`],
    selectedTroopId: null,
    validTargets: [],
    pendingAbility: null,
    abilitiesEnabled: true,
    specialBaseEnabled: true,
  };
}

export function selectTroop(state: GameState, troopId: string): GameState {
  if (state.phase !== 'playing') return state;
  const faction = state.currentTurn;

  if (state.selectedTroopId === troopId) {
    return { ...state, selectedTroopId: null, validTargets: [] };
  }

  const validTargets = getValidTargets(state, troopId, faction);
  return { ...state, selectedTroopId: troopId, validTargets };
}

export function drawTroops(state: GameState): GameState {
  if (state.phase !== 'playing') return state;
  const faction = state.currentTurn;
  const player = { ...state.players[faction] };
  const supply = [...player.supply];
  const rack = [...player.rack];

  const count = Math.min(2, supply.length, 8 - rack.length);
  if (count === 0) return state;

  for (let i = 0; i < count; i++) {
    rack.push(supply.pop()!);
  }

  const next: Faction = faction === 'blue' ? 'red' : 'blue';
  let newState: GameState = {
    ...state,
    players: { ...state.players, [faction]: { ...player, supply, rack } },
    currentTurn: next,
    turnCount: state.turnCount + 1,
    selectedTroopId: null,
    validTargets: [],
    log: [...state.log, `${faction === 'blue' ? '🔵 파랑' : '🔴 빨강'}이 병정 ${count}개 뽑기`],
  };

  newState = checkNoMoves(newState);
  return newState;
}

export function placeTroop(state: GameState, targetId: string): GameState {
  if (state.phase !== 'playing') return state;
  if (!state.selectedTroopId) return state;

  const faction = state.currentTurn;
  const player = { ...state.players[faction] };
  const troop = player.rack.find(t => t.id === state.selectedTroopId);
  if (!troop) return state;

  if (!state.validTargets.includes(targetId)) return state;

  const rack = player.rack.filter(t => t.id !== troop.id);

  let bases = state.terrain.bases.map(b => ({ ...b, stack: [...b.stack] }));
  let headquarters = state.terrain.headquarters.map(h => ({ ...h }));
  let isHQCapture = false;

  const hq = headquarters.find(h => h.id === targetId);
  if (hq) {
    hq.occupant = troop;
    hq.captured = true;
    isHQCapture = true;
  } else {
    bases = bases.map(b => {
      if (b.id !== targetId) return b;
      const stack = [...b.stack, troop];
      return { ...b, stack, occupant: troop };
    });
  }

  let newState: GameState = {
    ...state,
    terrain: { ...state.terrain, bases, headquarters },
    players: { ...state.players, [faction]: { ...player, rack } },
    selectedTroopId: null,
    validTargets: [],
    pendingAbility: null,
    log: [...state.log, `${faction === 'blue' ? '🔵 파랑' : '🔴 빨강'}이 ${troop.emoji}${troop.name}(힘${troop.isJoker ? '조커' : troop.power})을 ${targetId}에 배치`],
  };

  if (isHQCapture) {
    newState = checkHQCapture(newState, faction);
    if (newState.phase === 'ended') return newState;
  }

  // Troop ability
  if (state.abilitiesEnabled && !isHQCapture) {
    const key = troop.abilityKey;
    if (key !== 'none' && key !== 'joker' && key !== 'ignore-connection') {
      if (key === 'extra-place' || key === 'ranged-discard') {
        const targets = getAbilityTargets(newState, key, targetId, faction);
        if (targets.length > 0) {
          return {
            ...newState,
            phase: 'ability',
            pendingAbility: { troopId: troop.id, abilityKey: key, placedBaseId: targetId, targets },
          };
        }
      } else {
        newState = executeAbility(newState, key, faction, targetId);
      }
    }
  }

  // Special base effect
  if (state.specialBaseEnabled && !isHQCapture) {
    const base = newState.terrain.bases.find(b => b.id === targetId);
    if (base?.isSpecial && newState.terrain.specialBaseEffect) {
      const effect = newState.terrain.specialBaseEffect;
      if (effect.type === 'draw-from-supply') {
        newState = executeAbility(newState, 'draw-1', faction, targetId);
      } else if (effect.type === 'collect-from-terrain' || effect.type === 'collect-from-discard') {
        const sbTargets = getSpecialBaseTargets(newState, targetId, faction);
        if (sbTargets.length > 0) {
          return {
            ...newState,
            phase: 'ability',
            pendingAbility: {
              troopId: `special-base-${targetId}`,
              abilityKey: 'none',
              placedBaseId: targetId,
              targets: sbTargets,
            },
          };
        }
      }
    }
  }

  newState = checkRegionCapture(newState, faction);
  if (newState.phase === 'ended') return newState;

  newState = checkHQCapture(newState, faction);
  if (newState.phase === 'ended') return newState;

  const next: Faction = faction === 'blue' ? 'red' : 'blue';
  newState = { ...newState, currentTurn: next, turnCount: newState.turnCount + 1 };
  newState = checkNoMoves(newState);

  return newState;
}

export function resolveAbility(state: GameState, targetId?: string): GameState {
  if (state.phase !== 'ability' || !state.pendingAbility) return state;

  const faction = state.currentTurn;
  const { abilityKey, placedBaseId } = state.pendingAbility;
  let newState: GameState = { ...state, phase: 'playing', pendingAbility: null };

  if (abilityKey === 'extra-place' && targetId) {
    const [troopId, baseId] = targetId.split(':');
    if (troopId && baseId) {
      const validNow = getValidTargets(newState, troopId, faction);
      if (validNow.includes(baseId)) {
        newState = { ...newState, selectedTroopId: troopId, validTargets: validNow };
        return placeTroop({ ...newState, phase: 'playing' }, baseId);
      }
    }
  } else if (abilityKey === 'ranged-discard' && targetId) {
    newState = executeAbility(newState, 'ranged-discard', faction, placedBaseId, targetId);
  } else if (abilityKey === 'none' && targetId) {
    newState = executeSpecialBaseEffect(newState, placedBaseId, faction, targetId);
  }

  newState = checkRegionCapture(newState, faction);
  if (newState.phase === 'ended') return newState;

  newState = checkHQCapture(newState, faction);
  if (newState.phase === 'ended') return newState;

  const next: Faction = faction === 'blue' ? 'red' : 'blue';
  newState = { ...newState, currentTurn: next, turnCount: newState.turnCount + 1 };
  newState = checkNoMoves(newState);

  return newState;
}

export function skipAbility(state: GameState): GameState {
  if (state.phase !== 'ability') return state;

  const faction = state.currentTurn;
  let newState: GameState = { ...state, phase: 'playing', pendingAbility: null };

  newState = checkRegionCapture(newState, faction);
  if (newState.phase === 'ended') return newState;

  newState = checkHQCapture(newState, faction);
  if (newState.phase === 'ended') return newState;

  const next: Faction = faction === 'blue' ? 'red' : 'blue';
  newState = { ...newState, currentTurn: next, turnCount: newState.turnCount + 1 };
  newState = checkNoMoves(newState);

  return newState;
}
