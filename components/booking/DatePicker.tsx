'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  className?: string
}

export function DatePicker({ selectedDate, onDateSelect, className }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAvailability() {
      const supabase = createClient()

      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from('availability')
        .select('date')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .eq('is_blocked', false)

      if (error) {
        console.error('Error fetching availability:', error)
        setLoading(false)
        return
      }

      const dates = new Set<string>(data?.map((d: { date: string }) => d.date) || [])
      setAvailableDates(dates)
      setLoading(false)
    }

    fetchAvailability()
  }, [currentMonth])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Add all days in the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today && availableDates.has(dateStr)
  }

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
  }

  const days = getDaysInMonth(currentMonth)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={cn('bg-charcoal rounded-lg p-4 sm:p-6 border border-charcoal-light', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 text-warm-white/60 hover:text-california-gold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-bebas text-lg sm:text-2xl text-warm-white tracking-wide">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 text-warm-white/60 hover:text-california-gold transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-xs sm:text-sm text-warm-white/40 py-1 sm:py-2">
            {day.slice(0, 1)}
            <span className="hidden sm:inline">{day.slice(1)}</span>
          </div>
        ))}
      </div>

      {/* Days grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-9 sm:h-10 bg-charcoal-light animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="h-9 sm:h-10" />
            }

            const available = isDateAvailable(date)
            const selected = isDateSelected(date)

            return (
              <button
                key={date.toISOString()}
                onClick={() => available && onDateSelect(date)}
                disabled={!available}
                className={cn(
                  'h-9 sm:h-10 rounded-md text-xs sm:text-sm font-medium transition-all duration-200',
                  available
                    ? 'hover:bg-california-gold hover:text-matte-black cursor-pointer'
                    : 'text-warm-white/20 cursor-not-allowed',
                  selected
                    ? 'bg-california-gold text-matte-black'
                    : available
                    ? 'text-warm-white bg-charcoal-light'
                    : 'bg-transparent'
                )}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-charcoal-light">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-california-gold" />
          <span className="text-xs sm:text-sm text-warm-white/60">Selected</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-charcoal-light" />
          <span className="text-xs sm:text-sm text-warm-white/60">Available</span>
        </div>
      </div>
    </div>
  )
}
