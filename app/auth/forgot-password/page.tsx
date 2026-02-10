'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scissors, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const siteUrl = window.location.origin

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

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
            Check Your Email
          </h1>
          <p className="text-warm-white/60 mb-6 text-sm sm:text-base">
            We sent a password reset link to <strong className="text-warm-white">{email}</strong>.
            Click the link in the email to reset your password.
          </p>
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button variant="gold-outline" className="w-full">
                Back to Login
              </Button>
            </Link>
            <p className="text-warm-white/40 text-xs">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setSuccess(false)}
                className="text-california-gold hover:underline"
              >
                try again
              </button>
            </p>
          </div>
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
            <Mail className="w-7 h-7 text-california-gold" />
          </div>
          <h1 className="font-bebas text-3xl sm:text-4xl text-warm-white tracking-wide mb-2">
            Forgot Password?
          </h1>
          <p className="text-warm-white/60 text-sm sm:text-base">
            No worries. Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email Address"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-warm-white/60 hover:text-california-gold transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
