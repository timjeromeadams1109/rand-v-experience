import Link from 'next/link'
import { Scissors, ArrowLeft } from 'lucide-react'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { ScarcityBanner } from '@/components/ScarcityBanner'

export const metadata = {
  title: 'Book Your Experience | The Rand V Experience',
  description: 'Secure your appointment with Rand V. Limited availability ensures personalized attention.',
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-matte-black">
      {/* Header */}
      <header className="border-b border-charcoal-light sticky top-0 bg-matte-black/95 backdrop-blur-sm z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 text-warm-white/70 hover:text-california-gold transition-colors">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-california-gold" />
            <span className="font-bebas text-lg sm:text-xl text-warm-white tracking-wider">RAND V</span>
          </div>
          <div className="w-12 sm:w-16" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Scarcity Banner */}
      <div className="border-b border-charcoal-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScarcityBanner className="border-l-0 py-2 sm:py-3" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-bebas text-3xl sm:text-4xl md:text-5xl text-warm-white tracking-wide mb-3 sm:mb-4">
            Book Your Experience
          </h1>
          <p className="text-warm-white/60 max-w-xl mx-auto text-sm sm:text-base px-4">
            Select your service, choose your time, and prepare for transformation.
            Rand V operates by appointment only.
          </p>
        </div>

        <BookingFlow />
      </main>
    </div>
  )
}
