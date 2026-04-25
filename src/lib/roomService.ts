import { ref, set, get, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import type { GameState, Faction } from '../game/types';

export function randomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createRoom(code: string, hostFaction: Faction): Promise<void> {
  await set(ref(db, `rooms/${code}`), {
    hostFaction,
    guestJoined: false,
    gameState: null,
  });
}

export async function updateHostFaction(code: string, faction: Faction): Promise<void> {
  await set(ref(db, `rooms/${code}/hostFaction`), faction);
}

export async function joinRoom(code: string): Promise<Faction | null> {
  const snapshot = await get(ref(db, `rooms/${code}`));
  if (!snapshot.exists()) return null;
  const data = snapshot.val() as { hostFaction: Faction; guestJoined: boolean };
  if (data.guestJoined) return null;
  const guestFaction: Faction = data.hostFaction === 'blue' ? 'red' : 'blue';
  await set(ref(db, `rooms/${code}/guestJoined`), true);
  return guestFaction;
}

export async function pushGameState(code: string, state: GameState): Promise<void> {
  const clean = { ...state, selectedTroopId: null, validTargets: [] };
  await set(ref(db, `rooms/${code}/gameState`), clean);
}

export function subscribeToGameState(
  code: string,
  cb: (state: GameState | null) => void,
): () => void {
  const r = ref(db, `rooms/${code}/gameState`);
  onValue(r, (snap) => cb(snap.val() as GameState | null));
  return () => off(r);
}

export function subscribeToGuestJoined(
  code: string,
  cb: (joined: boolean) => void,
): () => void {
  const r = ref(db, `rooms/${code}/guestJoined`);
  onValue(r, (snap) => cb(snap.val() === true));
  return () => off(r);
}
