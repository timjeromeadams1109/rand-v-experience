'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Scissors } from 'lucide-react'
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
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signUp({
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

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-california-gold/20 flex items-center justify-center">
          <Scissors className="w-8 h-8 text-california-gold" />
        </div>
        <h1 className="font-bebas text-4xl text-warm-white tracking-wide mb-4">
          Check Your Email
        </h1>
        <p className="text-warm-white/60 mb-6">
          We sent a confirmation link to <strong className="text-warm-white">{email}</strong>.
          Click the link to activate your account.
        </p>
        <Link href="/auth/login">
          <Button variant="gold-outline">Back to Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <Scissors className="w-8 h-8 text-california-gold" />
          <span className="font-bebas text-2xl text-warm-white tracking-wider">RAND V</span>
        </Link>
        <h1 className="font-bebas text-4xl text-warm-white tracking-wide mb-2">
          Create Account
        </h1>
        <p className="text-warm-white/60">
          Join The Rand V Experience
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          type="text"
          label="Full Name"
          placeholder="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          type="email"
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="tel"
          label="Phone (for appointment reminders)"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          type="password"
          label="Password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="text-center text-warm-white/60 mt-6">
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
    <div className="min-h-screen bg-matte-black flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-warm-white">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  )
}
