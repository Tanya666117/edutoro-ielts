import { BookOpen, ExternalLink, MessageCircle, Users } from 'lucide-react'
import { SITE } from '../data/site'

interface ContactSectionProps {
  onContact: () => void
}

export function ContactSection({ onContact }: ContactSectionProps) {
  const surveyUrl = 'https://www.wjx.cn/'

  return (
    <section id="contact" className="section scroll-mt-24 bg-[var(--charcoal)]">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-[var(--yellow)]">了解团队</p>
          <h2 className="mt-3 text-[clamp(28px,3.6vw,44px)] font-black leading-tight text-white">
            先了解我们，再决定怎么备考
          </h2>
          <p className="mt-4 text-white/68">领资料 · 看案例 · 约试听 · 查看督学营 · 问题反馈</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              { icon: MessageCircle, title: '课程顾问', desc: '负责资料领取、试听预约和老师匹配沟通。' },
              { icon: BookOpen, title: '教研资料组', desc: '整理口语题库、阅读思路资料和虾家听力本月高频。' },
              { icon: Users, title: '督学服务组', desc: '负责每日监督打卡、答疑反馈和阶段复盘。' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-[8px] bg-white/7 p-5 ring-1 ring-white/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--yellow)] text-[var(--ink)]">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="mt-4 font-black text-white">{title}</p>
                  <p className="mt-1 text-sm text-white/60">{desc}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-12 text-center">
          <button type="button" onClick={onContact} className="btn btn-yellow">
            添加工作人员微信
          </button>
          <a href={surveyUrl} target="_blank" rel="noreferrer" className="btn btn-light ml-0 mt-3 sm:ml-3 sm:mt-0">
            填写问题反馈问卷
            <ExternalLink size={16} />
          </a>
          <p className="mt-4 text-sm text-white/50">微信号：{SITE.wechatId}</p>
        </div>
      </div>
    </section>
  )
}
