import { useMemo, useState } from 'react'
import { ArrowRight, BadgeCheck, CircleX, MessageCircle, Sparkles } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import teachersData from '../data/teachers.json'
import type { Teacher } from '../types'

const teachers = teachersData as Teacher[]
const filters = [
  { id: 'all', label: '全部老师' },
  { id: 'writing', label: '写作老师' },
  { id: 'speaking', label: '口语老师' },
] as const
type TeacherFilter = (typeof filters)[number]['id']

interface TeachersSectionProps {
  onContact: () => void
}

const portraitPosition: Record<string, string> = {
  tony: '72% 18%',
  ciara: '73% 18%',
  esme: '73% 18%',
  aliyaa: '73% 18%',
}

function portraitStyle(teacher: Teacher) {
  return {
    backgroundImage: `url(${teacher.image})`,
    backgroundSize: '245%',
    backgroundPosition: portraitPosition[teacher.id] || '72% 18%',
  }
}

export function TeachersSection({ onContact }: TeachersSectionProps) {
  const [filter, setFilter] = useState<TeacherFilter>('all')
  const [selected, setSelected] = useState<Teacher | null>(null)
  const visibleTeachers = useMemo(() => filter === 'all' ? teachers : teachers.filter((teacher) => teacher.subjects.includes(filter)), [filter])

  return (
    <section id="teachers" className="section scroll-mt-24 bg-[var(--bg)]">
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="老师"
            title="找到真正适合你的那位老师"
            description="每位老师都有明确的教学边界和擅长方向。先按科目筛选，再打开资料卡，看看谁的讲法最适合你。"
          />
          <div className="flex shrink-0 items-center gap-1 rounded-[8px] bg-white p-1.5 shadow-[var(--shadow-sm)] ring-1 ring-black/10">
            {filters.map((item) => (
              <button key={item.id} type="button" onClick={() => setFilter(item.id)} className="rounded-[6px] px-3 py-2 text-sm font-black transition sm:px-4" style={{ background: filter === item.id ? 'var(--charcoal)' : 'transparent', color: filter === item.id ? '#fff' : 'var(--ink-2)' }}>{item.label}</button>
            ))}
            <span className="hidden rounded-[6px] bg-[var(--yellow-soft)] px-3 py-2 text-xs font-black text-[var(--ink-2)] md:inline-flex">客返即将上线</span>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {visibleTeachers.map((teacher) => (
            <article key={teacher.id} className="card card-lift overflow-hidden">
              <div className="grid items-stretch lg:grid-cols-[156px_minmax(0,1fr)_210px]">
                <button type="button" onClick={() => setSelected(teacher)} className="relative min-h-[168px] overflow-hidden bg-[var(--charcoal)] lg:min-h-0" aria-label={`查看 ${teacher.name} 老师资料`}>
                  <div className="absolute inset-3 rounded-[6px] bg-white/5" style={portraitStyle(teacher)} aria-hidden="true" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black text-[var(--ink)]">{teacher.focus}</span>
                </button>

                <div className="p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2"><h3 className="text-[25px] font-black leading-tight text-[var(--ink)]">{teacher.name} 老师</h3><BadgeCheck size={19} className="text-[var(--yellow-2)]" /></div>
                      <p className="mt-1.5 text-sm font-black text-[var(--teal)]">{teacher.title}</p>
                    </div>
                    <span className="rounded-full bg-[var(--yellow-soft)] px-3 py-1.5 text-xs font-black text-[var(--ink)]">{teacher.price}</span>
                  </div>
                  <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[var(--ink-2)]">{teacher.strongestFeature}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="pill bg-white text-[var(--ink-2)] ring-1 ring-black/10">{teacher.experience}</span>
                    {teacher.highlights.map((highlight) => <span key={highlight} className="pill bg-[var(--teal-soft)] text-[var(--teal)]">{highlight}</span>)}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3 border-t border-black/8 bg-[var(--bg)] p-5 lg:border-l lg:border-t-0 md:p-6">
                  <div><p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--teal)]">适合这样开始</p><p className="mt-2 text-sm font-bold leading-6 text-[var(--ink-2)]">先做一次试听诊断，再决定是否长期合作。</p></div>
                  <button type="button" onClick={() => setSelected(teacher)} className="btn btn-dark w-full !min-h-0 !px-3 !py-2.5 text-sm">查看资料卡 <ArrowRight size={15} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-[8px] bg-[var(--charcoal)] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div><p className="inline-flex items-center gap-2 text-sm font-black text-[var(--yellow)]"><Sparkles size={16} />还不知道该选谁？</p><p className="mt-2 text-xl font-black">把目标分和考试日期发给顾问，先做一次匹配。</p></div>
          <button type="button" onClick={onContact} className="btn btn-yellow shrink-0"><MessageCircle size={17} />联系顾问</button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-6" onClick={() => setSelected(null)} role="presentation">
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[8px] bg-white p-6 shadow-[var(--shadow)] sm:p-8" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${selected.name} 老师资料`}>
            <button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 rounded-full p-2 text-[var(--ink-3)] hover:bg-[var(--bg)]" aria-label="关闭资料卡"><CircleX size={21} /></button>
            <div className="flex flex-col gap-5 pr-8 sm:flex-row sm:items-center">
              <div className="h-28 w-28 shrink-0 rounded-full bg-[var(--charcoal)] ring-4 ring-[var(--yellow-soft)]" style={portraitStyle(selected)} aria-hidden="true" />
              <div><span className="pill bg-[var(--yellow-soft)] text-[var(--ink)]">{selected.focus}专项</span><h2 className="mt-3 text-3xl font-black text-[var(--ink)]">{selected.name} 老师</h2><p className="mt-1 font-bold text-[var(--teal)]">{selected.title}</p></div>
            </div>
            <p className="mt-6 text-[15px] leading-8 text-[var(--ink-2)]">{selected.bio}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">{selected.detailCards.map((card) => <div key={card.title} className="rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10"><p className="text-sm font-black text-[var(--ink)]">{card.title}</p><p className="mt-1 text-sm leading-7 text-[var(--ink-2)]">{card.body}</p></div>)}</div>
            <div className="mt-6 rounded-[8px] border-l-4 border-[var(--yellow)] bg-[var(--yellow-soft)] p-4"><p className="text-xs font-black text-[var(--ink-3)]">真实案例</p><p className="mt-2 text-lg font-black text-[var(--ink)]">{selected.caseStudy.result}</p><p className="mt-1 text-sm leading-7 text-[var(--ink-2)]">{selected.caseStudy.detail}</p></div>
            <button type="button" onClick={onContact} className="btn btn-dark mt-7 w-full"><MessageCircle size={17} />预约试听</button>
          </div>
        </div>
      )}
    </section>
  )
}
