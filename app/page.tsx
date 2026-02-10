'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scissors, BookOpen, MessageCircle, Instagram, Calendar, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ScarcityBanner } from '@/components/ScarcityBanner'
import { WeatherWidget } from '@/components/WeatherWidget'
import { DMDrawer } from '@/components/messaging/DMDrawer'

export default function Home() {
  const [dmOpen, setDmOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-matte-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background with overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-matte-black/50 via-matte-black/70 to-matte-black" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231A1A1A" width="100" height="100"/><circle fill="%23D4AF37" cx="50" cy="50" r="1" opacity="0.3"/></svg>')`
          }}
        />

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 md:px-12">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-california-gold" />
            <span className="font-bebas text-xl sm:text-2xl text-warm-white tracking-wider">RAND V</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/lookbook" className="text-warm-white/70 hover:text-california-gold transition-colors">
              Lookbook
            </Link>
            <Link href="/booking" className="text-warm-white/70 hover:text-california-gold transition-colors">
              Book Now
            </Link>
            <button
              onClick={() => setDmOpen(true)}
              className="text-warm-white/70 hover:text-california-gold transition-colors"
            >
              Contact
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-warm-white/70 hover:text-california-gold transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 z-20 bg-matte-black/95 backdrop-blur-lg border-b border-charcoal-light">
            <div className="flex flex-col p-4 space-y-4">
              <Link
                href="/lookbook"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-warm-white/70 hover:text-california-gold transition-colors py-3 px-4 rounded-lg hover:bg-charcoal"
              >
                <BookOpen className="w-5 h-5" />
                Lookbook
              </Link>
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-warm-white/70 hover:text-california-gold transition-colors py-3 px-4 rounded-lg hover:bg-charcoal"
              >
                <Calendar className="w-5 h-5" />
                Book Now
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setDmOpen(true)
                }}
                className="flex items-center gap-3 text-warm-white/70 hover:text-california-gold transition-colors py-3 px-4 rounded-lg hover:bg-charcoal text-left"
              >
                <MessageCircle className="w-5 h-5" />
                Contact
              </button>
            </div>
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6">
          <h1 className="font-bebas text-5xl sm:text-6xl md:text-8xl text-warm-white tracking-wide mb-4 animate-fade-in">
            THE RAND V
            <span className="block text-california-gold">EXPERIENCE</span>
          </h1>
          <p className="text-warm-white/70 text-base sm:text-lg md:text-xl max-w-2xl mb-6 sm:mb-8 animate-slide-up px-2">
            Where precision meets artistry. Elevate your look with California&apos;s premier barbering experience.
          </p>

          <div className="animate-slide-up w-full sm:w-auto px-4 sm:px-0" style={{ animationDelay: '0.2s' }}>
            <Link href="/booking" className="block">
              <Button size="lg" className="uppercase w-full sm:w-auto text-sm sm:text-base">
                <span className="hidden sm:inline">Secure Your Seat – Rand V Operates By Appointment Only</span>
                <span className="sm:hidden">Book Your Appointment</span>
              </Button>
            </Link>
          </div>

          {/* Scarcity Banner */}
          <div className="mt-8 sm:mt-12 w-full max-w-md animate-slide-up px-4 sm:px-0" style={{ animationDelay: '0.4s' }}>
            <ScarcityBanner />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <div className="w-6 h-10 rounded-full border-2 border-warm-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-california-gold rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bebas text-3xl sm:text-4xl md:text-5xl text-warm-white text-center mb-10 sm:mb-16 tracking-wide">
            The Experience Awaits
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-charcoal rounded-lg p-6 sm:p-8 border border-charcoal-light hover:border-california-gold/30 transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-california-gold/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-california-gold/20 transition-colors">
                <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-california-gold" />
              </div>
              <h3 className="font-bebas text-xl sm:text-2xl text-warm-white mb-2 sm:mb-3 tracking-wide">
                Precision Craftsmanship
              </h3>
              <p className="text-warm-white/60 text-sm sm:text-base">
                Every cut is a masterpiece. From classic fades to modern styles, experience the attention to detail that defines Rand V.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-charcoal rounded-lg p-6 sm:p-8 border border-charcoal-light hover:border-california-gold/30 transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-california-gold/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-california-gold/20 transition-colors">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-california-gold" />
              </div>
              <h3 className="font-bebas text-xl sm:text-2xl text-warm-white mb-2 sm:mb-3 tracking-wide">
                The Lookbook
              </h3>
              <p className="text-warm-white/60 text-sm sm:text-base">
                Browse our portfolio of signature styles. Save your favorites and bring your vision to life in the chair.
              </p>
              <Link
                href="/lookbook"
                className="inline-block mt-3 sm:mt-4 text-california-gold hover:text-california-gold-light transition-colors text-sm sm:text-base"
              >
                Explore Styles →
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-charcoal rounded-lg p-6 sm:p-8 border border-charcoal-light hover:border-california-gold/30 transition-all duration-300 group sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-california-gold/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-california-gold/20 transition-colors">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-california-gold" />
              </div>
              <h3 className="font-bebas text-xl sm:text-2xl text-warm-white mb-2 sm:mb-3 tracking-wide">
                Appointment Only
              </h3>
              <p className="text-warm-white/60 text-sm sm:text-base">
                No walk-ins. No waiting. Your time is valued here. Book your session and arrive ready for transformation.
              </p>
              <Link
                href="/booking"
                className="inline-block mt-3 sm:mt-4 text-california-gold hover:text-california-gold-light transition-colors text-sm sm:text-base"
              >
                Book Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Weather Widget Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 bg-charcoal">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="text-center md:text-left">
              <h2 className="font-bebas text-2xl sm:text-3xl text-warm-white mb-3 sm:mb-4 tracking-wide">
                Product Recommendations
              </h2>
              <p className="text-warm-white/60 text-sm sm:text-base">
                Based on current weather conditions, here&apos;s what we recommend to maintain your fresh cut.
              </p>
            </div>
            <WeatherWidget />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bebas text-3xl sm:text-4xl md:text-5xl text-warm-white mb-4 sm:mb-6 tracking-wide">
            Ready to Elevate?
          </h2>
          <p className="text-warm-white/60 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join the exclusive clientele who trust Rand V with their image. Limited availability ensures personalized attention for every session.
          </p>
          <Link href="/booking">
            <Button size="lg" className="uppercase">
              Book Your Experience
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-charcoal-light py-8 sm:py-12 px-4 sm:px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-california-gold" />
            <span className="font-bebas text-lg sm:text-xl text-warm-white tracking-wider">RAND V</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/lookbook" className="text-warm-white/60 hover:text-california-gold transition-colors text-xs sm:text-sm">
              Lookbook
            </Link>
            <Link href="/booking" className="text-warm-white/60 hover:text-california-gold transition-colors text-xs sm:text-sm">
              Book Now
            </Link>
            <button
              onClick={() => setDmOpen(true)}
              className="text-warm-white/60 hover:text-california-gold transition-colors text-xs sm:text-sm"
            >
              Contact
            </button>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-charcoal-light flex items-center justify-center text-warm-white/60 hover:text-california-gold hover:bg-california-gold/10 transition-all"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-charcoal-light text-center">
          <p className="text-warm-white/40 text-xs sm:text-sm">
            © {new Date().getFullYear()} The Rand V Experience. All rights reserved.
          </p>
        </div>
      </footer>

      {/* DM Drawer */}
      <DMDrawer isOpen={dmOpen} onClose={() => setDmOpen(false)} />
    </div>
  )
}
