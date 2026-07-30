import { useState } from 'react'
import { ChevronLeft, ChevronRight, Images, MessageCircle, Trophy, X } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import teachersData from '../data/teachers.json'
import type { Teacher } from '../types'

const teachers = teachersData as Teacher[]
const CASE_IMAGES = Array.from({ length: 13 }, (_, index) => ({
  src: `${import.meta.env.BASE_URL}testimonials/case-${String(index + 1).padStart(2, '0')}.jpg`,
  alt: `一对一老师好评截图 ${index + 1}`,
}))

export function CasesSection() {
  const [activeImage, setActiveImage] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)

  const openPreview = (index: number) => {
    setActiveImage(index)
    setPreviewOpen(true)
  }

  const stepPreview = (step: number) => {
    setActiveImage((current) => (current + step + CASE_IMAGES.length) % CASE_IMAGES.length)
  }

  return (
    <>
      <section id="cases" className="section bg-[var(--bg)]">
        <div className="shell">
        <SectionHeader
          eyebrow="真实案例"
          title="一对一老师真实好评，左右滑动慢慢看"
          description="主要展示一对一老师的提分反馈、续课反馈和推荐反馈。手机端可以直接横向滑动，点开任意截图可以放大查看。"
        />

        <div className="mt-10 overflow-hidden rounded-[8px] bg-[var(--charcoal)] py-6 text-white shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-4 px-5">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-black text-[var(--ink)]">
                <Images size={14} />
                {CASE_IMAGES.length} 张真实反馈
              </p>
              <h3 className="mt-3 text-2xl font-black">学生出分、续课和推荐反馈</h3>
            </div>
          </div>

          <div className="testimonial-rail mt-6 flex gap-4 overflow-x-auto px-5 pb-4">
            {CASE_IMAGES.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => openPreview(index)}
                className="group relative shrink-0 overflow-hidden rounded-[8px] bg-white p-2 shadow-xl ring-1 ring-white/16"
                aria-label={`查看第 ${index + 1} 张好评截图`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-[380px] w-[240px] rounded-[6px] object-cover object-top transition duration-200 group-hover:scale-[1.02] sm:h-[460px] sm:w-[300px]"
                  loading="lazy"
                />
                <span className="absolute bottom-4 left-4 rounded-full bg-black/72 px-3 py-1 text-xs font-black text-white">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {teachers.slice(0, 4).map((teacher) => (
            <article key={teacher.id} className="card card-lift overflow-hidden">
              <div className="bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="inline-flex items-center gap-2 rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-black text-[var(--ink)]">
                    <Trophy size={13} />
                    {teacher.caseStudy.result}
                  </p>
                  <span className="rounded-full bg-[var(--teal-soft)] px-3 py-1 text-xs font-black text-[var(--teal)]">
                    {teacher.title}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-black text-[var(--ink)]">{teacher.name}</h3>
              </div>

              <div className="p-5">
                <p className="text-sm font-black text-[var(--teal)]">{teacher.caseStudy.student}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">{teacher.caseStudy.detail}</p>
                <blockquote className="mt-4 border-l-4 border-[var(--yellow)] pl-4 text-sm font-bold leading-relaxed text-[var(--ink-2)]">
                  "{teacher.caseStudy.quote}"
                </blockquote>

                <div className="mt-5 grid gap-3">
                  {teacher.feedbacks.slice(0, 2).map((feedback) => (
                    <div key={`${teacher.id}-${feedback.student}`} className="rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10">
                      <p className="flex items-center gap-2 text-xs font-black text-[var(--ink-3)]">
                        <MessageCircle size={14} className="text-[var(--teal)]" />
                        {feedback.student} · {feedback.tag}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">{feedback.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      </section>

      {previewOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/78 p-3 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
          role="presentation"
        >
          <div className="relative flex max-h-[92vh] w-full max-w-4xl items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute right-2 top-2 z-10 rounded-[8px] bg-white p-2 text-[var(--ink)] shadow-lg"
              aria-label="关闭好评截图"
            >
              <X size={20} />
            </button>
            <button
              type="button"
              onClick={() => stepPreview(-1)}
              className="absolute left-2 z-10 rounded-full bg-white/92 p-2 text-[var(--ink)] shadow-lg"
              aria-label="上一张"
            >
              <ChevronLeft size={24} />
            </button>
            <img
              src={CASE_IMAGES[activeImage].src}
              alt={CASE_IMAGES[activeImage].alt}
              className="max-h-[92vh] max-w-full rounded-[8px] bg-white object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => stepPreview(1)}
              className="absolute right-2 z-10 rounded-full bg-white/92 p-2 text-[var(--ink)] shadow-lg"
              aria-label="下一张"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
