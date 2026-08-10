import { ArrowRight, BookOpen, MessageCircle, Users, X } from 'lucide-react'

const WECHAT_QR_SRC = `${import.meta.env.BASE_URL}wechat-cloudtutor.png`

interface ResourcePackModalProps {
  open: boolean
  onClose: () => void
  onClaim: () => void
}

export function ResourcePackModal({ open, onClose, onClaim }: ResourcePackModalProps) {
  if (!open) return null
  return <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={onClose} role="presentation">
    <div className="fade-up relative w-full max-w-xl rounded-[8px] bg-white p-6 shadow-[var(--shadow)] sm:p-8" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="resource-pack-title">
      <button type="button" onClick={onClose} className="absolute right-5 top-5 rounded-[8px] p-2 text-[var(--ink-3)] hover:bg-[var(--bg)]" aria-label="关闭"><X size={20} /></button>
      <p className="eyebrow">备考资料</p>
      <h2 id="resource-pack-title" className="mt-2 text-2xl font-black text-[var(--ink)]">把有用的资料，放到你的备考节奏里</h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">添加学习顾问，领取当季资料、口语题库和阅读思路，也可以直接咨询老师或督学方案。</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[8px] bg-white p-3 ring-1 ring-black/10"><img src={WECHAT_QR_SRC} alt="学习顾问微信二维码" className="w-full rounded-[6px] object-contain" /></div>
        <div className="grid gap-3">
          {[
            { icon: BookOpen, title: '资料持续更新', desc: '口语题库、阅读思路和当季重点及时整理。' },
            { icon: MessageCircle, title: '老师与督学答疑', desc: '先把备考卡点问清楚，再决定适合的路径。' },
            { icon: Users, title: '有人一起坚持', desc: '了解真实反馈和阶段进展，少走弯路。' },
          ].map(({ icon: Icon, title, desc }) => <div key={title} className="rounded-[8px] bg-[var(--bg)] p-4 ring-1 ring-black/10"><Icon size={18} className="text-[var(--teal)]" /><p className="mt-2 text-sm font-black text-[var(--ink)]">{title}</p><p className="mt-1 text-xs leading-relaxed text-[var(--ink-3)]">{desc}</p></div>)}
        </div>
      </div>
      <button type="button" onClick={onClaim} className="btn btn-dark mt-6 w-full">添加学习顾问微信 <ArrowRight size={17} /></button>
    </div>
  </div>
}
