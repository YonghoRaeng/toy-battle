import type { Troop, Faction, TroopType, AbilityKey } from '../game/types';

const TROOP_CONFIG: Array<[TroopType, number, AbilityKey, string, string, boolean]> = [
  ['duck-joker',    0, 'joker',                   '꽉스',      '🦆', true],
  ['skeleton',      1, 'draw-2',                  '해골이',    '💀', false],
  ['captain',       2, 'extra-place',             '캡틴',      '🧟', false],
  ['robot-giant',   3, 'ranged-discard',          '거인병',    '🤖', false],
  ['pirate-monkey', 4, 'ignore-connection',       '코코 선장', '🐒', false],
  ['robot-xb42',    5, 'random-discard-opponent', 'XB-42',     '🔮', false],
  ['unicorn',       6, 'draw-1',                  '레인보우',  '🦄', false],
  ['trex',          7, 'none',                    '렉시',      '🦖', false],
];

export function generateFactionDeck(faction: Faction): Troop[] {
  return TROOP_CONFIG.flatMap(([type, power, abilityKey, name, emoji, isJoker]) =>
    [1, 2, 3].map(i => ({
      id: `${faction}-${type}-${i}`,
      faction,
      type,
      power,
      abilityKey,
      name,
      emoji,
      isJoker,
    }))
  );
}

export const ABILITY_DESCRIPTIONS: Record<AbilityKey, string> = {
  'joker':                   '상대 병정 힘에 상관없이 위에 놓을 수 있음. 단 상대도 내 꽉스 위에 아무 병정이나 놓을 수 있음.',
  'draw-2':                  '공급처에서 병정 2개를 받침대로 뽑기 (받침대 여유 공간 한도)',
  'extra-place':             '이번 차례에 병정 1개를 추가로 놓기',
  'ranged-discard':          '인접한 상대 병정 1개를 선택해 앞면으로 버리기',
  'ignore-connection':       '연결 규칙 무시하고 아무 거점에나 배치 가능 (상대 본부 제외)',
  'random-discard-opponent': '상대 받침대에서 무작위 병정 1개를 앞면으로 버리기',
  'draw-1':                  '공급처에서 병정 1개를 받침대로 뽑기',
  'none':                    '능력 없음',
};

export const TROOP_POWER_LABELS: Record<number, string> = {
  0: '조커',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
};
