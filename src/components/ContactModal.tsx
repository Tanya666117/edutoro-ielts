import { BookOpen, Users, X } from 'lucide-react'
import { SITE } from '../data/site'

const WECHAT_QR_SRC = `${import.meta.env.BASE_URL}wechat-cloudtutor.png`

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

export function ContactModal({ open, onClose }: ContactModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={onClose} role="presentation">
      <div className="fade-up relative w-full max-w-md rounded-[8px] bg-white p-7 shadow-[var(--shadow)] sm:p-8" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="contact-title">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 rounded-[8px] p-2 text-[var(--ink-3)] hover:bg-[var(--bg)]" aria-label="关闭">
          <X size={20} />
        </button>
        <p className="eyebrow">Contact</p>
        <h2 id="contact-title" className="mt-2 text-2xl font-black text-[var(--ink)]">添加学习顾问微信</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">{SITE.staffHint}</p>
        <div className="mt-7 flex justify-center">
          <div className="w-full max-w-[300px] rounded-[8px] bg-white p-3 ring-1 ring-black/10">
            <img src={WECHAT_QR_SRC} alt={`${SITE.staffName} 微信二维码`} className="w-full rounded-[6px] object-contain" />
          </div>
        </div>
        <div className="mt-6 rounded-[8px] bg-[var(--yellow)] px-4 py-3 text-center text-sm font-bold text-[var(--ink)]">微信号：<span className="font-black">{SITE.wechatId}</span></div>
        <ul className="mt-6 space-y-3">
          <li className="flex items-start gap-3 rounded-[8px] bg-[var(--bg)] p-4"><BookOpen className="mt-0.5 shrink-0 text-[var(--teal)]" size={18} /><div><p className="text-sm font-black">领取备考资料</p><p className="text-sm text-[var(--ink-2)]">口语题库、阅读思路和本月高频资料。</p></div></li>
          <li className="flex items-start gap-3 rounded-[8px] bg-[var(--bg)] p-4"><Users className="mt-0.5 shrink-0 text-[var(--teal)]" size={18} /><div><p className="text-sm font-black">预约试听 / 督学咨询</p><p className="text-sm text-[var(--ink-2)]">先了解需求，再推荐老师或督学档位。</p></div></li>
        </ul>
      </div>
    </div>
  )
}
