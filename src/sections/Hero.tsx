import { BookOpen, Check, FileText, Headphones, Sparkles, Star } from 'lucide-react'
import { SITE } from '../data/site'

interface HeroProps {
  onNavigate: (page: 'services' | 'teachers' | 'speaking' | 'recalls' | 'contact') => void
  onResource: () => void
}

const resourceModules = [
  {
    icon: FileText,
    title: 'Z 家阅读思路资料',
    desc: '阅读题型方法、定位练习和错题复盘表。',
  },
  {
    icon: Headphones,
    title: '虾家听力本月高频',
    desc: '场景词、题型训练和精听路径整理。',
  },
]

const heroStats = [
  { value: '239+', label: '资料总数' },
  { value: '1000+', label: '教学经验' },
  { value: '10+', label: '督学人数' },
]

export function Hero({ onNavigate, onResource }: HeroProps) {
  return (
    <section id="hero" className="hero">
      <div className="shell grid items-center gap-10 py-14 md:py-18 lg:min-h-[720px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        <div className="fade-up">
          <span className="tag-yellow">
            <Sparkles size={15} style={{ color: 'var(--yellow-2)' }} />
            2026 当季雅思题库与资料入口已更新
          </span>

          <h1 className="mt-7 text-[clamp(2.5rem,5.5vw,4.7rem)] font-black leading-[1.04] text-[var(--ink)]">
            找到适合你的
            <br />
            雅思提分路线
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-[1.85] text-[var(--ink-2)] md:text-[18px]">
            {SITE.description}
          </p>

          <div className="mt-8 max-w-2xl rounded-[8px] bg-white p-5 shadow-[var(--shadow)] ring-1 ring-black/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--teal)]">Resource Pack</p>
                <h3 className="mt-2 text-[24px] font-black leading-tight text-[var(--ink)]">备考资料统一领取入口</h3>
              </div>
              <button type="button" onClick={onResource} className="btn btn-dark shrink-0 !px-5">
                雅思全套资料 →
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {resourceModules.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--yellow)] text-[var(--ink)]">
                    <Icon size={19} />
                  </span>
                  <p className="mt-4 text-[17px] font-black text-[var(--ink)]">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { text: '口语真题题库免费练', target: 'speaking' as const },
              { text: '按价格与需求匹配老师', target: 'teachers' as const },
              { text: '督学营每日跟进', target: 'services' as const, isNew: true },
            ].map((item) => (
              <li key={item.text}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.target)}
                  className="relative flex min-h-11 w-full items-center gap-2 rounded-[8px] bg-white px-3 py-2 text-left text-[14px] font-bold text-[var(--ink-2)] ring-1 ring-black/10"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--yellow)] text-[var(--ink)]">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{item.text}</span>
                  {item.isNew && (
                    <span className="absolute -right-1.5 -top-2 rounded-full bg-[var(--red)] px-2 py-0.5 text-[11px] font-black leading-none text-white shadow-sm">
                      新
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={() => onNavigate('speaking')} className="btn btn-yellow">
              <BookOpen size={18} />
              先练口语题库
            </button>
            <button type="button" onClick={onResource} className="btn btn-outline">
              雅思全套资料 →
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
              {heroStats.map((item, index) => (
                <div key={item.label} className="p-5 md:p-6">
                  <p className="text-[1.45rem] font-black leading-none text-[var(--ink)] sm:text-[1.8rem] md:text-[2.4rem]">{item.value}</p>
                  <p className="mt-2 text-xs font-bold text-[var(--ink-3)] md:text-sm">{item.label}</p>
                  {index === 0 && <p className="mt-2 text-[11px] font-bold text-[var(--ink-3)]">按原统计口径</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
