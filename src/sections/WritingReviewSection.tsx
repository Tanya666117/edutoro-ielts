import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  MessageSquareText,
  Sparkles,
  Upload,
} from 'lucide-react'
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'

type Criterion = {
  band: number
  comment: string
}

type Annotation = {
  original: string
  revision: string
  issueType: 'Task Response' | 'Coherence' | 'Vocabulary' | 'Grammar' | 'Style' | string
  severity: 'high' | 'medium' | 'low' | string
  reason: string
}

type ReviewResult = {
  summary: string
  overallBand: number
  taskPromptUsed?: string
  calibrationReference?: Record<string, { label: string; band: number; rawBand?: number; mae?: number; withinHalf?: number }>
    | { unavailable: true; reason: string }
    | null
  inputWarnings?: string[]
  cleanedWordCount?: number
  criteria: {
    taskResponse: Criterion
    coherenceCohesion: Criterion
    lexicalResource: Criterion
    grammar: Criterion
  }
  annotations: Annotation[]
  recommendations: string[]
  warnings: string[]
  polishedEssay: string
}

const taskOptions = ['Task 2', 'Task 1'] as const

const criteriaLabels = {
  taskResponse: '任务回应/完成度',
  coherenceCohesion: '连贯与衔接',
  lexicalResource: '词汇资源',
  grammar: '语法多样性与准确性',
}

const scorerLabelMap: Record<string, string> = {
  'Task Achievement': '任务完成度',
  'Coherence and Cohesion': '连贯与衔接',
  Vocabulary: '词汇资源',
  Grammar: '语法准确性',
  Overall: '总分参考',
  'Local 200-sample calibrator': '历史作文评分参考',
  'Historical essay score reference': '历史作文评分参考',
}

const issueColors: Record<string, string> = {
  'Task Response': 'bg-[var(--yellow-soft)] text-[var(--ink)]',
  Coherence: 'bg-[var(--teal-soft)] text-[var(--teal)]',
  Vocabulary: 'bg-blue-50 text-[var(--blue)]',
  Grammar: 'bg-red-50 text-[var(--red)]',
  Style: 'bg-neutral-100 text-[var(--ink-2)]',
}

const severityLabels: Record<string, string> = {
  high: '优先修改',
  medium: '建议修改',
  low: '可优化',
}

function textParagraph(text: string, options: { bold?: boolean; heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel] } = {}) {
  return new Paragraph({
    heading: options.heading,
    spacing: { after: 160 },
    children: [
      new TextRun({
        text: text || '未提供',
        bold: options.bold,
        font: 'Microsoft YaHei',
        size: options.heading ? 28 : 22,
      }),
    ],
  })
}

function multiLineParagraphs(text: string) {
  return (text || '未提供').split(/\n+/).map(
    (line) =>
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: line, font: 'Microsoft YaHei', size: 21 })],
      }),
  )
}

function buildCriteriaTable(result: ReviewResult) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: ['评分项', '分数', '说明'].map(
          (text) =>
            new TableCell({
              children: [textParagraph(text, { bold: true })],
              shading: { fill: 'FFF1A8' },
            }),
        ),
      }),
      ...Object.entries(result.criteria).map(
        ([key, item]) =>
          new TableRow({
            children: [
              new TableCell({ children: [textParagraph(criteriaLabels[key as keyof typeof criteriaLabels], { bold: true })] }),
              new TableCell({ children: [textParagraph(`${item.band}（仅供参考）`)] }),
              new TableCell({ children: [textParagraph(item.comment)] }),
            ],
          }),
      ),
    ],
  })
}

async function buildReportDocx(prompt: string, essay: string, result: ReviewResult) {
  const annotationParagraphs = (result.annotations || []).flatMap((item, index) => [
    textParagraph(`${index + 1}. ${item.issueType} / ${severityLabels[item.severity] || item.severity}`, { bold: true }),
    textParagraph(`原文：${item.original}`),
    textParagraph(`建议：${item.revision}`),
    textParagraph(`原因：${item.reason}`),
  ])

  const calibrationReferenceText =
    result.calibrationReference && !('unavailable' in result.calibrationReference)
      ? Object.values(result.calibrationReference)
          .map((item) => `${scorerLabelMap[item.label] || item.label}: ${item.band}`)
          .join('；')
      : result.calibrationReference && 'unavailable' in result.calibrationReference
        ? `本地校准不可用：${result.calibrationReference.reason}`
        : '未启用'

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          textParagraph('Edutoro IELTS 写作批改报告', { heading: HeadingLevel.TITLE }),
          textParagraph('AI 评分与建议仅供参考，正式成绩以 IELTS 官方评分为准。'),
          textParagraph('题目', { heading: HeadingLevel.HEADING_1 }),
          ...multiLineParagraphs(prompt || result.taskPromptUsed || '未提供题目'),
          textParagraph('学生原文', { heading: HeadingLevel.HEADING_1 }),
          ...multiLineParagraphs(essay),
          textParagraph('评分概览', { heading: HeadingLevel.HEADING_1 }),
          textParagraph(`总分：${result.overallBand}（仅供参考）`, { bold: true }),
          textParagraph(`历史作文参考：${calibrationReferenceText}`),
          textParagraph(result.summary),
          buildCriteriaTable(result),
          textParagraph('修改批注', { heading: HeadingLevel.HEADING_1 }),
          ...annotationParagraphs,
          textParagraph('修改建议', { heading: HeadingLevel.HEADING_1 }),
          ...(result.recommendations || []).map((item) => textParagraph(`- ${item}`)),
          textParagraph('8 分版参考', { heading: HeadingLevel.HEADING_1 }),
          ...multiLineParagraphs(result.polishedEssay),
        ],
      },
    ],
  })

  return Packer.toBlob(doc)
}

function cleanInputText(value: string) {
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function isCalibrationUnavailable(
  value: ReviewResult['calibrationReference'],
): value is { unavailable: true; reason: string } {
  return Boolean(value && 'unavailable' in value && value.unavailable)
}

function renderAnnotatedEssay(essay: string, annotations: Annotation[]) {
  const matches = annotations
    .map((annotation, annotationIndex) => {
      const start = essay.indexOf(annotation.original)
      if (start === -1 || !annotation.original.trim()) return null
      return { start, end: start + annotation.original.length, annotation, annotationIndex }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => a.start - b.start)

  const nodes = []
  let cursor = 0
  for (const match of matches) {
    if (match.start < cursor) continue
    if (match.start > cursor) nodes.push(<span key={`text-${cursor}`}>{essay.slice(cursor, match.start)}</span>)
    nodes.push(
      <mark
        key={`mark-${match.start}-${match.annotationIndex}`}
        className="rounded-[4px] bg-[var(--yellow-soft)] px-1 py-0.5 text-[var(--ink)] ring-1 ring-yellow-300/70"
        title={`${match.annotation.issueType}: ${match.annotation.revision}`}
      >
        {essay.slice(match.start, match.end)}
      </mark>,
    )
    cursor = match.end
  }
  if (cursor < essay.length) nodes.push(<span key={`text-${cursor}`}>{essay.slice(cursor)}</span>)
  return nodes.length ? nodes : essay
}

export function WritingReviewSection() {
  const [taskType, setTaskType] = useState<(typeof taskOptions)[number]>('Task 2')
  const [prompt, setPrompt] = useState('')
  const [essay, setEssay] = useState('')
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportUrl, setReportUrl] = useState('')

  const wordCount = useMemo(() => (essay.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || []).length, [essay])

  useEffect(() => {
    if (!result) {
      setReportUrl('')
      return
    }
    let active = true
    let objectUrl = ''
    buildReportDocx(prompt, essay, result).then((blob) => {
      if (!active) return
      const url = URL.createObjectURL(blob)
      objectUrl = url
      setReportUrl(url)
    })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [essay, prompt, result])

  const readUploadedFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!/\.(txt|md)$/i.test(file.name)) {
      setError('目前支持上传 txt 或 md 文本文件；Word/PDF 作文请先复制粘贴到原文框。')
      return
    }
    setError('')
    setEssay(cleanInputText(await file.text()))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const cleanedPrompt = cleanInputText(prompt)
    const cleanedEssay = cleanInputText(essay)
    const cleanedWordCount = (cleanedEssay.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || []).length
    if (cleanedEssay.length < 80) {
      setError('请至少提交 80 个字符以上的作文原文。')
      return
    }
    if (cleanedPrompt.length < 20) {
      setError('题目过短或未填写。为了让分数尽量准确，请先粘贴完整作文题目。')
      return
    }
    if (taskType === 'Task 2' && cleanedWordCount < 120) {
      setError(`当前约 ${cleanedWordCount} words，作文过短，无法稳定评分。`)
      return
    }

    setPrompt(cleanedPrompt)
    setEssay(cleanedEssay)
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/writing-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType, prompt: cleanedPrompt, essay: cleanedEssay }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || '批改失败，请稍后重试。')
      setResult(payload)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '批改失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section bg-white">
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">作文批改</span>
            <h1 className="heading">雅思作文批改与润色</h1>
            <p className="lede">
              上传或粘贴作文后，系统会生成原文批注、修改建议、参考分数和可下载报告。
            </p>
          </div>
          <div className="rounded-[8px] bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--ink-2)] ring-1 ring-black/10">
            分数为 AI 估算，仅供参考
          </div>
        </div>

        <form onSubmit={submit} className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="card p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              {taskOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTaskType(option)}
                  className="rounded-full px-4 py-2 text-sm font-black transition"
                  style={{
                    background: taskType === option ? 'var(--yellow)' : '#fff',
                    color: 'var(--ink)',
                    boxShadow: 'inset 0 0 0 1px rgba(23,23,23,0.1)',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            <label className="mt-6 block text-sm font-black text-[var(--ink)]" htmlFor="writing-prompt">
              作文题目
            </label>
            <textarea
              id="writing-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="粘贴题目，Task 1 请包含图表关键信息。"
              className="mt-2 min-h-[108px] w-full resize-y rounded-[8px] border border-black/10 bg-white p-4 text-[15px] outline-none focus:border-[var(--teal)]"
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--bg)] px-4 py-2 text-sm font-black text-[var(--ink)] ring-1 ring-black/10">
                <Upload size={17} />
                上传 txt/md
                <input type="file" accept=".txt,.md,text/plain,text/markdown" className="hidden" onChange={readUploadedFile} />
              </label>
              <span className="text-xs font-bold text-[var(--ink-3)]">当前约 {wordCount} words</span>
            </div>

            <label className="mt-5 block text-sm font-black text-[var(--ink)]" htmlFor="writing-essay">
              作文原文
            </label>
            <textarea
              id="writing-essay"
              value={essay}
              onChange={(event) => setEssay(event.target.value)}
              placeholder="在这里粘贴学生作文原文。建议 Task 2 不少于 250 words，Task 1 不少于 150 words。"
              className="mt-2 min-h-[360px] w-full resize-y rounded-[8px] border border-black/10 bg-white p-4 text-[15px] leading-7 outline-none focus:border-[var(--teal)]"
              required
            />

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-[8px] bg-red-50 p-3 text-sm font-bold text-[var(--red)]">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-dark mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? '正在批改...' : '开始批改'}
            </button>
          </div>

          <div className="space-y-6">
            {!result && (
              <div className="card flex min-h-[520px] flex-col items-center justify-center p-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-[var(--yellow)] text-[var(--ink)]">
                  <MessageSquareText size={26} />
                </span>
                <h2 className="mt-5 text-2xl font-black text-[var(--ink)]">批改结果会显示在这里</h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-[var(--ink-2)]">
                  系统会返回原文高亮批注、雅思官方四项评分维度、总体建议和 8 分版参考作文。
                </p>
              </div>
            )}

            {result && (
              <>
                <div className="card p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-[var(--teal)]">总体评分</p>
                      <p className="mt-1 text-5xl font-black leading-none text-[var(--ink)]">{result.overallBand}</p>
                      <p className="mt-2 text-xs font-bold text-[var(--ink-3)]">仅供参考</p>
                    </div>
                    {reportUrl && (
                      <a href={reportUrl} download="edutoro-ielts-writing-report.docx" className="btn btn-yellow">
                        <Download size={18} />
                        下载 Word 报告
                      </a>
                    )}
                  </div>
                  <div className="mt-5 rounded-[8px] bg-[var(--bg)] p-4 text-sm leading-7 text-[var(--ink-2)] ring-1 ring-black/10">
                    <p className="font-black text-[var(--ink)]">本次评分题目</p>
                    <p className="mt-1 whitespace-pre-wrap">{result.taskPromptUsed || prompt}</p>
                  </div>
                  <p className="mt-5 text-[16px] leading-8 text-[var(--ink-2)]">{result.summary}</p>
                  {result.cleanedWordCount && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-[var(--ink-2)]">
                        清洗后 {result.cleanedWordCount} words
                      </span>
                    </div>
                  )}
                  {result.warnings?.length > 0 && (
                    <div className="mt-4 rounded-[8px] bg-[var(--bg)] p-4 text-sm font-bold text-[var(--ink-2)] ring-1 ring-black/10">
                      {result.warnings.join('；')}
                    </div>
                  )}
                </div>

                {result.calibrationReference && (
                  <div className="card p-5 md:p-6">
                  <h2 className="text-xl font-black text-[var(--ink)]">历史作文评分参考</h2>
                  {isCalibrationUnavailable(result.calibrationReference) ? (
                      <p className="mt-3 text-sm leading-7 text-[var(--ink-2)]">历史作文参考暂不可用，本次将主要依据雅思官方四项评分维度判断。</p>
                    ) : (
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {Object.entries(result.calibrationReference).map(([key, item]) => (
                          <div key={key} className="rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10">
                            <p className="text-xs font-black text-[var(--ink-3)]">{scorerLabelMap[item.label] || item.label}</p>
                            <p className="mt-1 text-3xl font-black text-[var(--ink)]">{item.band}</p>
                            <p className="mt-2 text-xs font-bold text-[var(--ink-3)]">系统参考过往已评分作文得到</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-3 text-xs font-bold text-[var(--ink-3)]">
                      这是辅助参考，不等于最终分；最终仍按雅思作文官方评分维度综合判断。
                    </p>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <h2 className="text-xl font-black text-[var(--ink)]">雅思作文官方四项评分维度</h2>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">
                      以下四项是雅思作文评分的核心维度，分数均为 AI 估算，仅供参考。
                    </p>
                  </div>
                  {Object.entries(result.criteria).map(([key, item]) => (
                    <div key={key} className="card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-[15px] font-black text-[var(--ink)]">
                          {criteriaLabels[key as keyof typeof criteriaLabels]}
                        </h3>
                        <span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-sm font-black text-[var(--ink)]">
                          {item.band}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--ink-2)]">{item.comment}</p>
                    </div>
                  ))}
                </div>

                <div className="card p-5 md:p-6">
                  <div className="flex items-center gap-2">
                    <FileText size={20} />
                    <h2 className="text-xl font-black text-[var(--ink)]">原文批注</h2>
                  </div>
                  <div className="mt-5 whitespace-pre-wrap rounded-[8px] bg-[var(--bg)] p-4 text-[15px] leading-8 text-[var(--ink)] ring-1 ring-black/10">
                    {renderAnnotatedEssay(essay, result.annotations || [])}
                  </div>
                </div>

                <div className="space-y-3">
                  {(result.annotations || []).map((item, index) => (
                    <div key={`${item.original}-${index}`} className="card p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${issueColors[item.issueType] || issueColors.Style}`}>
                          {item.issueType}
                        </span>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-[var(--ink-2)]">
                          {severityLabels[item.severity] || item.severity}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-black text-[var(--ink)]">原文：{item.original}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--teal)]">建议：{item.revision}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">{item.reason}</p>
                    </div>
                  ))}
                </div>

                <div className="card p-5 md:p-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} style={{ color: 'var(--teal)' }} />
                    <h2 className="text-xl font-black text-[var(--ink)]">修改建议</h2>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {(result.recommendations || []).map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-7 text-[var(--ink-2)]">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--yellow)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card p-5 md:p-6">
                  <h2 className="text-xl font-black text-[var(--ink)]">8 分版参考</h2>
                  <p className="mt-4 whitespace-pre-wrap text-[15px] leading-8 text-[var(--ink-2)]">{result.polishedEssay}</p>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
