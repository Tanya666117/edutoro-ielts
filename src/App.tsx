import { useEffect, useState } from 'react'
import { ContactModal } from './components/ContactModal'
import { Footer } from './components/Footer'
import { LoginGate } from './components/LoginGate'
import { Navbar } from './components/Navbar'
import { ResourcePackModal } from './components/ResourcePackModal'
import { AUTH_STORAGE_KEY, LOGIN_CREDENTIALS } from './data/auth'
import { NAV_ITEMS, type PageId } from './data/site'
import { ContactSection } from './sections/ContactSection'
import { CasesSection } from './sections/CasesSection'
import { Hero } from './sections/Hero'
import { RecallsSection } from './sections/RecallsSection'
import { ServicesSection } from './sections/ServicesSection'
import { SpeakingSection } from './sections/Speaking/SpeakingSection'
import { SupervisionSection } from './sections/SupervisionSection'
import { TeachersSection } from './sections/TeachersSection'
import { WritingReviewSection } from './sections/WritingReviewSection'

const PAGE_IDS: PageId[] = ['hero', 'cases', 'supervision', ...NAV_ITEMS.map((item) => item.id)]

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('hero')
  const [contactOpen, setContactOpen] = useState(false)
  const [resourceOpen, setResourceOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState(() => window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true')
  const [loginError, setLoginError] = useState<string | null>(null)

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

  const handleLogin = (username: string, password: string) => {
    const ok = username === LOGIN_CREDENTIALS.username && password === LOGIN_CREDENTIALS.password
    if (!ok) {
      setLoginError('用户名或密码不正确')
      return
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, 'true')
    setIsAuthed(true)
    setLoginError(null)
  }

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    setIsAuthed(false)
    setContactOpen(false)
    setResourceOpen(false)
    setLoginError(null)
  }

  if (!isAuthed) {
    return <LoginGate error={loginError} onSubmit={handleLogin} />
  }

  return (
    <>
      <Navbar
        activePage={activePage}
        onNavigate={navigate}
        onContact={() => setContactOpen(true)}
        onLogout={handleLogout}
      />
      <main>
        {activePage === 'hero' && <Hero onNavigate={navigate} onResource={() => setResourceOpen(true)} />}
        {activePage === 'services' && <ServicesSection onContact={() => setContactOpen(true)} onNavigate={navigate} />}
        {activePage === 'writing' && <WritingReviewSection />}
        {activePage === 'cases' && <CasesSection />}
        {activePage === 'supervision' && <SupervisionSection onContact={() => setContactOpen(true)} />}
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
