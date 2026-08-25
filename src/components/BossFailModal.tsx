import { useGameStore } from '../store/useGameStore'
import styles from './BossFailModal.module.css'

export function BossFailModal() {
  const { state, dismissBossFail } = useGameStore()

  if (!state.showBossFailModal) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon} />
        <h2 className={styles.title}>挑战失败</h2>
        <p className={styles.desc}>Boss 在 30 秒内未被击败。先打小怪积攒金币，准备好后再挑战。</p>
        <button type="button" className={styles.btn} onClick={dismissBossFail}>
          去打小怪
        </button>
      </div>
    </div>
  )
}
