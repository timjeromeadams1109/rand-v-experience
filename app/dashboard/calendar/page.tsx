import Link from 'next/link'
import { Scissors, ArrowLeft, MessageCircle } from 'lucide-react'
import { AvailabilityCalendar } from '@/components/dashboard/AvailabilityCalendar'

export const metadata = {
  title: 'Calendar | Rand V Dashboard',
  description: 'Manage your availability and view appointments.',
}

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-matte-black">
      {/* Header */}
      <header className="border-b border-charcoal-light">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-warm-white/70 hover:text-california-gold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-california-gold" />
              <span className="font-bebas text-xl text-warm-white tracking-wider">CALENDAR</span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard/messages"
              className="text-warm-white/70 hover:text-california-gold transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Messages
            </Link>
            <Link href="/dashboard" className="text-warm-white/70 hover:text-california-gold transition-colors text-sm">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-bebas text-4xl text-warm-white tracking-wide mb-2">
            Availability Calendar
          </h1>
          <p className="text-warm-white/60">
            Manage your time slots, block unavailable times, and view upcoming appointments.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-charcoal-light" />
            <span className="text-warm-white/60 text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-california-gold/20" />
            <span className="text-warm-white/60 text-sm">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/20" />
            <span className="text-warm-white/60 text-sm">Blocked</span>
          </div>
        </div>

        <AvailabilityCalendar />
      </main>
    </div>
  )
}
