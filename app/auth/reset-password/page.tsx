'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Scissors, Lock, CheckCircle, AlertCircle, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      // User should have a session from the recovery link
      setIsValidSession(!!session)
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      if (updateError.message.includes('same as')) {
        setError('New password must be different from your current password')
      } else {
        setError(updateError.message)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Redirect to home after 3 seconds
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }

  // Show loading while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center px-4 sm:px-6">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-california-gold border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-warm-white/60">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  // Show error if no valid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Scissors className="w-8 h-8 text-california-gold" />
            <span className="font-bebas text-2xl text-warm-white tracking-wider">RAND V</span>
          </Link>
          <h1 className="font-bebas text-3xl sm:text-4xl text-warm-white tracking-wide mb-4">
            Invalid or Expired Link
          </h1>
          <p className="text-warm-white/60 mb-6 text-sm sm:text-base">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <div className="space-y-3">
            <Link href="/auth/forgot-password">
              <Button className="w-full">Request New Link</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="gold-outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Scissors className="w-8 h-8 text-california-gold" />
            <span className="font-bebas text-2xl text-warm-white tracking-wider">RAND V</span>
          </Link>
          <h1 className="font-bebas text-3xl sm:text-4xl text-warm-white tracking-wide mb-4">
            Password Updated
          </h1>
          <p className="text-warm-white/60 mb-6 text-sm sm:text-base">
            Your password has been successfully reset. Redirecting you to the home page...
          </p>
          <Link href="/">
            <Button className="w-full">Go to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-matte-black flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-california-gold" />
            <span className="font-bebas text-xl sm:text-2xl text-warm-white tracking-wider">RAND V</span>
          </Link>
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-california-gold/20 flex items-center justify-center">
            <Lock className="w-7 h-7 text-california-gold" />
          </div>
          <h1 className="font-bebas text-3xl sm:text-4xl text-warm-white tracking-wide mb-2">
            Set New Password
          </h1>
          <p className="text-warm-white/60 text-sm sm:text-base">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              label="New Password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              autoFocus
            />
            {password && password.length >= 6 && (
              <div className="flex items-center gap-1 mt-1 text-green-500 text-xs">
                <Check className="w-3 h-3" />
                <span>Password strength: Good</span>
              </div>
            )}
          </div>

          <Input
            type="password"
            label="Confirm New Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Reset Password
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-warm-white/60 hover:text-california-gold transition-colors text-sm"
          >
            Remember your password? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
