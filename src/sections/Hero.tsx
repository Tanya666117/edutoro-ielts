import { ArrowRight, Check, ClipboardCheck, MessageCircle, Sparkles, UsersRound } from 'lucide-react'
import { SITE } from '../data/site'
import type { PageId } from '../data/site'

interface HeroProps {
  onNavigate: (page: PageId) => void
  onResource: () => void
}

const pillars = [
  { icon: UsersRound, label: '老师 1v1', title: '找到适合你的讲法', text: '先试听，再决定；让每一节课都对准你的卡点。', target: 'teachers' as const, tone: 'yellow' },
  { icon: ClipboardCheck, label: '多对一督学', title: '把计划真正做完', text: '每天有任务、有人跟进，周周复盘调整。', target: 'supervision' as const, tone: 'teal' },
]

const teacherPreviews = [
  { name: 'Tony', role: '写作导师', image: '/teachers/tony.png', position: '72% 18%' },
  { name: 'Ciara', role: '口语导师', image: '/teachers/ciara.png', position: '73% 18%' },
]

export function Hero({ onNavigate, onResource }: HeroProps) {
  return (
    <section id="hero" className="hero">
      <div className="shell grid items-center gap-12 py-16 md:py-24 lg:min-h-[760px] lg:grid-cols-[1.04fr_0.96fr] lg:gap-20">
        <div className="fade-up">
          <span className="tag-yellow"><Sparkles size={15} style={{ color: 'var(--yellow-2)' }} />2026 雅思提分服务已更新</span>
          <h1 className="mt-8 max-w-3xl text-[2.8rem] font-black leading-[1.03] text-[var(--ink)] sm:text-[3.8rem] lg:text-[5.3rem]">
            雅思提分，
            <br />
            从选对人开始。
          </h1>
          <p className="mt-7 max-w-2xl text-[19px] font-bold leading-[1.75] text-[var(--ink-2)] md:text-[21px]">{SITE.tagline}</p>
          <p className="mt-4 max-w-xl text-[16px] leading-8 text-[var(--ink-2)]">{SITE.description}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={() => onNavigate('teachers')} className="btn btn-yellow"><UsersRound size={18} />先看老师 <ArrowRight size={16} /></button>
            <button type="button" onClick={() => onNavigate('supervision')} className="btn btn-dark"><ClipboardCheck size={18} />了解督学</button>
          </div>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">{pillars.map(({ icon: Icon, label, title, text, target, tone }) => <button key={target} type="button" onClick={() => onNavigate(target)} className="group rounded-[8px] bg-white p-4 text-left shadow-[var(--shadow-sm)] ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:ring-black/20"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]" style={{ background: tone === 'yellow' ? 'var(--yellow-soft)' : 'var(--teal-soft)', color: tone === 'yellow' ? 'var(--ink)' : 'var(--teal)' }}><Icon size={19} /></span><span><span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--teal)]">{label}</span><span className="mt-1 block text-[17px] font-black leading-snug text-[var(--ink)]">{title}</span><span className="mt-1 block text-sm leading-relaxed text-[var(--ink-2)]">{text}</span></span></div></button>)}</div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-[var(--ink-2)]"><span className="inline-flex items-center gap-2"><Check size={16} className="text-[var(--teal)]" />题库、资料和 AI 工具随手用</span><button type="button" onClick={onResource} className="inline-flex items-center gap-2 text-[var(--teal)] hover:underline"><MessageCircle size={16} />领取备考资料</button></div>
        </div>

        <div className="fade-up relative" style={{ animationDelay: '0.1s' }}>
          <div className="relative overflow-hidden rounded-[8px] bg-[var(--charcoal)] p-6 shadow-[var(--shadow)] md:p-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />
            <p className="relative text-xs font-black uppercase tracking-[0.16em] text-[var(--yellow)]">Mentor-led preparation</p>
            <h2 className="relative mt-3 max-w-md text-3xl font-black leading-tight text-white md:text-4xl">每个目标，都有一套清晰的推进方式。</h2>
            <p className="relative mt-4 max-w-md text-sm leading-7 text-white/65">老师负责把方法讲明白，督学负责让计划发生。你只需要专注今天的下一步。</p>

            <div className="relative mt-8 flex items-end gap-4">
              {teacherPreviews.map((teacher, index) => <button key={teacher.name} type="button" onClick={() => onNavigate('teachers')} className="group text-left"><div className={`relative h-44 w-32 overflow-hidden rounded-[8px] border-2 ${index === 0 ? 'border-[var(--yellow)]' : 'border-white/25'} bg-white shadow-xl md:h-52 md:w-36`}><div className="absolute inset-0 transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${teacher.image})`, backgroundSize: '245%', backgroundPosition: teacher.position }} /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8"><p className="text-base font-black text-white">{teacher.name}</p><p className="mt-0.5 text-[11px] font-bold text-white/75">{teacher.role}</p></div></div></button>)}
              <div className="mb-2 ml-auto max-w-[150px] text-right"><p className="text-4xl font-black text-[var(--yellow)]">4</p><p className="mt-1 text-sm font-bold leading-6 text-white/65">位在岗老师<br />覆盖写作与口语</p><button type="button" onClick={() => onNavigate('teachers')} className="mt-4 inline-flex items-center gap-1 text-sm font-black text-white hover:text-[var(--yellow)]">认识他们 <ArrowRight size={15} /></button></div>
            </div>

            <div className="relative mt-7 grid grid-cols-2 gap-3 border-t border-white/12 pt-5 text-white"><div><p className="text-2xl font-black text-[var(--yellow)]">28 天</p><p className="mt-1 text-xs font-bold text-white/55">督学服务周期</p></div><div><p className="text-2xl font-black text-[var(--yellow)]">1:1</p><p className="mt-1 text-xs font-bold text-white/55">试听匹配机制</p></div></div>
          </div>
        </div>
      </div>
    </section>
  )
}
