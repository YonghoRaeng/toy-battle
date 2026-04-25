export type Faction = 'blue' | 'red';

export type TroopType =
  | 'duck-joker'
  | 'skeleton'
  | 'captain'
  | 'robot-giant'
  | 'pirate-monkey'
  | 'robot-xb42'
  | 'unicorn'
  | 'trex';

export type AbilityKey =
  | 'joker'
  | 'draw-2'
  | 'extra-place'
  | 'ranged-discard'
  | 'ignore-connection'
  | 'random-discard-opponent'
  | 'draw-1'
  | 'none';

export type Troop = {
  id: string;
  faction: Faction;
  type: TroopType;
  power: number;
  isJoker: boolean;
  abilityKey: AbilityKey;
  name: string;
  emoji: string;
};

export type Base = {
  id: string;
  isSpecial: boolean;
  specialEffect?: string;
  position: { x: number; y: number };
  connectedTo: string[];
  occupant: Troop | null;
  stack: Troop[];
};

export type Headquarters = {
  id: string;
  faction: Faction;
  position: { x: number; y: number };
  connectedTo: string[];
  captured: boolean;
  occupant: Troop | null;
};

export type Region = {
  id: string;
  surroundingBaseIds: string[];
  medals: number;
  initialMedals: number;
};

export type TerrainSpecialRule =
  | { type: 'collect-from-terrain' }
  | { type: 'draw-from-supply' }
  | { type: 'collect-from-discard' }
  | { type: 'push-adjacent-enemy' }
  | { type: 'steal-from-rack' }
  | { type: 'placement-restriction'; allowedPowers: Record<string, number[]> }
  | { type: 'disable-ability-on-special' };

export type Terrain = {
  id: string;
  name: string;
  medalGoal: 5 | 6 | 7 | 8;
  bases: Base[];
  headquarters: Headquarters[];
  regions: Region[];
  specialBaseEffect?: TerrainSpecialRule;
};

export type PlayerState = {
  faction: Faction;
  supply: Troop[];
  rack: Troop[];
  medalsOnTrack: number;
  isFirstPlayer: boolean;
};

export type WinReason = 'hq-captured' | 'medal-track-center' | 'no-moves';

export type GamePhase = 'setup' | 'playing' | 'ability' | 'ended';

export type AbilityPendingState = {
  troopId: string;
  abilityKey: AbilityKey;
  placedBaseId: string;
  targets: string[];
};

export type GameState = {
  terrain: Terrain;
  players: { blue: PlayerState; red: PlayerState };
  currentTurn: Faction;
  turnCount: number;
  discard: Troop[];
  phase: GamePhase;
  winner: Faction | null;
  winReason: WinReason | null;
  log: string[];
  selectedTroopId: string | null;
  validTargets: string[];
  pendingAbility: AbilityPendingState | null;
  abilitiesEnabled: boolean;
  specialBaseEnabled: boolean;
};
