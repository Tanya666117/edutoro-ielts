import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS, SITE } from '../data/site'

const LOGO_SRC = `${import.meta.env.BASE_URL}edutoro-logo.jpg`

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const ids = ['hero', ...NAV_ITEMS.map((item) => item.id)]
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActive(visible.target.id)
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.25] },
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="nav">
      <div className="shell flex h-[82px] items-center justify-between gap-4">
        <button type="button" onClick={() => scrollTo('hero')} className="flex items-center gap-3">
          <img
            src={LOGO_SRC}
            alt={`${SITE.name} logo`}
            className="h-11 w-auto rounded-[10px] bg-white object-contain px-2 py-1 ring-1 ring-black/10"
          />
          <span className="hidden text-[14px] font-bold text-[var(--ink-3)] md:inline">{SITE.cn}</span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const on = active === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="rounded-full px-4 py-2 text-[15px] font-extrabold transition"
                style={{
                  color: on ? 'var(--ink)' : 'var(--ink-2)',
                  background: on ? '#fff' : 'transparent',
                  boxShadow: on ? 'inset 0 0 0 1px rgba(23,23,23,0.1)' : undefined,
                }}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollTo('contact')}
            className="btn btn-dark hidden !min-h-0 !px-5 !py-2.5 text-[13px] sm:inline-flex"
          >
            免费诊断
          </button>
          <button
            type="button"
            className="rounded-[8px] bg-white p-2.5 ring-1 ring-black/10 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="菜单"
            style={{ color: 'var(--ink)' }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t bg-white px-5 py-4 lg:hidden" style={{ borderColor: 'rgba(23,23,23,0.08)' }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className="mb-1 block w-full rounded-[8px] px-4 py-3 text-left text-sm font-extrabold"
              style={{
                background: active === item.id ? 'var(--yellow-soft)' : 'transparent',
                color: active === item.id ? 'var(--ink)' : 'var(--ink-2)',
              }}
            >
              {item.label}
            </button>
          ))}
          <button type="button" onClick={() => scrollTo('contact')} className="btn btn-dark mt-2 w-full">
            免费诊断
          </button>
        </nav>
      )}
    </header>
  )
}
