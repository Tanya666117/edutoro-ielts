import { ClipboardCheck, UsersRound } from 'lucide-react'
import { SupervisionSection } from './SupervisionSection'
import { TeachersSection } from './TeachersSection'

export type CoachingMode = 'teachers' | 'supervision'

interface CoachingSectionProps {
  mode: CoachingMode
  onModeChange: (mode: CoachingMode) => void
  onContact: () => void
  initialTeacherId?: string | null
  onInitialTeacherHandled?: () => void
}

const modes = [
  { id: 'teachers', label: '一对一老师', icon: UsersRound },
  { id: 'supervision', label: '定制化督学', icon: ClipboardCheck },
] as const

export function CoachingSection({ mode, onModeChange, onContact, initialTeacherId, onInitialTeacherHandled }: CoachingSectionProps) {
  return (
    <div className="bg-[var(--bg)]">
      <div className="shell pt-7 md:pt-10">
        <div className="inline-flex w-full gap-1 rounded-[8px] bg-white p-1.5 shadow-[var(--shadow-sm)] ring-1 ring-black/10 sm:w-auto" role="tablist" aria-label="课程辅导类型">
          {modes.map(({ id, label, icon: Icon }) => {
            const active = mode === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onModeChange(id)}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[6px] px-5 text-sm font-black transition sm:flex-none ${active ? 'bg-[var(--charcoal)] text-white shadow-sm' : 'text-[var(--ink-2)] hover:bg-[var(--yellow-soft)] hover:text-[var(--ink)]'}`}
              >
                <Icon size={17} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {mode === 'teachers' ? (
        <TeachersSection onContact={onContact} initialTeacherId={initialTeacherId} onInitialTeacherHandled={onInitialTeacherHandled} compact />
      ) : (
        <SupervisionSection onContact={onContact} compact />
      )}
    </div>
  )
}
