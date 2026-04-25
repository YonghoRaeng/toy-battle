import { create } from 'zustand';
import type { GameState, Faction } from '../game/types';
import { setupGame, selectTroop, drawTroops, placeTroop, resolveAbility, skipAbility } from '../game/engine';
import { getAbilityTargets, getSpecialBaseTargets } from '../game/abilities';

type GameStore = {
  game: GameState | null;
  startGame: (terrainId: string, firstPlayer: Faction) => void;
  onSelectTroop: (troopId: string) => void;
  onDraw: () => void;
  onPlaceTroop: (targetId: string) => void;
  onResolveAbility: (targetId?: string) => void;
  onSkipAbility: () => void;
  resetGame: () => void;
  getAbilityChoices: () => string[];
};

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,

  startGame: (terrainId, firstPlayer) => {
    set({ game: setupGame(terrainId, firstPlayer) });
  },

  onSelectTroop: (troopId) => {
    const { game } = get();
    if (!game) return;
    set({ game: selectTroop(game, troopId) });
  },

  onDraw: () => {
    const { game } = get();
    if (!game) return;
    set({ game: drawTroops(game) });
  },

  onPlaceTroop: (targetId) => {
    const { game } = get();
    if (!game) return;
    set({ game: placeTroop(game, targetId) });
  },

  onResolveAbility: (targetId) => {
    const { game } = get();
    if (!game) return;
    if (game.pendingAbility?.abilityKey === 'extra-place' && targetId) {
      const [troopId, baseId] = targetId.split(':');
      void troopId; void baseId;
    }
    set({ game: resolveAbility(game, targetId) });
  },

  onSkipAbility: () => {
    const { game } = get();
    if (!game) return;
    set({ game: skipAbility(game) });
  },

  resetGame: () => set({ game: null }),

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
