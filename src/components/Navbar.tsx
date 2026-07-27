import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS, SITE } from '../data/site'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const ids = ['hero', ...NAV_ITEMS.map((item) => item.id)]
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
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
      <div className="shell flex h-[72px] items-center justify-between">
        <button type="button" onClick={() => scrollTo('hero')} className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--yellow)] text-[17px] font-black text-[var(--ink)] shadow-[inset_0_-2px_0_rgba(23,23,23,0.12)]">
            E
          </span>
          <span className="text-[18px] font-black text-[var(--ink)]">
            {SITE.name}
            <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-[12px] ring-1 ring-black/10">
              {SITE.cn}
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const on = active === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="relative rounded-full px-3.5 py-2 text-[14px] font-extrabold transition"
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
            onClick={() => setOpen((v) => !v)}
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
