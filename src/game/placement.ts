import type { GameState, Faction, Troop, Base, Headquarters } from './types';

function getNode(state: GameState, id: string): Base | Headquarters | null {
  const base = state.terrain.bases.find(b => b.id === id);
  if (base) return base;
  const hq = state.terrain.headquarters.find(h => h.id === id);
  return hq ?? null;
}

function isHQ(node: Base | Headquarters): node is Headquarters {
  return 'faction' in node && !('isSpecial' in node);
}

export function isMyOwnHQ(state: GameState, targetId: string, faction: Faction): boolean {
  const hq = state.terrain.headquarters.find(h => h.id === targetId);
  return hq?.faction === faction;
}

export function isEnemyHQ(state: GameState, targetId: string, faction: Faction): boolean {
  const hq = state.terrain.headquarters.find(h => h.id === targetId);
  return hq !== undefined && hq.faction !== faction;
}

export function canWinBattle(attacker: Troop, target: Base | Headquarters | null): boolean {
  if (!target) return false;
  const occupant = target.occupant;
  if (!occupant) return true;
  if (occupant.faction === attacker.faction) return true;
  if (occupant.isJoker) return true;
  if (attacker.isJoker) return true;
  return attacker.power > occupant.power;
}

export function isConnectedToMyHQ(
  state: GameState,
  targetId: string,
  faction: Faction
): boolean {
  const myHQs = state.terrain.headquarters.filter(h => h.faction === faction && !h.captured);

  const queue: string[] = myHQs.map(h => h.id);
  const visited = new Set<string>(queue);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentNode = getNode(state, currentId);
    if (!currentNode) continue;

    for (const neighborId of currentNode.connectedTo) {
      if (neighborId === targetId) return true;
      if (visited.has(neighborId)) continue;

      const neighbor = getNode(state, neighborId);
      if (!neighbor) continue;

      if (!isHQ(neighbor) && neighbor.occupant?.faction === faction) {
        visited.add(neighborId);
        queue.push(neighborId);
      }
    }
  }
  return false;
}

export function canPlaceTroop(
  state: GameState,
  troop: Troop,
  targetId: string,
  faction: Faction
): boolean {
  if (isMyOwnHQ(state, targetId, faction)) return false;

  const target = getNode(state, targetId);
  if (!target) return false;

  if (troop.abilityKey === 'ignore-connection') {
    if (isEnemyHQ(state, targetId, faction)) {
      return isConnectedToMyHQ(state, targetId, faction) && canWinBattle(troop, target);
    }
    return canWinBattle(troop, target);
  }

  if (troop.abilityKey === 'joker') {
    return isConnectedToMyHQ(state, targetId, faction);
  }

  return isConnectedToMyHQ(state, targetId, faction) && canWinBattle(troop, target);
}

export function getValidTargets(state: GameState, troopId: string, faction: Faction): string[] {
  const troop = state.players[faction].rack.find(t => t.id === troopId);
  if (!troop) return [];

  const targets: string[] = [];
  for (const base of state.terrain.bases) {
    if (canPlaceTroop(state, troop, base.id, faction)) {
      targets.push(base.id);
    }
  }
  for (const hq of state.terrain.headquarters) {
    if (canPlaceTroop(state, troop, hq.id, faction)) {
      targets.push(hq.id);
    }
  }
  return targets;
}

export function canDraw(state: GameState, faction: Faction): boolean {
  const player = state.players[faction];
  return player.supply.length > 0 && player.rack.length < 8;
}

export function canPlaceAny(state: GameState, faction: Faction): boolean {
  const player = state.players[faction];
  for (const troop of player.rack) {
    if (getValidTargets(state, troop.id, faction).length > 0) return true;
  }
  return false;
}
