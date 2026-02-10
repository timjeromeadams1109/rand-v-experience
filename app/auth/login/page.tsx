'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      if (authError.message.includes('Invalid login')) {
        setError('Invalid email or password. Please try again.')
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.')
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    router.push(redirect)
  }

  return (
    <div className="w-full max-w-md px-4 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6">
          <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-california-gold" />
          <span className="font-bebas text-xl sm:text-2xl text-warm-white tracking-wider">RAND V</span>
        </Link>
        <h1 className="font-bebas text-3xl sm:text-4xl text-warm-white tracking-wide mb-2">
          Welcome Back
        </h1>
        <p className="text-warm-white/60 text-sm sm:text-base">
          Sign in to book your experience
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          label="Password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <p className="text-center text-warm-white/60 mt-6 text-sm sm:text-base">
        Don&apos;t have an account?{' '}
        <Link href={`/auth/signup?redirect=${redirect}`} className="text-california-gold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-matte-black flex items-center justify-center px-4 sm:px-6">
      <Suspense fallback={<div className="text-warm-white">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
