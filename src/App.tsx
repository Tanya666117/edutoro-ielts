import { useState } from 'react'
import { ContactModal } from './components/ContactModal'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { ContactSection } from './sections/ContactSection'
import { Hero } from './sections/Hero'
import { RecallsSection } from './sections/RecallsSection'
import { ServicesSection } from './sections/ServicesSection'
import { SpeakingSection } from './sections/Speaking/SpeakingSection'
import { TeachersSection } from './sections/TeachersSection'

export default function App() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <>
      <Navbar />
      <main>
        <Hero onContact={() => setContactOpen(true)} />
        <ServicesSection onContact={() => setContactOpen(true)} />
        <TeachersSection onContact={() => setContactOpen(true)} />
        <SpeakingSection />
        <RecallsSection />
        <ContactSection onContact={() => setContactOpen(true)} />
      </main>
      <Footer />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  )
}
