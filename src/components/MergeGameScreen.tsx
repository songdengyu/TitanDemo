import { useEffect, useMemo, useReducer, useRef, useState, type PointerEvent } from 'react'
import { createMergeGameState, createMergeReducer, canCompleteOrder, isHighestGeneratorOnBoard, WAREHOUSE_EXPANSION_COSTS } from '../data/mergeGame'
import { loadMergeConfig, type MergeConfig } from '../data/mergeConfig'
import { useGameStore } from '../store/useGameStore'
import { CharacterAvatar } from './CharacterAvatar'
import { MergePiece } from './MergePiece'
import styles from './MergeGameScreen.module.css'

const ORDER_ROLES = ['archer', 'mage', 'knight', 'rogue', 'priest', 'sword'] as const

interface DragState {
  source: number
  pointerId: number
  startX: number
  startY: number
  dragging: boolean
}

interface DragVisual {
  source: number
  itemId: number
  x: number
  y: number
  originX: number
  originY: number
  returning: boolean
}

interface WarehouseDragVisual {
  warehouseIndex: number
  itemId: number
  pointerId: number
  x: number
  y: number
}

function MergeGame({ config }: { config: MergeConfig }) {
  const { closeSecondaryView } = useGameStore()
  const reducer = useMemo(() => createMergeReducer(config), [config])
  const [state, dispatch] = useReducer(reducer, config, createMergeGameState)
  const [warehouseOpen, setWarehouseOpen] = useState(false)
  const [warehouseDrag, setWarehouseDrag] = useState<WarehouseDragVisual | null>(null)
  const [dragVisual, setDragVisual] = useState<DragVisual | null>(null)
  const [dragTarget, setDragTarget] = useState<number | null>(null)
  const dragRef = useRef<DragState | null>(null)

  useEffect(() => {
    if (!warehouseDrag) return

    function move(event: globalThis.PointerEvent) {
      if (event.pointerId !== warehouseDrag!.pointerId) return
      event.preventDefault()
      setWarehouseDrag((current) => current ? { ...current, x: event.clientX, y: event.clientY } : current)
    }

    function finish(event: globalThis.PointerEvent) {
      if (event.pointerId !== warehouseDrag!.pointerId) return
      const targetElement = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-cell-index]')
      const parsedIndex = Number(targetElement?.dataset.cellIndex)
      dispatch({
        type: 'PLACE_WAREHOUSE',
        warehouseIndex: warehouseDrag!.warehouseIndex,
        cellIndex: Number.isInteger(parsedIndex) ? parsedIndex : null,
      })
      setWarehouseDrag(null)
      setWarehouseOpen(true)
    }

    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
    }
  }, [warehouseDrag])

  useEffect(() => {
    if (!state.message) return
    const timer = window.setTimeout(() => dispatch({ type: 'CLEAR_MESSAGE' }), 1800)
    return () => window.clearTimeout(timer)
  }, [state.message])

  const selectedItem = state.selectedCell !== null
    ? config.itemById.get(state.board[state.selectedCell]?.itemId ?? -1)
    : state.selectedWarehouse !== null
      ? config.itemById.get(state.warehouse[state.selectedWarehouse] ?? -1)
      : null

  function finishOrder(slot: number) {
    dispatch({ type: 'COMPLETE_ORDER', slot })
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>, index: number) {
    const cell = state.board[index]
    if (cell.lock !== 0 || cell.itemId === null || state.selectedWarehouse !== null) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { source: index, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, dragging: false }
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (!drag.dragging && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 8) {
      const sourceCell = state.board[drag.source]
      const rect = event.currentTarget.getBoundingClientRect()
      drag.dragging = true
      setDragVisual({
        source: drag.source,
        itemId: sourceCell.itemId!,
        x: event.clientX,
        y: event.clientY,
        originX: rect.left + rect.width / 2,
        originY: rect.top + rect.height / 2,
        returning: false,
      })
    } else if (drag.dragging) {
      setDragVisual((current) => current ? { ...current, x: event.clientX, y: event.clientY } : current)
    }

    if (drag.dragging) {
      const targetElement = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-cell-index]')
      const target = Number(targetElement?.dataset.cellIndex)
      setDragTarget(Number.isInteger(target) ? target : null)
    }
  }

  function isValidDrop(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex) return false
    const source = state.board[sourceIndex]
    const target = state.board[targetIndex]
    if (!source || !target || source.lock !== 0 || target.lock === 2 || source.itemId === null) return false
    if (target.lock === 0) return true
    const sourceItem = config.itemById.get(source.itemId)
    return target.lock === 1 && target.itemId === source.itemId && sourceItem?.nextId !== null
  }

  function returnDraggedPiece() {
    setDragTarget(null)
    setDragVisual((current) => current ? {
      ...current,
      x: current.originX,
      y: current.originY,
      returning: true,
    } : current)
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>, index: number) {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag || drag.pointerId !== event.pointerId) return
    if (!drag.dragging) {
      dispatch({ type: 'SELECT_CELL', index })
      return
    }
    const targetElement = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-cell-index]')
    const target = Number(targetElement?.dataset.cellIndex)
    if (Number.isInteger(target) && isValidDrop(drag.source, target)) {
      dispatch({ type: 'MOVE_CELL', from: drag.source, to: target })
      setDragTarget(null)
      setDragVisual(null)
      return
    }
    returnDraggedPiece()
  }

  function onPointerCancel() {
    const wasDragging = dragRef.current?.dragging
    dragRef.current = null
    if (wasDragging) returnDraggedPiece()
  }

  function startWarehouseDrag(event: PointerEvent<HTMLButtonElement>, warehouseIndex: number, itemId: number) {
    event.preventDefault()
    dispatch({ type: 'SELECT_WAREHOUSE', index: warehouseIndex })
    setWarehouseDrag({
      warehouseIndex,
      itemId,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    })
    setWarehouseOpen(false)
  }

  const expansionIndex = (state.warehouseCapacity - 6) / 3
  const expansionCost = WAREHOUSE_EXPANSION_COSTS[expansionIndex]

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>M</span>
          <div><strong>秘境合成</strong><small>MERGE WORKSHOP</small></div>
        </div>
        <div className={styles.currency}><span>●</span>{state.gold}</div>
        <div className={`${styles.currency} ${styles.gems}`}><span>◆</span>{state.gems}</div>
      </header>

      <section className={styles.orders} aria-label="订单">
        {state.activeOrders.map((orderState, slot) => {
          const order = config.orders[orderState.configIndex]
          const ready = canCompleteOrder(state, order)
          return (
            <article
              key={order.id}
              className={`${styles.order} ${orderState.leaving ? styles.orderLeaving : styles.orderEntering}`}
              onAnimationEnd={() => orderState.leaving && dispatch({ type: 'FINISH_ORDER_LEAVE', slot })}
            >
              <CharacterAvatar role={ORDER_ROLES[order.id % ORDER_ROLES.length]} size="sm" />
              <div className={styles.orderNeeds}>
                {order.requirements.map((itemId, requirementIndex) => (
                  <MergePiece key={`${itemId}-${requirementIndex}`} item={config.itemById.get(itemId)!} compact />
                ))}
              </div>
              <button type="button" disabled={!ready || orderState.leaving} onClick={() => finishOrder(slot)}>
                {ready ? '交付' : '收集'}
              </button>
            </article>
          )
        })}
      </section>

      <section className={styles.noticeArea} aria-live="polite">
        {state.message && <div className={styles.message}>{state.message}</div>}
      </section>

      <main className={styles.boardWrap}>
        <div className={styles.board}>
          {state.board.map((cell, index) => {
            const item = cell.itemId !== null ? config.itemById.get(cell.itemId) : null
            const selected = state.selectedCell === index
            const isDragSource = dragVisual?.source === index
            const isDropTarget = dragTarget === index && dragVisual !== null
            const validDropTarget = isDropTarget && isValidDrop(dragVisual.source, index)
            const activeGenerator = item?.itemType === 'generator'
              && isHighestGeneratorOnBoard(state, config, index)
            return (
              <button
                key={index}
                type="button"
                data-cell-index={index}
                className={`${styles.cell} ${styles[`lock${cell.lock}`]} ${selected ? styles.cellSelected : ''} ${activeGenerator ? styles.activeGenerator : ''} ${isDropTarget ? (validDropTarget ? styles.validDrop : styles.invalidDrop) : ''}`}
                onDoubleClick={() => dispatch({ type: 'USE_CELL', index })}
                onPointerDown={(event) => onPointerDown(event, index)}
                onPointerMove={onPointerMove}
                onPointerUp={(event) => onPointerUp(event, index)}
                onPointerCancel={onPointerCancel}
                aria-label={item ? `${item.name} 等级 ${item.level}` : '空格'}
              >
                {cell.lock === 2 && <span className={styles.lockMark}>?</span>}
                {cell.lock === 1 && <span className={styles.chainMark}>⌁</span>}
                <span
                  key={state.spawnedCell === index ? `spawn-${state.animationKey}` : `cell-${index}`}
                  className={`${isDragSource ? styles.dragSourceHidden : styles.cellPiece} ${state.spawnedCell === index ? styles.spawnedPiece : ''}`}
                >
                  {item && (
                    <MergePiece
                      item={item}
                      selected={selected}
                      shaking={selected && state.animationKey > 0}
                    />
                  )}
                </span>
                {activeGenerator && item.openCost !== null && (
                  <span className={styles.generatorCost} aria-label={`消耗 ${item.openCost} 金币`}>
                    <span className={styles.costCoin}>●</span>
                    <span>{item.openCost}</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </main>

      {dragVisual && (
        <div
          className={`${styles.dragPiece} ${dragVisual.returning ? styles.dragReturning : ''}`}
          style={{ left: dragVisual.x, top: dragVisual.y }}
          onTransitionEnd={() => dragVisual.returning && setDragVisual(null)}
        >
          <MergePiece item={config.itemById.get(dragVisual.itemId)!} />
        </div>
      )}

      {warehouseDrag && (
        <div
          className={`${styles.dragPiece} ${styles.warehouseDragPiece}`}
          style={{ left: warehouseDrag.x, top: warehouseDrag.y }}
        >
          <MergePiece item={config.itemById.get(warehouseDrag.itemId)!} />
        </div>
      )}

      <section className={styles.info}>
        <div>
          <span className={styles.infoLabel}>棋子说明</span>
          <strong>{selectedItem ? `${selectedItem.name} · Lv.${selectedItem.level}` : '点击棋子查看说明'}</strong>
          <small>{selectedItem?.description ?? '拖动相同棋子进行合成，半锁棋子需要合成解锁。'}</small>
        </div>
        {state.selectedCell !== null && state.board[state.selectedCell]?.lock === 0 && (
          <button type="button" onClick={() => dispatch({ type: 'STORE_CELL', index: state.selectedCell! })}>存入</button>
        )}
      </section>

      <nav className={styles.footer}>
        <button type="button" onClick={() => setWarehouseOpen(true)}><span>▦</span>仓库 {state.warehouse.length}/{state.warehouseCapacity}</button>
        <button type="button" className={styles.returnBtn} onClick={closeSecondaryView}><span>↩</span>返回战斗</button>
      </nav>

      {warehouseOpen && (
        <div className={styles.warehouseBackdrop} onClick={() => setWarehouseOpen(false)}>
          <section className={styles.warehouse} onClick={(event) => event.stopPropagation()}>
            <header><div><h2>秘境仓库</h2><small>拖动棋子到棋盘已解锁空格取回</small></div><button type="button" onClick={() => setWarehouseOpen(false)}>×</button></header>
            <div className={styles.warehouseGrid}>
              {Array.from({ length: state.warehouseCapacity }, (_, index) => {
                const item = config.itemById.get(state.warehouse[index] ?? -1)
                return (
                  <button
                    key={index}
                    type="button"
                    className={state.selectedWarehouse === index ? styles.warehouseSelected : ''}
                    onPointerDown={(event) => item && startWarehouseDrag(event, index, item.id)}
                  >
                    {item && <MergePiece item={item} compact />}
                  </button>
                )
              })}
            </div>
            <button type="button" className={styles.expandBtn} disabled={expansionCost === undefined} onClick={() => dispatch({ type: 'EXPAND_WAREHOUSE' })}>
              {expansionCost === undefined ? '已达最大容量' : `扩充 3 格 · ◆ ${expansionCost}`}
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

export function MergeGameScreen() {
  const { closeSecondaryView } = useGameStore()
  const [config, setConfig] = useState<MergeConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    loadMergeConfig().then((loaded) => active && setConfig(loaded)).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : '未知配置错误')
    })
    return () => { active = false }
  }, [])

  if (error) {
    return <div className={styles.loading}><h2>合成配置加载失败</h2><p>{error}</p><button type="button" onClick={closeSecondaryView}>返回</button></div>
  }
  if (!config) return <div className={styles.loading}><div className={styles.loader} /><p>正在开启秘境工坊...</p></div>
  return <MergeGame config={config} />
}
