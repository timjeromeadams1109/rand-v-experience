'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Scissors, Calendar, MessageCircle, Users, Clock, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppointmentWithDetails } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface DashboardStats {
  totalAppointments: number
  upcomingToday: number
  messagesUnread: number
  slotsRemaining: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    upcomingToday: 0,
    messagesUnread: 0,
    slotsRemaining: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentAppointments, setRecentAppointments] = useState<AppointmentWithDetails[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      // Fetch stats in parallel
      const [appointmentsRes, todayRes, availabilityRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('id', { count: 'exact' })
          .eq('status', 'confirmed'),
        supabase
          .from('appointments')
          .select(`
            *,
            availability:availability_id(*),
            profile:user_id(*)
          `)
          .eq('status', 'confirmed'),
        supabase
          .from('availability')
          .select('id')
          .gte('date', today)
          .eq('is_blocked', false),
      ])

      const todayAppointments = todayRes.data?.filter((apt: { availability?: { date?: string } }) => {
        return apt.availability?.date === today
      }) || []

      setStats({
        totalAppointments: appointmentsRes.count || 0,
        upcomingToday: todayAppointments.length,
        messagesUnread: 0, // Would need unread message tracking
        slotsRemaining: (availabilityRes.data?.length || 0) - (appointmentsRes.count || 0),
      })

      // Get recent appointments
      const { data: recent } = await supabase
        .from('appointments')
        .select(`
          *,
          availability:availability_id(*),
          profile:user_id(*)
        `)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentAppointments(recent || [])
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-matte-black">
      {/* Header */}
      <header className="border-b border-charcoal-light">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-california-gold" />
            <span className="font-bebas text-xl text-warm-white tracking-wider">RAND V DASHBOARD</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard/calendar"
              className="text-warm-white/70 hover:text-california-gold transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </Link>
            <Link
              href="/dashboard/messages"
              className="text-warm-white/70 hover:text-california-gold transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Messages
            </Link>
            <Link href="/" className="text-warm-white/70 hover:text-california-gold transition-colors text-sm">
              View Site
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-bebas text-4xl text-warm-white tracking-wide mb-8">
          Welcome Back
        </h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-warm-white/60 text-sm">Today&apos;s Appointments</p>
                  <p className="font-bebas text-4xl text-california-gold mt-1">
                    {loading ? '-' : stats.upcomingToday}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-california-gold/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-california-gold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-warm-white/60 text-sm">Total Confirmed</p>
                  <p className="font-bebas text-4xl text-warm-white mt-1">
                    {loading ? '-' : stats.totalAppointments}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-california-gold/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-california-gold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-warm-white/60 text-sm">Slots Remaining</p>
                  <p className="font-bebas text-4xl text-warm-white mt-1">
                    {loading ? '-' : stats.slotsRemaining}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-california-gold/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-california-gold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-warm-white/60 text-sm">Unread Messages</p>
                  <p className="font-bebas text-4xl text-warm-white mt-1">
                    {loading ? '-' : stats.messagesUnread}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-california-gold/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-california-gold" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/calendar">
                <Button variant="gold-outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Availability
                </Button>
              </Link>
              <Link href="/dashboard/messages">
                <Button variant="gold-outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  View Messages
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-charcoal-light animate-pulse rounded" />
                  ))}
                </div>
              ) : recentAppointments.length === 0 ? (
                <p className="text-warm-white/50 text-center py-8">No recent bookings</p>
              ) : (
                <div className="space-y-3">
                  {recentAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 bg-charcoal-light rounded-lg"
                    >
                      <div>
                        <p className="text-warm-white font-medium">
                          {apt.profile?.full_name || 'Unknown'}
                        </p>
                        <p className="text-warm-white/50 text-sm">{apt.service_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-california-gold text-sm">
                          {apt.availability?.date}
                        </p>
                        <p className="text-warm-white/50 text-sm">
                          {apt.availability?.start_time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
