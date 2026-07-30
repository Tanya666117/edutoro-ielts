import { ArrowRight, Check, Image, User, Users } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import type { PageId } from '../data/site'

interface ServicesSectionProps {
  onContact: () => void
  onNavigate: (page: PageId) => void
}

const serviceCards = [
  {
    icon: User,
    title: '独立老师一对一',
    desc: '可选择不同风格价位的老师，适合短期提分、目标明确或缺乏方法论的学生。',
    points: ['口语逐题陪练与发音纠正', '作文逐段批改和表达升级', '听阅方法与错题复盘', '按价格和需求匹配老师'],
    feedbackTitle: '往期提分和课后反馈',
    feedbackText: '案例会同步更新到网站和资料页，方便先看风格再决定试听。',
    action: '查看老师',
    target: 'teachers',
    accent: 'yellow',
  },
  {
    icon: Users,
    title: '多对一督学营',
    desc: '适合自律性弱、备考周期紧或需要督促的学生。提供个性化定制备考方案、每日监督打卡和答疑服务。',
    points: ['每日打卡和作业检查', '每周学习计划与阶段测试', '群内答疑与考情同步', '案例与好评持续更新'],
    feedbackTitle: '往期打卡和真实好评',
    feedbackText: '展示打卡截图、阶段反馈和真实评价，先了解执行氛围再报名。',
    action: '咨询督学营',
    target: 'contact',
    accent: 'teal',
  },
]

export function ServicesSection({ onContact, onNavigate }: ServicesSectionProps) {
  const goTo = (id: string) => {
    if (id === 'contact') {
      onContact()
      return
    }
    onNavigate(id as PageId)
  }

  return (
    <section id="services" className="section scroll-mt-24 bg-white">
      <div className="shell">
        <div>
          <SectionHeader
            eyebrow="课程服务"
            title="先看反馈，再选适合自己的提分路径"
            description="先咨询，看真实案例；再试听，匹配适合你的专属老师。"
          />
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
                      <button type="button" onClick={() => onNavigate('cases')} className="btn btn-outline flex-1">
                        看真实案例
                      </button>
                      <button type="button" onClick={() => goTo(card.target)} className="btn btn-dark flex-1">
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
