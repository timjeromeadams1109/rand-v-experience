'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Scissors, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Availability } from '@/types/database'
import { DatePicker } from './DatePicker'
import { TimeSlots } from './TimeSlots'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn, formatDate, formatTime } from '@/lib/utils'

const SERVICES = [
  {
    id: 'signature-cut',
    name: 'The Signature Cut',
    description: 'Precision haircut tailored to your style',
    duration: '45 min',
    icon: Scissors
  },
  {
    id: 'full-experience',
    name: 'The Full Experience',
    description: 'Cut, beard sculpt, and hot towel treatment',
    duration: '75 min',
    icon: Sparkles
  },
  {
    id: 'beard-sculpt',
    name: 'Beard Sculpt',
    description: 'Precision beard shaping and conditioning',
    duration: '30 min',
    icon: Scissors
  }
]

type BookingStep = 'service' | 'datetime' | 'details' | 'confirmation'

export function BookingFlow() {
  const router = useRouter()
  const [step, setStep] = useState<BookingStep>('service')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBooking = async () => {
    if (!selectedService || !selectedSlot) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login?redirect=/booking')
        return
      }

      const { error: bookingError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          availability_id: selectedSlot.id,
          service_type: selectedService,
          notes: notes || null,
          status: 'confirmed'
        })

      if (bookingError) throw bookingError

      setStep('confirmation')
    } catch (err) {
      console.error('Booking error:', err)
      setError('Failed to complete booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedServiceDetails = () => {
    return SERVICES.find((s) => s.id === selectedService)
  }

  const canProceed = () => {
    switch (step) {
      case 'service':
        return !!selectedService
      case 'datetime':
        return !!selectedDate && !!selectedSlot
      case 'details':
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    const steps: BookingStep[] = ['service', 'datetime', 'details']
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    } else {
      handleBooking()
    }
  }

  const prevStep = () => {
    const steps: BookingStep[] = ['service', 'datetime', 'details']
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  if (step === 'confirmation') {
    const service = getSelectedServiceDetails()
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-california-gold flex items-center justify-center">
          <Check className="w-10 h-10 text-matte-black" />
        </div>
        <h2 className="font-bebas text-4xl text-warm-white mb-4 tracking-wide">
          Your Seat is Secured
        </h2>
        <p className="text-warm-white/70 mb-8">
          The Rand V Experience awaits you.
        </p>

        <Card className="text-left mb-8">
          <CardContent className="space-y-4 py-6">
            <div>
              <p className="text-warm-white/60 text-sm">Service</p>
              <p className="text-warm-white font-medium">{service?.name}</p>
            </div>
            <div>
              <p className="text-warm-white/60 text-sm">Date</p>
              <p className="text-warm-white font-medium">
                {selectedDate && formatDate(selectedDate)}
              </p>
            </div>
            <div>
              <p className="text-warm-white/60 text-sm">Time</p>
              <p className="text-warm-white font-medium">
                {selectedSlot && formatTime(selectedSlot.start_time)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => router.push('/')} variant="gold-outline">
          Return Home
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {(['service', 'datetime', 'details'] as const).map((s, index) => {
          const isActive = s === step
          const isPast = ['service', 'datetime', 'details'].indexOf(s) < ['service', 'datetime', 'details'].indexOf(step)

          return (
            <div key={s} className="flex items-center gap-4">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bebas text-lg transition-colors',
                  isActive
                    ? 'bg-california-gold text-matte-black'
                    : isPast
                    ? 'bg-california-gold/30 text-california-gold'
                    : 'bg-charcoal-light text-warm-white/40'
                )}
              >
                {isPast ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              {index < 2 && (
                <div
                  className={cn(
                    'w-16 h-0.5',
                    isPast ? 'bg-california-gold/30' : 'bg-charcoal-light'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      {step === 'service' && (
        <div>
          <h2 className="font-bebas text-3xl text-warm-white text-center mb-8 tracking-wide">
            Select Your Experience
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES.map((service) => {
              const Icon = service.icon
              const isSelected = selectedService === service.id

              return (
                <Card
                  key={service.id}
                  variant={isSelected ? 'bordered' : 'default'}
                  className={cn(
                    'cursor-pointer transition-all duration-300',
                    isSelected && 'border-california-gold'
                  )}
                  onClick={() => setSelectedService(service.id)}
                >
                  <CardContent className="py-8 text-center">
                    <div
                      className={cn(
                        'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors',
                        isSelected ? 'bg-california-gold' : 'bg-charcoal-light'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-8 h-8',
                          isSelected ? 'text-matte-black' : 'text-california-gold'
                        )}
                      />
                    </div>
                    <h3 className="font-bebas text-2xl text-warm-white mb-2 tracking-wide">
                      {service.name}
                    </h3>
                    <p className="text-warm-white/60 text-sm mb-3">
                      {service.description}
                    </p>
                    <p className="text-california-gold text-sm font-medium">
                      {service.duration}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {step === 'datetime' && (
        <div>
          <h2 className="font-bebas text-3xl text-warm-white text-center mb-8 tracking-wide">
            Choose Your Time
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <DatePicker
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date)
                setSelectedSlot(null)
              }}
            />
            <TimeSlots
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSlotSelect={setSelectedSlot}
            />
          </div>
        </div>
      )}

      {step === 'details' && (
        <div className="max-w-lg mx-auto">
          <h2 className="font-bebas text-3xl text-warm-white text-center mb-8 tracking-wide">
            Final Details
          </h2>

          <Card className="mb-6">
            <CardContent className="py-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-warm-white/60">Service</span>
                <span className="text-warm-white">{getSelectedServiceDetails()?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-white/60">Date</span>
                <span className="text-warm-white">
                  {selectedDate && formatDate(selectedDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-white/60">Time</span>
                <span className="text-warm-white">
                  {selectedSlot && formatTime(selectedSlot.start_time)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <label className="block text-sm text-warm-white/70 mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific style references or notes for Rand V..."
              className="w-full bg-charcoal-light border border-charcoal-light rounded-md px-4 py-3 text-warm-white placeholder-warm-white/40 focus:outline-none focus:border-california-gold transition-colors resize-none h-32"
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-12">
        {step !== 'service' ? (
          <Button variant="ghost" onClick={prevStep}>
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          onClick={nextStep}
          disabled={!canProceed()}
          loading={loading}
          size="lg"
        >
          {step === 'details' ? 'SECURE YOUR SEAT' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
