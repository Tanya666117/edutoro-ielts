import { ArrowRight, CalendarCheck, Check, ClipboardList, Image, User, Users } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'

interface ServicesSectionProps {
  onContact: () => void
}

const serviceCards = [
  {
    icon: User,
    label: '1 老师 : 1 学生',
    title: '独立老师一对一',
    desc: '适合目标明确、短板突出或需要高密度反馈的学生。先做入学诊断，再按目标分倒推课程安排。',
    points: ['口语逐题陪练与发音纠正', '作文逐段批改和表达升级', '听阅方法与错题复盘', '按价格和需求匹配老师'],
    feedbackTitle: '往期提分和课后反馈',
    feedbackText: '案例会同步更新到网站和资料页，方便先看风格再决定试听。',
    action: '查看老师',
    target: 'teachers',
    accent: 'yellow',
  },
  {
    icon: Users,
    label: '1 督学 : N 学生',
    title: '多对一督学营',
    desc: '适合自律不足、备考周期紧或需要群体氛围的学生。每天有人跟进进度，每周有人复盘。',
    points: ['每日打卡和作业检查', '每周学习计划与阶段测试', '群内答疑与考情同步', '案例与好评持续更新'],
    feedbackTitle: '往期打卡和真实好评',
    feedbackText: '展示打卡截图、阶段反馈和真实评价，先了解执行氛围再报名。',
    action: '咨询督学营',
    target: 'contact',
    accent: 'teal',
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
        <div className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-end">
          <SectionHeader
            eyebrow="课程服务"
            title="先看反馈，再选适合自己的提分路径"
            description="独立老师和督学营都支持先咨询、看往期真实反馈，再决定是否试听或报名。"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: ClipboardList, title: '入学测评', desc: '定位弱项' },
              { icon: CalendarCheck, title: '计划排课', desc: '按目标倒推' },
              { icon: Check, title: '反馈复盘', desc: '课后可执行' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-[8px] bg-[var(--bg)] p-5 ring-1 ring-black/10">
                <Icon size={21} className="text-[var(--teal)]" />
                <p className="mt-3 text-[18px] font-black text-[var(--ink)]">{title}</p>
                <p className="mt-1 text-xs font-bold text-[var(--ink-3)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {serviceCards.map((card) => {
            const Icon = card.icon
            const accentBg = card.accent === 'yellow' ? 'var(--yellow-soft)' : 'var(--teal-soft)'
            const accentColor = card.accent === 'yellow' ? 'var(--ink)' : 'var(--teal)'

            return (
              <article key={card.title} className="card card-lift overflow-hidden">
                <div className="p-7 md:p-8">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-xs font-black text-[var(--teal)]">{card.label}</p>
                      <h3 className="mt-2 text-[2rem] font-black leading-tight text-[var(--ink)]">{card.title}</h3>
                    </div>
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px]"
                      style={{ background: accentBg, color: accentColor }}
                    >
                      <Icon size={23} />
                    </div>
                  </div>

                  <p className="mt-5 text-[15px] leading-relaxed text-[var(--ink-2)]">{card.desc}</p>

                  <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-[14px] text-[var(--ink-2)]">
                        <Check size={16} className="mt-0.5 shrink-0 text-[var(--yellow-2)]" strokeWidth={3} />
                        {point}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-white text-[var(--teal)] ring-1 ring-black/10">
                        <Image size={21} />
                      </span>
                      <div>
                        <p className="text-sm font-black text-[var(--ink)]">{card.feedbackTitle}</p>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--ink-3)]">{card.feedbackText}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={onContact} className="btn btn-outline flex-1">
                        看好评样张
                      </button>
                      <button type="button" onClick={() => scrollTo(card.target)} className="btn btn-dark flex-1">
                        {card.action}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
