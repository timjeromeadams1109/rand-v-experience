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
      <header className="border-b border-charcoal-light">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-warm-white/70 hover:text-california-gold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-california-gold" />
            <span className="font-bebas text-xl text-warm-white tracking-wider">RAND V</span>
          </div>
          <div className="w-16" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Scarcity Banner */}
      <div className="border-b border-charcoal-light">
        <div className="max-w-6xl mx-auto px-6">
          <ScarcityBanner className="border-l-0 py-3" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-bebas text-4xl md:text-5xl text-warm-white tracking-wide mb-4">
            Book Your Experience
          </h1>
          <p className="text-warm-white/60 max-w-xl mx-auto">
            Select your service, choose your time, and prepare for transformation.
            Rand V operates by appointment only.
          </p>
        </div>

        <BookingFlow />
      </main>
    </div>
  )
}
