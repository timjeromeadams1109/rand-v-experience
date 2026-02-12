'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Scissors } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAdminAccess() {
      const supabase = createClient()

      // Check if user is logged in
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/auth/login?redirect=/dashboard')
        return
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setError('Unable to verify admin access')
        setIsAuthorized(false)
        return
      }

      if (!profile?.is_admin) {
        setError('Access denied. Admin privileges required.')
        setIsAuthorized(false)
        return
      }

      setIsAuthorized(true)
    }

    checkAdminAccess()
  }, [router])

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-california-gold border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-warm-white/60">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <Scissors className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="font-bebas text-3xl text-warm-white tracking-wide mb-4">
            Access Denied
          </h1>
          <p className="text-warm-white/60 mb-6">
            {error || 'You do not have permission to access the dashboard.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-california-gold text-matte-black font-medium px-6 py-3 rounded-lg hover:bg-california-gold-light transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
