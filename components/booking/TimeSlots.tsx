'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Availability } from '@/types/database'
import { cn, formatTime } from '@/lib/utils'

interface TimeSlotsProps {
  selectedDate: Date | null
  selectedSlot: Availability | null
  onSlotSelect: (slot: Availability) => void
  className?: string
}

export function TimeSlots({ selectedDate, selectedSlot, onSlotSelect, className }: TimeSlotsProps) {
  const [slots, setSlots] = useState<Availability[]>([])
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      return
    }

    const date = selectedDate

    async function fetchSlots() {
      setLoading(true)
      const supabase = createClient()
      const dateStr = date.toISOString().split('T')[0]

      // Fetch available slots
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('availability')
        .select('*')
        .eq('date', dateStr)
        .eq('is_blocked', false)
        .order('start_time')

      if (availabilityError) {
        console.error('Error fetching slots:', availabilityError)
        setLoading(false)
        return
      }

      // Fetch booked appointments for these slots
      const slotIds = availabilityData?.map((s: { id: string }) => s.id) || []
      if (slotIds.length > 0) {
        const { data: appointments } = await supabase
          .from('appointments')
          .select('availability_id')
          .in('availability_id', slotIds)
          .eq('status', 'confirmed')

        setBookedSlots(new Set<string>(appointments?.map((a: { availability_id: string }) => a.availability_id) || []))
      }

      setSlots((availabilityData || []) as Availability[])
      setLoading(false)
    }

    fetchSlots()
  }, [selectedDate])

  if (!selectedDate) {
    return (
      <div className={cn('bg-charcoal rounded-lg p-6 border border-charcoal-light', className)}>
        <div className="flex items-center gap-3 text-warm-white/40">
          <Clock className="w-5 h-5" />
          <p>Select a date to view available times</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn('bg-charcoal rounded-lg p-6 border border-charcoal-light', className)}>
        <h3 className="font-bebas text-xl text-warm-white mb-4 tracking-wide">
          Available Times
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-charcoal-light animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  const availableSlots = slots.filter((slot) => !bookedSlots.has(slot.id))

  return (
    <div className={cn('bg-charcoal rounded-lg p-6 border border-charcoal-light', className)}>
      <h3 className="font-bebas text-xl text-warm-white mb-4 tracking-wide">
        Available Times
      </h3>

      {availableSlots.length === 0 ? (
        <p className="text-warm-white/40 text-center py-8">
          No available times for this date
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {availableSlots.map((slot) => {
            const isSelected = selectedSlot?.id === slot.id

            return (
              <button
                key={slot.id}
                onClick={() => onSlotSelect(slot)}
                className={cn(
                  'py-3 px-4 rounded-md text-center transition-all duration-200',
                  'border font-medium',
                  isSelected
                    ? 'bg-california-gold text-matte-black border-california-gold'
                    : 'bg-charcoal-light text-warm-white border-charcoal-light hover:border-california-gold hover:text-california-gold'
                )}
              >
                {formatTime(slot.start_time)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
