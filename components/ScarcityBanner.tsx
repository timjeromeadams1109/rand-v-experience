'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar } from 'lucide-react'

interface ScarcityBannerProps {
  className?: string
}

export function ScarcityBanner({ className }: ScarcityBannerProps) {
  const [remainingSlots, setRemainingSlots] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAvailability() {
      const supabase = createClient()

      const today = new Date()
      const endOfWeek = new Date(today)
      endOfWeek.setDate(today.getDate() + 7)

      const { data: availability, error } = await supabase
        .from('availability')
        .select('id')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0])
        .eq('is_blocked', false)

      if (error) {
        console.error('Error fetching availability:', error)
        setLoading(false)
        return
      }

      const availableIds = availability?.map((a: { id: string }) => a.id) || []

      if (availableIds.length === 0) {
        setRemainingSlots(0)
        setLoading(false)
        return
      }

      const { data: appointments } = await supabase
        .from('appointments')
        .select('availability_id')
        .in('availability_id', availableIds)
        .eq('status', 'confirmed')

      const bookedCount = appointments?.length || 0
      setRemainingSlots(availableIds.length - bookedCount)
      setLoading(false)
    }

    fetchAvailability()

    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('availability-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          fetchAvailability()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className={`bg-charcoal border-l-4 border-california-gold p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-california-gold" />
          <div className="h-4 w-48 bg-charcoal-light animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (remainingSlots === null) {
    return null
  }

  return (
    <div className={`bg-charcoal border-l-4 border-california-gold p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-california-gold" />
        <p className="text-warm-white">
          <span className="text-california-gold font-bold text-lg">
            {remainingSlots}
          </span>{' '}
          <span className="text-warm-white/80">
            {remainingSlots === 1 ? 'slot' : 'slots'} remaining this week
          </span>
        </p>
      </div>
      {remainingSlots <= 3 && remainingSlots > 0 && (
        <p className="text-california-gold/70 text-sm mt-2 ml-8">
          Limited availability - book now to secure your experience
        </p>
      )}
      {remainingSlots === 0 && (
        <p className="text-warm-white/50 text-sm mt-2 ml-8">
          This week is fully booked - check next week for availability
        </p>
      )}
    </div>
  )
}
