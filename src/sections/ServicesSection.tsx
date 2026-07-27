import { ArrowRight, CalendarCheck, Check, ClipboardList, User, Users } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'

interface ServicesSectionProps {
  onContact: () => void
}

const serviceCards = [
  {
    icon: User,
    label: '1 老师 : 1 学生',
    title: '独立老师一对一',
    desc: '适合目标明确、短板突出或需要高密度反馈的同学。先做入学诊断，再按目标分倒推课表。',
    points: ['口语逐题陪练与发音纠正', '作文逐段批改和表达升级', '听阅题型方法与错题复盘', '可约试听，按需匹配老师'],
    action: '查看老师',
    target: 'teachers',
    dark: false,
  },
  {
    icon: Users,
    label: '1 督学 : N 学生',
    title: '多对一督学营',
    desc: '适合自律不足、备考周期紧或需要社群氛围的同学。每天有人检查进度，周周复盘。',
    points: ['每日打卡和作业检查', '每周学习计划与阶段测试', '群内答疑与考情同步', '冲刺期模考和复盘调整'],
    action: '咨询当期营',
    target: 'contact',
    dark: true,
  },
]

export function ServicesSection({ onContact }: ServicesSectionProps) {
  const scrollTo = (id: string) => {
    if (id === 'contact') {
      onContact()
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="services" className="section scroll-mt-24 bg-white">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <SectionHeader
            eyebrow="课程服务"
            title="不用先买大课，先选适合自己的提分路径"
            description="参考 Superprof 的老师匹配逻辑，也保留雅思机构该有的规划、题库、督学和资料服务。"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: ClipboardList, title: '入学测评', desc: '定位弱项' },
              { icon: CalendarCheck, title: '计划排课', desc: '按目标倒推' },
              { icon: Check, title: '反馈复盘', desc: '课后可执行' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-[8px] bg-[var(--bg)] p-5 ring-1 ring-black/10">
                <Icon size={22} className="text-[var(--teal)]" />
                <p className="mt-3 text-sm font-black">{title}</p>
                <p className="mt-1 text-xs font-bold text-[var(--ink-3)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {serviceCards.map((card) => {
            const Icon = card.icon
            return (
              <article
                key={card.title}
                className={`card card-lift overflow-hidden ${card.dark ? 'bg-[var(--charcoal)] text-white' : ''}`}
                style={card.dark ? { background: 'var(--charcoal)', borderColor: 'var(--charcoal)' } : undefined}
              >
                <div className="p-7 md:p-8">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className={card.dark ? 'text-xs font-black text-[var(--yellow)]' : 'text-xs font-black text-[var(--teal)]'}>
                        {card.label}
                      </p>
                      <h3 className={`mt-2 text-2xl font-black ${card.dark ? 'text-white' : 'text-[var(--ink)]'}`}>
                        {card.title}
                      </h3>
                    </div>
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px]"
                      style={{
                        background: card.dark ? 'var(--yellow)' : 'var(--yellow-soft)',
                        color: 'var(--ink)',
                      }}
                    >
                      <Icon size={23} />
                    </div>
                  </div>

                  <p className={`mt-5 text-[15px] leading-relaxed ${card.dark ? 'text-white/70' : 'text-[var(--ink-2)]'}`}>
                    {card.desc}
                  </p>

                  <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                    {card.points.map((p) => (
                      <li key={p} className={`flex items-start gap-2.5 text-[14px] ${card.dark ? 'text-white/78' : 'text-[var(--ink-2)]'}`}>
                        <Check size={16} className="mt-0.5 shrink-0 text-[var(--yellow-2)]" strokeWidth={3} />
                        {p}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => scrollTo(card.target)}
                    className={`btn mt-8 w-full ${card.dark ? 'btn-yellow' : 'btn-dark'}`}
                  >
                    {card.action}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
