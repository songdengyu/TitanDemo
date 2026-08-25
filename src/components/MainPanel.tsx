import { useGameStore } from '../store/useGameStore'
import { EquipmentTab } from './EquipmentTab'
import { HeroOverlayPanel } from './HeroOverlayPanel'
import { SkillsTab } from './SkillsTab'
import styles from './MainPanel.module.css'

export function MainPanel() {
  const { state } = useGameStore()

  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        {state.activeTab === 'equipment' && <EquipmentTab />}
        {state.activeTab === 'skills' && <SkillsTab />}
        {state.activeTab === 'heroes' && (
          <div className={styles.heroesPlaceholder}>
            <p>点击下方英雄 Tab 管理队伍</p>
          </div>
        )}
      </div>

      {state.showHeroOverlay && <HeroOverlayPanel />}
    </div>
  )
}
