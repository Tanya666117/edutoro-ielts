import { useMemo, useState } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import recallsData from '../data/recalls.json'
import { SUBJECT_LABELS } from '../data/site'
import type { ExamRecall } from '../types'

const recalls = recallsData as ExamRecall[]
const SUBJECTS = ['all', 'listening', 'reading', 'writing', 'speaking'] as const

const SUBJECT_COLORS: Record<string, { bg: string; color: string }> = {
  listening: { bg: '#e9efff', color: '#3157c9' },
  reading: { bg: 'var(--teal-soft)', color: 'var(--teal)' },
  writing: { bg: 'var(--yellow-soft)', color: 'var(--ink)' },
  speaking: { bg: '#ffe9e2', color: '#c63c23' },
}

export function RecallsSection() {
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>('all')
  const [city, setCity] = useState('all')

  const cities = useMemo(
    () => ['all', ...Array.from(new Set(recalls.map((r) => r.city)))],
    [],
  )

  const filtered = useMemo(
    () =>
      recalls.filter(
        (r) =>
          (subject === 'all' || r.subject === subject) &&
          (city === 'all' || r.city === city),
      ),
    [subject, city],
  )

  return (
    <section id="recalls" className="section scroll-mt-24 bg-[var(--bg)]">
      <div className="shell">
        <SectionHeader
          eyebrow="考点回忆"
          title="近期考情，一眼筛到城市和科目"
          description="按日期、城市与科目整理，月度更新。内容仅供备考参考，最终请以官方考试安排和实际题目为准。"
        />

        <div className="mt-10 flex flex-wrap gap-2">
          {SUBJECTS.map((s) => {
            const on = subject === s
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className="rounded-full px-4 py-2 text-sm font-black transition"
                style={{
                  background: on ? 'var(--charcoal)' : '#fff',
                  color: on ? '#fff' : 'var(--ink-2)',
                  border: `1px solid ${on ? 'var(--charcoal)' : 'rgba(23,23,23,0.1)'}`,
                }}
              >
                {s === 'all' ? '全部科目' : SUBJECT_LABELS[s]}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {cities.map((c) => {
            const on = city === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCity(c)}
                className="rounded-full px-3.5 py-1.5 text-xs font-black transition"
                style={{
                  background: on ? 'var(--yellow)' : '#fff',
                  color: 'var(--ink)',
                  border: `1px solid ${on ? 'var(--yellow-2)' : 'rgba(23,23,23,0.1)'}`,
                }}
              >
                {c === 'all' ? '全部城市' : c}
              </button>
            )
          })}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((recall) => {
            const tone = SUBJECT_COLORS[recall.subject]
            return (
              <article key={recall.id} className="card card-lift p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill" style={{ background: tone.bg, color: tone.color }}>
                    {SUBJECT_LABELS[recall.subject]}
                  </span>
                  {recall.difficulty && (
                    <span className="pill bg-[var(--bg)] text-[var(--ink-3)]">{recall.difficulty}</span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-[var(--ink-3)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} className="text-[var(--teal)]" />
                    {recall.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-[var(--teal)]" />
                    {recall.city} · {recall.venue}
                  </span>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-2)]">{recall.content}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
