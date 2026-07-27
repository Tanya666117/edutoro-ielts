import { useState } from 'react'
import { BadgeCheck, MessageCircle, ReceiptText, RotateCcw, SearchCheck, WalletCards } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import teachersData from '../data/teachers.json'
import type { Teacher } from '../types'

const teachers = teachersData as Teacher[]

interface TeachersSectionProps {
  onContact: () => void
}

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffd91a,fff1a8,e4f7f3`
}

export function TeachersSection({ onContact }: TeachersSectionProps) {
  const [active, setActive] = useState(0)
  const teacher = teachers[active]

  return (
    <section id="teachers" className="section scroll-mt-24 bg-[var(--bg)]">
      <div className="shell">
        <SectionHeader
          eyebrow="找老师"
          title="创始人试听过的独立老师，按价位和需求匹配"
          description="这是我们的重点服务：老师覆盖口语、写作、听力、阅读和全科规划。可以先看真实战绩和学生反馈，再联系试听；不满意可沟通退款。"
          align="center"
        />

        <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
          {[
            { icon: SearchCheck, title: '创始人试听筛选', desc: '先听课再入库' },
            { icon: WalletCards, title: '覆盖不同价位', desc: '按预算匹配' },
            { icon: RotateCcw, title: '试听后再决定', desc: '不满意可退款' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-[8px] bg-white p-5 text-center ring-1 ring-black/10">
              <Icon size={22} className="mx-auto text-[var(--teal)]" />
              <p className="mt-3 text-sm font-black text-[var(--ink)]">{title}</p>
              <p className="mt-1 text-xs font-bold text-[var(--ink-3)]">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {teachers.map((t, i) => {
            const on = active === i
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(i)}
                className={`card card-lift flex min-h-[280px] flex-col p-5 text-left ${on ? 'ring-2 ring-[var(--charcoal)]' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <img
                    src={avatarUrl(t.avatarSeed)}
                    alt={`${t.name} 卡通头像`}
                    className="h-16 w-16 rounded-[8px] bg-[var(--yellow-soft)] object-cover ring-1 ring-black/10"
                  />
                  <span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-black text-[var(--ink)]">
                    {t.price}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-black text-[var(--ink)]">{t.name}</h3>
                <p className="mt-1 text-sm font-bold text-[var(--teal)]">{t.title}</p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--ink-2)]">{t.strongestFeature}</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                  {t.subjects.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-[var(--bg)] px-2.5 py-1 text-[11px] font-black text-[var(--ink-2)]">
                      {s}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mx-auto mt-8 grid max-w-6xl overflow-hidden rounded-[8px] bg-white shadow-[var(--shadow)] ring-1 ring-black/10 lg:grid-cols-[360px_1fr]">
          <div className="bg-[var(--charcoal)] p-7 text-white md:p-8">
            <div className="flex items-center gap-4">
              <img
                src={avatarUrl(teacher.avatarSeed)}
                alt={`${teacher.name} 卡通头像`}
                className="h-24 w-24 rounded-[8px] bg-[var(--yellow)] object-cover ring-1 ring-white/20"
              />
              <div>
                <p className="inline-flex rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-black text-[var(--ink)]">
                  {teacher.price}
                </p>
                <h3 className="mt-3 text-3xl font-black">{teacher.name}</h3>
                <p className="mt-1 text-sm font-bold text-white/70">{teacher.title}</p>
              </div>
            </div>

            <div className="mt-7 rounded-[8px] bg-white/8 p-5 ring-1 ring-white/10">
              <p className="flex items-center gap-2 text-sm font-black text-[var(--yellow)]">
                <BadgeCheck size={17} />
                最突出特点
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/78">{teacher.strongestFeature}</p>
            </div>

            <button type="button" onClick={onContact} className="btn btn-yellow mt-7 w-full">
              <MessageCircle size={17} />
              联系试听 / 看反馈
            </button>
          </div>

          <div className="p-7 md:p-8">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
              <div>
                <p className="text-sm font-black text-[var(--teal)]">{teacher.experience}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-2)]">{teacher.bio}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {teacher.subjects.map((s) => (
                    <span key={s} className="pill bg-[var(--yellow-soft)] text-[var(--ink)]">
                      {s}
                    </span>
                  ))}
                  {teacher.style.map((s) => (
                    <span key={s} className="pill bg-[var(--teal-soft)] text-[var(--teal)]">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {teacher.highlights.map((h) => (
                    <div key={h} className="rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10">
                      <span className="block h-1.5 w-8 rounded-full bg-[var(--yellow)]" />
                      <p className="mt-3 text-sm font-bold text-[var(--ink-2)]">{h}</p>
                    </div>
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
                  <p className="mt-2 text-xl font-black leading-tight text-[var(--ink)]">{teacher.caseStudy.result}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">{teacher.caseStudy.detail}</p>
                  <blockquote className="mt-4 border-l-4 border-[var(--yellow)] pl-4 text-sm font-bold leading-relaxed text-[var(--ink-2)]">
                    “{teacher.caseStudy.quote}”
                  </blockquote>
                </div>
                <button type="button" onClick={onContact} className="btn btn-outline mt-5 w-full">
                  查看截图版战绩和好评
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
