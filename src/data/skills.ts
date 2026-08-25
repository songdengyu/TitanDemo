export type SkillEffectShape = 'slash' | 'fireball' | 'lightning' | 'frost' | 'meteor' | 'void'

export interface SkillDefinition {
  id: string
  name: string
  description: string
  color: string
  accent: string
  shape: SkillEffectShape
  baseMultiplier: number
  levelMultiplier: number
  maxLevel: number
  unlockStage: number
  prerequisiteId?: string
  prerequisiteLevel?: number
}

export const SKILLS: SkillDefinition[] = [
  {
    id: 'heroic_slash', name: '英勇斩击', description: '挥出宽阔剑气，是勇者最可靠的基础攻击。',
    color: '#ffe08a', accent: '#ffffff', shape: 'slash', baseMultiplier: 1, levelMultiplier: 0.15,
    maxLevel: 10, unlockStage: 1,
  },
  {
    id: 'fire_orb', name: '烈焰爆弹', description: '投出膨胀的火球，命中时引发炽热爆炸。',
    color: '#ff5a36', accent: '#ffd166', shape: 'fireball', baseMultiplier: 1.45, levelMultiplier: 0.2,
    maxLevel: 10, unlockStage: 1,
  },
  {
    id: 'chain_lightning', name: '天穹雷击', description: '从天空召下雷柱，瞬间贯穿怪物。',
    color: '#54d8ff', accent: '#ffffff', shape: 'lightning', baseMultiplier: 2.1, levelMultiplier: 0.28,
    maxLevel: 8, unlockStage: 2, prerequisiteId: 'fire_orb', prerequisiteLevel: 2,
  },
  {
    id: 'frost_nova', name: '极寒新星', description: '引爆冰霜魔力，以巨型冰晶封锁目标。',
    color: '#8de7ff', accent: '#dffbff', shape: 'frost', baseMultiplier: 2.7, levelMultiplier: 0.34,
    maxLevel: 8, unlockStage: 3, prerequisiteId: 'chain_lightning', prerequisiteLevel: 2,
  },
  {
    id: 'meteor', name: '陨星坠落', description: '召唤燃烧陨石轰击战场，造成毁灭性伤害。',
    color: '#ff713d', accent: '#fff09a', shape: 'meteor', baseMultiplier: 3.6, levelMultiplier: 0.45,
    maxLevel: 6, unlockStage: 5, prerequisiteId: 'frost_nova', prerequisiteLevel: 3,
  },
  {
    id: 'void_rift', name: '虚空裂隙', description: '撕裂空间并吞噬目标，是勇者的终极奥义。',
    color: '#c05cff', accent: '#ff8ee7', shape: 'void', baseMultiplier: 5.2, levelMultiplier: 0.65,
    maxLevel: 5, unlockStage: 8, prerequisiteId: 'meteor', prerequisiteLevel: 3,
  },
]

export const INITIAL_SKILL_LEVELS: Record<string, number> = {
  heroic_slash: 1,
}

export function getSkillDamageMultiplier(skill: SkillDefinition, level: number): number {
  return skill.baseMultiplier + Math.max(0, level - 1) * skill.levelMultiplier
}

export function getSkillUpgradeCost(level: number): number {
  return level === 0 ? 35 : 20 + level * level * 15
}

export function getSkillById(skillId: string): SkillDefinition | undefined {
  return SKILLS.find((skill) => skill.id === skillId)
}
