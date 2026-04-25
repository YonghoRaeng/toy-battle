import type { Terrain } from '../../game/types';

// Image original: 1008×1061px, displayed at 582×613px
// Scale: 582/1008 ≈ 613/1061 ≈ 0.578 (uniform)
// Positions below are in display coordinates (original × 0.578)
export const castlePlain: Terrain = {
  id: 'castle-plain',
  name: '성채 평원',
  medalGoal: 7,
  specialBaseEffect: { type: 'collect-from-terrain' },
  headquarters: [
    {
      id: 'hq-red',
      faction: 'red',
      position: { x: 291, y: 70 },
      connectedTo: ['b01', 'b02', 'b03'],
      captured: false,
      occupant: null,
    },
    {
      id: 'hq-blue',
      faction: 'blue',
      position: { x: 291, y: 530 },
      connectedTo: ['b10', 'b11', 'b12'],
      captured: false,
      occupant: null,
    },
  ],
  bases: [
    // Row 1 — just below red HQ
    { id: 'b01', isSpecial: false, position: { x: 123, y: 133 }, connectedTo: ['hq-red', 'b02', 'b04'], occupant: null, stack: [] },
    { id: 'b02', isSpecial: false, position: { x: 291, y: 133 }, connectedTo: ['hq-red', 'b01', 'b03', 'b05'], occupant: null, stack: [] },
    { id: 'b03', isSpecial: false, position: { x: 459, y: 133 }, connectedTo: ['hq-red', 'b02', 'b06'], occupant: null, stack: [] },
    // Row 2 — lava region
    { id: 'b04', isSpecial: false, position: { x: 123, y: 208 }, connectedTo: ['b01', 'b05', 'b07'], occupant: null, stack: [] },
    { id: 'b05', isSpecial: true,  position: { x: 291, y: 208 }, connectedTo: ['b02', 'b04', 'b06', 'b08'], occupant: null, stack: [], specialEffect: 'collect-from-terrain' },
    { id: 'b06', isSpecial: false, position: { x: 459, y: 208 }, connectedTo: ['b03', 'b05', 'b09'], occupant: null, stack: [] },
    // Row 3 — mid zone
    { id: 'b07', isSpecial: false, position: { x: 123, y: 279 }, connectedTo: ['b04', 'b08', 'b10'], occupant: null, stack: [] },
    { id: 'b08', isSpecial: false, position: { x: 291, y: 279 }, connectedTo: ['b05', 'b07', 'b09', 'b11'], occupant: null, stack: [] },
    { id: 'b09', isSpecial: false, position: { x: 459, y: 279 }, connectedTo: ['b06', 'b08', 'b12'], occupant: null, stack: [] },
    // Row 4 — pond region
    { id: 'b10', isSpecial: false, position: { x: 123, y: 356 }, connectedTo: ['b07', 'b11', 'hq-blue'], occupant: null, stack: [] },
    { id: 'b11', isSpecial: true,  position: { x: 291, y: 356 }, connectedTo: ['b08', 'b10', 'b12', 'hq-blue'], occupant: null, stack: [], specialEffect: 'collect-from-terrain' },
    { id: 'b12', isSpecial: false, position: { x: 459, y: 356 }, connectedTo: ['b09', 'b11', 'hq-blue'], occupant: null, stack: [] },
  ],
  // Symmetric: red side (r1+r2=5), blue side (r3+r4=5), total=10
  regions: [
    { id: 'r1', surroundingBaseIds: ['b01', 'b02', 'b04', 'b05'], medals: 3, initialMedals: 3 },
    { id: 'r2', surroundingBaseIds: ['b02', 'b03', 'b05', 'b06'], medals: 2, initialMedals: 2 },
    { id: 'r3', surroundingBaseIds: ['b07', 'b08', 'b10', 'b11'], medals: 2, initialMedals: 2 },
    { id: 'r4', surroundingBaseIds: ['b08', 'b09', 'b11', 'b12'], medals: 3, initialMedals: 3 },
  ],
};
