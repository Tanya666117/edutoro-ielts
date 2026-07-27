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
  subjects: string[]
  score: string
  experience: string
  style: string[]
  bio: string
  highlights: string[]
}

export type SpeakingView = 'list' | 'topic' | 'practice'
