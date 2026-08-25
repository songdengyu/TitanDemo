import { useState, type CSSProperties } from 'react'
import {
  SKILLS,
  getSkillDamageMultiplier,
  getSkillUpgradeCost,
  type SkillDefinition,
} from '../data/skills'
import { useGameStore } from '../store/useGameStore'
import styles from './SkillsTab.module.css'

export function SkillsTab() {
  const { state, mainHeroDps, upgradeSkill } = useGameStore()
  const [selected, setSelected] = useState<SkillDefinition | null>(null)

  return (
    <div className={styles.tab}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>勇者战技</span>
          <h2>技能秘典</h2>
        </div>
        <div className={styles.books}><span>●</span><strong>{state.gold}</strong> 金币</div>
      </header>

      <p className={styles.guide}>点击或自动攻击时，会从所有已解锁技能中随机释放。技能使用金币解锁和升级。</p>

      <div className={`${styles.list} scroll-touch`}>
        {SKILLS.map((skill) => {
          const level = state.skillLevels[skill.id] ?? 0
          const prerequisiteLevel = skill.prerequisiteId
            ? state.skillLevels[skill.prerequisiteId] ?? 0
            : 0
          const prerequisite = SKILLS.find((item) => item.id === skill.prerequisiteId)
          const meetsStage = state.stage >= skill.unlockStage
          const meetsPrerequisite = !skill.prerequisiteId || prerequisiteLevel >= (skill.prerequisiteLevel ?? 1)
          const canUnlock = meetsStage && meetsPrerequisite
          const cost = getSkillUpgradeCost(level)
          const canAfford = state.gold >= cost
          const isMax = level >= skill.maxLevel
          const displayLevel = Math.max(1, level)
          const multiplier = getSkillDamageMultiplier(skill, displayLevel)
          const style = { '--skill-color': skill.color, '--skill-accent': skill.accent } as CSSProperties

          return (
            <article
              key={skill.id}
              className={`${styles.skillCard} ${level === 0 ? styles.locked : ''} ${level === 0 && canUnlock && canAfford ? styles.affordable : ''}`}
              style={style}
              onClick={() => setSelected(skill)}
            >
              <SkillIcon skill={skill} className={styles.skillIcon} />
              <div className={styles.skillInfo}>
                <div className={styles.skillTitle}>
                  <strong>{skill.name}</strong>
                  <span>{level > 0 ? `Lv.${level}` : '未解锁'}</span>
                </div>
                <p>{skill.description}</p>
                <div className={styles.damage}>伤害 {Math.round(mainHeroDps * multiplier)} <span>{multiplier.toFixed(2)}x</span></div>
                {!canUnlock && (
                  <div className={styles.requirement}>
                    {!meetsStage && `到达第 ${skill.unlockStage} 关`}
                    {!meetsStage && !meetsPrerequisite && ' · '}
                    {!meetsPrerequisite && `${prerequisite?.name} Lv.${skill.prerequisiteLevel}`}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={`${styles.upgradeBtn} ${level === 0 && canUnlock && canAfford ? styles.unlockReady : ''}`}
                disabled={!canUnlock || !canAfford || isMax}
                onClick={(event) => {
                  event.stopPropagation()
                  upgradeSkill(skill.id)
                }}
              >
                {canAfford && canUnlock && !isMax && <i />}
                <span>{isMax ? '满级' : level === 0 ? '解锁' : '升级'}</span>
                {!isMax && <strong>● {cost}</strong>}
              </button>
            </article>
          )
        })}
      </div>

      {selected && (
        <div className={styles.detailOverlay} onClick={() => setSelected(null)}>
          <div className={styles.detail} onClick={(event) => event.stopPropagation()}>
            <button type="button" className={styles.closeBtn} onClick={() => setSelected(null)}>×</button>
            <SkillIcon skill={selected} className={styles.detailIcon} />
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <div className={styles.detailStats}>
              <span>当前等级<b>Lv.{state.skillLevels[selected.id] ?? 0}</b></span>
              <span>最高等级<b>Lv.{selected.maxLevel}</b></span>
              <span>基础倍率<b>{selected.baseMultiplier.toFixed(2)}x</b></span>
              <span>每级成长<b>+{selected.levelMultiplier.toFixed(2)}x</b></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SkillIcon({ skill, className }: { skill: SkillDefinition; className: string }) {
  return (
    <div
      className={`${className} ${styles[`icon_${skill.shape}`]}`}
      style={{ '--skill-color': skill.color, '--skill-accent': skill.accent } as CSSProperties}
    >
      <span />
    </div>
  )
}
