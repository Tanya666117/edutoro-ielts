interface SectionHeaderProps {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
}: SectionHeaderProps) {
  const center = align === 'center'
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="eyebrow" style={light ? { color: 'var(--yellow)' } : undefined}>
        {eyebrow}
      </p>
      <h2 className="heading whitespace-pre-line" style={light ? { color: '#fff' } : undefined}>
        {title}
      </h2>
      {description && (
        <p
          className="lede whitespace-pre-line"
          style={{
            color: light ? 'rgba(255,255,255,0.7)' : undefined,
            marginInline: center ? 'auto' : undefined,
          }}
        >
          {description}
        </p>
      )}
    </div>
  )
}
