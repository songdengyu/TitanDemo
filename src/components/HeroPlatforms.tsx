import { useGameStore } from '../store/useGameStore'
import type { Hero } from '../data/heroes'
import { buildPlatformRows } from '../utils/platformLayout'
import { CharacterAvatar } from './CharacterAvatar'
import styles from './HeroPlatforms.module.css'

function Platform({
  side,
  slots,
}: {
  side: 'left' | 'right'
  slots: (Hero | null)[]
}) {
  const hasHero = slots.some(Boolean)
  if (!hasHero) {
    return <div className={styles.sideEmpty} />
  }

  const ordered =
    side === 'left'
      ? [slots[2], slots[1], slots[0]]
      : [slots[0], slots[1], slots[2]]

  return (
    <div className={side === 'left' ? styles.platformSideLeft : styles.platformSideRight}>
      <div className={styles.platform}>
        <div className={styles.slots}>
          {ordered.map((hero, index) => (
            <div key={index} className={styles.slot}>
              {hero ? (
                <div className={styles.avatarWrap} data-combat-source={hero.id}>
                  <CharacterAvatar role={hero.role} size="sm" />
                </div>
              ) : (
                <div className={styles.slotPlaceholder} />
              )}
            </div>
          ))}
        </div>
        <div className={styles.platformBar}>
          <span className={styles.rune} />
        </div>
      </div>
    </div>
  )
}

export function HeroPlatforms() {
  const { state } = useGameStore()
  const { heroes, deployedSlots } = state

  const rows = buildPlatformRows(heroes, deployedSlots)
  if (rows.length === 0) return null

  return (
    <div className={styles.wrap} data-no-tap-attack>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.rowPair}>
          <Platform side="left" slots={row.left} />
          <div className={styles.centerGap} />
          <Platform side="right" slots={row.right} />
        </div>
      ))}
    </div>
  )
}
