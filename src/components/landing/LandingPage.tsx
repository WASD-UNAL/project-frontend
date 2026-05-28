import Footer from './Footer'
import Hero from './Hero'
import Navbar from './Navbar'
import PeakHoursSection from './PeakHoursSection'
import ProgramsSection from './ProgramsSection'

function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main>
        <Hero />
        <ProgramsSection />
        <PeakHoursSection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
