import { ArrowRight, CalendarCheck, Check, MessageCircle, Target, UsersRound } from 'lucide-react'

interface SupervisionSectionProps {
  onContact: () => void
  compact?: boolean
}

const plans = [
  { code: 'A', name: '基础监督档', original: '580 元', trial: '480 元', mock: '1 次', speaking: '—', writing: '—' },
  { code: 'B', name: '陪练冲刺档', original: '980 元', trial: '880 元', mock: '1 次', speaking: '4 次', writing: '—' },
  { code: 'C', name: '全科提分档', original: '1180 元', trial: '1080 元', mock: '2 次', speaking: '8 次', writing: '15 篇' },
  { code: 'D', name: '高分冲刺档', original: '1480 元', trial: '1380 元', mock: '2 次', speaking: '8 次', writing: '30 篇' },
]

const serviceSteps = [
  {
    icon: Target,
    code: '01',
    title: '入学诊断',
    subtitle: '了解你的基础，找到提分重点',
    text: '分析目标分、考试时间和当前水平，制定专属备考方向。',
  },
  {
    icon: CalendarCheck,
    code: '02',
    title: '每日计划',
    subtitle: '每天都有明确学习任务',
    text: '根据备考阶段拆解任务，让学习更加高效。',
  },
  {
    icon: MessageCircle,
    code: '03',
    title: '督学答疑',
    subtitle: '陪你完成计划，解决学习难题',
    text: '早中晚跟进进度，及时反馈学习情况。',
  },
  {
    icon: UsersRound,
    code: '04',
    title: '中外教陪练',
    subtitle: '提升技巧，也练真实表达',
    text: '中教强化方法，外教模拟交流场景，提升口语实战能力。',
  },
]

export function SupervisionSection({ onContact, compact = false }: SupervisionSectionProps) {
  return (
    <section id="supervision" className={`${compact ? 'pb-[82px] pt-10 md:pb-[104px] md:pt-14' : 'section'} scroll-mt-24 bg-white`}>
      <div className="shell">
        <div>
          <div>
            <p className="eyebrow">督学</p>
            <h2 className="heading mt-3 lg:whitespace-nowrap">
              <span className="block sm:inline">没有方向？总是拖延？</span>
              <span className="block sm:inline">不知道如何做计划？</span>
            </h2>
            <p className="lede whitespace-pre-line">
              {`很多同学不是不知道怎么学，而是坚持不到最后。\n我们帮你拆目标、排任务、记进度、动态调整，并同步安排中外教陪练。`}
            </p>
          </div>

          <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[0.94fr_1.06fr] lg:gap-8">
            <figure className="flex min-h-[260px] items-center overflow-hidden rounded-[8px] bg-[var(--bg)] p-3 shadow-[0_24px_70px_-42px_rgba(23,23,23,0.34)] ring-1 ring-black/10 sm:min-h-[360px] lg:min-h-[452px]">
              <img src="/supervision/custom-plan-workspace.svg" alt="微信聊天、Excel 表格和 Word 文档组成的定制学习计划页面" className="block h-full w-full object-contain object-center" />
            </figure>

            <div className="grid gap-4 sm:grid-cols-2">
              {serviceSteps.map(({ icon: Icon, code, title, subtitle, text }) => (
                <div key={title} className="min-h-[218px] rounded-[8px] border border-[#eadc9e] bg-[#fff8d9] p-5 shadow-[0_18px_42px_-32px_rgba(23,23,23,0.3)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#fff6cb] hover:shadow-[0_24px_48px_-32px_rgba(23,23,23,0.4)] md:p-6">
                  <div className="flex items-center justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-white text-[var(--teal)] shadow-[0_8px_22px_-18px_rgba(15,143,124,0.7)] ring-1 ring-black/10"><Icon size={21} /></span><span className="text-4xl font-black leading-none text-[#cfc18a] opacity-70">{code}</span></div>
                  <h3 className="mt-5 text-xl font-black text-[#151515]">{title}</h3>
                  <p className="mt-2 text-sm font-black leading-6 text-[#252218]">{subtitle}</p>
                  <p className="mt-3 text-[15px] leading-7 text-[#5b563f]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="eyebrow">28 天方案</p><h2 className="heading mt-3">服务内容和价格，一次看清楚</h2></div><p className="max-w-md text-sm leading-7 text-[var(--ink-2)]">所有档位都包含入学诊断、每日学习计划、每日打卡监督和学习答疑。</p></div>
          <div className="mt-8 overflow-x-auto rounded-[8px] border border-black/10 shadow-[var(--shadow-sm)]"><div className="min-w-[760px]">
            <div className="grid grid-cols-[1.35fr_repeat(4,1fr)] bg-[var(--charcoal)] px-5 py-4 text-sm font-black text-white"><span>服务内容</span>{plans.map((plan) => <span key={plan.code} className="text-center">{plan.code} · {plan.name}</span>)}</div>
            {[
              ['原价（28 天）', ...plans.map((plan) => plan.original)],
              ['首期体验价', ...plans.map((plan) => plan.trial)],
              ['模考分析', ...plans.map((plan) => plan.mock)],
              ['中教 + 外教口语陪练', ...plans.map((plan) => plan.speaking)],
              ['作文精批及点评', ...plans.map((plan) => plan.writing)],
            ].map(([label, ...values], rowIndex) => <div key={label} className={`grid grid-cols-[1.35fr_repeat(4,1fr)] items-center border-t border-black/8 px-5 py-4 text-sm ${rowIndex === 1 ? 'bg-[var(--yellow-soft)] font-black' : 'bg-white'}`}><span className="font-bold text-[var(--ink-2)]">{label}</span>{values.map((value, index) => <span key={`${label}-${index}`} className="text-center font-black text-[var(--ink)]">{value}</span>)}</div>)}
            <div className="grid grid-cols-[1.35fr_repeat(4,1fr)] items-center bg-[var(--bg)] px-5 py-4 text-sm"><span className="font-bold text-[var(--ink-2)]">共同服务</span>{plans.map((plan) => <span key={plan.code} className="flex justify-center text-[var(--teal)]"><Check size={18} strokeWidth={3} /></span>)}</div>
          </div></div>
        </div>

        <div className="mt-16">
          <div className="rounded-[8px] bg-[var(--charcoal)] p-6 text-white md:p-8"><p className="text-xs font-black uppercase tracking-[0.15em] text-[var(--yellow)]">Service promise</p><h2 className="mt-3 text-3xl font-black leading-tight">规则先讲清楚，学习才有安全感。</h2><div className="mt-7 space-y-4">{['购买后 7 天内支持无理由退款。', '特殊情况可申请累计最多 7 天暂停。', '已完成服务按实际完成部分正常结算。', '督学与老师协作，计划会随模考结果动态调整。'].map((item) => <p key={item} className="flex items-start gap-3 text-sm leading-7 text-white/78"><Check size={17} className="mt-1 shrink-0 text-[var(--yellow)]" strokeWidth={3} />{item}</p>)}</div><button type="button" onClick={onContact} className="btn btn-yellow mt-8">询问适合我的档位 <ArrowRight size={16} /></button></div>
        </div>
      </div>
    </section>
  )
}
