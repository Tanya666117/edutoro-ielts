import { ArrowRight, BookOpen, Check, Search, Sparkles, Star } from 'lucide-react'
import { SITE } from '../data/site'

interface HeroProps {
  onContact: () => void
}

const quickFilters = ['口语 6.5+', '写作批改', '机考冲刺', '1 对 1 老师']

export function Hero({ onContact }: HeroProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="hero">
      <div className="shell grid items-center gap-12 py-16 md:py-20 lg:min-h-[720px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        <div className="fade-up">
          <span className="tag-yellow">
            <Sparkles size={15} style={{ color: 'var(--yellow-2)' }} />
            2026 当季雅思口语题库已更新
          </span>

          <h1 className="mt-7 text-[clamp(2.5rem,5.6vw,4.9rem)] font-black leading-[1.04] tracking-[0] text-[var(--ink)]">
            找到适合你的
            <br />
            雅思提分路线
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-[1.85] text-[var(--ink-2)] md:text-[18px]">
            {SITE.description}
          </p>

          <div className="mt-8 max-w-2xl rounded-[8px] bg-white p-3 shadow-[var(--shadow)] ring-1 ring-black/10">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="flex min-h-[56px] items-center gap-3 rounded-[6px] bg-[var(--bg)] px-4">
                <Search size={20} className="shrink-0 text-[var(--ink-3)]" />
                <input
                  aria-label="搜索课程或老师"
                  className="w-full bg-transparent text-[15px] font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]"
                  placeholder="搜口语、写作、目标分或备考周期"
                />
              </label>
              <button type="button" onClick={() => scrollTo('teachers')} className="btn btn-dark min-w-[148px]">
                找老师
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => scrollTo(filter.includes('老师') ? 'teachers' : 'services')}
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-extrabold text-[var(--ink-2)] transition hover:border-black/25"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {['真题题库免费练', '独立老师按需匹配', '督学营每日跟进'].map((t) => (
              <li key={t} className="flex items-center gap-2 text-[14px] font-bold text-[var(--ink-2)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--yellow)] text-[var(--ink)]">
                  <Check size={12} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={() => scrollTo('speaking')} className="btn btn-yellow">
              <BookOpen size={18} />
              先练口语题库
            </button>
            <button type="button" onClick={onContact} className="btn btn-outline">
              领取备考资料
            </button>
          </div>
        </div>

        <div className="fade-up relative" style={{ animationDelay: '0.1s' }}>
          <div className="overflow-hidden rounded-[8px] bg-white shadow-[var(--shadow)] ring-1 ring-black/10">
            <div className="relative h-[360px] overflow-hidden md:h-[420px]">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1100&q=80"
                alt="学生在课堂中讨论备考内容"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="inline-flex items-center gap-1 rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-black text-[var(--ink)]">
                  <Star size={13} fill="currentColor" />
                  Band 7.5+ 学习路径
                </div>
                <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">从测评到上课，每一步都清楚</h2>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-black/10">
              {[
                { value: '23', label: '口语话题' },
                { value: '118+', label: '真题示范' },
                { value: '5', label: '独立老师' },
              ].map((s) => (
                <div key={s.label} className="p-5">
                  <p className="text-3xl font-black leading-none text-[var(--ink)]">{s.value}</p>
                  <p className="mt-2 text-xs font-bold text-[var(--ink-3)]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
