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
  tagline: '老师讲透方法，督学守住节奏，让每一分进步都有迹可循。',
  description:
    '我们不贩卖焦虑，也不让你靠意志力硬撑。先定位问题、匹配老师，再由督学拆解计划、追踪执行；题库、资料和 AI 批改，只为让每一步更高效。',
  staffName: 'Edutoro 学习顾问',
  staffHint: '告诉我们目标分、考试日期和目前卡点，我们会先帮你判断适合老师还是督学方案。',
  wechatId: 'Cloudtutor_',
}
