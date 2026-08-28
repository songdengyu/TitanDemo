import { useGameStore } from '../store/useGameStore'
import { EquipmentArt } from './EquipmentArt'
import styles from './SkillsTab.module.css'

export function SkillsTab() {
  const { state, buyEquipment } = useGameStore()
  const skills = state.equipmentCatalog.filter((item) => item.type === 8)

  return (
    <div className={styles.tab}>
      <header className={styles.header}>
        <div><span className={styles.eyebrow}>勇者战技</span><h2>技能秘典</h2></div>
        <div className={styles.books}>◆ <strong>{state.diamonds}</strong></div>
      </header>
      <p className={styles.guide}>技能书仅通过合成订单产出或钻石购买解锁，技能战斗数值暂时沿用现有基础技能。</p>
      <div className={`${styles.list} scroll-touch`}>
        {skills.map((skill) => {
          const quantity = state.ownedEquipment[skill.id] ?? 0
          const owned = quantity > 0
          const canBuy = skill.diamond !== null && state.diamonds >= skill.diamond
          return (
            <article key={skill.id} className={`${styles.skillCard} ${owned ? '' : canBuy ? styles.affordable : styles.locked}`}>
              <EquipmentArt item={skill} size="md" />
              <div className={styles.skillInfo}>
                <div className={styles.skillTitle}><strong>{skill.name}</strong><span>{owned ? `已解锁 ×${quantity}` : '未解锁'}</span></div>
                <p>{skill.description}</p>
                <div className={styles.damage}>{skill.id === 100020001 ? '基础技能' : '技能数值待配置'}</div>
              </div>
              {owned ? <div className={styles.ownedBadge}>已获得</div> : (
                <button
                  type="button"
                  className={`${styles.upgradeBtn} ${canBuy ? styles.canBuy : ''}`}
                  disabled={skill.diamond === null || !canBuy}
                  onClick={() => buyEquipment(skill.id)}
                >
                  <span>{skill.diamond === null ? '仅合成产出' : '钻石购买'}</span>
                  {skill.diamond !== null && <strong>◆ {skill.diamond}</strong>}
                </button>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
