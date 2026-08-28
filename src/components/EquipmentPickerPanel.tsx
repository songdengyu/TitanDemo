import type { EquipmentConfig } from '../data/equipmentConfig'
import { useGameStore } from '../store/useGameStore'
import { EquipmentArt } from './EquipmentArt'
import styles from './EquipmentPickerPanel.module.css'

const TYPE_LABELS: Record<number, string> = { 1: '武器', 2: '副武器', 3: '头盔', 4: '衣服', 5: '腰带', 6: '鞋子', 7: '神器' }

function formatValue(value: number | null) {
  if (value === null) return null
  return value > 0 && value < 1 ? `${Math.round(value * 100)}%` : String(value)
}

function statRows(item: EquipmentConfig) {
  return [
    ['攻击', item.attack], ['攻击加成', item.attackBonus], ['暴击率', item.critRate],
    ['暴击伤害', item.critDamage], ['伤害加成', item.damageBonus],
    ['普攻伤害', item.normalAttackDamage], ['技能伤害', item.skillDamage], ['战斗力', item.power],
  ].filter((entry): entry is [string, number] => entry[1] !== null)
}

export function EquipmentPickerPanel() {
  const { state, closeSecondaryView, buyEquipment } = useGameStore()
  const type = state.equipmentPickerType ?? 1
  const items = state.equipmentCatalog.filter((item) => item.type === type)

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <div><h2>{TYPE_LABELS[type]}图鉴</h2><span>◆ {state.diamonds} 钻石</span></div>
          <button type="button" onClick={closeSecondaryView} aria-label="关闭">✕</button>
        </header>
        <div className={`${styles.inventory} scroll-touch`}>
          <div className={styles.grid}>
            {items.map((item) => {
              const quantity = state.ownedEquipment[item.id] ?? 0
              const owned = quantity > 0
              const canBuy = item.diamond !== null && state.diamonds >= item.diamond
              return (
                <article key={item.id} className={`${styles.card} ${owned ? styles.owned : styles.locked}`}>
                  <EquipmentArt item={item} size="lg" />
                  <div className={styles.info}>
                    <div className={styles.title}><strong>{item.name}</strong><span>{owned ? `持有 ×${quantity}` : '未解锁'}</span></div>
                    <p>{item.description}</p>
                    <div className={styles.stats}>{statRows(item).map(([label, value]) => <span key={label}>{label}<b>{formatValue(value)}</b></span>)}</div>
                  </div>
                  {owned ? <div className={styles.ownedBadge}>{item.id === 100010001 ? '基础装备' : '已获得'}</div> : (
                    <button type="button" className={canBuy ? styles.canBuy : ''} disabled={!canBuy} onClick={() => buyEquipment(item.id)}>
                      {item.diamond === null ? '仅合成产出' : <>钻石购买<strong>◆ {item.diamond}</strong></>}
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
