import { useGameStore } from '../store/useGameStore'
import { EquipmentArt } from './EquipmentArt'
import styles from './EquipmentTab.module.css'

const EQUIPMENT_TYPES = [
  { id: 1, label: '武器' },
  { id: 2, label: '副武器' },
  { id: 3, label: '头盔' },
  { id: 4, label: '衣服' },
  { id: 5, label: '腰带' },
  { id: 6, label: '鞋子' },
  { id: 7, label: '神器' },
]

export function EquipmentTab() {
  const { state, openEquipmentPicker } = useGameStore()

  return (
    <div className={styles.tab}>
      <header className={styles.header}>
        <div><span>勇者装备</span><h2>装备栏</h2></div>
        <div className={styles.diamonds}>◆ <strong>{state.diamonds}</strong></div>
      </header>
      <div className={styles.equipButtons}>
        {EQUIPMENT_TYPES.map((type) => {
          const items = state.equipmentCatalog.filter((item) => item.type === type.id)
          const owned = items.filter((item) => (state.ownedEquipment[item.id] ?? 0) > 0)
          const featured = owned[owned.length - 1] ?? items[0]
          return (
            <button key={type.id} type="button" className={styles.equipBtn} onClick={() => openEquipmentPicker(type.id)}>
              {featured && <EquipmentArt item={featured} size="lg" />}
              <span className={styles.equipLabel}>{type.label}</span>
              <span className={styles.equipName}>{owned.length > 0 ? `已获得 ${owned.length}/${items.length}` : '尚未获得'}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
