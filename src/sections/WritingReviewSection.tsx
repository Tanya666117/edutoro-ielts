import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BookMarked,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Download,
  History,
  ImagePlus,
  Layers3,
  Lightbulb,
  ListChecks,
  Loader2,
  PenLine,
  Save,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X,
  XCircle,
} from 'lucide-react'
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'

type TaskType = 'Task 2' | 'Task 1'
type CheckStatus = 'good' | 'warn' | 'bad'
type Criterion = { band: number; comment: string }
type Annotation = { original: string; revision: string; issueType: string; severity: string; reason: string }
type ChartFacts = { chartType: string; title: string; unit: string; overview: string; highest: string; lowest: string; trends: string; comparisons: string }
type SentenceStats = { words: number; sentences: number; paragraphs: number; averageSentenceLength: number }
type IssueStats = { task: number; coherence: number; vocabulary: number; grammar: number; style: number }
type VocabularyUpgrade = { original: string; upgrade: string; context: string; reason: string }
type Collocation = { phrase: string; example: string; useCase?: string }
type ImprovementItem = { title: string; priority: string; detail: string }
type EssayOutline = { questionType: string; position: string; bodyLogic: string }
type ReviewResult = {
  summary: string
  overallBand: number
  taskPromptUsed?: string
  criteria: Record<string, Criterion>
  annotations?: Annotation[]
  recommendations?: string[]
  warnings?: string[]
  polishedEssay?: string
  calibrationReference?: Record<string, { label: string; band: number }> | { unavailable: true; reason: string } | null
  cleanedWordCount?: number
  fallback?: boolean
  sentenceStats?: SentenceStats
  issueStats?: IssueStats
  vocabularyUpgrades?: VocabularyUpgrade[]
  collocations?: Collocation[]
  improvementPlan?: ImprovementItem[]
  essayOutline?: EssayOutline
}
type ReviewHistoryItem = { id: string; createdAt: string; taskType: TaskType; prompt: string; essay: string; result: ReviewResult }
type SavedVocabulary = VocabularyUpgrade & { id: string; savedAt: string }
type SavedTraining = ImprovementItem & { id: string; savedAt: string; completed?: boolean }
type EssayCheck = { label: string; detail: string; status: CheckStatus }

const taskOptions: TaskType[] = ['Task 2', 'Task 1']
const HISTORY_STORAGE_KEY = 'edutoro-writing-review-history-v2'
const VOCAB_STORAGE_KEY = 'edutoro-writing-vocabulary-v1'
const TRAINING_STORAGE_KEY = 'edutoro-writing-training-v1'

const criteriaLabels: Record<string, string> = {
  taskResponse: '任务回应',
  taskAchievement: '任务完成度',
  coherenceCohesion: '连贯与衔接',
  lexicalResource: '词汇资源',
  grammar: '语法多样性与准确性',
}

const issueLabels: Record<keyof IssueStats, string> = {
  task: '任务回应',
  coherence: '结构连贯',
  vocabulary: '词汇表达',
  grammar: '语法准确',
  style: '表达自然',
}

const issueColors: Record<string, string> = {
  'Task Response': 'bg-[var(--yellow-soft)] text-[var(--ink)]',
  'Task Achievement': 'bg-[var(--yellow-soft)] text-[var(--ink)]',
  Coherence: 'bg-[var(--teal-soft)] text-[var(--teal)]',
  Vocabulary: 'bg-blue-50 text-[var(--blue)]',
  Grammar: 'bg-red-50 text-[var(--red)]',
  Style: 'bg-neutral-100 text-[var(--ink-2)]',
}

const severityLabels: Record<string, string> = { high: '优先修改', medium: '建议修改', low: '可优化' }

const task2Samples = [
  {
    label: '观点讨论',
    prompt: 'Some people believe that university students should pay the full cost of their own education because they benefit the most from it. To what extent do you agree or disagree?',
  },
  {
    label: '双边讨论',
    prompt: 'Some people like to try new things, for example, places to visit and types of food. Other people prefer to keep doing things they are familiar with. Discuss both these attitudes and give your own opinion.',
  },
  {
    label: '利弊分析',
    prompt: 'In many countries, more people are choosing to live alone than in the past. Do the advantages of this trend outweigh the disadvantages?',
  },
  {
    label: '原因方案',
    prompt: 'Many young people today spend less time reading books than previous generations. Why is this happening, and what can be done to encourage them to read more?',
  },
]

const emptyChartFacts: ChartFacts = { chartType: '折线图', title: '', unit: '', overview: '', highest: '', lowest: '', trends: '', comparisons: '' }
const emptyIssueStats: IssueStats = { task: 0, coherence: 0, vocabulary: 0, grammar: 0, style: 0 }

function cleanInputText(value: string) {
  return value.normalize('NFKC').replace(/[\u0000-\u001F\u007F]/g, '').replace(/\r\n?/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim()
}

function countWords(value: string) {
  return (value.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || []).length
}

function countSentences(value: string) {
  return value.split(/[.!?]+/).map((item) => item.trim()).filter((item) => item.length > 8).length
}

function countParagraphs(value: string) {
  return value.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean).length || (value.trim() ? 1 : 0)
}

function calculateSentenceStats(value: string): SentenceStats {
  const words = countWords(value)
  const sentences = countSentences(value)
  const paragraphs = countParagraphs(value)
  return { words, sentences, paragraphs, averageSentenceLength: sentences ? Math.round((words / sentences) * 10) / 10 : 0 }
}

function chartFactsToText(facts: ChartFacts) {
  return Object.entries(facts).map(([key, value]) => `${key}: ${value || '未填写'}`).join('\n')
}

function safeReadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeIssueStats(result: ReviewResult): IssueStats {
  if (result.issueStats) return { ...emptyIssueStats, ...result.issueStats }
  return (result.annotations || []).reduce<IssueStats>((stats, item) => {
    if (item.issueType.includes('Task')) stats.task += 1
    else if (item.issueType === 'Coherence') stats.coherence += 1
    else if (item.issueType === 'Vocabulary') stats.vocabulary += 1
    else if (item.issueType === 'Grammar') stats.grammar += 1
    else stats.style += 1
    return stats
  }, { ...emptyIssueStats })
}

function buildChecks(taskType: TaskType, prompt: string, essay: string): EssayCheck[] {
  const cleanedPrompt = cleanInputText(prompt)
  const cleanedEssay = cleanInputText(essay)
  const stats = calculateSentenceStats(cleanedEssay)
  const targetWords = taskType === 'Task 2' ? 250 : 150
  const minimumWords = taskType === 'Task 2' ? 120 : 90
  const hasChinese = /[\u4e00-\u9fff]/.test(cleanedEssay)
  const hasPunctuation = /[.!?]/.test(cleanedEssay)
  const checks: EssayCheck[] = [
    {
      label: '题目是否完整',
      detail: cleanedPrompt.length >= 20 ? '题目信息足够用于判断任务回应' : '题目偏短，容易影响跑题判断',
      status: cleanedPrompt.length >= 20 ? 'good' : 'bad',
    },
    {
      label: '字数是否足够',
      detail: stats.words >= targetWords ? `已达到 ${targetWords} words 建议` : `当前约 ${stats.words} words，建议至少 ${targetWords} words`,
      status: stats.words >= targetWords ? 'good' : stats.words >= minimumWords ? 'warn' : 'bad',
    },
    {
      label: '段落是否清楚',
      detail: stats.paragraphs >= 3 ? `检测到 ${stats.paragraphs} 个段落` : '建议至少拆成引言、主体段和结论',
      status: stats.paragraphs >= 3 ? 'good' : stats.words > 0 ? 'warn' : 'bad',
    },
    {
      label: '内容是否展开',
      detail: stats.sentences >= 8 ? `约 ${stats.sentences} 个句子，平均 ${stats.averageSentenceLength} words` : '句子数量偏少，论证可能展开不足',
      status: stats.sentences >= 8 ? 'good' : stats.sentences >= 4 ? 'warn' : 'bad',
    },
    {
      label: '是否混入中文',
      detail: hasChinese ? '原文包含中文字符，请确认是否误粘贴说明' : '未检测到明显中文混入',
      status: hasChinese ? 'warn' : 'good',
    },
    {
      label: '标点是否完整',
      detail: hasPunctuation ? '句末标点正常' : '缺少明显英文句末标点',
      status: hasPunctuation ? 'good' : 'warn',
    },
  ]
  if (taskType === 'Task 1') {
    checks.push({
      label: '图表信息是否填写',
      detail: '图片只作预览，批改会使用你手动填写的关键数据',
      status: 'warn',
    })
  }
  return checks
}

function buildIdeaNotes(prompt: string) {
  const lower = prompt.toLowerCase()
  if (!prompt.trim()) return '先粘贴题目，我会根据题型拆立场、主体段和例子方向。'
  if (lower.includes('discuss both')) return '题型：双边讨论。建议结构：第一主体段解释保守选择的安全感和效率，第二主体段解释尝试新事物带来的成长，结论给出你的倾向。'
  if (lower.includes('advantages') || lower.includes('disadvantages')) return '题型：利弊分析。建议先判断哪一边更强，再让两个主体段分别承接好处和代价，结论不要写成五五开。'
  if (lower.includes('why') || lower.includes('reasons') || lower.includes('solutions')) return '题型：原因 / 方案。主体段一集中解释成因，主体段二给可执行方案，避免每段同时塞多个未展开观点。'
  return '题型：观点表达。建议先确定同意程度，再用两个主体段证明同一个立场；每段用 topic sentence + explanation + example 收住。'
}

function renderAnnotatedEssay(essay: string, annotations: Annotation[]) {
  const matches = annotations.map((annotation, index) => {
    const start = essay.indexOf(annotation.original)
    return start >= 0 && annotation.original.trim() ? { start, end: start + annotation.original.length, annotation, index } : null
  }).filter((item): item is NonNullable<typeof item> => Boolean(item)).sort((a, b) => a.start - b.start)
  const nodes: ReactNode[] = []
  let cursor = 0
  for (const match of matches) {
    if (match.start < cursor) continue
    if (match.start > cursor) nodes.push(<span key={`text-${cursor}`}>{essay.slice(cursor, match.start)}</span>)
    nodes.push(<mark key={`mark-${match.start}-${match.index}`} className="rounded-[4px] bg-[var(--yellow-soft)] px-1 py-0.5 text-[var(--ink)] ring-1 ring-yellow-300/70" title={`${match.annotation.issueType}: ${match.annotation.revision}`}>{essay.slice(match.start, match.end)}</mark>)
    cursor = match.end
  }
  if (cursor < essay.length) nodes.push(<span key={`text-${cursor}`}>{essay.slice(cursor)}</span>)
  return nodes.length ? nodes : essay
}

async function buildReportDocx(prompt: string, essay: string, result: ReviewResult) {
  const stats = result.sentenceStats || calculateSentenceStats(essay)
  const issueStats = normalizeIssueStats(result)
  const plan = result.improvementPlan || (result.recommendations || []).map((item) => ({ title: item, priority: 'medium', detail: item }))
  const paragraphs = [
    new Paragraph({ text: 'Edutoro IELTS 作文批改报告', heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: 'AI 结果仅供备考参考，正式成绩以 IELTS 官方评分为准。', bold: true })] }),
    new Paragraph({ text: '题目', heading: HeadingLevel.HEADING_1 }),
    new Paragraph(prompt || result.taskPromptUsed || '未提供题目'),
    new Paragraph({ text: '总体判断', heading: HeadingLevel.HEADING_1 }),
    new Paragraph(`参考分数：${result.overallBand}`),
    new Paragraph(result.summary || '暂无总结'),
    new Paragraph(`文本统计：${stats.words} words，${stats.sentences} 个句子，${stats.paragraphs} 个段落，平均句长 ${stats.averageSentenceLength} words。`),
    new Paragraph(`问题分布：任务回应 ${issueStats.task}，连贯结构 ${issueStats.coherence}，词汇 ${issueStats.vocabulary}，语法 ${issueStats.grammar}，风格 ${issueStats.style}。`),
    new Paragraph({ text: '四项评分', heading: HeadingLevel.HEADING_1 }),
    ...Object.entries(result.criteria || {}).map(([key, item]) => new Paragraph(`${criteriaLabels[key] || key}: ${item.band}. ${item.comment}`)),
    new Paragraph({ text: '原文批注', heading: HeadingLevel.HEADING_1 }),
    ...(result.annotations || []).map((item, index) => new Paragraph(`${index + 1}. ${item.issueType}: ${item.original} -> ${item.revision}. ${item.reason}`)),
    new Paragraph({ text: '高分词与词伙', heading: HeadingLevel.HEADING_1 }),
    ...(result.vocabularyUpgrades || []).map((item) => new Paragraph(`${item.original} -> ${item.upgrade}: ${item.reason || item.context}`)),
    ...(result.collocations || []).map((item) => new Paragraph(`${item.phrase}: ${item.example}`)),
    new Paragraph({ text: '下一步训练', heading: HeadingLevel.HEADING_1 }),
    ...plan.map((item) => new Paragraph(`${item.priority}: ${item.title}. ${item.detail}`)),
    new Paragraph({ text: '参考高分版本', heading: HeadingLevel.HEADING_1 }),
    new Paragraph(result.polishedEssay || essay),
  ]
  return Packer.toBlob(new Document({ sections: [{ properties: {}, children: paragraphs }] }))
}

export function WritingReviewSection() {
  const [taskType, setTaskType] = useState<TaskType>('Task 2')
  const [prompt, setPrompt] = useState('')
  const [essay, setEssay] = useState('')
  const [chartFacts, setChartFacts] = useState<ChartFacts>(emptyChartFacts)
  const [chartPreview, setChartPreview] = useState('')
  const [ideaNotes, setIdeaNotes] = useState('')
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportUrl, setReportUrl] = useState('')
  const [view, setView] = useState<'form' | 'report'>('form')
  const [history, setHistory] = useState<ReviewHistoryItem[]>([])
  const [savedVocabulary, setSavedVocabulary] = useState<SavedVocabulary[]>([])
  const [savedTraining, setSavedTraining] = useState<SavedTraining[]>([])
  const [sidePanel, setSidePanel] = useState<'history' | 'vocab' | 'training'>('history')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const liveStats = useMemo(() => calculateSentenceStats(essay), [essay])
  const checks = useMemo(() => buildChecks(taskType, prompt, essay), [essay, prompt, taskType])
  const highRiskCount = checks.filter((item) => item.status === 'bad').length

  useEffect(() => {
    setHistory(safeReadStorage<ReviewHistoryItem[]>(HISTORY_STORAGE_KEY, []))
    setSavedVocabulary(safeReadStorage<SavedVocabulary[]>(VOCAB_STORAGE_KEY, []))
    setSavedTraining(safeReadStorage<SavedTraining[]>(TRAINING_STORAGE_KEY, []))
  }, [])

  useEffect(() => {
    if (!drawerOpen) return undefined
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [drawerOpen])

  useEffect(() => {
    if (!result) return undefined
    let objectUrl = ''
    buildReportDocx(prompt, essay, result).then((blob) => {
      objectUrl = URL.createObjectURL(blob)
      setReportUrl(objectUrl)
    })
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [essay, prompt, result])

  const persistHistory = (items: ReviewHistoryItem[]) => {
    setHistory(items)
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items))
  }

  const persistVocabulary = (items: SavedVocabulary[]) => {
    setSavedVocabulary(items)
    window.localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(items))
  }

  const persistTraining = (items: SavedTraining[]) => {
    setSavedTraining(items)
    window.localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(items))
  }

  const handleChartUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('请上传 JPG、PNG 或 WebP 图表图片。')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setChartPreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  const readUploadedFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!/\.(txt|md)$/i.test(file.name)) {
      setError('目前支持上传 txt 或 md 文本文件。')
      return
    }
    setError('')
    setEssay(cleanInputText(await file.text()))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const cleanedPrompt = cleanInputText(prompt)
    const cleanedEssay = cleanInputText(essay)
    if (cleanedEssay.length < 80) {
      setError('请至少提交 80 个字符以上的英文作文原文。')
      return
    }
    if (cleanedPrompt.length < 20) {
      setError('请先粘贴完整题目，批改需要题目作为任务回应的依据。')
      return
    }
    if (taskType === 'Task 2' && countWords(cleanedEssay) < 120) {
      setError(`当前约 ${countWords(cleanedEssay)} words，Task 2 内容过短，无法稳定分析。`)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch('/api/writing-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType, prompt: cleanedPrompt, essay: cleanedEssay, chartContext: taskType === 'Task 1' ? chartFactsToText(chartFacts) : '' }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || '批改失败，请稍后重试。')
      const normalizedResult: ReviewResult = { ...payload, sentenceStats: payload.sentenceStats || calculateSentenceStats(cleanedEssay) }
      setPrompt(cleanedPrompt)
      setEssay(cleanedEssay)
      setResult(normalizedResult)
      persistHistory([{ id: makeId('review'), createdAt: new Date().toISOString(), taskType, prompt: cleanedPrompt, essay: cleanedEssay, result: normalizedResult }, ...history].slice(0, 8))
      setView('report')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '批改失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  const loadHistoryItem = (item: ReviewHistoryItem) => {
    setTaskType(item.taskType)
    setPrompt(item.prompt)
    setEssay(item.essay)
    setResult(item.result)
    setDrawerOpen(false)
    setView('report')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearHistory = () => persistHistory([])

  const saveVocabulary = (item: VocabularyUpgrade) => {
    if (savedVocabulary.some((saved) => saved.original === item.original && saved.upgrade === item.upgrade)) return
    persistVocabulary([{ ...item, id: makeId('vocab'), savedAt: new Date().toISOString() }, ...savedVocabulary].slice(0, 30))
  }

  const saveTraining = (item: ImprovementItem) => {
    if (savedTraining.some((saved) => saved.title === item.title)) return
    persistTraining([{ ...item, id: makeId('training'), savedAt: new Date().toISOString() }, ...savedTraining].slice(0, 30))
  }

  const openUtilityPanel = (panel: 'history' | 'vocab' | 'training') => {
    setSidePanel(panel)
    setDrawerOpen(true)
  }

  if (view === 'report' && result) {
    return (
      <section className="relative scroll-mt-24 bg-[#fffdf8] py-8 md:py-12">
        <div className="shell">
          <ReportHeader
            historyCount={history.length}
            reportUrl={reportUrl}
            result={result}
            savedTrainingCount={savedTraining.length}
            savedVocabularyCount={savedVocabulary.length}
            onBack={() => setView('form')}
            onOpenUtility={openUtilityPanel}
          />
          <ReviewReport
            essay={essay}
            prompt={prompt}
            result={result}
            savedTraining={savedTraining}
            savedVocabulary={savedVocabulary}
            onSaveTraining={saveTraining}
            onSaveVocabulary={saveVocabulary}
          />
        </div>
        <SavedItemsDrawer
          history={history}
          open={drawerOpen}
          panel={sidePanel}
          savedTraining={savedTraining}
          savedVocabulary={savedVocabulary}
          onClearHistory={clearHistory}
          onClose={() => setDrawerOpen(false)}
          onLoadHistory={loadHistoryItem}
          onPanelChange={setSidePanel}
        />
      </section>
    )
  }

  return (
    <section className="relative scroll-mt-24 bg-[#f7f3e8] py-6 md:py-10">
      <div className="shell">
        <div className="mb-4 flex flex-col gap-4 border border-black/10 bg-white px-4 py-3 shadow-[var(--shadow-sm)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[var(--teal)]">IELTS Writing Practice</p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-[var(--ink)]">作文在线练习与批改</h1>
          </div>
          <UtilityToolbar
            historyCount={history.length}
            savedTrainingCount={savedTraining.length}
            savedVocabularyCount={savedVocabulary.length}
            onOpen={openUtilityPanel}
          />
        </div>

        <form onSubmit={submit} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 border border-black/10 bg-white shadow-[var(--shadow-sm)]">
            <div className="grid border-b border-black/10 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="border-b border-black/10 bg-[#fbf7e8] p-4 md:border-b-0 md:border-r">
                <p className="text-xs font-black text-[var(--ink-3)]">写作任务</p>
                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-1">
                  {taskOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setTaskType(option)
                        setError('')
                      }}
                      className={`flex min-h-11 items-center justify-between rounded-[6px] px-3 text-sm font-black transition ${taskType === option ? 'bg-[var(--yellow)] text-[var(--ink)] shadow-sm' : 'bg-white text-[var(--ink-2)] ring-1 ring-black/10 hover:bg-[var(--yellow-soft)]'}`}
                    >
                      {option}
                      <span className="text-[11px]">{option === 'Task 2' ? '250+' : '150+'}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-xs font-bold leading-5 text-[var(--ink-3)]">
                  <p>模式参考 IELTS9：先选任务，再放题目，最后输入作文并获得即时统计。</p>
                  <p>历史、词汇本、训练清单保存在当前浏览器。</p>
                </div>
              </div>

              <div className="p-4 md:p-5">
                <TaskPromptPanel
                  ideaNotes={ideaNotes}
                  prompt={prompt}
                  taskType={taskType}
                  onGenerateIdeas={() => setIdeaNotes(buildIdeaNotes(prompt))}
                  onPromptChange={setPrompt}
                  onSample={(samplePrompt) => {
                    setPrompt(samplePrompt)
                    setIdeaNotes('')
                  }}
                />
                {taskType === 'Task 1' && (
                  <ChartFactsPanel
                    chartFacts={chartFacts}
                    chartPreview={chartPreview}
                    onChange={setChartFacts}
                    onUpload={handleChartUpload}
                  />
                )}
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-base font-black text-[var(--ink)]" htmlFor="writing-essay">作文内容</label>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-[6px] border border-black/10 bg-white px-3 text-sm font-black text-[var(--ink-2)] transition hover:bg-[var(--yellow-soft)]">
                    <ImagePlus size={17} />图片转文字
                    <input type="file" accept="image/*" className="hidden" onChange={() => setError('图片转文字入口已保留，当前版本请先手动粘贴识别后的文本。')} />
                  </label>
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-[6px] border border-[var(--teal)]/35 bg-white px-3 text-sm font-black text-[var(--teal)] transition hover:bg-[var(--teal-soft)]">
                    <Upload size={17} />上传文本
                    <input type="file" accept=".txt,.md,text/plain,text/markdown" className="hidden" onChange={readUploadedFile} />
                  </label>
                </div>
              </div>
              <textarea
                id="writing-essay"
                value={essay}
                onChange={(event) => setEssay(event.target.value)}
                placeholder={taskType === 'Task 1' ? '在这里粘贴至少 150 words 的小作文。' : '在这里粘贴至少 250 words 的大作文。'}
                className="mt-3 min-h-[460px] w-full resize-y rounded-[6px] border border-black/10 bg-[#fffef8] p-4 font-mono text-[15px] leading-7 outline-none transition focus:border-[var(--teal)] focus:bg-white focus:ring-2 focus:ring-[var(--teal-soft)]"
                required
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                <StatPill label="words" value={liveStats.words} />
                <StatPill label="sentences" value={liveStats.sentences} />
                <StatPill label="paragraphs" value={liveStats.paragraphs} />
                <StatPill label="avg / sentence" value={liveStats.averageSentenceLength} />
              </div>
              {error && <div className="mt-4 flex items-start gap-2 rounded-[6px] bg-red-50 p-3 text-sm font-bold leading-6 text-[var(--red)]"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={loading} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[6px] bg-[var(--yellow)] px-5 text-sm font-black text-[var(--ink)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {loading ? '正在批改...' : '开始批改'}
                </button>
                {result && <button type="button" onClick={() => setView('report')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] border border-[var(--teal)]/40 bg-white px-4 text-sm font-black text-[var(--teal)] transition hover:bg-[var(--teal-soft)]"><History size={17} />查看上一份报告</button>}
              </div>
            </div>
          </div>

          <ControlPanel
            checks={checks}
            highRiskCount={highRiskCount}
            taskType={taskType}
          />
        </form>
      </div>
      <SavedItemsDrawer
        history={history}
        open={drawerOpen}
        panel={sidePanel}
        savedTraining={savedTraining}
        savedVocabulary={savedVocabulary}
        onClearHistory={clearHistory}
        onClose={() => setDrawerOpen(false)}
        onLoadHistory={loadHistoryItem}
        onPanelChange={setSidePanel}
      />
    </section>
  )
}

function UtilityToolbar({ historyCount, savedVocabularyCount, savedTrainingCount, onOpen }: {
  historyCount: number
  savedVocabularyCount: number
  savedTrainingCount: number
  onOpen: (panel: 'history' | 'vocab' | 'training') => void
}) {
  return (
    <div className="flex items-center gap-2">
      {([
        { id: 'history', label: '历史记录', count: historyCount, icon: History },
        { id: 'vocab', label: '词汇本', count: savedVocabularyCount, icon: BookMarked },
        { id: 'training', label: '训练清单', count: savedTrainingCount, icon: ListChecks },
      ].map(({ id, label, count, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onOpen(id as 'history' | 'vocab' | 'training')}
          className="relative flex h-10 w-10 items-center justify-center rounded-[6px] border border-black/10 bg-white text-[var(--ink-2)] transition hover:border-[var(--teal)]/40 hover:bg-[var(--teal-soft)] hover:text-[var(--teal)]"
          aria-label={label}
          title={label}
        >
          <Icon size={18} />
          {count > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--yellow)] px-1 text-[9px] font-black text-[var(--ink)]">{count}</span>}
        </button>
      )) as ReactNode[])}
    </div>
  )
}

function TaskPromptPanel({ taskType, prompt, ideaNotes, onPromptChange, onSample, onGenerateIdeas }: {
  taskType: TaskType
  prompt: string
  ideaNotes: string
  onPromptChange: (value: string) => void
  onSample: (value: string) => void
  onGenerateIdeas: () => void
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-base font-black text-[var(--ink)]" htmlFor="writing-prompt">作文题目</label>
        {taskType === 'Task 2' && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onSample(task2Samples[Math.floor(Math.random() * task2Samples.length)].prompt)} className="inline-flex min-h-9 items-center gap-2 rounded-[6px] border border-black/10 bg-white px-3 text-xs font-black text-[var(--ink-2)] transition hover:bg-[var(--yellow-soft)]">
              <Sparkles size={15} />随机题目
            </button>
            <button type="button" onClick={onGenerateIdeas} className="inline-flex min-h-9 items-center gap-2 rounded-[6px] border border-[var(--teal)]/35 bg-white px-3 text-xs font-black text-[var(--teal)] transition hover:bg-[var(--teal-soft)]">
              <Wand2 size={15} />观点提示
            </button>
          </div>
        )}
      </div>
      <textarea
        id="writing-prompt"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder={taskType === 'Task 1' ? '粘贴 Task 1 图表题目和题干。' : '粘贴完整 Task 2 题目，或点击随机题目开始。'}
        className="mt-3 min-h-[116px] w-full resize-y rounded-[6px] border border-black/10 bg-[#fffef8] p-4 text-[15px] leading-7 outline-none transition focus:border-[var(--teal)] focus:bg-white focus:ring-2 focus:ring-[var(--teal-soft)]"
      />
      {taskType === 'Task 2' && (
        <div className="mt-3 flex flex-wrap gap-2">
          {task2Samples.map((sample) => (
            <button key={sample.label} type="button" onClick={() => onSample(sample.prompt)} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-black text-[var(--ink-2)] transition hover:bg-[var(--yellow-soft)]">
              {sample.label}
            </button>
          ))}
        </div>
      )}
      {ideaNotes && <div className="mt-3 rounded-[6px] bg-[var(--teal-soft)] px-4 py-3 text-sm font-bold leading-7 text-[var(--ink-2)]">{ideaNotes}</div>}
    </div>
  )
}

function ChartFactsPanel({ chartFacts, chartPreview, onChange, onUpload }: {
  chartFacts: ChartFacts
  chartPreview: string
  onChange: (facts: ChartFacts) => void
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <details className="mt-4 rounded-[6px] border border-yellow-300/60 bg-[var(--yellow-soft)] p-4">
      <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-black text-[var(--ink)]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-white text-[var(--teal)]"><BarChart3 size={18} /></span>
        Task 1 图表信息
        <span className="ml-auto text-xs font-bold text-[var(--ink-3)]">点击填写</span>
      </summary>
      <p className="mt-3 text-sm font-bold leading-7 text-[var(--ink-2)]">当前批改以手动填写的关键数据为准，图片仅用于预览。</p>
      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-black/10 bg-white px-3 py-3 text-sm font-black text-[var(--teal)]">
        <ImagePlus size={17} />上传图表预览
        <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
      </label>
      {chartPreview && <img src={chartPreview} alt="Task 1 图表预览" className="mt-3 max-h-52 w-full rounded-[6px] bg-white object-contain ring-1 ring-black/10" />}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-black text-[var(--ink-2)]">图表类型<select value={chartFacts.chartType} onChange={(event) => onChange({ ...chartFacts, chartType: event.target.value })} className="mt-1 w-full rounded-[6px] border border-black/10 bg-white px-3 py-2 text-sm font-semibold"><option>折线图</option><option>柱状图</option><option>饼图</option><option>表格</option><option>流程图 / 地图</option></select></label>
        <label className="text-xs font-black text-[var(--ink-2)]">单位 / 时间范围<input value={chartFacts.unit} onChange={(event) => onChange({ ...chartFacts, unit: event.target.value })} placeholder="例如：百分比，2000-2020" className="mt-1 w-full rounded-[6px] border border-black/10 bg-white px-3 py-2 text-sm" /></label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {([
          ['overview', 'Overview 一句话', '整体上升 / 波动 / 两组相反趋势'],
          ['highest', '最高点 / 最大值', '对象 + 数值 + 时间'],
          ['lowest', '最低点 / 最小值', '对象 + 数值 + 时间'],
          ['trends', '趋势节点', '上升、下降、稳定或转折'],
          ['comparisons', '关键对比', '两组或多个对象的差异'],
        ] as const).map(([key, label, placeholder]) => <label key={key} className={`text-xs font-black text-[var(--ink-2)] ${key === 'overview' ? 'sm:col-span-2' : ''}`}>{label}<input value={chartFacts[key]} onChange={(event) => onChange({ ...chartFacts, [key]: event.target.value })} placeholder={placeholder} className="mt-1 w-full rounded-[6px] border border-black/10 bg-white px-3 py-2 text-sm" /></label>)}
      </div>
    </details>
  )
}

function ControlPanel({ checks, highRiskCount, taskType }: {
  checks: EssayCheck[]
  highRiskCount: number
  taskType: TaskType
}) {
  const [showAllChecks, setShowAllChecks] = useState(false)
  const primaryLabels = taskType === 'Task 1'
    ? ['题目是否完整', '字数是否足够', '段落是否清楚', '图表信息是否填写']
    : ['题目是否完整', '字数是否足够', '段落是否清楚', '标点是否完整']
  const primaryChecks = primaryLabels.map((label) => checks.find((item) => item.label === label)).filter((item): item is EssayCheck => Boolean(item))
  const secondaryChecks = checks.filter((item) => !primaryLabels.includes(item.label))
  const highlights = [
    { title: '四项评分', text: '任务回应、连贯、词汇、语法分别判断', icon: ClipboardCheck },
    { title: '逐句批注', text: '定位原句并给出可替换表达', icon: PenLine },
    { title: 'Word 报告', text: '批改完成后可下载复盘文档', icon: Download },
  ]
  return (
    <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
      <div className="border border-black/10 bg-white p-5 shadow-[var(--shadow-sm)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-[var(--teal)]">提交前确认</p>
            <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">批改前检查</h2>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] bg-[var(--yellow)] text-[var(--ink)]"><ClipboardCheck size={22} /></span>
        </div>
        <div className={`mt-4 rounded-[6px] px-4 py-3 text-sm font-black ${highRiskCount ? 'bg-[var(--yellow-soft)] text-[var(--ink)]' : 'bg-[var(--teal-soft)] text-[var(--teal)]'}`}>
          {highRiskCount ? `还需补充 ${highRiskCount} 项` : '可以提交'}
        </div>
        <div className="mt-4"><CheckList checks={primaryChecks} /></div>
        {secondaryChecks.length > 0 && (
          <div className="mt-3 border-t border-black/10 pt-3">
            <button type="button" onClick={() => setShowAllChecks((value) => !value)} className="inline-flex min-h-9 items-center text-xs font-black text-[var(--teal)] hover:underline">{showAllChecks ? '收起其他检查' : `查看其他 ${secondaryChecks.length} 项检查`}</button>
            {showAllChecks && <div className="mt-2"><CheckList checks={secondaryChecks} /></div>}
          </div>
        )}
      </div>
      {highlights.map(({ title, text, icon: Icon }) => (
        <div key={title} className="flex items-start gap-3 border border-black/10 bg-white p-4 shadow-[var(--shadow-sm)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-[var(--teal-soft)] text-[var(--teal)]"><Icon size={19} /></span>
          <div className="min-w-0">
            <p className="text-sm font-black text-[var(--ink)]">{title}</p>
            <p className="mt-1 text-xs font-bold leading-5 text-[var(--ink-3)]">{text}</p>
          </div>
        </div>
      ))}
    </aside>
  )
}

function SavedItemsDrawer({ open, panel, history, savedVocabulary, savedTraining, onClose, onPanelChange, onLoadHistory, onClearHistory }: {
  open: boolean
  panel: 'history' | 'vocab' | 'training'
  history: ReviewHistoryItem[]
  savedVocabulary: SavedVocabulary[]
  savedTraining: SavedTraining[]
  onClose: () => void
  onPanelChange: (panel: 'history' | 'vocab' | 'training') => void
  onLoadHistory: (item: ReviewHistoryItem) => void
  onClearHistory: () => void
}) {
  if (!open) return null
  const tabs = [
    { id: 'history' as const, label: '历史记录', icon: History },
    { id: 'vocab' as const, label: '词汇本', icon: BookMarked },
    { id: 'training' as const, label: '训练清单', icon: ListChecks },
  ]
  const activeTab = tabs.find((item) => item.id === panel) || tabs[0]
  const ActiveIcon = activeTab.icon
  return (
    <div className="fixed inset-0 z-[80]">
      <button type="button" className="absolute inset-0 bg-black/20" onClick={onClose} aria-label="关闭侧边栏" />
      <aside role="dialog" aria-modal="true" aria-label={activeTab.label} className="absolute inset-y-0 right-0 flex w-full max-w-[390px] flex-col border-l border-black/10 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[var(--teal-soft)] text-[var(--teal)]"><ActiveIcon size={19} /></span>
            <h2 className="text-lg font-black text-[var(--ink)]">{activeTab.label}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-black/10 text-[var(--ink-2)] transition hover:bg-[var(--bg)]" aria-label="关闭" title="关闭"><X size={19} /></button>
        </div>
        <div className="grid grid-cols-3 gap-2 border-b border-black/10 p-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => onPanelChange(id)} className={`flex min-h-10 items-center justify-center gap-1.5 rounded-[6px] px-2 text-xs font-black transition ${panel === id ? 'bg-[var(--yellow)] text-[var(--ink)]' : 'bg-[var(--bg)] text-[var(--ink-2)] hover:bg-[var(--yellow-soft)]'}`}><Icon size={15} />{label}</button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {panel === 'history' && <HistoryPanel history={history} onClearHistory={onClearHistory} onLoadHistory={onLoadHistory} />}
          {panel === 'vocab' && <SavedVocabularyPanel items={savedVocabulary} />}
          {panel === 'training' && <SavedTrainingPanel items={savedTraining} />}
        </div>
      </aside>
    </div>
  )
}

function CheckList({ checks }: { checks: EssayCheck[] }) {
  return <div className="space-y-3">{checks.map((item) => {
    const Icon = item.status === 'good' ? CheckCircle2 : item.status === 'warn' ? AlertCircle : XCircle
    const color = item.status === 'good' ? 'text-[var(--teal)] bg-[var(--teal-soft)]' : item.status === 'warn' ? 'text-[var(--ink)] bg-[var(--yellow-soft)]' : 'text-[var(--red)] bg-red-50'
    return <div key={item.label} className="flex items-start gap-3 rounded-[6px] bg-[var(--bg)] p-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] ${color}`}><Icon size={18} /></span>
      <div>
        <p className="text-sm font-black text-[var(--ink)]">{item.label}</p>
        <p className="mt-1 text-xs font-bold leading-6 text-[var(--ink-3)]">{item.detail}</p>
      </div>
    </div>
  })}</div>
}

function HistoryPanel({ history, onLoadHistory, onClearHistory }: { history: ReviewHistoryItem[]; onLoadHistory: (item: ReviewHistoryItem) => void; onClearHistory: () => void }) {
  if (!history.length) return <EmptyPanel icon={History} title="还没有批改记录" text="生成报告后，最近 8 份会保存在当前浏览器。" />
  return <div className="space-y-3">
    {history.map((item) => (
      <button key={item.id} type="button" onClick={() => onLoadHistory(item)} className="block w-full rounded-[6px] border border-black/10 bg-white p-3 text-left transition hover:bg-[var(--bg)]">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-[var(--yellow-soft)] px-2.5 py-1 text-xs font-black text-[var(--ink)]">{item.taskType}</span>
          <span className="text-xs font-bold text-[var(--ink-3)]">{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-black leading-6 text-[var(--ink)]">{item.prompt}</p>
        <p className="mt-1 text-xs font-bold text-[var(--teal)]">Band {item.result.overallBand}</p>
      </button>
    ))}
    <button type="button" onClick={onClearHistory} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] px-2 text-xs font-black text-[var(--red)] transition hover:bg-red-50"><Trash2 size={14} />清空本地记录</button>
  </div>
}

function SavedVocabularyPanel({ items }: { items: SavedVocabulary[] }) {
  if (!items.length) return <EmptyPanel icon={BookMarked} title="词汇本为空" text="在报告里的高分词替换处点击保存，就会收进这里。" />
  return <div className="space-y-3">{items.map((item) => (
    <div key={item.id} className="rounded-[6px] bg-[var(--bg)] p-3">
      <p className="text-sm font-black text-[var(--ink)]">{item.original} {'->'} <span className="text-[var(--teal)]">{item.upgrade}</span></p>
      <p className="mt-1 text-xs font-bold leading-6 text-[var(--ink-3)]">{item.reason || item.context}</p>
    </div>
  ))}</div>
}

function SavedTrainingPanel({ items }: { items: SavedTraining[] }) {
  if (!items.length) return <EmptyPanel icon={ListChecks} title="训练清单为空" text="在报告里的下一步训练处点击保存，就会成为复盘待办。" />
  return <div className="space-y-3">{items.map((item) => (
    <div key={item.id} className="rounded-[6px] bg-[var(--bg)] p-3">
      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-[var(--teal)] ring-1 ring-black/10">{item.priority}</span>
      <p className="mt-2 text-sm font-black text-[var(--ink)]">{item.title}</p>
      <p className="mt-1 text-xs font-bold leading-6 text-[var(--ink-3)]">{item.detail}</p>
    </div>
  ))}</div>
}

function EmptyPanel({ icon: Icon, title, text }: { icon: typeof History; title: string; text: string }) {
  return <div className="rounded-[6px] bg-[var(--bg)] p-5 text-center">
    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[6px] bg-white text-[var(--teal)] ring-1 ring-black/10"><Icon size={22} /></span>
    <p className="mt-3 font-black text-[var(--ink)]">{title}</p>
    <p className="mt-1 text-sm font-bold leading-6 text-[var(--ink-3)]">{text}</p>
  </div>
}

function ReportHeader({ reportUrl, onBack, result, historyCount, savedVocabularyCount, savedTrainingCount, onOpenUtility }: {
  reportUrl: string
  onBack: () => void
  result: ReviewResult
  historyCount: number
  savedVocabularyCount: number
  savedTrainingCount: number
  onOpenUtility: (panel: 'history' | 'vocab' | 'training') => void
}) {
  const words = result.sentenceStats?.words || result.cleanedWordCount
  return (
    <div className="mb-6 border border-black/10 bg-white p-4 shadow-[var(--shadow-sm)] md:px-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onBack} className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-[var(--teal)]/35 bg-white px-3 text-sm font-black text-[var(--teal)] transition hover:bg-[var(--teal-soft)]"><ArrowLeft size={17} />返回修改</button>
          <span className="h-6 w-px bg-black/10" />
          <div>
            <p className="text-sm font-black text-[var(--ink)]">作文批改报告</p>
            <p className="mt-0.5 text-xs font-bold text-[var(--ink-3)]">{result.fallback ? '基础评分模式' : 'AI 精批模式'}{words ? ` · ${words} words` : ''}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <UtilityToolbar historyCount={historyCount} savedTrainingCount={savedTrainingCount} savedVocabularyCount={savedVocabularyCount} onOpen={onOpenUtility} />
          {reportUrl ? <a href={reportUrl} download="edutoro-writing-report.docx" className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-[var(--yellow)] px-4 text-sm font-black text-[var(--ink)] transition hover:brightness-95"><Download size={17} />下载 Word</a> : <span className="inline-flex h-10 items-center rounded-[6px] bg-[var(--bg)] px-3 text-xs font-bold text-[var(--ink-3)]">正在准备文件...</span>}
        </div>
      </div>
    </div>
  )
}

function ReviewReport({ result, prompt, essay, savedVocabulary, savedTraining, onSaveVocabulary, onSaveTraining }: {
  result: ReviewResult
  prompt: string
  essay: string
  savedVocabulary: SavedVocabulary[]
  savedTraining: SavedTraining[]
  onSaveVocabulary: (item: VocabularyUpgrade) => void
  onSaveTraining: (item: ImprovementItem) => void
}) {
  const stats = result.sentenceStats || calculateSentenceStats(essay)
  const issueStats = normalizeIssueStats(result)
  const plan = result.improvementPlan || (result.recommendations || []).map((item) => ({ title: item, priority: 'medium', detail: item }))
  const maxIssueCount = Math.max(1, ...Object.values(issueStats))
  return <div className="space-y-6">
    <div className="grid items-start gap-6 md:grid-cols-[minmax(280px,0.84fr)_minmax(0,1.16fr)]">
      <aside>
        <div className="border border-black/10 bg-white p-5 shadow-[var(--shadow-sm)] md:p-6">
          <p className="text-xs font-black text-[var(--ink-3)]">批改结果</p>
          <p className="mt-3 text-7xl font-black leading-none text-[var(--teal)]">{result.overallBand}</p>
          <p className="mt-2 text-xs font-bold text-[var(--ink-3)]">{result.fallback ? '基础参考分数' : 'AI 参考分数'}</p>
          <div className="mt-5 border-t border-black/10 pt-5">
            <p className="text-sm font-black text-[var(--ink)]">四项评分</p>
            <div className="mt-4 space-y-4">{Object.entries(result.criteria || {}).map(([key, item]) => <ScoreBar key={key} label={criteriaLabels[key] || key} band={item.band} />)}</div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <MiniStat label="words" value={stats.words} />
            <MiniStat label="sentences" value={stats.sentences} />
            <MiniStat label="paras" value={stats.paragraphs} />
          </div>
        </div>
      </aside>
      <DetailedFeedbackOverview result={result} />
    </div>

    <div className="min-w-0 space-y-5">
      {result.fallback ? <div className="rounded-[6px] bg-[var(--yellow-soft)] p-4 text-sm font-bold leading-7 text-[var(--ink-2)]">当前为基础评分报告：大模型服务不可用时，系统会先用本地校准器和规则给出可参考结果；恢复网络后可重新提交获取逐句精批和改写。</div> : null}
      <section className="border border-black/10 bg-white p-5 md:p-7">
        <div className="flex items-center gap-2"><CheckCircle2 size={20} className="text-[var(--teal)]" /><h2 className="text-xl font-black">先看结论</h2></div>
        <p className="mt-4 text-[16px] leading-8 text-[var(--ink-2)]">{result.summary}</p>
        {result.essayOutline && <div className="mt-5 grid gap-3 md:grid-cols-3">
          <ReportFact icon={Brain} label="题型" value={result.essayOutline.questionType} />
          <ReportFact icon={Lightbulb} label="立场" value={result.essayOutline.position} />
          <ReportFact icon={Layers3} label="主体逻辑" value={result.essayOutline.bodyLogic} />
        </div>}
        <div className="mt-5 rounded-[6px] bg-[var(--bg)] p-4 text-sm leading-7 text-[var(--ink-2)]">
          <p className="font-black text-[var(--ink)]">本次题目</p>
          <p className="mt-1 whitespace-pre-wrap">{result.taskPromptUsed || prompt}</p>
        </div>
      </section>

      {result.warnings?.length ? <div className="rounded-[6px] bg-[var(--yellow-soft)] p-4 text-sm font-bold leading-7 text-[var(--ink-2)]">{result.warnings.join('；')}</div> : null}

      <section className="border border-black/10 bg-white p-5 md:p-7">
        <h2 className="text-xl font-black">优先修改</h2>
        <p className="mt-2 text-sm font-bold leading-7 text-[var(--ink-3)]">问题越多的部分越值得先处理，修改时可以从数量最高的项目开始。</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-5">
          {(Object.entries(issueStats) as [keyof IssueStats, number][]).map(([key, value]) => (
            <div key={key} className="rounded-[6px] bg-[var(--bg)] p-3">
              <p className="text-xs font-black text-[var(--ink-3)]">{issueLabels[key]}</p>
              <p className="mt-2 text-3xl font-black text-[var(--ink)]">{value}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[var(--teal)]" style={{ width: `${(value / maxIssueCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-black/10 bg-white p-5 md:p-7">
        <h2 className="text-xl font-black">评分依据</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{Object.entries(result.criteria || {}).map(([key, item]) => <div key={key} className="rounded-[6px] bg-[var(--bg)] p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-black">{criteriaLabels[key] || key}</h3><span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-sm font-black">{item.band}</span></div><p className="mt-3 text-sm leading-7 text-[var(--ink-2)]">{item.comment}</p></div>)}</div>
      </section>

      <section className="border border-black/10 bg-white p-5 md:p-7">
        <h2 className="text-xl font-black">原文批注</h2>
        <div className="mt-4 whitespace-pre-wrap rounded-[6px] bg-[var(--bg)] p-4 text-[15px] leading-8">{renderAnnotatedEssay(essay, result.annotations || [])}</div>
        {result.annotations?.length ? <div className="mt-5 grid gap-3">{result.annotations.map((item, index) => <div key={`${item.original}-${index}`} className="rounded-[6px] border border-black/10 p-4"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${issueColors[item.issueType] || issueColors.Style}`}>{item.issueType}</span><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-[var(--ink-2)]">{severityLabels[item.severity] || item.severity}</span></div><p className="mt-3 text-sm font-black">原文：{item.original}</p><p className="mt-2 text-sm leading-7 text-[var(--teal)]">建议：{item.revision}</p><p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">{item.reason}</p></div>)}</div> : <p className="mt-4 rounded-[6px] bg-[var(--yellow-soft)] p-4 text-sm font-bold leading-7 text-[var(--ink-2)]">基础评分报告暂不生成逐句批注；等大模型服务恢复后重新提交，就会显示逐句修改建议。</p>}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <VocabularyReport items={result.vocabularyUpgrades || []} savedVocabulary={savedVocabulary} onSave={onSaveVocabulary} />
        <CollocationReport items={result.collocations || []} />
      </section>

      <TrainingReport items={plan} savedTraining={savedTraining} onSave={onSaveTraining} />

      <section className="border border-[var(--teal)]/15 bg-[var(--teal-soft)] p-5 md:p-7">
        <h2 className="text-xl font-black text-[var(--ink)]">参考高分版本</h2>
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-8 text-[var(--ink-2)]">{result.polishedEssay || essay}</p>
      </section>
    </div>
  </div>
}

function DetailedFeedbackOverview({ result }: { result: ReviewResult }) {
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const annotations = [...(result.annotations || [])]
    .sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3))
    .slice(0, 3)
  const vocabulary = result.vocabularyUpgrades?.[0]
  const fallbackItems = result.improvementPlan?.slice(0, 3) || (result.recommendations || []).slice(0, 3).map((detail) => ({ title: '修改建议', detail, priority: 'medium' }))

  return (
    <section className="border border-black/10 bg-white p-5 shadow-[var(--shadow-sm)] md:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
        <div>
          <p className="text-xs font-black text-[var(--teal)]">Detailed Feedback</p>
          <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">逐句精批</h2>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] bg-[var(--teal-soft)] text-[var(--teal)]"><PenLine size={21} /></span>
      </div>

      {annotations.length > 0 ? (
        <div className="mt-4 space-y-3">
          {annotations.map((item, index) => (
            <div key={`${item.original}-${index}`} className="rounded-[6px] bg-[var(--bg)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${issueColors[item.issueType] || issueColors.Style}`}>{item.issueType}</span>
                <span className="text-[11px] font-black text-[var(--ink-3)]">{severityLabels[item.severity] || item.severity}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-2)] line-through decoration-red-300">{item.original}</p>
              <p className="mt-2 text-sm font-black leading-6 text-[var(--teal)]">{item.revision}</p>
              <p className="mt-2 text-xs font-bold leading-5 text-[var(--ink-3)]">{item.reason}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="rounded-[6px] bg-[var(--teal-soft)] p-4 text-sm font-bold leading-7 text-[var(--ink-2)]">{result.summary}</p>
          {fallbackItems.map((item, index) => <div key={`${item.title}-${index}`} className="flex gap-3 rounded-[6px] bg-[var(--bg)] p-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--yellow)]" /><div><p className="text-sm font-black text-[var(--ink)]">{item.title}</p><p className="mt-1 text-xs font-bold leading-5 text-[var(--ink-3)]">{item.detail}</p></div></div>)}
        </div>
      )}

      {vocabulary && <div className="mt-4 rounded-[6px] border border-[var(--teal)]/20 bg-white p-4"><p className="text-xs font-black text-[var(--ink-3)]">词汇提升</p><p className="mt-2 text-sm font-black text-[var(--ink)]">{vocabulary.original} <span className="px-1 text-[var(--teal)]">{'->'}</span> <span className="text-[var(--teal)]">{vocabulary.upgrade}</span></p><p className="mt-2 text-xs font-bold leading-5 text-[var(--ink-3)]">{vocabulary.reason || vocabulary.context}</p></div>}
    </section>
  )
}

function VocabularyReport({ items, savedVocabulary, onSave }: { items: VocabularyUpgrade[]; savedVocabulary: SavedVocabulary[]; onSave: (item: VocabularyUpgrade) => void }) {
  return <div className="border border-black/10 bg-white p-5 md:p-6">
    <h2 className="text-xl font-black text-[var(--ink)]">高分词替换</h2>
    <div className="mt-4 space-y-3">
      {items.length ? items.map((item) => {
        const saved = savedVocabulary.some((savedItem) => savedItem.original === item.original && savedItem.upgrade === item.upgrade)
        return <div key={`${item.original}-${item.upgrade}`} className="rounded-[6px] bg-[var(--bg)] p-4">
          <p className="text-sm font-black text-[var(--ink)]">{item.original} <span className="px-1 text-[var(--teal)]">{'->'}</span> <span className="text-[var(--teal)]">{item.upgrade}</span></p>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">{item.reason || item.context}</p>
          <button type="button" onClick={() => onSave(item)} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-[6px] border border-[var(--teal)]/35 bg-white px-3 text-xs font-black text-[var(--teal)] transition hover:bg-[var(--teal-soft)] disabled:opacity-55" disabled={saved}><Save size={14} />{saved ? '已保存' : '保存到词汇本'}</button>
        </div>
      }) : <p className="rounded-[6px] bg-[var(--bg)] p-4 text-sm font-bold leading-7 text-[var(--ink-3)]">本次结果暂未返回词汇替换。后端升级后会显示原词、推荐替换和使用原因。</p>}
    </div>
  </div>
}

function CollocationReport({ items }: { items: Collocation[] }) {
  return <div className="bg-[var(--bg)] p-5 md:p-6">
    <h2 className="text-xl font-black text-[var(--ink)]">可复用词伙</h2>
    <div className="mt-4 space-y-3">
      {items.length ? items.map((item) => <div key={item.phrase} className="rounded-[6px] bg-white p-4 ring-1 ring-black/10"><p className="text-sm font-black text-[var(--teal)]">{item.phrase}</p><p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">{item.example}</p>{item.useCase && <p className="mt-2 text-xs font-black text-[var(--ink-3)]">{item.useCase}</p>}</div>) : <p className="rounded-[6px] bg-white p-4 text-sm font-bold leading-7 text-[var(--ink-3)] ring-1 ring-black/10">本次结果暂未返回词伙。可以先用高分词替换和参考高分版本复盘表达。</p>}
    </div>
  </div>
}

function TrainingReport({ items, savedTraining, onSave }: { items: ImprovementItem[]; savedTraining: SavedTraining[]; onSave: (item: ImprovementItem) => void }) {
  return <div className="bg-white p-5 shadow-[var(--shadow-sm)] ring-1 ring-black/10 md:p-6">
    <h2 className="text-xl font-black">下一步训练</h2>
    <ul className="mt-4 space-y-3">{items.map((item) => {
      const saved = savedTraining.some((savedItem) => savedItem.title === item.title)
      return <li key={`${item.priority}-${item.title}`} className="rounded-[6px] bg-[var(--bg)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--teal)] ring-1 ring-black/10">{item.priority}</span>
          <button type="button" onClick={() => onSave(item)} disabled={saved} className="inline-flex min-h-9 items-center gap-2 rounded-[6px] border border-[var(--teal)]/35 bg-white px-3 text-xs font-black text-[var(--teal)] transition hover:bg-[var(--teal-soft)] disabled:opacity-55"><Save size={14} />{saved ? '已保存' : '保存训练'}</button>
        </div>
        <p className="mt-3 text-sm font-black text-[var(--ink)]">{item.title}</p>
        <p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">{item.detail}</p>
      </li>
    })}</ul>
  </div>
}

function ReportFact({ icon: Icon, label, value }: { icon: typeof Brain; label: string; value: string }) {
  return <div className="rounded-[6px] bg-[var(--bg)] p-3">
    <Icon size={18} className="text-[var(--teal)]" />
    <p className="mt-2 text-xs font-black text-[var(--ink-3)]">{label}</p>
    <p className="mt-1 text-sm font-black leading-6 text-[var(--ink)]">{value}</p>
  </div>
}

function ScoreBar({ label, band }: { label: string; band: number }) {
  return <div>
    <div className="flex items-center justify-between gap-2 text-xs font-black"><span>{label}</span><span>{band}</span></div>
    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--bg)]"><div className="h-full rounded-full bg-[var(--teal)]" style={{ width: `${Math.min(100, Number(band) * 10)}%` }} /></div>
  </div>
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-[6px] bg-[var(--bg)] px-2 py-2 text-[var(--ink)] ring-1 ring-black/5">
    <p className="text-lg font-black">{value}</p>
    <p className="text-[10px] font-black uppercase tracking-normal text-[var(--ink-3)]">{label}</p>
  </div>
}

function StatPill({ label, value }: { label: string; value: number }) {
  return <span className="rounded-[6px] bg-[var(--bg)] px-3 py-1.5 text-center text-xs font-black text-[var(--ink-2)] ring-1 ring-black/10">{value} {label}</span>
}
