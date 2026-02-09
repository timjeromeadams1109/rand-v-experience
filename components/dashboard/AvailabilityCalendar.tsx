'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Availability, AppointmentWithDetails } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn, formatTime } from '@/lib/utils'

interface TimeSlotModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  onSave: (slot: { startTime: string; endTime: string }) => void
}

function TimeSlotModal({ isOpen, onClose, date, onSave }: TimeSlotModalProps) {
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Time Slot</CardTitle>
          <button onClick={onClose} className="text-warm-white/60 hover:text-warm-white">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-warm-white/70">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-warm-white/70 mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-charcoal-light border border-charcoal-light rounded-md px-4 py-2 text-warm-white focus:outline-none focus:border-california-gold"
              />
            </div>
            <div>
              <label className="block text-sm text-warm-white/70 mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-charcoal-light border border-charcoal-light rounded-md px-4 py-2 text-warm-white focus:outline-none focus:border-california-gold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSave({ startTime, endTime })}>Add Slot</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface BlockTimeModalProps {
  isOpen: boolean
  onClose: () => void
  slot: Availability | null
  onBlock: (reason: string) => void
  onUnblock: () => void
}

function BlockTimeModal({ isOpen, onClose, slot, onBlock, onUnblock }: BlockTimeModalProps) {
  const [reason, setReason] = useState('Private Session')

  if (!isOpen || !slot) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{slot.is_blocked ? 'Unblock Time' : 'Block Time'}</CardTitle>
          <button onClick={onClose} className="text-warm-white/60 hover:text-warm-white">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-warm-white/70">
            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
          </p>
          {slot.is_blocked ? (
            <>
              <p className="text-warm-white">This time is currently blocked: {slot.block_reason}</p>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={onUnblock}>Unblock</Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm text-warm-white/70 mb-2">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-charcoal-light border border-charcoal-light rounded-md px-4 py-2 text-warm-white focus:outline-none focus:border-california-gold"
                >
                  <option value="Private Session">Private Session</option>
                  <option value="In-Studio Maintenance">In-Studio Maintenance</option>
                  <option value="Personal Time">Personal Time</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={() => onBlock(reason)}>Block Time</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function AvailabilityCalendar() {
  const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()))
  const [availability, setAvailability] = useState<Availability[]>([])
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null)

  function getStartOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
  }

  function getWeekDays(): Date[] {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeek)
      day.setDate(currentWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const endOfWeek = new Date(currentWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)

      const startStr = currentWeek.toISOString().split('T')[0]
      const endStr = endOfWeek.toISOString().split('T')[0]

      const [availabilityRes, appointmentsRes] = await Promise.all([
        supabase
          .from('availability')
          .select('*')
          .gte('date', startStr)
          .lte('date', endStr)
          .order('start_time'),
        supabase
          .from('appointments')
          .select(`
            *,
            availability:availability_id(*),
            profile:user_id(*)
          `)
          .eq('status', 'confirmed')
      ])

      if (availabilityRes.data) {
        setAvailability(availabilityRes.data)
      }

      if (appointmentsRes.data) {
        setAppointments(appointmentsRes.data as AppointmentWithDetails[])
      }

      setLoading(false)
    }

    fetchData()
  }, [currentWeek])

  const handleAddSlot = async (slot: { startTime: string; endTime: string }) => {
    if (!selectedDate) return

    const supabase = createClient()
    const dateStr = selectedDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('availability')
      .insert({
        date: dateStr,
        start_time: slot.startTime,
        end_time: slot.endTime
      })
      .select()
      .single()

    if (!error && data) {
      setAvailability((prev) => [...prev, data])
    }

    setShowAddModal(false)
    setSelectedDate(null)
  }

  const handleBlockSlot = async (reason: string) => {
    if (!selectedSlot) return

    const supabase = createClient()

    const { error } = await supabase
      .from('availability')
      .update({ is_blocked: true, block_reason: reason })
      .eq('id', selectedSlot.id)

    if (!error) {
      setAvailability((prev) =>
        prev.map((a) =>
          a.id === selectedSlot.id ? { ...a, is_blocked: true, block_reason: reason } : a
        )
      )
    }

    setShowBlockModal(false)
    setSelectedSlot(null)
  }

  const handleUnblockSlot = async () => {
    if (!selectedSlot) return

    const supabase = createClient()

    const { error } = await supabase
      .from('availability')
      .update({ is_blocked: false, block_reason: null })
      .eq('id', selectedSlot.id)

    if (!error) {
      setAvailability((prev) =>
        prev.map((a) =>
          a.id === selectedSlot.id ? { ...a, is_blocked: false, block_reason: null } : a
        )
      )
    }

    setShowBlockModal(false)
    setSelectedSlot(null)
  }

  const weekDays = getWeekDays()

  const getAppointmentForSlot = (slotId: string) => {
    return appointments.find((a) => a.availability_id === slotId)
  }

  return (
    <div>
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            const prev = new Date(currentWeek)
            prev.setDate(prev.getDate() - 7)
            setCurrentWeek(prev)
          }}
          className="p-2 text-warm-white/60 hover:text-california-gold transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="font-bebas text-2xl text-warm-white tracking-wide">
          {currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => {
            const next = new Date(currentWeek)
            next.setDate(next.getDate() + 7)
            setCurrentWeek(next)
          }}
          className="p-2 text-warm-white/60 hover:text-california-gold transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-64 bg-charcoal animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0]
            const daySlots = availability.filter((a) => a.date === dateStr)
            const isToday = day.toDateString() === new Date().toDateString()

            return (
              <div
                key={dateStr}
                className={cn(
                  'bg-charcoal rounded-lg p-3 min-h-[250px]',
                  isToday && 'ring-2 ring-california-gold'
                )}
              >
                <div className="text-center mb-3">
                  <p className="text-warm-white/50 text-xs">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className={cn(
                    'font-bebas text-xl',
                    isToday ? 'text-california-gold' : 'text-warm-white'
                  )}>
                    {day.getDate()}
                  </p>
                </div>

                <div className="space-y-2">
                  {daySlots.map((slot) => {
                    const appointment = getAppointmentForSlot(slot.id)

                    return (
                      <button
                        key={slot.id}
                        onClick={() => {
                          if (!appointment) {
                            setSelectedSlot(slot)
                            setShowBlockModal(true)
                          }
                        }}
                        className={cn(
                          'w-full text-left p-2 rounded text-xs transition-colors',
                          slot.is_blocked
                            ? 'bg-red-500/20 text-red-400'
                            : appointment
                            ? 'bg-california-gold/20 text-california-gold cursor-default'
                            : 'bg-charcoal-light text-warm-white/70 hover:bg-charcoal-light/70'
                        )}
                      >
                        <p className="font-medium">{formatTime(slot.start_time)}</p>
                        {slot.is_blocked && (
                          <p className="text-[10px] opacity-70">{slot.block_reason}</p>
                        )}
                        {appointment && (
                          <p className="text-[10px] opacity-70 truncate">
                            {(appointment.profile as { full_name: string }).full_name}
                          </p>
                        )}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => {
                      setSelectedDate(day)
                      setShowAddModal(true)
                    }}
                    className="w-full p-2 rounded border border-dashed border-charcoal-light text-warm-white/40 hover:border-california-gold hover:text-california-gold transition-colors flex items-center justify-center gap-1 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <TimeSlotModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setSelectedDate(null)
        }}
        date={selectedDate || new Date()}
        onSave={handleAddSlot}
      />

      <BlockTimeModal
        isOpen={showBlockModal}
        onClose={() => {
          setShowBlockModal(false)
          setSelectedSlot(null)
        }}
        slot={selectedSlot}
        onBlock={handleBlockSlot}
        onUnblock={handleUnblockSlot}
      />
    </div>
  )
}
