import type { Terrain } from '../../game/types';
import { castlePlain } from './castle-plain';

export const TERRAINS: Record<string, Terrain> = {
  'castle-plain': castlePlain,
};

export function getTerrain(id: string): Terrain {
  const t = TERRAINS[id];
  if (!t) throw new Error(`Unknown terrain: ${id}`);
  return JSON.parse(JSON.stringify(t)) as Terrain;
}
