import { X, MessageCircle, BookOpen, Users } from 'lucide-react'
import { SITE } from '../data/site'

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

export function ContactModal({ open, onClose }: ContactModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      style={{ background: 'rgba(23,23,23,0.58)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="fade-up relative w-full max-w-md rounded-[8px] bg-white p-7 sm:p-8"
        style={{ boxShadow: 'var(--shadow)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
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

        <p className="eyebrow">Contact</p>
        <h2 id="contact-title" className="mt-2 text-2xl font-black text-[var(--ink)]">
          添加工作人员微信
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">{SITE.staffHint}</p>

        <div className="mt-7 flex justify-center">
          <div className="flex h-48 w-48 flex-col items-center justify-center rounded-[8px] bg-[var(--bg)] ring-1 ring-black/10">
            <MessageCircle size={30} className="text-[var(--teal)]" />
            <p className="mt-2 text-sm font-black text-[var(--ink)]">{SITE.staffName}</p>
            <p className="mt-1 text-[11px] text-[var(--ink-3)]">可替换为二维码图片</p>
          </div>
        </div>

        <div className="mt-6 rounded-[8px] bg-[var(--yellow)] px-4 py-3 text-center text-sm font-bold text-[var(--ink)]">
          微信号：<span className="font-black">{SITE.wechatId}</span>
        </div>

        <ul className="mt-6 space-y-3">
          <li className="flex items-start gap-3 rounded-[8px] bg-[var(--bg)] p-4">
            <BookOpen className="mt-0.5 shrink-0 text-[var(--teal)]" size={18} />
            <div>
              <p className="text-sm font-black">领取备考资料</p>
              <p className="text-sm text-[var(--ink-2)]">口语题库、阅读资料、听力素材索引</p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-[8px] bg-[var(--bg)] p-4">
            <Users className="mt-0.5 shrink-0 text-[var(--teal)]" size={18} />
            <div>
              <p className="text-sm font-black">预约课程 / 加入社群</p>
              <p className="text-sm text-[var(--ink-2)]">独立老师试听、督学营咨询、备考答疑群</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
