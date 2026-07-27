import { BookOpen, MessageCircle, Users } from 'lucide-react'
import { SITE } from '../data/site'

interface ContactSectionProps {
  onContact: () => void
}

export function ContactSection({ onContact }: ContactSectionProps) {
  return (
    <section id="contact" className="section scroll-mt-24 bg-[var(--charcoal)]">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-[var(--yellow)]">咨询顾问</p>
          <h2 className="mt-3 text-[clamp(28px,3.6vw,44px)] font-black leading-tight text-white">
            领资料 · 约试听 · 加入备考社群
          </h2>
          <p className="mt-4 text-white/68">{SITE.staffHint}</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="mx-auto flex h-52 w-52 flex-col items-center justify-center rounded-[8px] bg-white/8 ring-1 ring-white/12">
            <MessageCircle size={38} className="text-[var(--yellow)]" />
            <p className="mt-3 text-sm font-black text-white">工作人员微信</p>
            <p className="mt-1 text-xs text-white/45">可替换为二维码图片</p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BookOpen, title: '领取真题资料', desc: '剑桥真题、当季口语题、写作范文' },
              { icon: Users, title: '报名课程', desc: '一对一独立老师 / 多对一督学营' },
              { icon: MessageCircle, title: '加入备考社群', desc: '考情交流、资料更新、备考答疑' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 rounded-[8px] bg-white/7 p-5 ring-1 ring-white/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--yellow)] text-[var(--ink)]">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-black text-white">{title}</p>
                  <p className="mt-1 text-sm text-white/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button type="button" onClick={onContact} className="btn btn-yellow">
            添加工作人员微信
          </button>
          <p className="mt-4 text-sm text-white/50">微信号：{SITE.wechatId}</p>
        </div>
      </div>
    </section>
  )
}
