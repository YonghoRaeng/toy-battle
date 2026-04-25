import { create } from 'zustand';
import type { GameState, Faction } from '../game/types';
import { setupGame, selectTroop, drawTroops, placeTroop, resolveAbility, skipAbility } from '../game/engine';
import { getAbilityTargets, getSpecialBaseTargets } from '../game/abilities';
import { pushGameState } from '../lib/roomService';

type GameStore = {
  game: GameState | null;
  roomCode: string | null;
  myFaction: Faction | null;

  setRoom: (roomCode: string, myFaction: Faction) => void;
  syncFromFirebase: (game: GameState) => void;
  startGame: (terrainId: string, firstPlayer: Faction) => Promise<void>;
  onSelectTroop: (troopId: string) => void;
  onDraw: () => void;
  onPlaceTroop: (targetId: string) => void;
  onResolveAbility: (targetId?: string) => void;
  onSkipAbility: () => void;
  resetGame: () => void;
  getAbilityChoices: () => string[];
};

async function sync(roomCode: string | null, game: GameState): Promise<void> {
  if (roomCode) await pushGameState(roomCode, game);
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  roomCode: null,
  myFaction: null,

  setRoom: (roomCode, myFaction) => set({ roomCode, myFaction }),

  syncFromFirebase: (incoming) => {
    set({ game: incoming });
  },

  startGame: async (terrainId, firstPlayer) => {
    const newGame = setupGame(terrainId, firstPlayer);
    set({ game: newGame });
    await sync(get().roomCode, newGame);
  },

  onSelectTroop: (troopId) => {
    const { game } = get();
    if (!game) return;
    set({ game: selectTroop(game, troopId) });
  },

  onDraw: () => {
    const { game, roomCode } = get();
    if (!game) return;
    const newGame = drawTroops(game);
    set({ game: newGame });
    void sync(roomCode, newGame);
  },

  onPlaceTroop: (targetId) => {
    const { game, roomCode } = get();
    if (!game) return;
    const newGame = placeTroop(game, targetId);
    set({ game: newGame });
    void sync(roomCode, newGame);
  },

  onResolveAbility: (targetId) => {
    const { game, roomCode } = get();
    if (!game) return;
    const newGame = resolveAbility(game, targetId);
    set({ game: newGame });
    void sync(roomCode, newGame);
  },

  onSkipAbility: () => {
    const { game, roomCode } = get();
    if (!game) return;
    const newGame = skipAbility(game);
    set({ game: newGame });
    void sync(roomCode, newGame);
  },

  resetGame: () => set({ game: null, roomCode: null, myFaction: null }),

  getAbilityChoices: () => {
    const { game } = get();
    if (!game?.pendingAbility) return [];
    const { abilityKey, placedBaseId, targets } = game.pendingAbility;
    if (abilityKey === 'ranged-discard') {
      return getAbilityTargets(game, abilityKey, placedBaseId, game.currentTurn);
    }
    if (abilityKey === 'none') {
      return getSpecialBaseTargets(game, placedBaseId, game.currentTurn);
    }
    return targets;
  },
}));
