import { useGameStore } from '../store/useGameStore'
import { MAX_DEPLOYED } from '../data/heroes'
import { getDeployedHeroIds, isHeroDeployed } from '../utils/platformLayout'
import { EquipmentArt } from './EquipmentArt'
import styles from './HeroPanel.module.css'

export function HeroPanel() {
  const { state, totalDps, mainHeroDps, deployHero, withdrawHero, buyEquipment } = useGameStore()
  const deployedIds = getDeployedHeroIds(state.deployedSlots)
  const companions = state.equipmentCatalog.filter((item) => item.type === 9)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.dpsLabel}>总 DPS: <strong>{Math.floor(totalDps)}</strong><span className={styles.mainDps}>主角 {Math.floor(mainHeroDps)} + 队友 {Math.floor(totalDps - mainHeroDps)}</span></span>
        <span className={styles.deployCount}>◆ {state.diamonds}　上阵 {deployedIds.length}/{MAX_DEPLOYED}</span>
      </div>
      <div className={`${styles.list} scroll-touch`}>
        {companions.map((item, index) => {
          const hero = state.heroes[index]
          if (!hero) return null
          const owned = (state.ownedEquipment[item.id] ?? 0) > 0
          const deployed = isHeroDeployed(state.deployedSlots, hero.id)
          const canBuy = item.diamond !== null && state.diamonds >= item.diamond
          return (
            <article key={item.id} className={`${styles.companion} ${deployed ? styles.deployed : ''} ${!owned ? (canBuy ? styles.affordable : styles.locked) : ''}`}>
              <EquipmentArt item={item} size="md" />
              <div className={styles.companionInfo}>
                <strong>{item.name}</strong><span>{owned ? '已解锁' : '未解锁'}</span>
                <p>{item.description}</p>
              </div>
              <div className={styles.actions}>
                {owned ? (
                  <button type="button" className={deployed ? styles.withdraw : styles.deploy} onClick={() => deployed ? withdrawHero(hero.id) : deployHero(hero.id)}>{deployed ? '下阵' : '上阵'}</button>
                ) : (
                  <button type="button" className={canBuy ? styles.canBuy : ''} disabled={item.diamond === null || !canBuy} onClick={() => buyEquipment(item.id)}>
                    {item.diamond === null ? '仅合成产出' : <>钻石购买<br /><b>◆ {item.diamond}</b></>}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
