import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, Download, Eye, EyeOff, Library, Mic, Pause, Search, Shuffle, Trash2 } from 'lucide-react'
import { SectionHeader } from '../../components/SectionHeader'
import speakingTopics from '../../data/speaking-topics.json'
import type { SpeakingQuestion, SpeakingTopic } from '../../types'
import { TopicIcon } from './TopicIcon'

const topics = speakingTopics as SpeakingTopic[]
const highFrequencyQuestions = [
  { id: 'hf-1', title: 'Work or studies', question: 'Do you work or are you a student?', zh: '工作还是学习？' },
  { id: 'hf-2', title: 'Hometown', question: 'What do you like most about your hometown?', zh: '你最喜欢家乡的什么？' },
  { id: 'hf-3', title: 'Technology', question: 'What piece of technology do you use every day?', zh: '你每天都会用到什么科技产品？' },
  { id: 'hf-4', title: 'Describe a person', question: 'Describe someone who has influenced you.', zh: '描述一个影响过你的人。' },
  { id: 'hf-5', title: 'Describe a place', question: 'Describe a place you would like to visit.', zh: '描述一个你想去的地方。' },
  { id: 'hf-6', title: 'An important decision', question: 'Describe an important decision you have made.', zh: '描述一个你做过的重要决定。' },
]

type View = 'library' | 'topic' | 'practice'
type LibraryTab = 'topics' | 'highFrequency'
interface Recording { id: string; topicId: string; question: string; createdAt: string; durationSeconds?: number; audioUrl: string }

function pickQuestion(): { topic: SpeakingTopic; question: SpeakingQuestion } {
  const topic = topics[Math.floor(Math.random() * topics.length)]
  const question = topic.questions[Math.floor(Math.random() * topic.questions.length)]
  return { topic, question }
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export function SpeakingSection() {
  const [view, setView] = useState<View>('library')
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('topics')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [search, setSearch] = useState('')
  const [practice, setPractice] = useState(() => pickQuestion())
  const [practiceHighFrequency, setPracticeHighFrequency] = useState<(typeof highFrequencyQuestions)[number] | null>(null)
  const [recording, setRecording] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [recordingError, setRecordingError] = useState('')
  const [userId, setUserId] = useState(() => window.localStorage.getItem('edutoro-speaking-user') || 'edutoro')
  const [recordings, setRecordings] = useState<Recording[]>([])
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const totalQuestions = useMemo(() => topics.reduce((sum, topic) => sum + topic.questionCount, 0), [])
  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query ? topics.filter((topic) => `${topic.titleEn} ${topic.titleZh}`.toLowerCase().includes(query)) : topics
  }, [search])
  const filteredHighFrequency = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query ? highFrequencyQuestions.filter((item) => `${item.title} ${item.question}`.toLowerCase().includes(query)) : highFrequencyQuestions
  }, [search])
  const activeQuestion = practiceHighFrequency ? practiceHighFrequency.question : practice.question.questionEn
  const activeTopicLabel = practiceHighFrequency ? '本季高频精选' : practice.topic.titleEn

  useEffect(() => {
    window.localStorage.setItem('edutoro-speaking-user', userId)
    const load = async () => {
      try {
        const response = await fetch(`/api/speaking-recordings?userId=${encodeURIComponent(userId)}`)
        if (response.ok) setRecordings((await response.json()).recordings || [])
      } catch { /* API may be unavailable during static preview. */ }
    }
    void load()
  }, [userId])

  useEffect(() => () => {
    if (audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl)
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop())
  }, [audioUrl])

  const startPractice = (highFrequency = false) => {
    if (highFrequency) {
      setPracticeHighFrequency(highFrequencyQuestions[Math.floor(Math.random() * highFrequencyQuestions.length)])
    } else {
      setPracticeHighFrequency(null)
      setPractice(pickQuestion())
    }
    setView('practice')
    setShowAnswer(false)
    clearTake()
  }

  const clearTake = () => {
    if (audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl)
    setAudioUrl('')
    setRecordingBlob(null)
    setRecordingError('')
  }

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('当前浏览器不支持录音')
      clearTake()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        setRecordingBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }
      recorderRef.current = recorder
      recorder.start()
      setRecordingError('')
      setRecording(true)
    } catch (error) {
      setRecordingError(error instanceof Error ? error.message : '无法获取麦克风权限，请检查浏览器设置。')
    }
  }

  const stopRecording = () => { recorderRef.current?.stop(); setRecording(false) }

  const saveRecording = async () => {
    if (!recordingBlob) return
    try {
      setRecordingError('')
      const audioBase64 = await blobToBase64(recordingBlob)
      const response = await fetch('/api/speaking-recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topicId: practiceHighFrequency?.id || practice.topic.id, question: activeQuestion, mimeType: recordingBlob.type, audioBase64 }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || '录音保存失败')
      setRecordings((current) => [payload.recording, ...current])
      setRecordingError('录音已保存到你的练习库')
    } catch (error) {
      setRecordingError(error instanceof Error ? error.message : '录音保存失败，请稍后重试。')
    }
  }

  const deleteRecording = async (id: string) => {
    try {
      await fetch(`/api/speaking-recordings/${id}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
      setRecordings((current) => current.filter((item) => item.id !== id))
    } catch { setRecordingError('删除录音失败，请稍后重试。') }
  }

  return <section id="speaking" className="section scroll-mt-24 bg-white"><div className="shell">
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><SectionHeader eyebrow="口语练习" title="题库、高频题和录音复盘，放在一个练习台里" description={`${topics.length} 个主题、${totalQuestions}+ 道题，另有本季高频精选。每道题都可以直接开始练习并把录音存进自己的练习库。`} />{view === 'library' && <button type="button" onClick={() => startPractice(libraryTab === 'highFrequency')} className="btn btn-dark shrink-0"><Shuffle size={16} />随机练习</button>}</div>

    {view !== 'library' && <button type="button" onClick={() => { setView('library'); setSelectedId(null); setPracticeHighFrequency(null); clearTake() }} className="mt-8 inline-flex items-center gap-1.5 text-sm font-black text-[var(--teal)]"><ArrowLeft size={16} />返回题库</button>}

    {view === 'library' && <><div className="mt-9 flex flex-wrap items-center justify-between gap-4"><div className="flex rounded-[8px] bg-[var(--bg)] p-1 ring-1 ring-black/10"><button type="button" onClick={() => setLibraryTab('topics')} className="rounded-[6px] px-4 py-2 text-sm font-black" style={{ background: libraryTab === 'topics' ? 'var(--charcoal)' : 'transparent', color: libraryTab === 'topics' ? '#fff' : 'var(--ink-2)' }}><Library size={15} className="mr-2 inline" />完整题库</button><button type="button" onClick={() => setLibraryTab('highFrequency')} className="rounded-[6px] px-4 py-2 text-sm font-black" style={{ background: libraryTab === 'highFrequency' ? 'var(--charcoal)' : 'transparent', color: libraryTab === 'highFrequency' ? '#fff' : 'var(--ink-2)' }}>本季高频</button></div><label className="relative block w-full max-w-sm"><Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索主题或题目" className="w-full rounded-full border border-black/10 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--teal)]" /></label></div>
      {libraryTab === 'topics' ? <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredTopics.map((topic) => <button key={topic.id} type="button" onClick={() => { setSelectedId(topic.id); setView('topic'); setShowAnswer(false) }} className="card card-lift group flex min-h-[176px] flex-col p-6 text-left"><div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[var(--yellow-soft)] text-[var(--ink)]"><TopicIcon name={topic.icon} /></div><span className="pill bg-[var(--bg)] text-[var(--ink-3)]">#{String(topic.num).padStart(2, '0')}</span></div><h3 className="mt-5 text-[18px] font-black text-[var(--ink)]">{topic.titleEn}</h3><p className="mt-1 text-sm font-bold text-[var(--ink-3)]">{topic.questionCount} 道题目</p><span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-black text-[var(--teal)]">进入练习 <ChevronRight size={16} className="transition group-hover:translate-x-0.5" /></span></button>)}</div> : <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredHighFrequency.map((item) => <button key={item.id} type="button" onClick={() => { setPracticeHighFrequency(item); setView('practice'); setShowAnswer(false); clearTake() }} className="card card-lift group min-h-[170px] p-6 text-left"><span className="pill bg-[var(--yellow-soft)] text-[var(--ink)]">高频精选</span><h3 className="mt-4 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm font-bold leading-7 text-[var(--ink-2)]">{item.question}</p><p className="mt-4 text-sm font-black text-[var(--teal)]">开始录音练习 <ChevronRight size={16} className="inline" /></p></button>)}</div>}</>}

    {view === 'topic' && selectedId && <TopicDetail topic={topics.find((topic) => topic.id === selectedId)!} onPractice={() => { setPracticeHighFrequency(null); setPractice(pickQuestion()); setView('practice'); clearTake() }} showAnswer={showAnswer} setShowAnswer={setShowAnswer} />}
    {view === 'practice' && <PracticePanel question={activeQuestion} topicLabel={activeTopicLabel} showAnswer={showAnswer} setShowAnswer={setShowAnswer} recording={recording} audioUrl={audioUrl} recordingError={recordingError} onStart={startRecording} onStop={stopRecording} onSave={saveRecording} onNext={() => startPractice(Boolean(practiceHighFrequency))} userId={userId} setUserId={setUserId} recordings={recordings} onDelete={deleteRecording} />}
  </div></section>
}

function TopicDetail({ topic, onPractice, showAnswer, setShowAnswer }: { topic: SpeakingTopic; onPractice: () => void; showAnswer: boolean; setShowAnswer: (value: boolean) => void }) {
  return <div className="mt-9 space-y-4"><div className="card flex flex-wrap items-center justify-between gap-4 p-6"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[var(--yellow-soft)]"><TopicIcon name={topic.icon} /></div><div><p className="text-xs font-black text-[var(--teal)]">Topic {topic.num}</p><h3 className="text-xl font-black">{topic.titleEn}</h3></div></div><button type="button" onClick={onPractice} className="btn btn-yellow !min-h-0 !px-4 !py-2.5 text-sm"><Mic size={16} />随机录音练习</button></div>{topic.questions.map((question, index) => <article key={question.id} className="card overflow-hidden"><div className="p-6" style={{ borderLeft: '5px solid var(--yellow)' }}><span className="pill bg-[var(--yellow-soft)] text-[var(--ink)]">Q{index + 1}</span><p className="mt-3 text-lg font-black leading-snug">{question.questionEn}</p></div>{showAnswer && <div className="border-t border-black/8 bg-[var(--bg)] px-6 py-5"><p className="text-xs font-black tracking-wide text-[var(--teal)]">MODEL ANSWER</p><p className="mt-3 text-[15px] leading-[1.8] text-[var(--ink-2)]">{question.modelAnswerEn}</p></div>}</article>)}<button type="button" onClick={() => setShowAnswer(!showAnswer)} className="btn btn-outline"><Eye size={16} />{showAnswer ? '隐藏示例答案' : '显示示例答案'}</button></div>
}

function PracticePanel({ question, topicLabel, showAnswer, setShowAnswer, recording, audioUrl, recordingError, onStart, onStop, onSave, onNext, userId, setUserId, recordings, onDelete }: { question: string; topicLabel: string; showAnswer: boolean; setShowAnswer: (value: boolean) => void; recording: boolean; audioUrl: string; recordingError: string; onStart: () => void; onStop: () => void; onSave: () => void; onNext: () => void; userId: string; setUserId: (value: string) => void; recordings: Recording[]; onDelete: (id: string) => void }) {
  return <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="card overflow-hidden"><div className="flex items-center justify-between bg-[var(--charcoal)] px-6 py-4 text-white"><p className="text-sm font-bold text-white/70">模拟练习</p><span className="pill bg-[var(--yellow)] text-[var(--ink)]">{topicLabel}</span></div><div className="p-6 md:p-8"><div className="rounded-[8px] bg-[var(--yellow-soft)] p-6"><p className="text-xl font-black leading-snug md:text-2xl">{question}</p></div><div className="mt-5 flex items-start gap-2 rounded-[8px] bg-[var(--bg)] p-4 text-sm leading-7 text-[var(--ink-2)]"><Mic size={16} className="mt-1 text-[var(--teal)]" />建议先用 20-30 秒组织思路，再完整回答。录音会保存到你的练习库。</div><div className="mt-5 rounded-[8px] bg-white p-4 ring-1 ring-black/10"><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={recording ? onStop : onStart} className="btn btn-yellow !min-h-0 !px-4 !py-2.5 text-sm">{recording ? <Pause size={15} /> : <Mic size={15} />}{recording ? '停止录音' : '开始录音'}</button>{audioUrl && <><button type="button" onClick={onSave} className="btn btn-dark !min-h-0 !px-4 !py-2.5 text-sm"><Download size={15} />保存到练习库</button><audio src={audioUrl} controls className="w-full" /></>} </div>{recordingError && <p className="mt-3 text-sm font-bold text-[var(--teal)]">{recordingError}</p>}</div><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => setShowAnswer(!showAnswer)} className="btn btn-outline">{showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}{showAnswer ? '隐藏提示' : '查看提示'}</button><button type="button" onClick={onNext} className="btn btn-outline"><Shuffle size={16} />下一题</button></div>{showAnswer && <div className="mt-6 rounded-[8px] bg-[var(--teal-soft)] p-5 text-sm leading-7 text-[var(--ink-2)]">先给出直接回答，再补充一个具体例子，最后用一句让步或结果句收束。避免背诵完整模板。</div>}</div></div><aside className="space-y-4"><div className="rounded-[8px] bg-[var(--bg)] p-5 ring-1 ring-black/10"><p className="text-sm font-black">我的录音库</p><p className="mt-1 text-xs leading-6 text-[var(--ink-3)]">录音会按你的学员编号保存在服务器的轻量数据库中。</p><label className="mt-4 block text-xs font-black text-[var(--ink-2)]">学员编号<input value={userId} onChange={(event) => setUserId(event.target.value.trim() || 'edutoro')} className="mt-1 w-full rounded-[6px] border border-black/10 bg-white px-3 py-2 text-sm" /></label></div><div className="rounded-[8px] bg-white p-5 ring-1 ring-black/10"><div className="flex items-center justify-between gap-3"><p className="text-sm font-black">已保存 {recordings.length} 条</p><Library size={17} className="text-[var(--teal)]" /></div><div className="mt-4 space-y-3">{recordings.length === 0 ? <p className="text-xs leading-6 text-[var(--ink-3)]">完成一次录音并点击保存，这里会出现可回听的记录。</p> : recordings.slice(0, 8).map((item) => <div key={item.id} className="rounded-[6px] bg-[var(--bg)] p-3"><p className="line-clamp-2 text-xs font-bold leading-5 text-[var(--ink-2)]">{item.question}</p><audio src={item.audioUrl} controls className="mt-2 w-full" /><button type="button" onClick={() => onDelete(item.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[var(--red)]"><Trash2 size={13} />删除</button></div>)}</div></div></aside></div>
}
