'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Scissors, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const errors: {[key: string]: string} = {}

    // Name validation
    if (fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    // Phone validation (optional but if provided, check format)
    if (phone && !/^[+]?[\d\s()-]{10,}$/.test(phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // If user is confirmed immediately (email confirmation disabled), redirect
    if (data.user && data.session) {
      router.push(redirect)
    } else if (data.user) {
      // Email confirmation required - show message
      router.push('/auth/confirm-email?email=' + encodeURIComponent(email))
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-md px-4 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6">
          <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-california-gold" />
          <span className="font-bebas text-xl sm:text-2xl text-warm-white tracking-wider">RAND V</span>
        </Link>
        <h1 className="font-bebas text-3xl sm:text-4xl text-warm-white tracking-wide mb-2">
          Create Account
        </h1>
        <p className="text-warm-white/60 text-sm sm:text-base">
          Join The Rand V Experience
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <Input
            type="text"
            label="Full Name"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              if (fieldErrors.fullName) setFieldErrors({...fieldErrors, fullName: ''})
            }}
            error={fieldErrors.fullName}
            required
          />
        </div>
        <div>
          <Input
            type="email"
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors({...fieldErrors, email: ''})
            }}
            error={fieldErrors.email}
            required
          />
        </div>
        <div>
          <Input
            type="tel"
            label="Phone (for appointment reminders)"
            placeholder="+1 (555) 123-4567"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (fieldErrors.phone) setFieldErrors({...fieldErrors, phone: ''})
            }}
            error={fieldErrors.phone}
          />
        </div>
        <div>
          <Input
            type="password"
            label="Password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) setFieldErrors({...fieldErrors, password: ''})
            }}
            error={fieldErrors.password}
            required
          />
          {password && password.length >= 6 && (
            <div className="flex items-center gap-1 mt-1 text-green-500 text-xs">
              <Check className="w-3 h-3" />
              <span>Password strength: Good</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="text-center text-warm-white/60 mt-6 text-sm sm:text-base">
        Already have an account?{' '}
        <Link href={`/auth/login?redirect=${redirect}`} className="text-california-gold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-matte-black flex items-center justify-center px-4 sm:px-6">
      <Suspense fallback={<div className="text-warm-white">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  )
}
