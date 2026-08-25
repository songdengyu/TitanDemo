const MONSTER_NAMES = [
  '史莱姆',
  '哥布林',
  '蝙蝠',
  '骷髅兵',
  '野狼',
  '蜘蛛',
  '食人花',
  '石怪',
  '幽灵',
  '小恶魔',
]

const BOSS_NAMES = [
  '巨型章鱼',
  '暗影领主',
  '熔岩巨兽',
  '冰霜龙王',
  '深渊魔王',
]

export interface Monster {
  name: string
  maxHp: number
  currentHp: number
}

export function getMonsterName(stage: number, killCount: number, isBoss: boolean): string {
  if (isBoss) {
    return BOSS_NAMES[(stage - 1) % BOSS_NAMES.length]
  }
  return MONSTER_NAMES[killCount % MONSTER_NAMES.length]
}

export function calcNormalMonsterHp(stage: number, killCount: number): number {
  return Math.floor(100 * stage * (1 + killCount * 0.2))
}

export function calcBossHp(stage: number): number {
  return calcNormalMonsterHp(stage, 9) * 10
}

export function createMonster(stage: number, killCount: number, isBoss: boolean): Monster {
  const maxHp = isBoss ? calcBossHp(stage) : calcNormalMonsterHp(stage, killCount)
  return {
    name: getMonsterName(stage, killCount, isBoss),
    maxHp,
    currentHp: maxHp,
  }
}

export function createRandomNormalMonster(stage: number): Monster {
  return createMonster(stage, Math.floor(Math.random() * MONSTER_NAMES.length), false)
}

export function calcGoldReward(stage: number, isBoss: boolean): number {
  return isBoss ? 50 * stage : 5 + stage
}
