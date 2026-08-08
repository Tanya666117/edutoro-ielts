import { NAV_ITEMS, SITE } from '../data/site'
import type { PageId } from '../data/site'

const LOGO_SRC = `${import.meta.env.BASE_URL}edutoro-logo-transparent.png`

interface FooterProps {
  onNavigate: (page: PageId) => void
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#101010] text-white/55">
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src={LOGO_SRC} alt={`${SITE.name} logo`} className="h-11 w-auto object-contain" />
              <p className="text-[17px] font-black text-white">{SITE.tagline}</p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{SITE.description}</p>
          </div>

          <div>
            <p className="text-xs font-black tracking-wide text-white/80">快速导航</p>
            <ul className="mt-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => onNavigate(item.id)} className="text-sm hover:text-white">{item.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-black tracking-wide text-white/80">说明</p>
            <p className="mt-4 text-sm leading-relaxed">本站内容仅供备考参考，不代表 IELTS 官方。口语题库和高频题目用于学习整理，请以官方考试安排为准。</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Edutoro. All rights reserved.</p>
          <p className="text-white/35">好老师讲方法，真督学陪执行。</p>
        </div>
      </div>
    </footer>
  )
}
