import { useEffect, useState } from 'react'
import { ContactModal } from './components/ContactModal'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { ResourcePackModal } from './components/ResourcePackModal'
import type { PageId } from './data/site'
import { ContactSection } from './sections/ContactSection'
import { CasesSection } from './sections/CasesSection'
import { CoachingSection, type CoachingMode } from './sections/CoachingSection'
import { Hero } from './sections/Hero'
import { SpeakingSection } from './sections/Speaking/SpeakingSection'
import { WritingReviewSection } from './sections/WritingReviewSection'

const PAGE_IDS: PageId[] = ['hero', 'coaching', 'teachers', 'supervision', 'writing', 'speaking', 'cases', 'contact']

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('hero')
  const [contactOpen, setContactOpen] = useState(false)
  const [resourceOpen, setResourceOpen] = useState(false)
  const [featuredTeacherId, setFeaturedTeacherId] = useState<string | null>(null)
  const [coachingMode, setCoachingMode] = useState<CoachingMode>('teachers')

  useEffect(() => {
    const pageFromHash = window.location.hash.replace('#', '') as PageId
    if (!PAGE_IDS.includes(pageFromHash)) return
    if (pageFromHash === 'teachers' || pageFromHash === 'supervision') {
      setCoachingMode(pageFromHash)
      setActivePage('coaching')
      window.history.replaceState(null, '', '#coaching')
      return
    }
    setActivePage(pageFromHash)
  }, [])

  const navigate = (page: PageId) => {
    const targetPage = page === 'teachers' || page === 'supervision' ? 'coaching' : page
    if (page === 'teachers' || page === 'supervision') setCoachingMode(page)
    setContactOpen(false)
    setResourceOpen(false)
    setActivePage(targetPage)
    window.history.replaceState(null, '', `#${targetPage}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openFeaturedTeacher = (teacherId: string) => {
    setFeaturedTeacherId(teacherId)
    navigate('teachers')
  }

  return (
    <>
      <Navbar activePage={activePage} onNavigate={navigate} onContact={() => { setResourceOpen(false); setContactOpen(true) }} />
      <main>
        {activePage === 'hero' && <Hero onNavigate={navigate} onTeacher={openFeaturedTeacher} onResource={() => { setContactOpen(false); setResourceOpen(true) }} onCommunity={() => { setResourceOpen(false); setContactOpen(true) }} />}
        {activePage === 'coaching' && <CoachingSection mode={coachingMode} onModeChange={setCoachingMode} onContact={() => setContactOpen(true)} initialTeacherId={featuredTeacherId} onInitialTeacherHandled={() => setFeaturedTeacherId(null)} />}
        {activePage === 'writing' && <WritingReviewSection />}
        {activePage === 'speaking' && <SpeakingSection />}
        {activePage === 'cases' && <CasesSection />}
        {activePage === 'contact' && <ContactSection onContact={() => setContactOpen(true)} />}
      </main>
      <Footer onNavigate={navigate} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <ResourcePackModal open={resourceOpen} onClose={() => setResourceOpen(false)} />
    </>
  )
}
