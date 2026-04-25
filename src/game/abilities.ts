import type { GameState, Faction, AbilityKey } from './types';

function drawFromSupply(state: GameState, faction: Faction, count: number): GameState {
  const player = { ...state.players[faction] };
  const supply = [...player.supply];
  const rack = [...player.rack];
  const log = [...state.log];

  const available = Math.min(count, supply.length, 8 - rack.length);
  for (let i = 0; i < available; i++) {
    const troop = supply.pop()!;
    rack.push(troop);
  }

  log.push(`${faction === 'blue' ? '🔵 파랑' : '🔴 빨강'}이 공급처에서 ${available}개 뽑기`);

  return {
    ...state,
    players: {
      ...state.players,
      [faction]: { ...player, supply, rack },
    },
    log,
  };
}

function discardTopTroop(state: GameState, baseId: string): GameState {
  const bases = state.terrain.bases.map(b => {
    if (b.id !== baseId) return b;
    const stack = [...b.stack];
    stack.pop();
    return {
      ...b,
      stack,
      occupant: stack.length > 0 ? stack[stack.length - 1] : null,
    };
  });

  const discardedTroop = state.terrain.bases.find(b => b.id === baseId)?.occupant;
  const discard = discardedTroop ? [...state.discard, discardedTroop] : state.discard;

  return {
    ...state,
    terrain: { ...state.terrain, bases },
    discard,
    log: [...state.log, `거점 ${baseId}의 병정을 버림 더미로`],
  };
}

function discardRandomFromRack(state: GameState, targetFaction: Faction): GameState {
  const player = { ...state.players[targetFaction] };
  const rack = [...player.rack];
  if (rack.length === 0) return state;

  const idx = Math.floor(Math.random() * rack.length);
  const [discarded] = rack.splice(idx, 1);
  const discard = [...state.discard, discarded];

  return {
    ...state,
    players: {
      ...state.players,
      [targetFaction]: { ...player, rack },
    },
    discard,
    log: [...state.log, `${targetFaction === 'blue' ? '🔵 파랑' : '🔴 빨강'}의 받침대에서 무작위 병정 1개 버림`],
  };
}

export function getAbilityTargets(
  state: GameState,
  abilityKey: AbilityKey,
  placedBaseId: string,
  faction: Faction
): string[] {
  if (abilityKey === 'ranged-discard') {
    const base = state.terrain.bases.find(b => b.id === placedBaseId);
    if (!base) return [];
    return base.connectedTo.filter(id => {
      const neighbor = state.terrain.bases.find(b => b.id === id);
      return neighbor?.occupant && neighbor.occupant.faction !== faction;
    });
  }
  if (abilityKey === 'extra-place') {
    return state.players[faction].rack.map(t => t.id);
  }
  return [];
}

export function executeAbility(
  state: GameState,
  abilityKey: AbilityKey,
  faction: Faction,
  _placedBaseId: string,
  targetId?: string
): GameState {
  switch (abilityKey) {
    case 'draw-2':
      return drawFromSupply(state, faction, 2);
    case 'draw-1':
      return drawFromSupply(state, faction, 1);
    case 'ranged-discard':
      if (!targetId) return state;
      return discardTopTroop(state, targetId);
    case 'random-discard-opponent': {
      const opponent: Faction = faction === 'blue' ? 'red' : 'blue';
      return discardRandomFromRack(state, opponent);
    }
    case 'joker':
    case 'ignore-connection':
    case 'none':
    default:
      return state;
  }
}

export function executeSpecialBaseEffect(
  state: GameState,
  baseId: string,
  faction: Faction,
  targetId?: string
): GameState {
  const terrain = state.terrain;
  const base = terrain.bases.find(b => b.id === baseId);
  if (!base?.isSpecial || !terrain.specialBaseEffect) return state;

  const effect = terrain.specialBaseEffect;

  if (effect.type === 'collect-from-terrain') {
    if (!targetId) return state;
    const targetBase = terrain.bases.find(b => b.id === targetId);
    if (!targetBase?.occupant || targetBase.occupant.faction !== faction) return state;
    if (state.players[faction].rack.length >= 8) return state;

    const bases = terrain.bases.map(b => {
      if (b.id !== targetId) return b;
      const stack = [...b.stack];
      stack.pop();
      return { ...b, stack, occupant: stack.length > 0 ? stack[stack.length - 1] : null };
    });

    const collected = targetBase.occupant;
    const player = { ...state.players[faction] };
    player.rack = [...player.rack, collected];

    return {
      ...state,
      terrain: { ...terrain, bases },
      players: { ...state.players, [faction]: player },
      log: [...state.log, `특별 거점 효과: 전장에서 병정 회수!`],
    };
  }

  if (effect.type === 'draw-from-supply') {
    return drawFromSupply(state, faction, 1);
  }

  if (effect.type === 'collect-from-discard') {
    if (!targetId) return state;
    const discarded = state.discard.find(t => t.id === targetId && t.faction === faction);
    if (!discarded) return state;
    if (state.players[faction].rack.length >= 8) return state;

    const discard = state.discard.filter(t => t.id !== targetId);
    const player = { ...state.players[faction] };
    player.rack = [...player.rack, discarded];

    return {
      ...state,
      discard,
      players: { ...state.players, [faction]: player },
      log: [...state.log, `특별 거점 효과: 버림 더미에서 병정 회수!`],
    };
  }

  return state;
}

export function getSpecialBaseTargets(
  state: GameState,
  _baseId: string,
  faction: Faction
): string[] {
  const effect = state.terrain.specialBaseEffect;
  if (!effect) return [];

  if (effect.type === 'collect-from-terrain') {
    return state.terrain.bases
      .filter(b => b.occupant?.faction === faction && state.players[faction].rack.length < 8)
      .map(b => b.id);
  }
  if (effect.type === 'collect-from-discard') {
    return state.discard
      .filter(t => t.faction === faction)
      .map(t => t.id);
  }
  return [];
}
