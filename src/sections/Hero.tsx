import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Bot,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Sparkles,
  UserPlus,
  UsersRound,
} from 'lucide-react'
import { SITE } from '../data/site'
import type { PageId } from '../data/site'

interface HeroProps {
  onNavigate: (page: PageId) => void
  onTeacher: (teacherId: string) => void
  onResource: () => void
  onCommunity: () => void
}

type HeroAd = {
  id: string
  page: PageId
  title: string
  cta: string
  image: string
}

const heroAds: HeroAd[] = [
  {
    id: 'writing',
    page: 'writing',
    title: 'AI 作文批改广告图',
    cta: '查看写作批改',
    image: '/hero-ads/writing.png',
  },
  {
    id: 'speaking',
    page: 'speaking',
    title: '口语题库广告图',
    cta: '进入口语练习',
    image: '/hero-ads/speaking.png',
  },
  {
    id: 'teachers',
    page: 'teachers',
    title: '一对一老师广告图',
    cta: '查看一对一老师',
    image: '/hero-ads/teachers.png',
  },
  {
    id: 'supervision',
    page: 'supervision',
    title: '督学服务广告图',
    cta: '查看督学方案',
    image: '/hero-ads/supervision.png',
  },
]

export function Hero({ onNavigate, onResource, onCommunity }: HeroProps) {
  const [activeAdIndex, setActiveAdIndex] = useState(0)
  const [carouselPaused, setCarouselPaused] = useState(false)
  const activeAd = heroAds[activeAdIndex % heroAds.length]

  const showNextAd = () => {
    setActiveAdIndex((current) => (current + 1) % heroAds.length)
  }

  useEffect(() => {
    if (carouselPaused || heroAds.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const timer = window.setTimeout(showNextAd, 5000)
    return () => window.clearTimeout(timer)
  }, [activeAdIndex, carouselPaused])

  const openAd = (ad: HeroAd) => onNavigate(ad.page)

  return (
    <section id="hero" className="hero">
      <div className="shell hero-shell grid items-center gap-12 py-12 md:py-16 lg:min-h-[calc(100svh-82px)] lg:grid-cols-[0.74fr_1.26fr] lg:items-start lg:gap-10 lg:py-10 xl:grid-cols-[0.72fr_1.28fr] xl:gap-12 xl:py-12">
        <div className="fade-up lg:pl-6 xl:pl-10">
          <span className="tag-yellow"><Sparkles size={15} style={{ color: 'var(--yellow-2)' }} />2026 雅思提分服务已更新</span>
          <h1 className="mt-8 max-w-3xl text-[2.15rem] font-black leading-[1.14] text-[var(--ink)] sm:text-[2.4rem] lg:text-[2.15rem] xl:text-[2.45rem]">
            雅思学习，
            <br />
            <span className="lg:whitespace-nowrap">从找到适合自己的方法开始。</span>
          </h1>
          <p className="mt-7 max-w-2xl whitespace-pre-line text-[17px] font-bold leading-[1.9] text-[var(--ink-2)] md:text-[18px]">{SITE.tagline}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={() => onNavigate('teachers')} className="btn btn-yellow"><UsersRound size={18} />先看老师 <ArrowRight size={16} /></button>
            <button type="button" onClick={() => onNavigate('supervision')} className="btn btn-dark"><ClipboardCheck size={18} />了解督学</button>
            <button type="button" onClick={() => onNavigate('writing')} className="btn btn-outline"><Bot size={18} />AI 批改作文</button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-black">
            <button type="button" onClick={onResource} className="inline-flex items-center gap-2 text-[var(--teal)] transition hover:text-[var(--ink)] hover:underline"><BookOpen size={17} />领取雅思全套资料 · 2000+份</button>
            <button type="button" onClick={onCommunity} className="inline-flex items-center gap-2 text-[var(--ink-2)] transition hover:text-[var(--teal)] hover:underline"><UserPlus size={17} />添加雅思学习交流社群</button>
          </div>
        </div>

        <div className="hero-card-stage fade-up relative" style={{ animationDelay: '0.1s' }}>
          <article
            key={activeAd.id}
            className="hero-teacher-card group relative cursor-pointer overflow-hidden rounded-[8px] bg-[#fffbed] text-[var(--ink)] ring-1 ring-black/10"
            aria-live="polite"
            role="link"
            tabIndex={0}
            aria-label={`进入${activeAd.cta}`}
            onClick={() => openAd(activeAd)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openAd(activeAd)
              }
            }}
            onMouseEnter={() => setCarouselPaused(true)}
            onMouseLeave={() => setCarouselPaused(false)}
            onFocusCapture={() => setCarouselPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCarouselPaused(false)
            }}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#fffbed]">
              <img
                src={activeAd.image}
                alt={activeAd.title}
                className="h-full w-full object-cover"
                draggable={false}
              />

              <div
                className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white px-3 py-2 shadow-[0_8px_20px_rgba(23,23,23,0.12)]"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                {heroAds.map((ad, index) => (
                  <button
                    key={ad.id}
                    type="button"
                    onClick={() => setActiveAdIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${index === activeAdIndex ? 'w-6 bg-[var(--charcoal)]' : 'w-2.5 bg-black/20 hover:bg-black/40'}`}
                    aria-label={`切换到${ad.cta}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  showNextAd()
                }}
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--yellow)] text-[var(--ink)] shadow-[0_10px_24px_rgba(23,23,23,0.16)] transition hover:scale-105 hover:bg-[var(--yellow-2)]"
                aria-label="下一张广告"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
