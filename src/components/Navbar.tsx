import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NAV_ITEMS, SITE, type PageId } from '../data/site'

const LOGO_SRC = `${import.meta.env.BASE_URL}edutoro-logo-transparent.png`
const MENU_ITEMS = [{ id: 'hero', label: '首页' }, ...NAV_ITEMS] as const

interface NavbarProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
  onContact: () => void
}

export function Navbar({ activePage, onNavigate, onContact }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const navigate = (page: PageId) => { setOpen(false); onNavigate(page) }
  const openContact = () => { setOpen(false); onContact() }

  return (
    <header className="nav">
      <div className="shell flex h-[82px] items-center justify-between gap-4">
        <button type="button" onClick={() => navigate('hero')} className="flex items-center gap-3">
          <img src={LOGO_SRC} alt={`${SITE.name} logo`} className="h-14 w-auto object-contain md:h-16" />
          <span className="hidden text-[14px] font-bold text-[var(--ink-3)] md:inline">{SITE.cn}</span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="主导航">
          {MENU_ITEMS.map((item) => {
            const on = activePage === item.id
            return <button key={item.id} type="button" onClick={() => navigate(item.id)} className="rounded-full px-4 py-2 text-[15px] font-extrabold transition" style={{ color: on ? 'var(--ink)' : 'var(--ink-2)', background: on ? '#fff' : 'transparent', boxShadow: on ? 'inset 0 0 0 1px rgba(23,23,23,0.1)' : undefined }}>{item.label}</button>
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" onClick={openContact} className="btn btn-dark hidden !min-h-0 !px-5 !py-2.5 text-[13px] sm:inline-flex">免费诊断咨询</button>
          <button type="button" className="rounded-[8px] bg-white p-2.5 ring-1 ring-black/10 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="菜单" style={{ color: 'var(--ink)' }}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>

      {open && <nav className="border-t bg-white px-5 py-4 lg:hidden" style={{ borderColor: 'rgba(23,23,23,0.08)' }} aria-label="移动端主导航">
        {MENU_ITEMS.map((item) => <button key={item.id} type="button" onClick={() => navigate(item.id)} className="mb-1 block w-full rounded-[8px] px-4 py-3 text-left text-sm font-extrabold" style={{ background: activePage === item.id ? 'var(--yellow-soft)' : 'transparent', color: activePage === item.id ? 'var(--ink)' : 'var(--ink-2)' }}>{item.label}</button>)}
        <button type="button" onClick={openContact} className="btn btn-dark mt-2 w-full">免费诊断咨询</button>
      </nav>}
    </header>
  )
}
