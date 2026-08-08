export const NAV_ITEMS = [
  { id: 'teachers', label: '老师' },
  { id: 'supervision', label: '督学' },
  { id: 'writing', label: '作文批改' },
  { id: 'speaking', label: '口语练习' },
] as const

export type PageId = 'hero' | 'teachers' | 'supervision' | 'writing' | 'speaking' | 'contact' | 'cases'

export const SUBJECT_LABELS: Record<string, string> = {
  listening: '听力',
  reading: '阅读',
  writing: '写作',
  speaking: '口语',
}

export const SITE = {
  name: 'Edutoro',
  cn: '雅思提分工作室',
  tagline: '好老师讲对方法，真督学陪你做到。',
  description:
    '把最重要的投入放在老师和督学上：先定位，再匹配老师；把每天的任务拆清楚，让每一次练习都能留下进步。资料、口语题库和 AI 批改，都是让这条路更顺手的工具。',
  staffName: 'Edutoro 学习顾问',
  staffHint: '告诉我们目标分、考试日期和目前卡点，我们会先帮你判断适合老师还是督学方案。',
  wechatId: 'Cloudtutor_',
}
