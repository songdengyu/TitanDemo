import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { QUALITY_COLORS } from '../data/weapons'
import { getHeroAttackInterval, HERO_ATTACK_INTERVAL_SCALE } from '../data/heroes'
import { getDeployedHeroIds } from '../utils/platformLayout'
import { SKILLS, getSkillDamageMultiplier } from '../data/skills'
import { useCombatEffects } from '../hooks/useCombatEffects'
import { useGameStore } from '../store/useGameStore'
import { CombatEffectsLayer } from './CombatEffectsLayer'
import { CharacterAvatar } from './CharacterAvatar'
import { HealthBar } from './HealthBar'
import { HeroPlatforms } from './HeroPlatforms'
import { MonsterSprite } from './MonsterSprite'
import { ArtIcon } from './ArtIcon'
import styles from './CombatView.module.css'

const AUTO_DAMAGE_INTERVAL = 500

interface CoinDrop {
  id: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  delay: number
}

export function CombatView() {
  const {
    state,
    totalDps,
    mainHeroDps,
    equippedWeapon,
    mainFireInterval,
    completeMonsterDeath,
    completeMonsterSpawn,
    toggleAutoBattle,
    attackWithMainHero,
    challengeBoss,
    retreatBoss,
  } = useGameStore()
  const {
    mainHero,
    monster,
    killCount,
    isBoss,
    bossTimer,
    gold,
    goldFlash,
    monsterHit,
    deployedSlots,
    monsterPhase,
    combatGraceRemaining,
    heroes,
  } = state

  const combatActive =
    state.secondaryView === null &&
    !state.showBossFailModal &&
    monsterPhase === 'fighting' &&
    combatGraceRemaining <= 0

  const combatRef = useRef<HTMLDivElement>(null)
  const arenaRef = useRef<HTMLDivElement>(null)
  const monsterRef = useRef<HTMLDivElement>(null)
  const mainHeroRef = useRef<HTMLDivElement>(null)
  const goldRef = useRef<HTMLSpanElement>(null)
  const [coinDrops, setCoinDrops] = useState<CoinDrop[]>([])

  const {
    bullets,
    popups,
    fireBullet,
    showDamage,
    skillEffects,
    showSkillEffect,
    removeBullet,
    removePopup,
    removeSkillEffect,
  } = useCombatEffects()

  useEffect(() => {
    if (!state.goldDropId) return
    const combat = combatRef.current
    const monsterEl = monsterRef.current
    const goldEl = goldRef.current
    if (!combat || !monsterEl || !goldEl) return

    const root = combat.getBoundingClientRect()
    const source = monsterEl.getBoundingClientRect()
    const target = goldEl.getBoundingClientRect()
    const fromX = source.left + source.width / 2 - root.left
    const fromY = source.top + source.height / 2 - root.top
    const toX = target.left + target.width / 2 - root.left
    const toY = target.top + target.height / 2 - root.top
    const count = Math.min(6, Math.max(3, Math.ceil(state.goldDropAmount / 10)))

    setCoinDrops(Array.from({ length: count }, (_, index) => ({
      id: state.goldDropId * 10 + index,
      fromX,
      fromY,
      toX,
      toY,
      delay: index * 70,
    })))

    const timer = setTimeout(() => setCoinDrops([]), 1300)
    return () => clearTimeout(timer)
  }, [state.goldDropAmount, state.goldDropId])

  const getSourceEl = useCallback((sourceId: string) => {
    const arena = arenaRef.current
    if (!arena) return null
    if (sourceId === 'main') return mainHeroRef.current
    return arena.querySelector<HTMLElement>(`[data-combat-source="${sourceId}"]`)
  }, [])

  const shootFrom = useCallback(
    (sourceId: string) => {
      if (!combatActive) return
      const arena = arenaRef.current
      const monsterEl = monsterRef.current
      const sourceEl = getSourceEl(sourceId)
      if (!arena || !monsterEl || !sourceEl) return
      const qualityColor = QUALITY_COLORS[equippedWeapon.quality]
      fireBullet(
        arena,
        sourceEl,
        monsterEl,
        sourceId,
        undefined,
        sourceId === 'main' ? qualityColor : undefined,
      )
    },
    [combatActive, fireBullet, getSourceEl, equippedWeapon],
  )

  const showDamageOnMonster = useCallback(
    (amount: number, isMain: boolean) => {
      if (!combatActive) return
      const arena = arenaRef.current
      const monsterEl = monsterRef.current
      if (!arena || !monsterEl || amount <= 0) return
      showDamage(arena, monsterEl, amount, isMain)
    },
    [combatActive, showDamage],
  )

  const castRandomSkill = useCallback(() => {
    if (!combatActive) return
    const availableSkills = SKILLS.filter((skill) => (state.skillLevels[skill.id] ?? 0) > 0)
    const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)] ?? SKILLS[0]
    const level = state.skillLevels[skill.id] ?? 1
    const multiplier = getSkillDamageMultiplier(skill, level)
    const arena = arenaRef.current
    const monsterEl = monsterRef.current
    if (!arena || !monsterEl) return

    showSkillEffect(arena, monsterEl, skill)
    const result = attackWithMainHero(multiplier, true)
    showDamageOnMonster(result.damage, true)
  }, [attackWithMainHero, combatActive, showDamageOnMonster, showSkillEffect, state.skillLevels])

  useEffect(() => {
    if (!combatActive || !state.autoBattle) return
    const interval = setInterval(castRandomSkill, mainFireInterval)
    return () => clearInterval(interval)
  }, [castRandomSkill, mainFireInterval, combatActive, state.autoBattle])

  const wasCombatActiveRef = useRef(combatActive)
  useEffect(() => {
    if (combatActive && !wasCombatActiveRef.current) {
      if (state.autoBattle) castRandomSkill()
      getDeployedHeroIds(deployedSlots).forEach((id) => shootFrom(id))
    }
    wasCombatActiveRef.current = combatActive
  }, [castRandomSkill, combatActive, deployedSlots, shootFrom, state.autoBattle])

  useEffect(() => {
    if (!combatActive || !deployedSlots.some(Boolean)) return

    const intervals = getDeployedHeroIds(deployedSlots).map((heroId) => {
      const hero = heroes.find((h) => h.id === heroId)
      const ms = hero
        ? hero.attackInterval * HERO_ATTACK_INTERVAL_SCALE
        : getHeroAttackInterval(heroId)
      return setInterval(() => shootFrom(heroId), ms)
    })

    return () => intervals.forEach(clearInterval)
  }, [deployedSlots, shootFrom, combatActive, heroes])

  useEffect(() => {
    if (!combatActive || totalDps <= 0) return

    const interval = setInterval(() => {
      const seconds = AUTO_DAMAGE_INTERVAL / 1000
      const heroDps = totalDps - mainHeroDps
      if (heroDps > 0) {
        showDamageOnMonster(heroDps * seconds, false)
      }
    }, AUTO_DAMAGE_INTERVAL)

    return () => clearInterval(interval)
  }, [totalDps, mainHeroDps, showDamageOnMonster, combatActive, state.autoBattle])

  const handleManualAttack = useCallback(() => {
    if (!combatActive || state.autoBattle) return
    castRandomSkill()
  }, [castRandomSkill, combatActive, state.autoBattle])

  const handleArenaTap = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!combatActive || state.autoBattle) return
      const target = event.target as HTMLElement
      if (target.closest('button')) return
      if (target.closest('[data-no-tap-attack]')) return
      handleManualAttack()
    },
    [combatActive, handleManualAttack, state.autoBattle],
  )


  return (
    <div
      className={`${styles.combat} ${!state.autoBattle && combatActive ? styles.combatTap : ''}`}
      ref={combatRef}
      onClick={handleArenaTap}
    >
      <div className={styles.skyTop} />
      <div className={styles.skyGlow} />
      <div className={styles.mountains} />
      <div className={styles.castle} />
      <div className={styles.ground} />
      <div className={styles.groundTexture} />

      <div className={styles.battleZone}>
        <div className={styles.hud}>
          <HealthBar
            name={monster.name}
            currentHp={monster.currentHp}
            maxHp={monster.maxHp}
            isBoss={isBoss}
            bossTimer={bossTimer}
          />
          <div className={styles.statusRow}>
            {isBoss || state.bossFailed ? (
              <button
                type="button"
                className={styles.bossBtn}
                onClick={isBoss ? retreatBoss : challengeBoss}
              >
                {isBoss ? '暂时撤退' : '挑战 Boss'}
              </button>
            ) : (
              <span className={styles.progress}>{killCount}/10</span>
            )}
            <span className={styles.stage}>第 {state.stage} 关</span>
            <span ref={goldRef} className={`${styles.gold} ${goldFlash ? styles.goldFlash : ''}`}>
              <ArtIcon sheet="ui" name="coin" className={styles.coinIcon} /> {gold}
            </span>
          </div>
        </div>

        <div className={styles.arena} ref={arenaRef}>
          <CombatEffectsLayer
            bullets={bullets}
            popups={popups}
            skillEffects={skillEffects}
            onBulletEnd={removeBullet}
            onPopupEnd={removePopup}
            onSkillEffectEnd={removeSkillEffect}
          />
          <div className={styles.battlefield}>
            <HeroPlatforms />
            <div className={styles.monsterArea}>
              <MonsterSprite
                ref={monsterRef}
                name={monster.name}
                isBoss={isBoss}
                hit={monsterHit}
                phase={monsterPhase}
                onDeathComplete={completeMonsterDeath}
                onSpawnComplete={completeMonsterSpawn}
              />
              <div className={styles.heroRow} data-no-tap-attack>
                <div ref={mainHeroRef} className={styles.heroWrap} data-combat-source="main">
                  <CharacterAvatar role={mainHero.role} size="lg" />
                  <span className={styles.heroDps}>{mainHeroDps} DPS</span>
                </div>
                <button
                  type="button"
                  className={`${styles.autoBattleBtn} ${state.autoBattle ? styles.autoBattleOn : ''}`}
                  onClick={toggleAutoBattle}
                  aria-pressed={state.autoBattle}
                >
                  <span className={styles.autoBattleDot} />
                  <span>自动战斗</span>
                  <strong>{state.autoBattle ? '开' : '关'}</strong>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.coinDropLayer}>
        {coinDrops.map((coin) => {
          const dx = coin.toX - coin.fromX
          const dy = coin.toY - coin.fromY
          return (
            <span
              key={coin.id}
              className={styles.coinDrop}
              style={{
                left: coin.fromX,
                top: coin.fromY,
                '--coin-x': `${dx}px`,
                '--coin-y': `${dy}px`,
                '--coin-mid-x': `${dx * 0.55}px`,
                '--coin-mid-y': `${dy * 0.42 - 36}px`,
                animationDelay: `${coin.delay}ms`,
              } as CSSProperties}
            >
              <ArtIcon sheet="ui" name="coin" />
            </span>
          )
        })}
      </div>
    </div>
  )
}
