import { useEffect, useState } from 'react'
import { ArrowRight, Bot, BookOpen, ChevronRight, ClipboardCheck, Sparkles, UserPlus, UsersRound } from 'lucide-react'
import { SITE } from '../data/site'
import teachersData from '../data/teachers.json'
import type { PageId } from '../data/site'
import type { Teacher } from '../types'

interface HeroProps {
  onNavigate: (page: PageId) => void
  onTeacher: (teacherId: string) => void
  onResource: () => void
  onCommunity: () => void
}

const teachers = teachersData as Teacher[]
const heroTeacherOrder = ['tony', 'ciara', 'esme', 'aliyaa']
const heroTeachers = heroTeacherOrder
  .map((id) => teachers.find((teacher) => teacher.id === id))
  .filter((teacher): teacher is Teacher => Boolean(teacher))

const portraitPosition: Record<string, string> = {
  tony: '50% 42%',
  ciara: '50% 28%',
  esme: '50% 42%',
  aliyaa: '64% 30%',
}

const heroCardCopy: Record<string, { subjectLine: string; intro: string; suitableFor: string; badges: string[] }> = {
  tony: {
    subjectLine: '线上｜雅思口语 / 写作',
    intro: '8年雅思教学经验，模考学生超过2万人，深度教学3000+。专攻雅思口语、写作全段课程与全科规划，擅长精准定位问题，把审题、结构和表达拆成清晰、可执行的训练步骤。',
    suitableFor: '适合口语或写作长期卡在5.5-6分，希望突破6.5或冲刺7分以上的学生。',
    badges: ['8年教学经验', '模考学生2W+', '深度教学3000+'],
  },
  ciara: {
    subjectLine: '线上｜雅思口语 / 写作',
    intro: '10年雅思一线教学经验，自身雅思总分8分，并拥有英国留学与工作经历。熟悉官方评分标准，擅长从逻辑、发音、语法和表达自然度定位失分原因，兼顾应试提分与真实沟通能力。',
    suitableFor: '适合口语卡顿、逻辑零散，或写作结构和用词长期难以突破的学生。',
    badges: ['10年教学经验', '雅思8分', '英国留学背景'],
  },
  esme: {
    subjectLine: '线上｜雅思口语',
    intro: '4年教学经验并拥有机构任教经历，专注帮助5-5.5分段学生突破口语瓶颈。不依赖模板和死记硬背，而是把真实语料、表达框架和逻辑组织结合起来，快速激活已有语言储备。',
    suitableFor: '适合有基础但表达不够灵活、备考时间有限，希望短期高效突破的学生。',
    badges: ['4年教学经验', '机构任教经历', '短期高效提分'],
  },
  aliyaa: {
    subjectLine: '线上｜雅思口语',
    intro: '拥有欧洲交换学习背景与机构任教经历，专注雅思口语单项教学。擅长识别语言卡点和思维卡点，通过真实对话重塑表达路径，让流利度、词汇灵活性和语法准确度同步提升。',
    suitableFor: '适合基础不差但表达生硬、思路混乱，或长期卡在5.5-6.5分的学生。',
    badges: ['欧洲交换背景', '机构任教经历', '口语专项讲师'],
  },
}

export function Hero({ onNavigate, onTeacher, onResource, onCommunity }: HeroProps) {
  const [activeTeacherIndex, setActiveTeacherIndex] = useState(0)
  const [carouselPaused, setCarouselPaused] = useState(false)
  const activeTeacher = heroTeachers[activeTeacherIndex % heroTeachers.length]
  const activeCard = activeTeacher ? heroCardCopy[activeTeacher.id] : null

  const showNextTeacher = () => {
    setActiveTeacherIndex((current) => (current + 1) % heroTeachers.length)
  }

  useEffect(() => {
    if (carouselPaused || heroTeachers.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const timer = window.setTimeout(showNextTeacher, 5000)
    return () => window.clearTimeout(timer)
  }, [activeTeacherIndex, carouselPaused])

  return (
    <section id="hero" className="hero">
      <div className="shell grid items-center gap-12 py-12 md:py-16 lg:min-h-[calc(100svh-82px)] lg:grid-cols-[1.04fr_0.96fr] lg:items-start lg:gap-20 lg:py-10 xl:py-12">
        <div className="fade-up">
          <span className="tag-yellow"><Sparkles size={15} style={{ color: 'var(--yellow-2)' }} />2026 雅思提分服务已更新</span>
          <h1 className="mt-8 max-w-3xl text-[2.15rem] font-black leading-[1.14] text-[var(--ink)] sm:text-[2.4rem] lg:text-[2.15rem] xl:text-[2.45rem]">
            雅思学习，
            <br />
            <span className="lg:whitespace-nowrap">从找到适合自己的方法开始。</span>
          </h1>
          <p className="mt-7 max-w-2xl whitespace-pre-line text-[17px] font-bold leading-[1.9] text-[var(--ink-2)] md:text-[18px]">{SITE.tagline}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={() => onNavigate('teachers')} className="btn btn-yellow"><UsersRound size={18} />先看老师 <ArrowRight size={16} /></button>
            <button type="button" onClick={() => onNavigate('supervision')} className="btn btn-dark"><ClipboardCheck size={18} />了解督学</button>
            <button type="button" onClick={() => onNavigate('writing')} className="btn btn-outline"><Bot size={18} />AI 批改作文</button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-black">
            <button type="button" onClick={onResource} className="inline-flex items-center gap-2 text-[var(--teal)] transition hover:text-[var(--ink)] hover:underline"><BookOpen size={17} />领取雅思全套资料 · 2000+份</button>
            <button type="button" onClick={onCommunity} className="inline-flex items-center gap-2 text-[var(--ink-2)] transition hover:text-[var(--teal)] hover:underline"><UserPlus size={17} />添加雅思学习交流社群</button>
          </div>
        </div>

        <div className="hero-card-stage fade-up relative" style={{ animationDelay: '0.1s' }}>
          {activeTeacher && activeCard && (
            <article key={activeTeacher.id} className="hero-teacher-card group relative cursor-pointer overflow-hidden rounded-[8px] bg-white text-[var(--ink)] ring-1 ring-black/10" aria-live="polite" role="link" tabIndex={0} aria-label={`查看 ${activeTeacher.name} 老师详细资料`} onClick={() => onTeacher(activeTeacher.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onTeacher(activeTeacher.id) } }} onMouseEnter={() => setCarouselPaused(true)} onMouseLeave={() => setCarouselPaused(false)} onFocusCapture={() => setCarouselPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCarouselPaused(false) }}>
              <div className="p-6 sm:p-8 lg:p-7 xl:p-9">
                <div className="flex items-start gap-5 sm:gap-7">
                  <div className="group relative h-[112px] w-[112px] shrink-0 overflow-hidden rounded-full bg-[var(--bg)] shadow-[0_10px_30px_rgba(23,23,23,0.14)] ring-4 ring-[var(--yellow-soft)] sm:h-[144px] sm:w-[144px]">
                    <img src={activeTeacher.image} alt={`${activeTeacher.name} 老师头像`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" style={{ objectPosition: portraitPosition[activeTeacher.id] || '50% 35%' }} />
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--teal)]">Edutoro mentor</p>
                      <span className="text-[11px] font-black text-black/35">{String(activeTeacherIndex + 1).padStart(2, '0')} / {String(heroTeachers.length).padStart(2, '0')}</span>
                    </div>
                    <h2 className="mt-2 block max-w-full text-left text-[32px] font-black leading-none text-[var(--ink)] transition group-hover:text-[var(--teal)] sm:text-[40px]">{activeTeacher.name}</h2>
                    <p className="mt-3 text-[13px] font-black leading-5 text-[var(--ink-2)] sm:text-sm">{activeCard.subjectLine}</p>
                    <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
                      {activeCard.badges.map((badge) => (
                        <span key={badge} className="rounded-full border border-black/10 bg-[var(--yellow-soft)] px-3 py-1.5 text-[11px] font-black text-[var(--ink)]">{badge}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 sm:hidden">
                  {activeCard.badges.map((badge) => (
                    <span key={badge} className="rounded-full border border-black/10 bg-[var(--yellow-soft)] px-3 py-1.5 text-[11px] font-black text-[var(--ink)]">{badge}</span>
                  ))}
                </div>

                <div className="mt-7 border-t border-black/10 pt-6">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--ink-2)]">老师介绍</p>
                  <p className="mt-3 text-[15px] font-bold leading-[1.9] text-[var(--ink-2)]">{activeCard.intro}</p>
                  <div className="mt-4 bg-[var(--yellow-soft)] px-4 py-3">
                    <p className="text-[13px] font-black leading-6 text-[var(--ink-2)]">{activeCard.suitableFor}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-black/10 pt-5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0e8] px-4 py-2.5 text-[#a33a20] ring-1 ring-[#efaa83]">
                    <span className="text-[11px] font-black">试听价</span>
                    <span className="text-[17px] font-black">{activeTeacher.price.replace('试听 ', '')}</span>
                  </span>
                  <div className="flex items-center gap-3" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                    <div className="flex gap-1.5">
                      {heroTeachers.map((teacher, index) => (
                        <button key={teacher.id} type="button" onClick={() => setActiveTeacherIndex(index)} className={`h-2.5 rounded-full transition-all ${index === activeTeacherIndex ? 'w-6 bg-[var(--yellow)]' : 'w-2.5 bg-black/15 hover:bg-black/30'}`} aria-label={`切换到 ${teacher.name} 老师`} />
                      ))}
                    </div>
                    <button type="button" onClick={showNextTeacher} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--charcoal)] text-white transition hover:bg-[var(--teal)]" aria-label="下一位老师">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  )
}
