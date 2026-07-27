export const NAV_ITEMS = [
  { id: 'services', label: '课程服务' },
  { id: 'teachers', label: '找老师' },
  { id: 'speaking', label: '口语题库' },
  { id: 'recalls', label: '考点回忆' },
  { id: 'contact', label: '咨询顾问' },
] as const

export const SUBJECT_LABELS: Record<string, string> = {
  listening: '听力',
  reading: '阅读',
  writing: '写作',
  speaking: '口语',
}

export const SITE = {
  name: 'Edutoro',
  cn: '雅思',
  tagline: '口语题库 · 考点回忆 · 1 对 1 & 督学营',
  description:
    '面向中国雅思考生的一站式备考前台：当季口语题库、考点回忆、独立老师匹配和督学营一起给到，先定位问题，再安排课程。',
  staffName: '课程顾问 · 小 E',
  staffHint: '添加课程顾问微信，领取当季题库、作文范文和备考规划表；也可以直接预约试听或加入备考社群。',
  wechatId: 'edutoro-ielts',
}
