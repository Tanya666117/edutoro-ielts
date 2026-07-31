import { CalendarCheck, Check, ClipboardList, MessageCircle, ShieldCheck } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'

interface SupervisionSectionProps {
  onContact: () => void
}

const plans = [
  {
    name: '基础督学',
    price: '¥399 / 14 天起',
    desc: '适合刚开始备考、需要建立每日节奏的同学。',
    items: ['每日打卡提醒', '学习任务检查', '资料使用建议'],
  },
  {
    name: '强化督学',
    price: '¥699 / 30 天起',
    desc: '适合周期紧、需要有人持续盯进度和复盘的同学。',
    items: ['定制周计划', '每日监督打卡', '每周复盘调整', '群内答疑'],
  },
  {
    name: '冲刺督学',
    price: '¥999 / 30 天起',
    desc: '适合考前 4-6 周，需要高密度推进和阶段检查的同学。',
    items: ['考前倒排计划', '阶段模考复盘', '薄弱项专项跟进', '优先答疑'],
  },
]

export function SupervisionSection({ onContact }: SupervisionSectionProps) {
  return (
    <section id="supervision" className="section bg-white">
      <div className="shell">
        <SectionHeader
          eyebrow="督学营"
          title="每天有人盯进度，每周有人帮你复盘"
          description="适合自律性弱、备考周期紧或需要督促的学生。我们会按目标分、考试时间和薄弱科目定制备考方案，持续监督打卡和答疑。"
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: ClipboardList, title: '定制计划', desc: '按目标分和考试日期拆成每天能执行的任务。' },
            { icon: CalendarCheck, title: '每日监督', desc: '打卡、作业、资料使用都会有人跟进。' },
            { icon: ShieldCheck, title: '阶段复盘', desc: '每周看执行情况，及时调整薄弱项。' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-[8px] bg-[var(--bg)] p-5 ring-1 ring-black/10">
              <Icon size={22} className="text-[var(--teal)]" />
              <p className="mt-3 font-black text-[var(--ink)]">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink-2)]">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="card card-lift p-6">
              <p className="text-sm font-black text-[var(--teal)]">{plan.name}</p>
              <h3 className="mt-2 text-3xl font-black text-[var(--ink)]">{plan.price}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">{plan.desc}</p>
              <ul className="mt-5 space-y-3">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm font-bold text-[var(--ink-2)]">
                    <Check size={16} className="mt-0.5 shrink-0 text-[var(--yellow-2)]" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[8px] bg-[var(--charcoal)] p-6 text-white md:p-8">
          <p className="text-xl font-black">不确定选哪档？先做一次免费诊断。</p>
          <p className="mt-2 text-sm leading-relaxed text-white/68">
            把目标分、考试日期、目前模考情况发给客服老师，我们会先判断是否适合督学营，再给你推荐节奏和档位。
          </p>
          <button type="button" onClick={onContact} className="btn btn-yellow mt-5">
            <MessageCircle size={17} />
            免费诊断咨询
          </button>
        </div>
      </div>
    </section>
  )
}
