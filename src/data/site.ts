export const NAV_ITEMS = [
  { id: 'teachers', label: '一对一老师' },
  { id: 'supervision', label: '定制化督学' },
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
  cn: '雅思全站学习平台',
  tagline: '不盲目刷题，不依赖模板。\n我们提供定制化督学和一对一课程，配套学习资料和方法\n帮助每位学生找到适合自己的备考方法。',
  description:
    '不盲目刷题，不依赖模板。\n我们提供定制化督学和一对一课程，配套学习资料和方法\n帮助每位学生找到适合自己的备考方法。',
  staffName: 'Edutoro 学习顾问',
  staffHint: '告诉我们目标分、考试日期和目前卡点，我们会先帮你判断适合老师还是督学方案。',
  wechatId: 'Cloudtutor_',
}
