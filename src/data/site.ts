export const NAV_ITEMS = [
  { id: 'services', label: '课程服务' },
  { id: 'teachers', label: '找老师' },
  { id: 'speaking', label: '口语题库' },
  { id: 'recalls', label: '高频题目' },
  { id: 'contact', label: '了解团队' },
] as const

export type PageId = 'hero' | 'cases' | (typeof NAV_ITEMS)[number]['id']

export const SUBJECT_LABELS: Record<string, string> = {
  listening: '听力',
  reading: '阅读',
  writing: '写作',
  speaking: '口语',
}

export const SITE = {
  name: 'Edutoro',
  cn: '雅思',
  tagline: '口语题库 · 高频题目 · 独立老师 · 督学营',
  description:
    '面向中国雅思考生的一站式备考前台：当季口语题库、听阅写高频题目、独立老师匹配和督学营一起给到，先定位问题，再安排课程。',
  staffName: '课程顾问 · 小星_',
  staffHint:
    '添加课程顾问微信，领取当季题库、阅读思路资料、虾家听力本月高频和老师试听信息；也可以直接预约试听或加入备考社群。',
  wechatId: 'Cloudtutor_',
}
