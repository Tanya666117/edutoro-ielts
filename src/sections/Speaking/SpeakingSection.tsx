import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, Download, Eye, EyeOff, Mic, Search, Shuffle, Square, Timer } from 'lucide-react'
import { SectionHeader } from '../../components/SectionHeader'
import speakingTopics from '../../data/speaking-topics.json'
import type { SpeakingTopic, SpeakingView } from '../../types'
import { TopicIcon } from './TopicIcon'

const topics = speakingTopics as SpeakingTopic[]

function pickRandomQuestion() {
  const topic = topics[Math.floor(Math.random() * topics.length)]
  const question = topic.questions[Math.floor(Math.random() * topic.questions.length)]
  return { topic, question }
}

function isPracticePrompt(text: string) {
  return text.startsWith('Practice prompt:')
}

export function SpeakingSection() {
  const [view, setView] = useState<SpeakingView>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [search, setSearch] = useState('')
  const [practice, setPractice] = useState(() => pickRandomQuestion())
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingError, setRecordingError] = useState('')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const selected = useMemo(() => topics.find((topic) => topic.id === selectedId) ?? null, [selectedId])
  const totalQuestions = useMemo(() => topics.reduce((sum, topic) => sum + topic.questionCount, 0), [])

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return topics
    return topics.filter((topic) => topic.titleEn.toLowerCase().includes(query))
  }, [search])

  const openTopic = (id: string) => {
    setSelectedId(id)
    setView('topic')
    setShowAnswer(false)
  }

  const startPractice = () => {
    setPractice(pickRandomQuestion())
    setView('practice')
    setShowAnswer(false)
  }

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop())
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      setRecordingError('')
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
        setAudioUrl(null)
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }
      recorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      setRecordingError('浏览器没有拿到麦克风权限，可以检查权限后再试一次。')
    }
  }

  const stopRecording = () => {
    recorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <section id="speaking" className="section scroll-mt-24 bg-white">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="口语题库"
            title="Part 1 题库直练"
            description={`${topics.length} 个话题 · ${totalQuestions}+ 真题。部分题目配 7.5+ 示例回答，新增题先给练习提示。`}
          />
          {view === 'list' && (
            <button type="button" onClick={startPractice} className="btn btn-dark shrink-0">
              <Shuffle size={16} />
              随机模拟
            </button>
          )}
        </div>

        {view !== 'list' && (
          <button
            type="button"
            onClick={() => {
              setView('list')
              setSelectedId(null)
              setShowAnswer(false)
            }}
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-black text-[var(--teal)]"
          >
            <ArrowLeft size={16} />
            返回话题列表
          </button>
        )}

        {view === 'list' && (
          <>
            <div className="relative mt-10 max-w-md">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: 'var(--ink-3)' }}
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索话题，如 History、Music"
                className="w-full rounded-full bg-[var(--bg)] py-3.5 pl-11 pr-4 text-sm font-semibold outline-none"
                style={{ border: '1px solid rgba(23,23,23,0.1)', boxShadow: 'var(--shadow-sm)' }}
              />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => openTopic(topic.id)}
                  className="card card-lift group flex min-h-[176px] flex-col p-6 text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[var(--yellow-soft)] text-[var(--ink)]">
                      <TopicIcon name={topic.icon} />
                    </div>
                    <span className="pill bg-[var(--bg)] text-[var(--ink-3)]">#{String(topic.num).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-5 text-[18px] font-black text-[var(--ink)]">{topic.titleEn}</h3>
                  <p className="mt-1 text-sm font-bold text-[var(--ink-3)]">{topic.questionCount} 道题目</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-black text-[var(--teal)]">
                    进入练习
                    <ChevronRight size={16} className="transition group-hover:translate-x-0.5" />
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {view === 'topic' && selected && (
          <div className="mt-10 space-y-4">
            <div className="card flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[var(--yellow-soft)] text-[var(--ink)]">
                <TopicIcon name={selected.icon} />
              </div>
              <div>
                <p className="text-xs font-black text-[var(--teal)]">Topic {selected.num}</p>
                <h3 className="text-xl font-black">{selected.titleEn}</h3>
              </div>
            </div>

            {selected.questions.map((question, index) => {
              const promptOnly = isPracticePrompt(question.modelAnswerEn)
              return (
                <article key={question.id} className="card overflow-hidden">
                  <div className="p-6" style={{ borderLeft: '5px solid var(--yellow)' }}>
                    <span className="pill bg-[var(--yellow-soft)] text-[var(--ink)]">Q{index + 1}</span>
                    <p className="mt-3 text-lg font-black leading-snug">{question.questionEn}</p>
                    {question.questionZh && <p className="mt-2 text-sm text-[var(--ink-3)]">{question.questionZh}</p>}
                  </div>
                  <div className="px-6 py-5" style={{ background: 'var(--bg)', borderTop: '1px solid var(--line-2)' }}>
                    <p className="text-xs font-black tracking-wide text-[var(--teal)]">
                      {promptOnly ? 'PRACTICE PROMPT' : 'MODEL ANSWER'}
                    </p>
                    <p className="mt-3 text-[15px] leading-[1.8] text-[var(--ink-2)]">{question.modelAnswerEn}</p>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {view === 'practice' && (
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="card overflow-hidden" style={{ boxShadow: 'var(--shadow)' }}>
              <div className="flex items-center justify-between bg-[var(--charcoal)] px-6 py-4 text-white">
                <p className="text-sm font-bold text-white/70">模拟练习</p>
                <span className="pill bg-[var(--yellow)] text-[var(--ink)]">{practice.topic.titleEn}</span>
              </div>
              <div className="p-6 md:p-8">
                <div className="rounded-[8px] bg-[var(--yellow-soft)] p-6">
                  <p className="text-xl font-black leading-snug md:text-2xl">{practice.question.questionEn}</p>
                  {practice.question.questionZh && (
                    <p className="mt-3 text-sm text-[var(--ink-2)]">{practice.question.questionZh}</p>
                  )}
                </div>
                <div className="mt-5 flex items-start gap-2 rounded-[8px] bg-white p-4 text-sm text-[var(--ink-2)] ring-1 ring-black/10">
                  <Timer size={16} className="mt-0.5 text-[var(--teal)]" />
                  建议先用 20 到 30 秒组织思路，口头回答后再看示例或练习提示。
                </div>
                <div className="mt-5 rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10">
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={recording ? stopRecording : startRecording} className="btn btn-yellow !min-h-0 !px-4 !py-2.5 text-sm">
                      {recording ? <Square size={15} /> : <Mic size={15} />}
                      {recording ? '停止录音' : '开始录音'}
                    </button>
                    {audioUrl && (
                      <a href={audioUrl} download="ielts-speaking-practice.webm" className="btn btn-outline !min-h-0 !px-4 !py-2.5 text-sm">
                        <Download size={15} />
                        保存录音
                      </a>
                    )}
                    <p className="text-xs font-bold text-[var(--ink-3)]">录音只保存在你的浏览器本地，不会上传。</p>
                  </div>
                  {audioUrl && <audio src={audioUrl} controls className="mt-4 w-full" />}
                  {recordingError && <p className="mt-3 text-sm font-bold text-[var(--red)]">{recordingError}</p>}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setShowAnswer((value) => !value)} className="btn btn-dark">
                    {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showAnswer ? '隐藏内容' : '查看提示'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPractice(pickRandomQuestion())
                      setShowAnswer(false)
                    }}
                    className="btn btn-outline"
                  >
                    <Shuffle size={16} />
                    下一题
                  </button>
                </div>
                {showAnswer && (
                  <div className="mt-6 rounded-[8px] p-5 ring-1 ring-black/10">
                    <p className="text-xs font-black text-[var(--teal)]">
                      {isPracticePrompt(practice.question.modelAnswerEn) ? 'PRACTICE PROMPT' : 'MODEL ANSWER · Band 7.5+'}
                    </p>
                    <p className="mt-3 text-[15px] leading-[1.8] text-[var(--ink-2)]">{practice.question.modelAnswerEn}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
