import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CircleX,
  ClipboardList,
  GraduationCap,
  Headphones,
  MessageCircle,
  NotebookPen,
  Sparkles,
  Star,
  Target,
  Trophy,
  UsersRound,
} from 'lucide-react'
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
type Subject = TeacherSubjectProfile['subject']
type TeacherView = {
  teacher: Teacher
  profile?: TeacherSubjectProfile
}

interface TeachersSectionProps {
  onContact: () => void
  initialTeacherId?: string | null
  onInitialTeacherHandled?: () => void
  compact?: boolean
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

const subjectLabels: Record<Subject, string> = {
  speaking: '口语',
  writing: '写作',
}

const subjectIcons: Record<Subject, typeof MessageCircle> = {
  speaking: Headphones,
  writing: NotebookPen,
}

const teacherPreviewCopy: Record<string, string> = {
  'tony-speaking': 'Tony 老师最强的是“定位快、给方法狠”。如果你口语说不长、写作展不开，他会用真题先找出卡点，再把 Part 1-3 回答框架和写作展开方法拆成能马上练的步骤。适合长期卡在 5-6.5 分、想冲 7+ 的学生。',
  'tony-writing': 'Tony 老师不让学生继续死背模板，而是教你真正会写：题目怎么看、观点怎么选、段落怎么搭、例子怎么展开。试听会直接用你的文章或真题诊断问题，适合写了很多却一直卡在 5.5-6 分的同学。',
  'ciara-speaking': 'Ciara 老师有 10 年雅思一线经验和英国留学工作背景，优势是把“听起来不自然”的地方讲得很清楚。她会从发音、停顿、逻辑和用词入手，让你的回答更像真实交流，而不是背答案。',
  'ciara-writing': 'Ciara 老师写作 8.0，特别适合想把作文改扎实的同学。她会从审题开始，逐段看你的结构、论证、衔接和语言质量，告诉你哪句话为什么扣分、下一版怎么改。适合冲 6.5+、单项补短板，或想一次把写作思路理顺的学生。',
  'esme-speaking': 'Esme 老师适合备考时间紧、口语卡在 5-5.5 的学生。她不会让你背一堆万能答案，而是用几个真题快速看出你为什么说不顺，再帮你把想法整理成自然、完整、考官听得懂的英文。',
  'aliyaa-speaking': 'Aliyaa 老师擅长解决“脑子里有内容，但英文说不出来”的问题。她会帮你减少中文直译，把回答结构、衔接和语音语调一起调整。适合基础不差但表达生硬、想从 5.5-6.5 往上冲的学生。',
}

const getSubjectProfile = (teacher: Teacher, subject: Subject) =>
  teacher.subjectProfiles?.find((profile) => profile.subject === subject)

const getDefaultSubject = (teacher: Teacher, preferred?: Subject) => {
  if (preferred && teacher.subjects.includes(preferred)) return preferred
  return teacher.subjectProfiles?.[0]?.subject ?? teacher.subjects[0]
}

const getDefaultProfile = (teacher: Teacher, preferred?: Subject) =>
  getSubjectProfile(teacher, getDefaultSubject(teacher, preferred))

const getTeacherTitle = ({ teacher, profile }: TeacherView) => profile?.title ?? teacher.title
const getTeacherFocus = ({ teacher, profile }: TeacherView) => profile?.focus ?? teacher.focus
const getTeacherPrice = ({ teacher, profile }: TeacherView) => profile?.price ?? teacher.price

const getTeacherPreview = ({ teacher, profile }: TeacherView) => {
  if (!profile) return teacher.strongestFeature
  return teacherPreviewCopy[`${teacher.id}-${profile.subject}`] ?? teacher.strongestFeature
}

const getFeedbackImages = ({ teacher, profile }: TeacherView) => {
  const subject = profile?.subject ?? getDefaultSubject(teacher)
  const group = `${teacher.id}-${subject}`
  const count = feedbackImageCounts[group] ?? 0

  return Array.from({ length: count }, (_, index) => {
    const fileNumber = String(index + 1).padStart(2, '0')
    return `/teacher-feedback/${group}/${fileNumber}.jpg`
  })
}

function InfoBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MessageCircle
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[8px] bg-white p-5 ring-1 ring-black/10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--yellow)] text-[var(--ink)] ring-1 ring-black/10">
          <Icon size={20} />
        </span>
        <h3 className="text-xl font-black leading-tight text-[var(--ink)]">{title}</h3>
      </div>
      <div className="mt-4 text-[15px] leading-8 text-[var(--ink-2)]">{children}</div>
    </section>
  )
}

export function TeachersSection({ onContact, initialTeacherId, onInitialTeacherHandled, compact = false }: TeachersSectionProps) {
  const [filter, setFilter] = useState<TeacherFilter>('all')
  const [selected, setSelected] = useState<TeacherView | null>(null)
  const [caseSelected, setCaseSelected] = useState<TeacherView | null>(null)
  const visibleTeachers = useMemo<TeacherView[]>(() => {
    if (filter === 'all') {
      return teachers
        .map((teacher) => ({ teacher, profile: getDefaultProfile(teacher) }))
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
      setSelected({ teacher, profile: getDefaultProfile(teacher) })
    }
    onInitialTeacherHandled?.()
  }, [initialTeacherId, onInitialTeacherHandled])

  const openTeacher = (teacher: Teacher, preferred?: Subject) => {
    setSelected({ teacher, profile: getDefaultProfile(teacher, preferred) })
  }

  const switchSelectedSubject = (subject: Subject) => {
    if (!selected) return
    setSelected({ teacher: selected.teacher, profile: getSubjectProfile(selected.teacher, subject) })
  }

  return (
    <section id="teachers" className={`${compact ? 'pb-[82px] pt-10 md:pb-[104px] md:pt-14' : 'section'} scroll-mt-24 bg-[var(--bg)]`}>
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="老师"
            title="像选 Superprof 老师一样，先看清课程是否适合你"
            description={`这里不是简单的老师名单。\n每位老师都有完整资料页：背景、课程方式、适合学生、试听说明和真实提分反馈，先了解清楚，再预约试听。`}
          />
          <div className="flex shrink-0 items-center gap-1 rounded-[8px] bg-white p-1.5 shadow-[var(--shadow-sm)] ring-1 ring-black/10">
            {filters.map((item) => (
              <button key={item.id} type="button" onClick={() => setFilter(item.id)} className="rounded-[6px] px-3 py-2 text-sm font-black transition sm:px-4" style={{ background: filter === item.id ? 'var(--charcoal)' : 'transparent', color: filter === item.id ? '#fff' : 'var(--ink-2)' }}>{item.label}</button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 xl:gap-10">
          {visibleTeachers.map(({ teacher, profile }) => {
            const SubjectIcon = profile ? subjectIcons[profile.subject] : BookOpen

            return (
              <article key={teacher.id} className="card card-lift bg-white p-6 md:p-7">
                <div className="min-h-full">
                  <div className="flex gap-5 sm:items-start">
                    <button type="button" onClick={() => openTeacher(teacher, profile?.subject)} className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-[var(--yellow-soft)] text-left shadow-[var(--shadow-sm)] ring-4 ring-white transition hover:ring-[var(--yellow)] sm:h-32 sm:w-32" aria-label={`查看 ${teacher.name} 老师完整资料`}>
                      <img src={teacher.image} alt={`${teacher.name} 老师头像`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" style={{ objectPosition: portraitPosition[teacher.id] || '50% 35%' }} />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span className="inline-flex items-center rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-black text-[var(--ink)] ring-1 ring-black/10">{getTeacherFocus({ teacher, profile })}</span>
                          <div className="mt-3 flex items-center gap-2">
                            <h3 className="text-[29px] font-black leading-tight text-[var(--ink)]">{teacher.name} 老师</h3>
                            <BadgeCheck size={20} className="shrink-0 text-[var(--yellow-2)]" />
                          </div>
                          <p className="mt-2 text-[15px] font-black leading-6 text-[var(--ink-2)]">{getTeacherTitle({ teacher, profile })}</p>
                        </div>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--yellow-soft)] text-[var(--ink)] ring-1 ring-black/10">
                          <SubjectIcon size={20} />
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 min-h-[128px] max-w-3xl text-[16px] leading-8 text-[var(--ink-2)]">{getTeacherPreview({ teacher, profile })}</p>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {(profile?.stats ?? teacher.highlights).slice(0, 3).map((stat) => (
                      <span key={stat} className="pill bg-[var(--yellow-soft)] text-[var(--ink)] ring-1 ring-black/10">{stat}</span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-5">
                    <span className="font-black text-[var(--ink)]">{getTeacherPrice({ teacher, profile })}</span>
                    <button type="button" onClick={() => openTeacher(teacher, profile?.subject)} className="btn btn-dark !min-h-0 !px-4 !py-2.5 text-sm">
                      查看完整主页 <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-[8px] bg-[var(--charcoal)] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black text-[var(--yellow)]"><Sparkles size={16} />还不知道哪位老师适合你？</p>
            <p className="mt-2 max-w-4xl text-xl font-black leading-relaxed">告诉我们你的目标分、考试时间和目前情况，我们帮你匹配更合适的老师。</p>
          </div>
          <button type="button" onClick={onContact} className="btn btn-yellow shrink-0"><MessageCircle size={17} />免费咨询</button>
        </div>
      </div>

      {selected && selected.profile && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-6" onClick={() => setSelected(null)} role="presentation">
          <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[8px] bg-[#fffdf3] shadow-[var(--shadow)] ring-1 ring-white/60" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${selected.teacher.name} 老师资料`}>
            <button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 text-[var(--ink-3)] shadow-[var(--shadow-sm)] ring-1 ring-black/10 hover:bg-[var(--yellow-soft)]" aria-label="关闭资料卡"><CircleX size={22} /></button>

            <div className="grid bg-white lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="p-6 pr-14 sm:p-8 sm:pr-16 lg:p-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--yellow)] px-4 py-2 text-xs font-black text-[var(--ink)] ring-1 ring-black/10">
                  <BookOpen size={15} />Edutoro 雅思导师资料页
                </span>
                <h2 className="mt-5 text-[36px] font-black leading-none text-[var(--ink)] sm:text-[48px]">{selected.teacher.name} 老师</h2>
                <p className="mt-3 max-w-3xl text-xl font-black leading-8 text-[var(--ink)]">{selected.profile.title}</p>
                <p className="mt-4 max-w-3xl text-[16px] leading-8 text-[var(--ink-2)]">{selected.profile.aboutTeacher}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {selected.teacher.subjectProfiles && selected.teacher.subjectProfiles.length > 1 && (
                    <div className="flex flex-wrap gap-2" role="tablist" aria-label={`${selected.teacher.name} 老师科目`}>
                      {selected.teacher.subjectProfiles.map((profile) => {
                        const active = profile.subject === selected.profile?.subject
                        const Icon = subjectIcons[profile.subject]
                        return (
                          <button
                            key={profile.subject}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => switchSelectedSubject(profile.subject)}
                            className={`inline-flex min-h-10 items-center gap-2 rounded-[8px] px-4 text-sm font-black transition ${active ? 'bg-[var(--charcoal)] text-white shadow-sm' : 'bg-[var(--yellow-soft)] text-[var(--ink)] ring-1 ring-black/10 hover:bg-[var(--yellow)]'}`}
                          >
                            <Icon size={17} />
                            {subjectLabels[profile.subject]}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  <button type="button" onClick={() => setCaseSelected(selected)} className="inline-flex min-h-10 items-center gap-2 rounded-[8px] bg-[var(--yellow)] px-4 text-sm font-black text-[var(--ink)] shadow-sm ring-1 ring-black/10 transition hover:bg-[var(--yellow-2)]">
                    <Trophy size={17} />
                    查看真实案例
                  </button>
                </div>
              </div>

              <aside className="border-t border-black/10 bg-[var(--yellow-soft)] p-6 sm:p-8 lg:border-l lg:border-t-0">
                <div className="mx-auto h-44 w-44 overflow-hidden rounded-full bg-white shadow-[var(--shadow-sm)] ring-4 ring-white">
                  <img src={selected.teacher.image} alt={`${selected.teacher.name} 老师头像`} className="h-full w-full object-cover" style={{ objectPosition: portraitPosition[selected.teacher.id] || '50% 35%' }} />
                </div>
                <div className="mt-6 rounded-[8px] bg-white p-5 text-center shadow-[var(--shadow-sm)] ring-1 ring-black/10">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--ink-3)]">试听价</p>
                  <p className="mt-2 text-[28px] font-black leading-tight text-[var(--ink)]">{selected.profile.price.replace('试听 ', '')}</p>
                  <button type="button" onClick={onContact} className="btn btn-dark mt-5 w-full"><MessageCircle size={17} />预约试听</button>
                </div>
              </aside>
            </div>

            <div className="grid gap-3 border-y border-black/10 bg-[var(--charcoal)] p-4 text-white sm:grid-cols-2 lg:grid-cols-4">
              {selected.profile.stats.map((stat, index) => {
                const icons = [GraduationCap, BriefcaseBusiness, Trophy, Target]
                const Icon = icons[index % icons.length]
                return (
                  <div key={stat} className="flex min-h-[76px] items-center gap-3 rounded-[8px] bg-white/8 p-4 ring-1 ring-white/12">
                    <Icon size={22} className="shrink-0 text-[var(--yellow)]" />
                    <span className="text-sm font-black leading-6">{stat}</span>
                  </div>
                )
              })}
            </div>

            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:p-8">
              <div className="space-y-5">
                <InfoBlock icon={BookOpen} title="关于这位老师">
                  <p>{selected.profile.aboutTeacher}</p>
                </InfoBlock>

                <InfoBlock icon={ClipboardList} title="关于课程">
                  <p>{selected.profile.aboutLesson}</p>
                </InfoBlock>

                {selected.profile.trainingFocus && selected.profile.trainingFocus.length > 0 && (
                  <InfoBlock icon={Target} title={`${subjectLabels[selected.profile.subject]}训练重点`}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selected.profile.trainingFocus.map((item) => (
                        <div key={item.label} className="rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10">
                          <p className="text-sm font-black text-[var(--ink)]">{item.label}</p>
                          <p className="mt-1 text-sm leading-7 text-[var(--ink-2)]">{item.body}</p>
                        </div>
                      ))}
                    </div>
                  </InfoBlock>
                )}
              </div>

              <div className="space-y-5">
                <InfoBlock icon={Star} title="教学特色">
                  <ul className="space-y-2">
                    {selected.profile.teachingFeatures.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[var(--yellow-2)]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </InfoBlock>

                <InfoBlock icon={UsersRound} title="适合学生">
                  <ul className="space-y-2">
                    {selected.profile.suitableStudents.map((student) => (
                      <li key={student} className="flex gap-2">
                        <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[var(--charcoal)]" />
                        <span>{student}</span>
                      </li>
                    ))}
                  </ul>
                </InfoBlock>

                <InfoBlock icon={Headphones} title="试听说明">
                  <p>{selected.profile.trialNote}</p>
                </InfoBlock>

                {selected.profile.extraGift && (
                  <InfoBlock icon={Sparkles} title="课程额外赠送">
                    <ul className="space-y-2">
                      {selected.profile.extraGift.map((gift) => (
                        <li key={gift} className="flex gap-2">
                          <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[var(--yellow-2)]" />
                          <span>{gift}</span>
                        </li>
                      ))}
                    </ul>
                  </InfoBlock>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {caseSelected && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-6" onClick={() => setCaseSelected(null)} role="presentation">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[8px] bg-white p-6 shadow-[var(--shadow)] sm:p-8" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${caseSelected.teacher.name} 老师真实提分案例`}>
            <button type="button" onClick={() => setCaseSelected(null)} className="absolute right-4 top-4 rounded-full p-2 text-[var(--ink-3)] hover:bg-[var(--bg)]" aria-label="关闭真实提分案例"><CircleX size={21} /></button>
            <div className="pr-8">
              <span className="pill bg-[var(--yellow-soft)] text-[var(--ink)]">{getTeacherFocus(caseSelected)}案例</span>
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
