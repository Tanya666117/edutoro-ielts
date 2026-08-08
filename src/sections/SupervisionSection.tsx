import { ArrowRight, CalendarCheck, Check, ClipboardCheck, MessageCircle, ShieldCheck, Target } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'

interface SupervisionSectionProps {
  onContact: () => void
}

const plans = [
  { code: 'A', name: '基础监督档', original: '580 元', trial: '480 元', mock: '1 次', speaking: '—', writing: '—', tone: 'bg-[#fff7d3]' },
  { code: 'B', name: '陪练冲刺档', original: '980 元', trial: '880 元', mock: '1 次', speaking: '4 次', writing: '—', tone: 'bg-[#fff1b2]' },
  { code: 'C', name: '全科提分档', original: '1180 元', trial: '1080 元', mock: '2 次', speaking: '8 次', writing: '15 篇', tone: 'bg-[#ffe78a]' },
  { code: 'D', name: '高分冲刺档', original: '1480 元', trial: '1380 元', mock: '2 次', speaking: '8 次', writing: '30 篇', tone: 'bg-[#ffd91a]' },
]

const serviceSteps = [
  { icon: Target, title: '先定目标', text: '结合目标分、考试日期和基础，确定每天最值得投入的任务。' },
  { icon: CalendarCheck, title: '每天推进', text: '打卡、作业和资料使用都有记录，完成情况当天反馈。' },
  { icon: ClipboardCheck, title: '每周复盘', text: '看完成率和模考变化，调整下一周的科目比例与节奏。' },
  { icon: ShieldCheck, title: '全程协作', text: '督学负责计划与推进，听说读写老师负责专业训练。' },
]

export function SupervisionSection({ onContact }: SupervisionSectionProps) {
  return (
    <section id="supervision" className="section scroll-mt-24 bg-white">
      <div className="shell">
        <div className="grid items-start gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <div>
            <SectionHeader
              eyebrow="督学"
              title="不是陪你打卡，而是陪你把目标做完"
              description="督学服务的重点，是把知道该学什么，变成每天真的完成了什么。我们会和各科老师配合，持续调整你的备考方案。"
            />
            <div className="mt-7 rounded-[8px] bg-[var(--charcoal)] p-6 text-white md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[var(--yellow)]">28-day learning management</p>
              <p className="mt-3 text-2xl font-black leading-tight">每天一个可完成动作，28 天看见进度。</p>
              <p className="mt-3 text-sm leading-7 text-white/70">适合自律性较弱、计划总被拖延，或离考试只剩几周的同学。</p>
              <button type="button" onClick={onContact} className="btn btn-yellow mt-6">
                <MessageCircle size={17} />做一次免费诊断
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {serviceSteps.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="rounded-[8px] bg-[var(--bg)] p-5 ring-1 ring-black/10">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-white text-[var(--teal)] ring-1 ring-black/10"><Icon size={21} /></span>
                  <span className="text-4xl font-black leading-none text-black/10">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-black text-[var(--ink)]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">28 天方案</p>
              <h2 className="heading mt-3">把服务内容和价格一次看清楚</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--ink-2)]">所有档位都包含入学诊断、每日专属学习计划、每日打卡监督和无限次学习答疑。</p>
          </div>

          <div className="mt-8 overflow-x-auto rounded-[8px] border border-black/10 shadow-[var(--shadow-sm)]">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.35fr_repeat(4,1fr)] bg-[var(--charcoal)] px-5 py-4 text-sm font-black text-white">
                <span>服务内容</span>
                {plans.map((plan) => <span key={plan.code} className="text-center">{plan.code} · {plan.name}</span>)}
              </div>
              {[
                ['原价（28 天）', ...plans.map((plan) => plan.original)],
                ['首期体验价', ...plans.map((plan) => plan.trial)],
                ['模考分析', ...plans.map((plan) => plan.mock)],
                ['中教 + 外教口语陪练', ...plans.map((plan) => plan.speaking)],
                ['作文精批及点评', ...plans.map((plan) => plan.writing)],
              ].map(([label, ...values], rowIndex) => (
                <div key={label} className={`grid grid-cols-[1.35fr_repeat(4,1fr)] items-center px-5 py-4 text-sm ${rowIndex === 1 ? 'bg-[var(--yellow-soft)] font-black' : 'bg-white'} border-t border-black/8`}>
                  <span className="font-bold text-[var(--ink-2)]">{label}</span>
                  {values.map((value, index) => <span key={`${label}-${index}`} className="text-center font-black text-[var(--ink)]">{value}</span>)}
                </div>
              ))}
              <div className="grid grid-cols-[1.35fr_repeat(4,1fr)] items-center bg-[var(--bg)] px-5 py-4 text-sm">
                <span className="font-bold text-[var(--ink-2)]">共同服务</span>
                {plans.map((plan) => (
                  <span key={plan.code} className="flex justify-center text-[var(--teal)]"><Check size={18} strokeWidth={3} /></span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="overflow-hidden rounded-[8px] bg-[var(--bg)] ring-1 ring-black/10 sm:row-span-2">
              <img src="/supervision/overview.jpg" alt="督学服务介绍" className="h-full w-full object-cover object-top" />
            </figure>
            <figure className="overflow-hidden rounded-[8px] bg-[var(--bg)] ring-1 ring-black/10">
              <img src="/supervision/plans.png" alt="督学定价方案" className="h-full w-full object-cover object-top" />
            </figure>
            <figure className="overflow-hidden rounded-[8px] bg-[var(--bg)] ring-1 ring-black/10">
              <img src="/supervision/policy.jpg" alt="退费与请假规则" className="h-full w-full object-cover object-top" />
            </figure>
          </div>
          <div className="rounded-[8px] bg-[var(--charcoal)] p-6 text-white md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-[var(--yellow)]">Service promise</p>
            <h2 className="mt-3 text-3xl font-black leading-tight">规则先讲清楚，学习才有安全感。</h2>
            <div className="mt-7 space-y-4">
              {[
                '购买后 7 天内支持无理由退款。',
                '特殊情况可申请累计最多 7 天暂停。',
                '已完成服务按实际完成部分正常结算。',
                '督学与老师协作，计划会随模考结果动态调整。',
              ].map((item) => (
                <p key={item} className="flex items-start gap-3 text-sm leading-7 text-white/78"><Check size={17} className="mt-1 shrink-0 text-[var(--yellow)]" strokeWidth={3} />{item}</p>
              ))}
            </div>
            <button type="button" onClick={onContact} className="btn btn-yellow mt-8">
              询问适合我的档位 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
