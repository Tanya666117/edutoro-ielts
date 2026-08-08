import { ArrowRight, Check, ClipboardCheck, MessageCircle, Sparkles, UsersRound } from 'lucide-react'
import { SITE } from '../data/site'
import type { PageId } from '../data/site'

interface HeroProps {
  onNavigate: (page: PageId) => void
  onResource: () => void
}

const pillars = [
  {
    icon: UsersRound,
    label: '老师 1v1',
    title: '按科目和卡点匹配老师',
    text: '先试听、再决定，找到真正适合你的讲法。',
    target: 'teachers' as const,
    tone: 'yellow',
  },
  {
    icon: ClipboardCheck,
    label: '多对一督学',
    title: '每天有人盯进度',
    text: '把目标拆成今天能完成的动作，周周复盘。',
    target: 'supervision' as const,
    tone: 'teal',
  },
]

const teacherPreviews = [
  { name: 'Tony', role: '写作', image: '/teachers/tony.png' },
  { name: 'Ciara', role: '口语', image: '/teachers/ciara.png' },
]

export function Hero({ onNavigate, onResource }: HeroProps) {
  return (
    <section id="hero" className="hero">
      <div className="shell grid items-center gap-10 py-14 md:py-20 lg:min-h-[720px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        <div className="fade-up">
          <span className="tag-yellow">
            <Sparkles size={15} style={{ color: 'var(--yellow-2)' }} />
            2026 雅思提分服务已更新
          </span>

          <h1 className="mt-7 max-w-3xl text-[clamp(2.5rem,5.5vw,4.7rem)] font-black leading-[1.05] text-[var(--ink)]">
            好老师讲对方法，
            <br />
            真督学陪你做到。
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-[1.85] text-[var(--ink-2)] md:text-[18px]">
            {SITE.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => onNavigate('teachers')} className="btn btn-yellow">
              <UsersRound size={18} />
              先看老师
              <ArrowRight size={16} />
            </button>
            <button type="button" onClick={() => onNavigate('supervision')} className="btn btn-dark">
              <ClipboardCheck size={18} />
              了解督学
            </button>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {pillars.map(({ icon: Icon, label, title, text, target, tone }) => (
              <button
                key={target}
                type="button"
                onClick={() => onNavigate(target)}
                className="group rounded-[8px] bg-white p-4 text-left shadow-[var(--shadow-sm)] ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:ring-black/20"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]"
                    style={{ background: tone === 'yellow' ? 'var(--yellow-soft)' : 'var(--teal-soft)', color: tone === 'yellow' ? 'var(--ink)' : 'var(--teal)' }}
                  >
                    <Icon size={19} />
                  </span>
                  <span>
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--teal)]">{label}</span>
                    <span className="mt-1 block text-[17px] font-black leading-snug text-[var(--ink)]">{title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-[var(--ink-2)]">{text}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-[var(--ink-2)]">
            <span className="inline-flex items-center gap-2"><Check size={16} className="text-[var(--teal)]" />资料、题库和 AI 工具随手用</span>
            <button type="button" onClick={onResource} className="inline-flex items-center gap-2 text-[var(--teal)] hover:underline">
              <MessageCircle size={16} />领取学习资料
            </button>
          </div>
        </div>

        <div className="fade-up relative" style={{ animationDelay: '0.1s' }}>
          <div className="rounded-[8px] bg-[var(--charcoal)] p-4 shadow-[var(--shadow)] md:p-5">
            <div className="flex items-end justify-between gap-4 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--yellow)]">Meet your tutors</p>
                <h2 className="mt-2 text-2xl font-black leading-tight md:text-3xl">先选对人，再开始练。</h2>
              </div>
              <button type="button" onClick={() => onNavigate('teachers')} className="hidden items-center gap-1 text-sm font-bold text-white/75 hover:text-white sm:inline-flex">
                全部老师 <ArrowRight size={15} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {teacherPreviews.map((teacher) => (
                <button key={teacher.name} type="button" onClick={() => onNavigate('teachers')} className="group relative aspect-[0.74] overflow-hidden rounded-[8px] bg-white text-left">
                  <img src={teacher.image} alt={`${teacher.name} 老师资料卡`} className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent px-4 pb-4 pt-12 text-white">
                    <p className="text-lg font-black">{teacher.name} 老师</p>
                    <p className="mt-1 text-xs font-bold text-white/80">{teacher.role}专项</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x divide-white/15 rounded-[8px] bg-white/8 py-4 text-center text-white">
              <div><p className="text-2xl font-black text-[var(--yellow)]">4</p><p className="mt-1 text-xs font-bold text-white/60">在岗老师</p></div>
              <div><p className="text-2xl font-black text-[var(--yellow)]">28</p><p className="mt-1 text-xs font-bold text-white/60">天督学方案</p></div>
              <div><p className="text-2xl font-black text-[var(--yellow)]">1:1</p><p className="mt-1 text-xs font-bold text-white/60">试听匹配</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
