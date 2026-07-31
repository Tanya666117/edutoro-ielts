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
  const cityOptions = useMemo(() => ['all', ...Array.from(new Set(recalls.map((item) => item.city).filter(Boolean)))], [])

  const filtered = useMemo(
    () =>
      recalls.filter((item) => {
        const subjectMatch = subject === 'all' || item.subject === subject
        const cityMatch = city === 'all' || item.city === city
        return subjectMatch && cityMatch
      }),
    [city, subject],
  )

  return (
    <section id="recalls" className="section scroll-mt-24 bg-[var(--bg)]">
      <div className="shell">
        <SectionHeader
          eyebrow="高频题目"
          title="近期高频题目参考"
          description="口语保留考场口径；听阅写更偏高频题型和主题整理，不强调具体考点，方便直接备考。"
        />

        <div className="mt-10 flex flex-wrap gap-2">
          {SUBJECTS.map((item) => {
            const on = subject === item
            return (
              <button
                key={item}
                type="button"
                onClick={() => setSubject(item)}
                className="rounded-full px-4 py-2 text-sm font-black transition"
                style={{
                  background: on ? 'var(--charcoal)' : '#fff',
                  color: on ? '#fff' : 'var(--ink-2)',
                  border: `1px solid ${on ? 'var(--charcoal)' : 'rgba(23,23,23,0.1)'}`,
                }}
              >
                {item === 'all' ? '全部科目' : SUBJECT_LABELS[item]}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {cityOptions.map((item) => {
            const on = city === item
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCity(item)}
                className="rounded-full px-4 py-2 text-sm font-black transition"
                style={{
                  background: on ? 'var(--teal)' : '#fff',
                  color: on ? '#fff' : 'var(--ink-2)',
                  border: `1px solid ${on ? 'var(--teal)' : 'rgba(23,23,23,0.1)'}`,
                }}
              >
                {item === 'all' ? '全部城市' : item}
              </button>
            )
          })}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((recall) => {
            const tone = SUBJECT_COLORS[recall.subject]
            const isSpeaking = recall.subject === 'speaking'

            return (
              <article key={recall.id} className="card card-lift p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill" style={{ background: tone.bg, color: tone.color }}>
                    {SUBJECT_LABELS[recall.subject]}
                  </span>
                  {recall.difficulty && <span className="pill bg-[var(--bg)] text-[var(--ink-3)]">{recall.difficulty}</span>}
                  {!isSpeaking && <span className="pill bg-white text-[var(--ink-3)] ring-1 ring-black/10">本月高频</span>}
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-[var(--ink-3)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} className="text-[var(--teal)]" />
                    {recall.date}
                  </span>
                  {isSpeaking && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} className="text-[var(--teal)]" />
                      {recall.city} · {recall.venue}
                    </span>
                  )}
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
