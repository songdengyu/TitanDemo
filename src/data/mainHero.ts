import type { HeroRole } from './heroes'
import { getWeaponAttack } from './weapons'
import type { Weapon } from './weapons'

export interface MainHero {
  name: string
  level: number
  baseDps: number
  role: HeroRole
}

export const INITIAL_MAIN_HERO: MainHero = {
  name: '勇者',
  level: 1,
  baseDps: 50,
  role: 'champion',
}

export function getMainHeroBaseDps(hero: MainHero): number {
  return hero.baseDps * hero.level
}

export function getMainHeroDps(hero: MainHero, weapon: Weapon): number {
  return getMainHeroBaseDps(hero) + getWeaponAttack(weapon)
}
