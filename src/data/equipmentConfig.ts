import { parseCsv } from './csv'

export interface EquipmentConfig {
  id: number
  type: number
  name: string
  diamond: number | null
  description: string
  icon: string
  attack: number | null
  attackBonus: number | null
  critRate: number | null
  critDamage: number | null
  damageBonus: number | null
  normalAttackDamage: number | null
  skillDamage: number | null
  power: number | null
}

export function getEquipmentConfigPower(item: EquipmentConfig): number {
  if (item.power !== null) return item.power
  return Math.round(
    (item.attack ?? 0)
    + (item.attackBonus ?? 0) * 100
    + (item.critRate ?? 0) * 100
    + (item.critDamage ?? 0) * 50
    + (item.damageBonus ?? 0) * 100
    + (item.normalAttackDamage ?? 0) * 75
    + (item.skillDamage ?? 0) * 75,
  )
}

export function getEquipmentDismantleGold(item: EquipmentConfig): number {
  if (item.type < 1 || item.type > 7) return 0
  const tier = Math.floor((item.id - 100010001) / 7)
  return [10, 25, 60, 150, 350][tier] ?? 10
}

function required(row: Record<string, string>, key: string): string {
  if (!row[key]) throw new Error(`equipment.csv 缺少字段 ${key}`)
  return row[key]
}

function integer(value: string, key: string): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) throw new Error(`${key} 不是整数: ${value}`)
  return parsed
}

function optionalInteger(value: string): number | null {
  return value ? integer(value, 'diamond') : null
}

function optionalNumber(value: string, key: string): number | null {
  if (!value) return null
  const normalized = value.endsWith('%') ? String(Number(value.slice(0, -1)) / 100) : value
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) throw new Error(`${key} 不是有效数值: ${value}`)
  return parsed
}

export function parseEquipmentConfig(text: string): EquipmentConfig[] {
  const equipment = parseCsv(text).map((row) => ({
    id: integer(required(row, 'equipment_id'), 'equipment_id'),
    type: integer(required(row, 'equipment_type'), 'equipment_type'),
    name: required(row, 'name'),
    diamond: optionalInteger(row.diamond),
    description: required(row, 'description'),
    icon: required(row, 'icon'),
    attack: optionalNumber(row.attack, 'attack'),
    attackBonus: optionalNumber(row.attack_bonus, 'attack_bonus'),
    critRate: optionalNumber(row.crit_rate, 'crit_rate'),
    critDamage: optionalNumber(row.crit_damage, 'crit_damage'),
    damageBonus: optionalNumber(row.damage_bonus, 'damage_bonus'),
    normalAttackDamage: optionalNumber(row.normal_attack_damage, 'normal_attack_damage'),
    skillDamage: optionalNumber(row.skill_damage, 'skill_damage'),
    power: optionalNumber(row.power, 'power'),
  }))
  const ids = new Set<number>()
  equipment.forEach((item) => {
    if (ids.has(item.id)) throw new Error(`重复 equipment_id: ${item.id}`)
    if (item.type < 1 || item.type > 9) throw new Error(`无效 equipment_type: ${item.type}`)
    ids.add(item.id)
  })
  return equipment
}

export async function loadEquipmentConfig(): Promise<EquipmentConfig[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}config/merge/equipment.csv`)
  if (!response.ok) throw new Error(`无法加载 equipment.csv (${response.status})`)
  return parseEquipmentConfig(await response.text())
}
