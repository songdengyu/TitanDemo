interface ArtIconProps {
  sheet: 'ui' | 'heroes' | 'monsters' | 'weapons'
  name: string
  viewBox?: string
  className?: string
}

export function ArtIcon({ sheet, name, viewBox = '0 0 64 64', className }: ArtIconProps) {
  return (
    <svg viewBox={viewBox} className={className} aria-hidden>
      <use href={`/assets/fantasy-pack/${sheet}.svg#${name}`} />
    </svg>
  )
}
