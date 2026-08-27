import type { MergeItemConfig } from '../data/mergeConfig'
import styles from './MergePiece.module.css'

const CHAIN_SYMBOLS: Record<number, string> = {
  1: '▣',
  2: '◆',
  3: '⌂',
  4: '†',
  5: '⬟',
  6: '♦',
  7: '✦',
  8: '●',
}

interface MergePieceProps {
  item: MergeItemConfig
  selected?: boolean
  shaking?: boolean
  compact?: boolean
}

export function MergePiece({ item, selected = false, shaking = false, compact = false }: MergePieceProps) {
  return (
    <span
      className={`${styles.piece} ${styles[`chain${item.chain}`]} ${styles[item.itemType]} ${selected ? styles.selected : ''} ${shaking ? styles.shaking : ''} ${compact ? styles.compact : ''}`}
      title={`${item.name} Lv.${item.level}`}
    >
      {item.itemType === 'generator' ? (
        <span className={styles.questionMark} aria-hidden>?</span>
      ) : (
        <span className={styles.symbol}>{CHAIN_SYMBOLS[item.chain] ?? '◆'}</span>
      )}
      <span className={styles.level}>{item.level}</span>
    </span>
  )
}
