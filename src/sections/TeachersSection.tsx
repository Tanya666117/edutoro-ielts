import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BadgeCheck, CircleX, MessageCircle, Sparkles } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import teachersData from '../data/teachers.json'
import type { Teacher, TeacherSubjectProfile } from '../types'

const teachers = teachersData as Teacher[]
const filters = [
  { id: 'all', label: '全部老师' },
  { id: 'writing', label: '写作老师' },
  { id: 'speaking', label: '口语老师' },
] as const
type TeacherFilter = (typeof filters)[number]['id']
type TeacherView = {
  teacher: Teacher
  profile?: TeacherSubjectProfile
}

interface TeachersSectionProps {
  onContact: () => void
  initialTeacherId?: string | null
  onInitialTeacherHandled?: () => void
}

const portraitPosition: Record<string, string> = {
  tony: '50% 42%',
  ciara: '50% 28%',
  esme: '50% 42%',
  aliyaa: '64% 30%',
}

const feedbackImageCounts: Record<string, number> = {
  'tony-speaking': 17,
  'ciara-writing': 10,
  'ciara-speaking': 5,
  'esme-speaking': 6,
  'aliyaa-speaking': 4,
}

const allTeacherOrder: Record<string, number> = {
  tony: 1,
  ciara: 2,
  esme: 3,
  aliyaa: 4,
}

const combinedTeacherTitles: Record<string, string> = {
  tony: '雅思口语 / 写作高分突破导师',
  ciara: '雅思口语 / 写作高分精修导师',
}

const getSubjectProfile = (teacher: Teacher, subject: Exclude<TeacherFilter, 'all'>) =>
  teacher.subjectProfiles?.find((profile) => profile.subject === subject)

const isCombinedView = ({ teacher, profile }: TeacherView) =>
  !profile && teacher.subjects.includes('writing') && teacher.subjects.includes('speaking')

const getTeacherTitle = (view: TeacherView) =>
  isCombinedView(view) ? combinedTeacherTitles[view.teacher.id] ?? view.teacher.title : view.profile?.title ?? view.teacher.title

const getTeacherFocus = (view: TeacherView) =>
  isCombinedView(view) ? '口语 / 写作' : view.profile?.focus ?? view.teacher.focus

const getTeacherPrice = (view: TeacherView) => {
  if (!isCombinedView(view)) return view.profile?.price ?? view.teacher.price

  const prices = view.teacher.subjectProfiles?.map((profile) => profile.price) ?? [view.teacher.price]
  return Array.from(new Set(prices)).join(' / ')
}

const getFeedbackImages = ({ teacher, profile }: TeacherView) => {
  if (!profile && teacher.subjects.includes('writing') && teacher.subjects.includes('speaking')) {
    return ['speaking', 'writing'].flatMap((subject) => {
      const group = `${teacher.id}-${subject}`
      const count = feedbackImageCounts[group] ?? 0

      return Array.from({ length: count }, (_, index) => {
        const fileNumber = String(index + 1).padStart(2, '0')
        return `/teacher-feedback/${group}/${fileNumber}.jpg`
      })
    })
  }

  const subject = profile?.subject ?? (teacher.subjects.includes('speaking') ? 'speaking' : 'writing')
  const group = `${teacher.id}-${subject}`
  const count = feedbackImageCounts[group] ?? 0

  return Array.from({ length: count }, (_, index) => {
    const fileNumber = String(index + 1).padStart(2, '0')
    return `/teacher-feedback/${group}/${fileNumber}.jpg`
  })
}

export function TeachersSection({ onContact, initialTeacherId, onInitialTeacherHandled }: TeachersSectionProps) {
  const [filter, setFilter] = useState<TeacherFilter>('all')
  const [selected, setSelected] = useState<TeacherView | null>(null)
  const [caseSelected, setCaseSelected] = useState<TeacherView | null>(null)
  const visibleTeachers = useMemo<TeacherView[]>(() => {
    if (filter === 'all') {
      return teachers
        .map((teacher) => ({ teacher }))
        .sort((a, b) => (allTeacherOrder[a.teacher.id] ?? 99) - (allTeacherOrder[b.teacher.id] ?? 99))
    }

    return teachers
      .filter((teacher) => teacher.subjects.includes(filter))
      .map((teacher) => ({ teacher, profile: getSubjectProfile(teacher, filter) }))
      .sort((a, b) => (a.profile?.sortOrder ?? 99) - (b.profile?.sortOrder ?? 99))
  }, [filter])
  const selectedFeedbackImages = caseSelected ? getFeedbackImages(caseSelected) : []

  useEffect(() => {
    if (!initialTeacherId) return

    const teacher = teachers.find((item) => item.id === initialTeacherId)
    if (teacher) {
      setFilter('all')
      setSelected({ teacher })
    }
    onInitialTeacherHandled?.()
  }, [initialTeacherId, onInitialTeacherHandled])

  return (
    <section id="teachers" className="section scroll-mt-24 bg-[var(--bg)]">
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="老师"
            title="找到适合你的那位老师"
            description={`每位老师都有自己的教学风格和独特方法。\n先了解老师的背景和案例，再选择试听，每一次上课，你都会有新的收获！`}
          />
          <div className="flex shrink-0 items-center gap-1 rounded-[8px] bg-white p-1.5 shadow-[var(--shadow-sm)] ring-1 ring-black/10">
            {filters.map((item) => (
              <button key={item.id} type="button" onClick={() => setFilter(item.id)} className="rounded-[6px] px-3 py-2 text-sm font-black transition sm:px-4" style={{ background: filter === item.id ? 'var(--charcoal)' : 'transparent', color: filter === item.id ? '#fff' : 'var(--ink-2)' }}>{item.label}</button>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {visibleTeachers.map(({ teacher, profile }) => (
            <article key={`${teacher.id}-${profile?.subject ?? 'all'}`} className="card card-lift overflow-hidden">
              <div className="grid items-stretch lg:grid-cols-[156px_minmax(0,1fr)_240px]">
                <div className="flex min-h-[152px] items-center justify-center bg-[var(--bg)] p-5 lg:min-h-0">
                  <button type="button" onClick={() => setSelected({ teacher, profile })} className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-white shadow-[var(--shadow-sm)] ring-4 ring-white transition hover:ring-[var(--yellow)]" aria-label={`查看 ${teacher.name} 老师资料`}>
                    <img src={teacher.image} alt={`${teacher.name} 老师头像`} className="h-full w-full object-cover" style={{ objectPosition: portraitPosition[teacher.id] || '50% 35%' }} />
                  </button>
                </div>

                <div className="p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2"><h3 className="text-[25px] font-black leading-tight text-[var(--ink)]">{teacher.name} 老师</h3><BadgeCheck size={19} className="text-[var(--yellow-2)]" /></div>
                      <p className="mt-1.5 text-sm font-black text-[var(--teal)]">{getTeacherTitle({ teacher, profile })}</p>
                    </div>
                    <span className="rounded-full bg-[var(--yellow-soft)] px-3 py-1.5 text-xs font-black text-[var(--ink)]">{getTeacherPrice({ teacher, profile })}</span>
                  </div>
                  <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[var(--ink-2)]">{teacher.strongestFeature}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="pill bg-white text-[var(--ink-2)] ring-1 ring-black/10">{teacher.experience}</span>
                    {teacher.highlights.map((highlight) => <span key={highlight} className="pill bg-[var(--teal-soft)] text-[var(--teal)]">{highlight}</span>)}
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-3 border-t border-black/8 bg-[var(--bg)] p-5 lg:border-l lg:border-t-0 md:p-6">
                  <button type="button" onClick={() => setCaseSelected({ teacher, profile })} className="btn w-full whitespace-nowrap !min-h-0 bg-[var(--yellow)] !px-3 !py-2.5 text-xs text-[var(--ink)] shadow-[var(--shadow-sm)] ring-1 ring-black/10 hover:bg-[var(--yellow-2)]">
                    查看真实提分案例
                  </button>
                  <button type="button" onClick={() => setSelected({ teacher, profile })} className="btn btn-dark w-full !min-h-0 !px-3 !py-2.5 text-sm">
                    查看资料卡 <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-[8px] bg-[var(--charcoal)] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div><p className="inline-flex items-center gap-2 text-sm font-black text-[var(--yellow)]"><Sparkles size={16} />还不知道哪位老师适合你？</p><p className="mt-2 max-w-4xl text-xl font-black leading-relaxed">告诉我们你的目标分、考试时间和目前情况，我们帮你匹配更合适的老师。</p></div>
          <button type="button" onClick={onContact} className="btn btn-yellow shrink-0"><MessageCircle size={17} />免费咨询</button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-6" onClick={() => setSelected(null)} role="presentation">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[8px] bg-white p-6 shadow-[var(--shadow)] sm:p-8" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${selected.teacher.name} 老师资料`}>
            <button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 rounded-full p-2 text-[var(--ink-3)] hover:bg-[var(--bg)]" aria-label="关闭资料卡"><CircleX size={21} /></button>
            <div className="flex flex-col gap-5 pr-8 sm:flex-row sm:items-center">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-white ring-4 ring-[var(--yellow-soft)]">
                <img src={selected.teacher.image} alt={`${selected.teacher.name} 老师头像`} className="h-full w-full object-cover" style={{ objectPosition: portraitPosition[selected.teacher.id] || '50% 35%' }} />
              </div>
              <div><span className="pill bg-[var(--yellow-soft)] text-[var(--ink)]">{getTeacherFocus(selected)}专项</span><h2 className="mt-3 text-3xl font-black text-[var(--ink)]">{selected.teacher.name} 老师</h2><p className="mt-1 font-bold text-[var(--teal)]">{getTeacherTitle(selected)}</p></div>
            </div>
            <p className="mt-6 text-[15px] leading-8 text-[var(--ink-2)]">{selected.teacher.bio}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">{selected.teacher.detailCards.map((card) => <div key={card.title} className="rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10"><p className="text-sm font-black text-[var(--ink)]">{card.title}</p><p className="mt-1 text-sm leading-7 text-[var(--ink-2)]">{card.body}</p></div>)}</div>
            <div className="mt-6 rounded-[8px] border-l-4 border-[var(--yellow)] bg-[var(--yellow-soft)] p-4"><p className="text-xs font-black text-[var(--ink-3)]">真实案例</p><p className="mt-2 text-lg font-black text-[var(--ink)]">{selected.teacher.caseStudy.result}</p><p className="mt-1 text-sm leading-7 text-[var(--ink-2)]">{selected.teacher.caseStudy.detail}</p></div>
            <button type="button" onClick={onContact} className="btn btn-dark mt-7 w-full"><MessageCircle size={17} />预约试听</button>
          </div>
        </div>
      )}

      {caseSelected && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-6" onClick={() => setCaseSelected(null)} role="presentation">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[8px] bg-white p-6 shadow-[var(--shadow)] sm:p-8" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${caseSelected.teacher.name} 老师真实提分案例`}>
            <button type="button" onClick={() => setCaseSelected(null)} className="absolute right-4 top-4 rounded-full p-2 text-[var(--ink-3)] hover:bg-[var(--bg)]" aria-label="关闭真实提分案例"><CircleX size={21} /></button>
            <div className="pr-8">
              <span className="pill bg-[var(--teal-soft)] text-[var(--teal)]">{getTeacherFocus(caseSelected)}案例</span>
              <h2 className="mt-3 text-3xl font-black text-[var(--ink)]">{caseSelected.teacher.name} 老师真实提分案例</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">左右滑动查看学生反馈截图。</p>
            </div>
            {selectedFeedbackImages.length > 0 ? (
              <div className="mt-5 overflow-hidden rounded-[8px] bg-[var(--bg)] p-3 ring-1 ring-black/10">
                <div className="testimonial-rail flex gap-3 overflow-x-auto pb-2">
                  {selectedFeedbackImages.map((image, index) => (
                    <figure key={image} className="w-[78%] shrink-0 snap-start overflow-hidden rounded-[8px] bg-white ring-1 ring-black/10 sm:w-[320px]">
                      <img src={image} alt={`${caseSelected.teacher.name} 老师真实提分案例 ${index + 1}`} className="h-[520px] w-full object-contain" loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[8px] bg-[var(--bg)] p-5 text-sm font-bold text-[var(--ink-2)] ring-1 ring-black/10">
                这个科目的真实提分案例正在整理中。
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
