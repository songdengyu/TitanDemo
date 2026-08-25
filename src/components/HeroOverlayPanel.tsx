import { useGameStore } from '../store/useGameStore'
import { HeroPanel } from './HeroPanel'
import styles from './HeroOverlayPanel.module.css'

export function HeroOverlayPanel() {
  const { closeHeroOverlay } = useGameStore()

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>英雄管理</h2>
          <button type="button" className={styles.closeBtn} onClick={closeHeroOverlay} aria-label="关闭">
            ✕
          </button>
        </div>
        <HeroPanel />
      </div>
    </div>
  )
}
