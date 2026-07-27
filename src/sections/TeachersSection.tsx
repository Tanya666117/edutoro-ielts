import { useState } from 'react'
import { MessageCircle, Star } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import teachersData from '../data/teachers.json'
import type { Teacher } from '../types'

const teachers = teachersData as Teacher[]

interface TeachersSectionProps {
  onContact: () => void
}

export function TeachersSection({ onContact }: TeachersSectionProps) {
  const [active, setActive] = useState(0)
  const teacher = teachers[active]

  return (
    <section id="teachers" className="section scroll-mt-24 bg-[var(--bg)]">
      <div className="shell">
        <SectionHeader
          eyebrow="找老师"
          title="像挑私教一样挑雅思老师"
          description="先看老师擅长科目、教学风格和适合人群，再预约顾问做匹配。老师卡片保持透明，不把所有人塞进同一套大课。"
          align="center"
        />

        <div className="mt-10 flex gap-3 overflow-x-auto pb-2 md:justify-center">
          {teachers.map((t, i) => {
            const on = active === i
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(i)}
                className="flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-black transition"
                style={{
                  background: on ? 'var(--charcoal)' : '#fff',
                  color: on ? '#fff' : 'var(--ink-2)',
                  border: `1px solid ${on ? 'var(--charcoal)' : 'rgba(23,23,23,0.1)'}`,
                }}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black"
                  style={{
                    background: on ? 'var(--yellow)' : 'var(--yellow-soft)',
                    color: 'var(--ink)',
                  }}
                >
                  {t.name[0]}
                </span>
                {t.name}
              </button>
            )
          })}
        </div>

        <div className="mx-auto mt-9 grid max-w-5xl overflow-hidden rounded-[8px] bg-white shadow-[var(--shadow)] ring-1 ring-black/10 lg:grid-cols-[330px_1fr]">
          <div className="relative bg-[var(--charcoal)] p-8 text-white">
            <div className="absolute right-5 top-5 rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-black text-[var(--ink)]">
              可预约
            </div>
            <div className="flex h-24 w-24 items-center justify-center rounded-[8px] bg-white/10 text-4xl font-black backdrop-blur">
              {teacher.name[0]}
            </div>
            <h3 className="mt-6 text-3xl font-black">{teacher.name}</h3>
            <p className="mt-2 text-white/76">{teacher.title}</p>
            <div className="mt-4 flex items-center gap-1 text-sm">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={14} fill="#ffd91a" color="#ffd91a" />
              ))}
              <span className="ml-1.5 font-bold text-white/85">5.0</span>
            </div>
            <p className="mt-8 rounded-[8px] bg-white/8 p-4 text-sm text-white/72 ring-1 ring-white/10">
              {teacher.experience}
            </p>
          </div>

          <div className="p-7 md:p-9">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <p className="text-sm font-black text-[var(--teal)]">{teacher.score}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-2)]">{teacher.bio}</p>
              </div>
              <button type="button" onClick={onContact} className="btn btn-yellow shrink-0">
                <MessageCircle size={17} />
                预约咨询
              </button>
            </div>

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

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {teacher.highlights.map((h) => (
                <div key={h} className="rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10">
                  <span className="block h-1.5 w-8 rounded-full bg-[var(--yellow)]" />
                  <p className="mt-3 text-sm font-bold text-[var(--ink-2)]">{h}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
