import { NAV_ITEMS, SITE } from '../data/site'

export function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#101010] text-white/55">
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[var(--yellow)] text-sm font-black text-[var(--ink)]">
                E
              </span>
              <p className="text-[17px] font-black text-white">
                {SITE.name}
                <span className="ml-1 text-[var(--yellow)]">{SITE.cn}</span>
              </p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{SITE.description}</p>
          </div>

          <div>
            <p className="text-xs font-black tracking-wide text-white/80">导航</p>
            <ul className="mt-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => scrollTo(item.id)} className="text-sm hover:text-white">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-black tracking-wide text-white/80">免责声明</p>
            <p className="mt-4 text-sm leading-relaxed">
              本站内容仅供备考参考，与 IELTS 官方无隶属关系。考点回忆来自考生整理，请以官方考试安排为准。
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Edutoro. All rights reserved.</p>
          <p className="text-white/35">做高效雅思备考工具，让提分路径更清楚</p>
        </div>
      </div>
    </footer>
  )
}
