import { ArrowRight, X } from 'lucide-react'

const LOGO_SRC = `${import.meta.env.BASE_URL}edutoro-logo-transparent.png`

interface ResourcePackModalProps {
  open: boolean
  onClose: () => void
  onClaim: () => void
}

export function ResourcePackModal({ open, onClose, onClaim }: ResourcePackModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center p-4 sm:items-center"
      style={{ background: 'rgba(23,23,23,0.58)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="fade-up relative w-full max-w-xl rounded-[8px] bg-white p-6 sm:p-8"
        style={{ boxShadow: 'var(--shadow)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-pack-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-[8px] p-2 hover:bg-[var(--bg)]"
          style={{ color: 'var(--ink-3)' }}
          aria-label="关闭"
        >
          <X size={20} />
        </button>

        <p className="eyebrow">Resource Pack</p>
        <h2 id="resource-pack-title" className="mt-2 text-2xl font-black text-[var(--ink)]">
          雅思全套资料
        </h2>

        <div className="mt-6 rounded-[8px] bg-[var(--bg)] px-6 py-8 ring-1 ring-black/10">
          <img src={LOGO_SRC} alt="Edutoro 雅思全套资料" className="mx-auto max-h-56 w-full object-contain" />
        </div>

        <button type="button" onClick={onClaim} className="btn btn-dark mt-6 w-full">
          免费领取
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  )
}
