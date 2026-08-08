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

export function TeachersSection({ onContact }: TeachersSectionProps) {
  const [filter, setFilter] = useState<TeacherFilter>('all')
  const [selected, setSelected] = useState<Teacher | null>(null)

  const visibleTeachers = useMemo(
    () => (filter === 'all' ? teachers : teachers.filter((teacher) => teacher.subjects.includes(filter))),
    [filter],
  )

  return (
    <section id="teachers" className="section scroll-mt-24 bg-[var(--bg)]">
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="老师"
            title="找到愿意把问题讲透的那位老师"
            description="资料卡里的经历、教学重点和试听说明都放在这里。先按科目筛选，再打开完整资料卡了解风格。"
          />
          <div className="flex shrink-0 items-center gap-3 rounded-[8px] bg-white px-2 py-2 shadow-[var(--shadow-sm)] ring-1 ring-black/10">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className="rounded-[6px] px-3 py-2 text-sm font-black transition sm:px-4"
                style={{
                  background: filter === item.id ? 'var(--charcoal)' : 'transparent',
                  color: filter === item.id ? '#fff' : 'var(--ink-2)',
                }}
              >
                {item.label}
              </button>
            ))}
            <span className="hidden rounded-[6px] bg-[var(--yellow-soft)] px-3 py-2 text-xs font-black text-[var(--ink-2)] md:inline-flex">
              客返即将上线
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {visibleTeachers.map((teacher) => (
            <article key={teacher.id} className="card card-lift overflow-hidden">
              <button type="button" onClick={() => setSelected(teacher)} className="group block w-full text-left">
                <div className="relative aspect-[0.74] overflow-hidden bg-white">
                  <img
                    src={teacher.image}
                    alt={`${teacher.name} 老师资料卡`}
                    className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.025]"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-black text-[var(--ink)] shadow-sm">
                    {teacher.focus}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black text-[var(--ink)]">{teacher.name} 老师</h3>
                      <p className="mt-1 text-sm font-bold text-[var(--teal)]">{teacher.title}</p>
                    </div>
                    <BadgeCheck size={19} className="mt-1 shrink-0 text-[var(--yellow-2)]" />
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[var(--ink-2)]">{teacher.strongestFeature}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {teacher.highlights.slice(0, 2).map((highlight) => (
                      <span key={highlight} className="rounded-full bg-[var(--bg)] px-2.5 py-1 text-[11px] font-black text-[var(--ink-2)]">
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-black text-[var(--teal)]">
                    查看完整资料卡 <ArrowRight size={15} />
                  </span>
                </div>
              </button>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-[8px] bg-[var(--charcoal)] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black text-[var(--yellow)]"><Sparkles size={16} />还不知道该选谁？</p>
            <p className="mt-2 text-xl font-black">把目标分和考试日期发给顾问，先做一次匹配。</p>
          </div>
          <button type="button" onClick={onContact} className="btn btn-yellow shrink-0">
            <MessageCircle size={17} />联系顾问
          </button>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-6"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div
            className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[8px] bg-white shadow-[var(--shadow)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.name} 老师资料`}
          >
            <button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[var(--ink)] shadow-sm" aria-label="关闭资料卡">
              <CircleX size={21} />
            </button>
            <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <div className="bg-[var(--charcoal)] p-3 sm:p-5">
                <img src={selected.image} alt={`${selected.name} 老师完整资料卡`} className="w-full rounded-[6px]" />
              </div>
              <div className="p-6 sm:p-8">
                <span className="pill bg-[var(--yellow-soft)] text-[var(--ink)]">{selected.focus}专项</span>
                <h2 className="mt-4 text-3xl font-black text-[var(--ink)]">{selected.name} 老师</h2>
                <p className="mt-2 font-bold text-[var(--teal)]">{selected.title}</p>
                <p className="mt-5 text-[15px] leading-8 text-[var(--ink-2)]">{selected.bio}</p>
                <div className="mt-6 grid gap-3">
                  {selected.detailCards.map((card) => (
                    <div key={card.title} className="rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10">
                      <p className="text-sm font-black text-[var(--ink)]">{card.title}</p>
                      <p className="mt-1 text-sm leading-7 text-[var(--ink-2)]">{card.body}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-[8px] border-l-4 border-[var(--yellow)] bg-[var(--yellow-soft)] p-4">
                  <p className="text-xs font-black text-[var(--ink-3)]">真实案例</p>
                  <p className="mt-2 text-lg font-black text-[var(--ink)]">{selected.caseStudy.result}</p>
                  <p className="mt-1 text-sm leading-7 text-[var(--ink-2)]">{selected.caseStudy.detail}</p>
                </div>
                <button type="button" onClick={onContact} className="btn btn-dark mt-7 w-full">
                  <MessageCircle size={17} />预约试听
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
