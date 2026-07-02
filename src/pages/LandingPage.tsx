import { Navbar } from '../components/landing/Navbar'
import { Hero } from '../components/landing/Hero'
import { About } from '../components/landing/About'
import { Pricing } from '../components/landing/Pricing'
import { Schedule } from '../components/landing/Schedule'
import { Crowd } from '../components/landing/Crowd'
import { Footer } from '../components/landing/Footer'
import { ScrollBackground } from '../components/landing/ScrollBackground'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <ScrollBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Pricing />
        <Schedule />
        <Crowd />
      </main>
      <Footer />
    </div>
  )
}
