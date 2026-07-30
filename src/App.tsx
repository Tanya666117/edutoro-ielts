import { useEffect, useState } from 'react'
import { ContactModal } from './components/ContactModal'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { ResourcePackModal } from './components/ResourcePackModal'
import { NAV_ITEMS, type PageId } from './data/site'
import { ContactSection } from './sections/ContactSection'
import { CasesSection } from './sections/CasesSection'
import { Hero } from './sections/Hero'
import { RecallsSection } from './sections/RecallsSection'
import { ServicesSection } from './sections/ServicesSection'
import { SpeakingSection } from './sections/Speaking/SpeakingSection'
import { TeachersSection } from './sections/TeachersSection'

const PAGE_IDS: PageId[] = ['hero', 'cases', ...NAV_ITEMS.map((item) => item.id)]

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('hero')
  const [contactOpen, setContactOpen] = useState(false)
  const [resourceOpen, setResourceOpen] = useState(false)

  useEffect(() => {
    const pageFromHash = window.location.hash.replace('#', '') as PageId
    if (PAGE_IDS.includes(pageFromHash)) setActivePage(pageFromHash)
  }, [])

  const navigate = (page: PageId) => {
    setActivePage(page)
    window.history.replaceState(null, '', `#${page}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openContactFromResource = () => {
    setResourceOpen(false)
    setContactOpen(true)
  }

  return (
    <>
      <Navbar activePage={activePage} onNavigate={navigate} onResource={() => setResourceOpen(true)} />
      <main>
        {activePage === 'hero' && <Hero onNavigate={navigate} onResource={() => setResourceOpen(true)} />}
        {activePage === 'services' && <ServicesSection onContact={() => setContactOpen(true)} onNavigate={navigate} />}
        {activePage === 'cases' && <CasesSection />}
        {activePage === 'teachers' && <TeachersSection onContact={() => setContactOpen(true)} />}
        {activePage === 'speaking' && <SpeakingSection />}
        {activePage === 'recalls' && <RecallsSection />}
        {activePage === 'contact' && <ContactSection onContact={() => setContactOpen(true)} />}
      </main>
      <Footer onNavigate={navigate} />
      <ResourcePackModal open={resourceOpen} onClose={() => setResourceOpen(false)} onClaim={openContactFromResource} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  )
}
