import { BookOpen, ExternalLink, MessageCircle, Users } from 'lucide-react'
import { SITE } from '../data/site'

interface ContactSectionProps {
  onContact: () => void
}

export function ContactSection({ onContact }: ContactSectionProps) {
  return (
    <section id="contact" className="section scroll-mt-24 bg-[var(--charcoal)]">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow" style={{ color: 'var(--yellow)' }}>联系我们</p>
          <h2 className="mt-3 text-[30px] font-black leading-tight text-white md:text-[44px]">先说清楚你的目标，<br />再一起决定怎么准备。</h2>
          <p className="mt-4 text-white/68">领取资料、预约试听、咨询督学，或把你现在遇到的卡点直接发给我们。</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
          {[
            { icon: MessageCircle, title: '学习顾问', desc: '负责资料领取、试听预约和老师匹配。' },
            { icon: BookOpen, title: '备考资料', desc: '整理口语题库、阅读思路和阶段性高频内容。' },
            { icon: Users, title: '督学团队', desc: '负责学习计划、每日跟进、答疑和阶段复盘。' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-[8px] bg-white/7 p-5 ring-1 ring-white/10"><div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--yellow)] text-[var(--ink)]"><Icon size={18} /></div><p className="mt-4 font-black text-white">{title}</p><p className="mt-1 text-sm leading-7 text-white/60">{desc}</p></div>
          ))}
        </div>

        <div className="mt-12 text-center"><button type="button" onClick={onContact} className="btn btn-yellow">添加学习顾问微信</button><a href="https://www.wjx.cn/" target="_blank" rel="noreferrer" className="btn btn-light ml-0 mt-3 sm:ml-3 sm:mt-0">填写问题反馈 <ExternalLink size={16} /></a><p className="mt-4 text-sm text-white/50">微信号：{SITE.wechatId}</p></div>
      </div>
    </section>
  )
}
