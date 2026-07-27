import { ArrowRight, BookOpen, Check, FileText, Gift, Sparkles, Star } from 'lucide-react'
import { SITE } from '../data/site'

interface HeroProps {
  onContact: () => void
}

const resourceCards = [
  {
    icon: FileText,
    title: 'Z 家阅读思路资料',
    desc: '整理阅读题型方法、定位练习和错题复盘表，作为资料领取入口，不搬运原版内容。',
  },
  {
    icon: Gift,
    title: '虾滑口语素材索引',
    desc: '提供口语话题素材方向、表达清单和练习路径，方便按题库补表达。',
  },
]

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

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            {resourceCards.map(({ icon: Icon, title, desc }) => (
              <button
                key={title}
                type="button"
                onClick={onContact}
                className="card card-lift flex min-h-[148px] flex-col items-start p-5 text-left"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--yellow)] text-[var(--ink)]">
                  <Icon size={20} />
                </span>
                <span className="mt-4 text-lg font-black text-[var(--ink)]">{title}</span>
                <span className="mt-2 text-sm font-semibold leading-relaxed text-[var(--ink-2)]">{desc}</span>
              </button>
            ))}
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {['口语真题题库免费练', '独立老师按价位和需求匹配', '督学营每日跟进'].map((t) => (
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
              免费领取备考资料
              <ArrowRight size={17} />
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
                { value: '42', label: '口语话题' },
                { value: '210+', label: '真题题目' },
                { value: '2', label: '资料包入口' },
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
