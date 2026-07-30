import { useState } from 'react'
import { BadgeCheck, Gift, MessageCircle, ReceiptText, X } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import teachersData from '../data/teachers.json'
import type { Teacher } from '../types'

const teachers = (teachersData as Teacher[]).sort((a, b) => {
  const aPrice = Number(a.price.replace(/[^\d]/g, ''))
  const bPrice = Number(b.price.replace(/[^\d]/g, ''))
  return aPrice - bPrice
})

const AVATAR_STYLES: Record<string, string> = {
  blue: 'from-[#dceaff] to-[#f2f7ff] text-[#274a8c]',
  violet: 'from-[#efe4ff] to-[#f9f5ff] text-[#6b36b9]',
  green: 'from-[#e3faf2] to-[#f5fffb] text-[#177d64]',
  orange: 'from-[#ffe7cf] to-[#fff6ea] text-[#b45812]',
  teal: 'from-[#dff8fb] to-[#f3feff] text-[#19798b]',
}

interface TeachersSectionProps {
  onContact: () => void
}

function avatarInitial(name: string) {
  return name.slice(0, 1).toUpperCase()
}

export function TeachersSection({ onContact }: TeachersSectionProps) {
  const [active, setActive] = useState(0)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const teacher = teachers[active]

  return (
    <>
      <section id="teachers" className="section scroll-mt-24 bg-[var(--bg)]">
        <div className="shell">
          <SectionHeader
            eyebrow="找老师"
            title="我们花一个月时间 1V1 试听，精心挑选了几位优秀的独立老师"
            align="center"
          />
          <div className="mx-auto mt-5 max-w-3xl text-center">
            <p className="text-[15px] font-black leading-relaxed text-[var(--ink-2)]">
              每一位老师我们都单独试听，再挑选入库，覆盖不同学科和价位。可以先看老师资料和真实提分案例，再联系试听。匹配成功后，若上课中途不满意可联系退款。
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--ink-2)] ring-1 ring-black/10">
              <Gift size={16} className="text-[var(--red)]" />
              有优秀老师推荐/自荐，也可以联系我们的顾问，推荐成功者有红包奖励
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {teachers.map((item, index) => {
              const on = active === index
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActive(index)
                    setFeedbackOpen(false)
                  }}
                  className={`card card-lift flex min-h-[312px] flex-col p-5 text-left ${on ? 'ring-2 ring-[var(--charcoal)]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-18 w-18 items-center justify-center rounded-[14px] bg-gradient-to-br text-[28px] font-black ${AVATAR_STYLES[item.avatarTone]}`}
                    >
                      {avatarInitial(item.name)}
                    </div>
                    <span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-black text-[var(--ink)]">
                      {item.price}
                    </span>
                  </div>

                  <h3 className="mt-5 text-[20px] font-black text-[var(--ink)]">{item.name}</h3>
                  <p className="mt-1 text-sm font-bold text-[var(--teal)]">{item.title}</p>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--ink-2)]">{item.strongestFeature}</p>

                  <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {item.serviceTags.filter((tag) => tag !== '可试听').map((tag) => (
                      <span key={tag} className="rounded-full bg-[var(--bg)] px-2.5 py-1 text-[11px] font-black text-[var(--ink-2)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mx-auto mt-8 grid max-w-6xl overflow-hidden rounded-[8px] bg-white shadow-[var(--shadow)] ring-1 ring-black/10 lg:grid-cols-[370px_1fr]">
            <div className="bg-[var(--charcoal)] p-7 text-white md:p-8">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-28 w-28 items-center justify-center rounded-[16px] bg-gradient-to-br text-[42px] font-black ${AVATAR_STYLES[teacher.avatarTone]}`}
                >
                  {avatarInitial(teacher.name)}
                </div>
                <div>
                  <p className="inline-flex rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-black text-[var(--ink)]">
                    {teacher.price}
                  </p>
                  <p className="mt-2 text-xs font-bold text-white/55">试听费请联系顾问</p>
                  <h3 className="mt-3 flex flex-wrap items-center gap-2 text-3xl font-black">
                    {teacher.name}
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-black text-white/72">老师</span>
                  </h3>
                  <p className="mt-1 text-sm font-bold text-white/70">{teacher.title}</p>
                </div>
              </div>

              <div className="mt-7 rounded-[8px] bg-white/6 p-5 ring-1 ring-white/10">
                <p className="flex items-center gap-2 text-sm font-black text-[var(--yellow)]">
                  <BadgeCheck size={17} />
                  最突出特点
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/82">{teacher.strongestFeature}</p>
              </div>

              <button type="button" onClick={onContact} className="btn btn-yellow mt-7 w-full">
                <MessageCircle size={17} />
                联系试听
              </button>
            </div>

            <div className="p-7 md:p-8">
              <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                <div>
                  <p className="text-sm font-black text-[var(--teal)]">教学经验</p>
                  <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-2)]">{teacher.bio}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="pill bg-white text-[var(--ink-2)] ring-1 ring-black/10">{teacher.experience}</span>
                    {teacher.subjects.map((subject) => (
                      <span key={subject} className="pill bg-[var(--yellow-soft)] text-[var(--ink)]">
                        {subject}
                      </span>
                    ))}
                    {teacher.style.map((style) => (
                      <span key={style} className="pill bg-[var(--teal-soft)] text-[var(--teal)]">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[8px] bg-[var(--bg)] p-5 ring-1 ring-black/10">
                  <p className="flex items-center gap-2 text-sm font-black text-[var(--ink)]">
                    <ReceiptText size={18} className="text-[var(--teal)]" />
                    真实战绩 / 学生反馈
                  </p>
                  <div className="mt-5 rounded-[8px] bg-white p-5 ring-1 ring-black/10">
                    <p className="text-xs font-black text-[var(--ink-3)]">{teacher.caseStudy.student}</p>
                    <p className="mt-2 text-[20px] font-black leading-tight text-[var(--ink)]">{teacher.caseStudy.result}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">{teacher.caseStudy.detail}</p>
                    <blockquote className="mt-4 border-l-4 border-[var(--yellow)] pl-4 text-sm font-bold leading-relaxed text-[var(--ink-2)]">
                      "{teacher.caseStudy.quote}"
                    </blockquote>
                  </div>
                  <button type="button" onClick={() => setFeedbackOpen(true)} className="btn btn-outline mt-5 w-full">
                    查看全部客返
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {feedbackOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          style={{ background: 'rgba(23,23,23,0.58)', backdropFilter: 'blur(6px)' }}
          onClick={() => setFeedbackOpen(false)}
          role="presentation"
        >
          <div
            className="fade-up relative max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-[8px] bg-white p-6 shadow-[var(--shadow)] md:p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-feedback-title"
          >
            <button
              type="button"
              onClick={() => setFeedbackOpen(false)}
              className="absolute right-5 top-5 rounded-[8px] p-2 hover:bg-[var(--bg)]"
              aria-label="关闭客返窗口"
              style={{ color: 'var(--ink-3)' }}
            >
              <X size={20} />
            </button>

            <p className="eyebrow">Student Feedback</p>
            <h3 id="teacher-feedback-title" className="mt-2 pr-10 text-2xl font-black text-[var(--ink)]">
              {teacher.name} 的往期客返
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-2)]">
              当前先展示文字样张。后续你把真实聊天截图、成绩单或学生评价图片给我，我们可以直接替换成图片墙。
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {teacher.feedbacks.map((feedback, index) => (
                <article key={`${feedback.student}-${index}`} className="rounded-[8px] bg-[var(--bg)] p-5 ring-1 ring-black/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-[var(--ink-3)]">{feedback.student}</p>
                      <h4 className="mt-1 text-lg font-black leading-tight text-[var(--ink)]">{feedback.tag}</h4>
                    </div>
                    <span className="rounded-full bg-[var(--yellow)] px-2.5 py-1 text-[11px] font-black text-[var(--ink)]">
                      客返
                    </span>
                  </div>
                  <blockquote className="mt-4 border-l-4 border-[var(--yellow)] pl-4 text-sm font-bold leading-relaxed text-[var(--ink-2)]">
                    "{feedback.text}"
                  </blockquote>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-[8px] bg-[var(--charcoal)] p-5 text-white">
              <p className="text-sm font-black">适合后续补充的真实素材</p>
              <p className="mt-2 text-sm leading-relaxed text-white/68">
                成绩单截图、聊天好评截图、课后反馈截图、学习计划截图。为保护隐私，学生姓名和联系方式建议统一打码。
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
