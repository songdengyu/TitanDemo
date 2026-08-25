import { useGameStore } from '../store/useGameStore'
import { MAX_DEPLOYED } from '../data/heroes'
import { getDeployedHeroIds, isHeroDeployed } from '../utils/platformLayout'
import { HeroCard } from './HeroCard'
import styles from './HeroPanel.module.css'

export function HeroPanel() {
  const { state, totalDps, mainHeroDps, deployHero, withdrawHero, upgradeHero } = useGameStore()
  const deployedIds = getDeployedHeroIds(state.deployedSlots)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.dpsLabel}>
          总 DPS: <strong>{Math.floor(totalDps)}</strong>
          <span className={styles.mainDps}>
            （主角 {Math.floor(mainHeroDps)} + 英雄 {Math.floor(totalDps - mainHeroDps)}）
          </span>
        </span>
        <span className={styles.deployCount}>
          ● {state.gold}　上阵 {deployedIds.length}/{MAX_DEPLOYED}
        </span>
      </div>
      <div className={`${styles.list} scroll-touch`}>
        {state.heroes.map((hero) => (
          <HeroCard
            key={hero.id}
            hero={hero}
            deployed={isHeroDeployed(state.deployedSlots, hero.id)}
            onDeploy={() => deployHero(hero.id)}
            onWithdraw={() => withdrawHero(hero.id)}
            onUpgrade={() => upgradeHero(hero.id)}
            gold={state.gold}
          />
        ))}
      </div>
    </div>
  )
}
