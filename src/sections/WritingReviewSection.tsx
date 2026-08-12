import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { AlertCircle, ArrowLeft, BarChart3, CheckCircle2, Download, FileText, Gauge, ImagePlus, Loader2, PenLine, ShieldCheck, Sparkles, Upload } from 'lucide-react'
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'

type Criterion = { band: number; comment: string }
type Annotation = { original: string; revision: string; issueType: string; severity: string; reason: string }
type ChartFacts = { chartType: string; title: string; unit: string; overview: string; highest: string; lowest: string; trends: string; comparisons: string }
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
}

const taskOptions = ['Task 2', 'Task 1'] as const
const criteriaLabels: Record<string, string> = {
  taskResponse: '任务回应 / 完成度',
  taskAchievement: '任务完成度',
  coherenceCohesion: '连贯与衔接',
  lexicalResource: '词汇资源',
  grammar: '语法多样性与准确性',
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
const reviewHighlights = [
  { icon: ShieldCheck, label: '四项评分', text: '任务回应、结构、词汇、语法分开判断' },
  { icon: PenLine, label: '逐句批注', text: '定位原句，给出可直接替换的表达' },
  { icon: Download, label: '报告下载', text: '生成后可导出 Word 留档复盘' },
]

const emptyChartFacts: ChartFacts = { chartType: '折线图', title: '', unit: '', overview: '', highest: '', lowest: '', trends: '', comparisons: '' }

function cleanInputText(value: string) {
  return value.normalize('NFKC').replace(/[\u0000-\u001F\u007F]/g, '').replace(/\r\n?/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim()
}

function countWords(value: string) {
  return (value.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || []).length
}

function chartFactsToText(facts: ChartFacts) {
  return Object.entries(facts).map(([key, value]) => `${key}: ${value || '未填写'}`).join('\n')
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
  const paragraphs = [
    new Paragraph({ text: 'Edutoro IELTS 作文批改报告', heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: 'AI 结果仅供备考参考，正式成绩以 IELTS 官方评分为准。', bold: true })] }),
    new Paragraph({ text: '题目', heading: HeadingLevel.HEADING_1 }),
    new Paragraph(prompt || result.taskPromptUsed || '未提供题目'),
    new Paragraph({ text: '总体判断', heading: HeadingLevel.HEADING_1 }),
    new Paragraph(`参考分数：${result.overallBand}（仅供参考）`),
    new Paragraph(result.summary || '暂无总结'),
    new Paragraph({ text: '四项评分', heading: HeadingLevel.HEADING_1 }),
    ...Object.entries(result.criteria || {}).map(([key, item]) => new Paragraph(`${criteriaLabels[key] || key}：${item.band}。${item.comment}`)),
    new Paragraph({ text: '原文批注', heading: HeadingLevel.HEADING_1 }),
    ...(result.annotations || []).map((item, index) => new Paragraph(`${index + 1}. ${item.issueType}｜${item.original} → ${item.revision}。${item.reason}`)),
    new Paragraph({ text: '修改建议', heading: HeadingLevel.HEADING_1 }),
    ...(result.recommendations || []).map((item) => new Paragraph(`• ${item}`)),
    new Paragraph({ text: '参考高分版本', heading: HeadingLevel.HEADING_1 }),
    new Paragraph(result.polishedEssay || essay),
  ]
  return Packer.toBlob(new Document({ sections: [{ properties: {}, children: paragraphs }] }))
}

export function WritingReviewSection() {
  const [taskType, setTaskType] = useState<(typeof taskOptions)[number]>('Task 2')
  const [prompt, setPrompt] = useState('')
  const [essay, setEssay] = useState('')
  const [chartFacts, setChartFacts] = useState<ChartFacts>(emptyChartFacts)
  const [chartPreview, setChartPreview] = useState('')
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportUrl, setReportUrl] = useState('')
  const [view, setView] = useState<'form' | 'report'>('form')

  const wordCount = useMemo(() => countWords(essay), [essay])

  useEffect(() => {
    if (!result) return undefined
    let objectUrl = ''
    buildReportDocx(prompt, essay, result).then((blob) => { objectUrl = URL.createObjectURL(blob); setReportUrl(objectUrl) })
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [essay, prompt, result])

  const handleChartUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('请上传 JPG、PNG 或 WebP 图表图片。'); return }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setChartPreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  const readUploadedFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!/\.(txt|md)$/i.test(file.name)) { setError('目前支持上传 txt 或 md 文本文件。'); return }
    setError('')
    setEssay(cleanInputText(await file.text()))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const cleanedPrompt = cleanInputText(prompt)
    const cleanedEssay = cleanInputText(essay)
    if (cleanedEssay.length < 80) { setError('请至少提交 80 个字符以上的英文作文原文。'); return }
    if (cleanedPrompt.length < 20) { setError('请先粘贴完整题目，批改需要题目作为任务回应的依据。'); return }
    if (taskType === 'Task 2' && countWords(cleanedEssay) < 120) { setError(`当前约 ${countWords(cleanedEssay)} words，Task 2 内容过短，无法稳定分析。`); return }

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
      setPrompt(cleanedPrompt)
      setEssay(cleanedEssay)
      setResult(payload)
      setView('report')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '批改失败，请稍后重试。')
    } finally { setLoading(false) }
  }

  if (view === 'report' && result) {
    return (
      <section className="relative overflow-hidden scroll-mt-24 bg-white py-12 md:py-18">
        <div className="absolute inset-x-0 top-0 h-[260px] bg-[linear-gradient(135deg,#171717_0%,#2a2a2a_48%,#0f8f7c_100%)]" />
        <div className="shell">
          <ReportHeader reportUrl={reportUrl} onBack={() => setView('form')} result={result} />
          <ReviewReport result={result} prompt={prompt} essay={essay} />
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden scroll-mt-24 bg-white py-16 md:py-24">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[linear-gradient(135deg,#fff5b8_0%,#ffffff_48%,#e4f7f3_100%)]" />
      <div className="absolute left-0 top-0 h-full w-full opacity-[0.28]" style={{ backgroundImage: 'linear-gradient(rgba(23,23,23,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,23,0.06) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
      <div className="shell">
        <div className="relative">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <span className="eyebrow">作文批改</span>
              <h1 className="mt-4 max-w-4xl text-[38px] font-black leading-[1.08] tracking-normal text-[var(--ink)] md:text-[62px]">把一篇作文，拆成一份清楚的提分报告</h1>
              <p className="mt-5 max-w-2xl text-[17px] leading-8 text-[var(--ink-2)]">输入题目和原文后，系统会按 IELTS 四项标准给出参考分数、评分依据、原文批注和下一次训练动作。批改完成后会进入独立报告页，方便下载和复盘。</p>
            </div>
            <div className="rounded-[8px] border border-black/10 bg-[var(--charcoal)] p-5 text-white shadow-[var(--shadow)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--yellow)]">Review Engine</p>
                  <p className="mt-2 text-2xl font-black">IELTS Writing</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-white/10 text-[var(--yellow)]"><Gauge size={26} /></span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {['Band', 'Notes', 'DOCX'].map((item) => <div key={item} className="rounded-[6px] bg-white/10 px-2 py-3 text-xs font-black text-white/78">{item}</div>)}
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="mt-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
              <div className="rounded-[8px] border border-black/10 bg-white p-5 shadow-[0_28px_80px_-45px_rgba(23,23,23,0.45)] md:p-7">
              <div className="flex items-center justify-between gap-3">
                <div className="flex rounded-[8px] bg-[var(--bg)] p-1 ring-1 ring-black/10">
                  {taskOptions.map((option) => <button key={option} type="button" onClick={() => setTaskType(option)} className="rounded-[6px] px-4 py-2 text-sm font-black" style={{ background: taskType === option ? 'var(--charcoal)' : 'transparent', color: taskType === option ? '#fff' : 'var(--ink-2)' }}>{option}</button>)}
                </div>
                <span className="text-xs font-bold text-[var(--ink-3)]">当前约 {wordCount} words</span>
              </div>

              <label className="mt-6 block text-sm font-black text-[var(--ink)]" htmlFor="writing-prompt">作文题目</label>
              <textarea id="writing-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={taskType === 'Task 1' ? '粘贴 Task 1 图表题目和题干。' : '粘贴完整的 Task 2 题目。'} className="mt-2 min-h-[118px] w-full resize-y rounded-[8px] border border-black/10 bg-white p-4 text-[15px] outline-none focus:border-[var(--teal)]" />

              {taskType === 'Task 1' && (
                <div className="mt-5 rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10">
                  <div className="flex items-start gap-3"><BarChart3 size={20} className="mt-1 text-[var(--teal)]" /><div><p className="font-black text-[var(--ink)]">图表关键节点</p><p className="mt-1 text-xs leading-6 text-[var(--ink-3)]">先在图上找到最高、最低、趋势和关键对比，再交给 AI 组织 overview。这样比让文本模型猜图更可靠。</p></div></div>
                  <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-[8px] bg-white px-3 py-2.5 text-sm font-black text-[var(--ink)] ring-1 ring-black/10"><ImagePlus size={17} />上传图表预览<input type="file" accept="image/*" className="hidden" onChange={handleChartUpload} /></label>
                  {chartPreview && <img src={chartPreview} alt="Task 1 图表预览" className="mt-3 max-h-44 w-full rounded-[6px] object-contain bg-white ring-1 ring-black/10" />}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-black text-[var(--ink-2)]">图表类型<select value={chartFacts.chartType} onChange={(event) => setChartFacts((facts) => ({ ...facts, chartType: event.target.value }))} className="mt-1 w-full rounded-[6px] border border-black/10 bg-white px-3 py-2 text-sm font-semibold"><option>折线图</option><option>柱状图</option><option>饼图</option><option>表格</option><option>流程图 / 地图</option></select></label>
                    <label className="text-xs font-black text-[var(--ink-2)]">单位 / 时间范围<input value={chartFacts.unit} onChange={(event) => setChartFacts((facts) => ({ ...facts, unit: event.target.value }))} placeholder="例如：百分比，2000-2020" className="mt-1 w-full rounded-[6px] border border-black/10 bg-white px-3 py-2 text-sm" /></label>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {([
                      ['overview', 'Overview 一句话', '整体上升 / 波动 / 两组相反趋势'],
                      ['highest', '最高点 / 最大值', '对象 + 数值 + 时间'],
                      ['lowest', '最低点 / 最小值', '对象 + 数值 + 时间'],
                      ['trends', '趋势节点', '上升、下降、稳定或转折'],
                      ['comparisons', '关键对比', '两组或多个对象的差异'],
                    ] as const).map(([key, label, placeholder]) => <label key={key} className={`text-xs font-black text-[var(--ink-2)] ${key === 'overview' ? 'sm:col-span-2' : ''}`}>{label}<input value={chartFacts[key]} onChange={(event) => setChartFacts((facts) => ({ ...facts, [key]: event.target.value }))} placeholder={placeholder} className="mt-1 w-full rounded-[6px] border border-black/10 bg-white px-3 py-2 text-sm" /></label>)}
                  </div>
                </div>
              )}

              <label className="mt-5 block text-sm font-black text-[var(--ink)]" htmlFor="writing-essay">作文原文</label>
              <textarea id="writing-essay" value={essay} onChange={(event) => setEssay(event.target.value)} placeholder={taskType === 'Task 1' ? '在这里粘贴至少 150 words 的小作文。' : '在这里粘贴至少 250 words 的大作文。'} className="mt-2 min-h-[330px] w-full resize-y rounded-[8px] border border-black/10 bg-white p-4 text-[15px] leading-7 outline-none focus:border-[var(--teal)]" required />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--bg)] px-4 py-2 text-sm font-black text-[var(--ink)] ring-1 ring-black/10"><Upload size={17} />上传 txt / md<input type="file" accept=".txt,.md,text/plain,text/markdown" className="hidden" onChange={readUploadedFile} /></label>
                <span className="text-xs font-bold text-[var(--ink-3)]">题目和原文只会用于本次分析</span>
              </div>
              {error && <div className="mt-4 flex items-start gap-2 rounded-[8px] bg-red-50 p-3 text-sm font-bold text-[var(--red)]"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
              <button type="submit" disabled={loading} className="btn btn-dark mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}{loading ? '正在分析…' : '生成分析报告'}</button>
            </div>

              <div className="space-y-4">
                <div className="rounded-[8px] border border-black/10 bg-[var(--charcoal)] p-6 text-white shadow-[var(--shadow)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[var(--yellow)] text-[var(--ink)]"><FileText size={25} /></span>
                  <h2 className="mt-5 text-3xl font-black leading-tight">批改前检查</h2>
                  <p className="mt-3 text-sm leading-7 text-white/68">题目、观点、主体段和字数越完整，评分依据越稳定。提交后系统会生成可下载的 Word 报告，方便后续复盘。</p>
                  {result && <button type="button" onClick={() => setView('report')} className="btn btn-yellow mt-5 w-full">查看上一份报告</button>}
                </div>
                <div className="grid gap-3">
                  {reviewHighlights.map(({ icon: Icon, label, text }) => (
                    <div key={label} className="flex items-start gap-3 rounded-[8px] border border-black/8 bg-white p-4 shadow-[var(--shadow-sm)]">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--teal-soft)] text-[var(--teal)]"><Icon size={20} /></span>
                      <div>
                        <p className="font-black text-[var(--ink)]">{label}</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--ink-2)]">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-[8px] bg-[var(--yellow-soft)] p-4 text-sm font-bold leading-7 text-[var(--ink-2)]">AI 评分仅供备考参考，正式成绩以 IELTS 官方评分为准。</div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

function ReportHeader({ reportUrl, onBack, result }: { reportUrl: string; onBack: () => void; result: ReviewResult }) {
  return (
    <div className="relative mb-6 rounded-[8px] border border-white/12 bg-white/10 p-5 text-white shadow-[var(--shadow)] backdrop-blur md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--yellow)]">Writing Review Report</p>
          <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">作文批改报告</h2>
          <p className="mt-2 text-sm font-bold text-white/66">{result.fallback ? '基础评分模式' : 'AI 精批模式'} · {result.cleanedWordCount ? `约 ${result.cleanedWordCount} words` : 'IELTS Writing'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onBack} className="btn btn-light w-fit"><ArrowLeft size={18} />返回修改</button>
          {reportUrl ? <a href={reportUrl} download="edutoro-writing-report.docx" className="btn btn-yellow w-fit"><Download size={18} />下载 Word</a> : <span className="rounded-full bg-white/12 px-4 py-3 text-sm font-bold text-white/70">正在生成下载文件…</span>}
        </div>
      </div>
    </div>
  )
}

function ReviewReport({ result, prompt, essay }: { result: ReviewResult; prompt: string; essay: string }) {
  return <div className="relative grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
    <aside className="space-y-4 lg:sticky lg:top-28">
      <div className="rounded-[8px] bg-[var(--charcoal)] p-6 text-white shadow-[var(--shadow)]">
        <p className="text-xs font-black uppercase tracking-[0.13em] text-[var(--yellow)]">Your report</p>
        <p className="mt-4 text-7xl font-black leading-none">{result.overallBand}</p>
        <p className="mt-2 text-xs font-bold text-white/60">{result.fallback ? '基础参考分数' : 'AI 参考分数'}</p>
        {result.cleanedWordCount ? <p className="mt-4 rounded-[6px] bg-white/10 px-3 py-2 text-xs font-bold text-white/75">约 {result.cleanedWordCount} words</p> : null}
      </div>
      <div className="rounded-[8px] bg-white p-4 shadow-[var(--shadow-sm)] ring-1 ring-black/10"><p className="text-xs font-black text-[var(--teal)]">四项评分</p><div className="mt-3 space-y-3">{Object.entries(result.criteria || {}).map(([key, item]) => <div key={key}><div className="flex items-center justify-between gap-2 text-xs font-black"><span>{criteriaLabels[key] || key}</span><span>{item.band}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--bg)]"><div className="h-full rounded-full bg-[var(--teal)]" style={{ width: `${Math.min(100, Number(item.band) * 10)}%` }} /></div></div>)}</div></div>
    </aside>
    <div className="min-w-0 space-y-5">
      {result.fallback ? <div className="rounded-[8px] bg-[var(--yellow-soft)] p-4 text-sm font-bold leading-7 text-[var(--ink-2)]">当前为基础评分报告：大模型服务不可用时，系统会先用本地校准器和规则给出可参考结果；恢复网络后可重新提交获取逐句精批和改写。</div> : null}
      <div className="rounded-[8px] border border-black/10 bg-white p-5 md:p-7"><div className="flex items-center gap-2"><CheckCircle2 size={20} className="text-[var(--teal)]" /><h2 className="text-xl font-black">先看结论</h2></div><p className="mt-4 text-[16px] leading-8 text-[var(--ink-2)]">{result.summary}</p><div className="mt-5 rounded-[8px] bg-[var(--bg)] p-4 text-sm leading-7 text-[var(--ink-2)]"><p className="font-black text-[var(--ink)]">本次题目</p><p className="mt-1 whitespace-pre-wrap">{result.taskPromptUsed || prompt}</p></div></div>
      {result.warnings?.length ? <div className="rounded-[8px] bg-[var(--yellow-soft)] p-4 text-sm font-bold leading-7 text-[var(--ink-2)]">{result.warnings.join('；')}</div> : null}
      <div className="rounded-[8px] border border-black/10 bg-white p-5 md:p-7"><h2 className="text-xl font-black">评分依据</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{Object.entries(result.criteria || {}).map(([key, item]) => <div key={key} className="rounded-[8px] bg-[var(--bg)] p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-black">{criteriaLabels[key] || key}</h3><span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-sm font-black">{item.band}</span></div><p className="mt-3 text-sm leading-7 text-[var(--ink-2)]">{item.comment}</p></div>)}</div></div>
      <div className="rounded-[8px] border border-black/10 bg-white p-5 md:p-7">
        <h2 className="text-xl font-black">原文批注</h2>
        <div className="mt-4 whitespace-pre-wrap rounded-[8px] bg-[var(--bg)] p-4 text-[15px] leading-8">{renderAnnotatedEssay(essay, result.annotations || [])}</div>
        {result.annotations?.length ? <div className="mt-5 grid gap-3">{result.annotations.map((item, index) => <div key={`${item.original}-${index}`} className="rounded-[8px] border border-black/8 p-4"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${issueColors[item.issueType] || issueColors.Style}`}>{item.issueType}</span><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-[var(--ink-2)]">{severityLabels[item.severity] || item.severity}</span></div><p className="mt-3 text-sm font-black">原文：{item.original}</p><p className="mt-2 text-sm leading-7 text-[var(--teal)]">建议：{item.revision}</p><p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">{item.reason}</p></div>)}</div> : <p className="mt-4 rounded-[8px] bg-[var(--yellow-soft)] p-4 text-sm font-bold leading-7 text-[var(--ink-2)]">基础评分报告暂不生成逐句批注；等大模型服务恢复后重新提交，就会显示逐句修改建议。</p>}
      </div>
      <div className="grid gap-5 md:grid-cols-2"><div className="rounded-[8px] bg-[var(--charcoal)] p-5 text-white md:p-6"><h2 className="text-xl font-black">下一步训练</h2><ul className="mt-4 space-y-3">{(result.recommendations || []).map((item) => <li key={item} className="flex gap-3 text-sm leading-7 text-white/75"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--yellow)]" />{item}</li>)}</ul></div><div className="rounded-[8px] bg-[var(--teal-soft)] p-5 md:p-6"><h2 className="text-xl font-black text-[var(--ink)]">参考高分版本</h2><p className="mt-4 whitespace-pre-wrap text-[15px] leading-8 text-[var(--ink-2)]">{result.polishedEssay || essay}</p></div></div>
    </div>
  </div>
}
