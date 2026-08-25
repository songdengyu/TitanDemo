import { useGameStore } from '../store/useGameStore'
import { WeaponIcon } from './WeaponIcon'
import { ArtIcon } from './ArtIcon'
import styles from './EquipmentTab.module.css'

const SYSTEM_ENTRIES = [
  { id: 'relic', label: '遗物' },
  { id: 'prestige', label: '转生' },
  { id: 'shop', label: '商店' },
  { id: 'quest', label: '任务' },
]

export function EquipmentTab() {
  const { equippedWeapon, hasNewWeapons, openWeaponPicker, showAlert } = useGameStore()

  return (
    <div className={styles.tab}>
      <div className={styles.systemRow}>
        {SYSTEM_ENTRIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={styles.systemBtn}
            onClick={() => showAlert(entry.label, `${entry.label}系统暂未开放，敬请期待。`)}
          >
            <ArtIcon sheet="ui" name={entry.id} className={styles.systemIcon} />
            <span>{entry.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.equipButtons}>
        <button type="button" className={styles.equipBtn} onClick={openWeaponPicker}>
          {hasNewWeapons && <span className={styles.redDot} />}
            <WeaponIcon
              weaponId={equippedWeapon.id}
              bulletStyle={equippedWeapon.bulletStyle}
            quality={equippedWeapon.quality}
            size="lg"
          />
          <span className={styles.equipLabel}>武器</span>
          <span className={styles.equipName}>{equippedWeapon.name}</span>
        </button>

        <button type="button" className={`${styles.equipBtn} ${styles.disabled}`} disabled>
          <div className={styles.armorPlaceholder}><ArtIcon sheet="ui" name="armor" /></div>
          <span className={styles.equipLabel}>盔甲</span>
          <span className={styles.comingSoon}>即将开放</span>
        </button>
      </div>
    </div>
  )
}
