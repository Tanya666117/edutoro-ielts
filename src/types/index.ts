export interface SpeakingQuestion {
  id: string
  questionEn: string
  questionZh: string
  modelAnswerEn: string
}

export interface SpeakingTopic {
  id: string
  num: number
  titleEn: string
  titleZh: string
  questionCount: number
  icon: string
  questions: SpeakingQuestion[]
}

export interface ExamRecall {
  id: string
  date: string
  city: string
  venue: string
  subject: 'listening' | 'reading' | 'writing' | 'speaking'
  content: string
  difficulty?: string
}

export interface Teacher {
  id: string
  name: string
  title: string
  price: string
  avatarSeed: string
  strongestFeature: string
  subjects: string[]
  experience: string
  style: string[]
  bio: string
  highlights: string[]
  caseStudy: {
    student: string
    result: string
    detail: string
    quote: string
  }
  feedbacks: Array<{
    student: string
    tag: string
    text: string
  }>
}

export type SpeakingView = 'list' | 'topic' | 'practice'
