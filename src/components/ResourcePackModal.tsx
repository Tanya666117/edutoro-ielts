import { useEffect } from 'react'
import { BookOpen, ExternalLink, MessageCircle, X } from 'lucide-react'
import { SITE } from '../data/site'

const CATALOG_SRC = `${import.meta.env.BASE_URL}ielts-resource-catalog.jpg`
const WECHAT_QR_SRC = `${import.meta.env.BASE_URL}wechat-cloudtutor.png`

interface ResourcePackModalProps {
  open: boolean
  onClose: () => void
}

export function ResourcePackModal({ open, onClose }: ResourcePackModalProps) {
  useEffect(() => {
    if (!open) return undefined

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/65 p-3 sm:items-center sm:p-5" onClick={onClose} role="presentation">
      <div className="fade-up relative max-h-[94vh] w-full max-w-[1180px] overflow-y-auto rounded-[8px] bg-white shadow-[var(--shadow)]" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="resource-pack-title">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--charcoal)] text-white shadow-lg transition hover:bg-[var(--teal)]" aria-label="关闭资料目录">
          <X size={20} />
        </button>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="min-w-0 bg-[#fffdf7] p-3 sm:p-5 lg:p-7">
            <a href={CATALOG_SRC} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-[6px] ring-1 ring-black/10" aria-label="查看雅思全套资料目录原图">
              <img src={CATALOG_SRC} alt="Edutoro 2026 雅思全套资料目录" className="h-auto w-full object-contain" />
              <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/75 text-white opacity-90 shadow-md transition group-hover:bg-[var(--teal)]" title="查看清晰原图">
                <ExternalLink size={18} />
              </span>
            </a>
          </div>

          <aside className="border-t border-black/10 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--teal)]">Resource pack</p>
            <h2 id="resource-pack-title" className="mt-3 text-[27px] font-black leading-tight text-[var(--ink)]">领取雅思全套资料</h2>
            <p className="mt-3 text-sm font-bold leading-7 text-[var(--ink-2)]">网课、真题、听力、阅读、写作、口语与电子书分类整理，一站式领取。</p>

            <div className="mt-6 rounded-[8px] bg-[var(--yellow-soft)] p-4 ring-1 ring-black/10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--yellow)] text-[var(--ink)]"><BookOpen size={19} /></span>
                <div>
                  <p className="text-lg font-black text-[var(--ink)]">2000+ 份</p>
                  <p className="text-xs font-bold text-[var(--ink-2)]">视频、真题、音频与 PDF</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[8px] bg-white p-3 ring-1 ring-black/10">
              <img src={WECHAT_QR_SRC} alt={`${SITE.staffName} 微信二维码`} className="mx-auto w-full max-w-[240px] rounded-[6px] object-contain" />
            </div>

            <div className="mt-4 rounded-[8px] bg-[var(--charcoal)] px-4 py-3 text-center text-sm font-bold text-white">
              微信号：<span className="font-black text-[var(--yellow)]">{SITE.wechatId}</span>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs font-bold leading-6 text-[var(--ink-2)]"><MessageCircle size={16} className="mt-1 shrink-0 text-[var(--teal)]" />添加小助手，备注“雅思资料”，即可领取完整备考包。</p>
          </aside>
        </div>
      </div>
    </div>
  )
}
