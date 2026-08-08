import { useEffect, useState } from 'react'
import { ContactModal } from './components/ContactModal'
import { Footer } from './components/Footer'
import { LoginGate } from './components/LoginGate'
import { Navbar } from './components/Navbar'
import { ResourcePackModal } from './components/ResourcePackModal'
import { AUTH_STORAGE_KEY, LOGIN_CREDENTIALS } from './data/auth'
import type { PageId } from './data/site'
import { ContactSection } from './sections/ContactSection'
import { CasesSection } from './sections/CasesSection'
import { Hero } from './sections/Hero'
import { SpeakingSection } from './sections/Speaking/SpeakingSection'
import { SupervisionSection } from './sections/SupervisionSection'
import { TeachersSection } from './sections/TeachersSection'
import { WritingReviewSection } from './sections/WritingReviewSection'

const PAGE_IDS: PageId[] = ['hero', 'teachers', 'supervision', 'writing', 'speaking', 'cases', 'contact']

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

  const handleLogin = (username: string, password: string) => {
    if (username !== LOGIN_CREDENTIALS.username || password !== LOGIN_CREDENTIALS.password) {
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

  if (!isAuthed) return <LoginGate error={loginError} onSubmit={handleLogin} />

  return (
    <>
      <Navbar activePage={activePage} onNavigate={navigate} onContact={() => setContactOpen(true)} onLogout={handleLogout} />
      <main>
        {activePage === 'hero' && <Hero onNavigate={navigate} onResource={() => setResourceOpen(true)} />}
        {activePage === 'teachers' && <TeachersSection onContact={() => setContactOpen(true)} />}
        {activePage === 'supervision' && <SupervisionSection onContact={() => setContactOpen(true)} />}
        {activePage === 'writing' && <WritingReviewSection />}
        {activePage === 'speaking' && <SpeakingSection />}
        {activePage === 'cases' && <CasesSection />}
        {activePage === 'contact' && <ContactSection onContact={() => setContactOpen(true)} />}
      </main>
      <Footer onNavigate={navigate} />
      <ResourcePackModal open={resourceOpen} onClose={() => setResourceOpen(false)} onClaim={() => { setResourceOpen(false); setContactOpen(true) }} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  )
}
