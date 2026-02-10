'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Scissors, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'

  return (
    <div className="w-full max-w-md text-center px-4">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-california-gold/20 flex items-center justify-center">
        <Mail className="w-8 h-8 text-california-gold" />
      </div>
      <Link href="/" className="inline-flex items-center gap-2 mb-6">
        <Scissors className="w-8 h-8 text-california-gold" />
        <span className="font-bebas text-2xl text-warm-white tracking-wider">RAND V</span>
      </Link>
      <h1 className="font-bebas text-3xl sm:text-4xl text-warm-white tracking-wide mb-4">
        Check Your Email
      </h1>
      <p className="text-warm-white/60 mb-6 text-sm sm:text-base">
        We sent a confirmation link to <strong className="text-warm-white">{decodeURIComponent(email)}</strong>.
        Click the link to activate your account.
      </p>
      <div className="space-y-3">
        <Link href="/auth/login">
          <Button variant="gold-outline" className="w-full">Back to Login</Button>
        </Link>
        <p className="text-warm-white/40 text-xs">
          Didn&apos;t receive the email? Check your spam folder.
        </p>
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen bg-matte-black flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-warm-white">Loading...</div>}>
        <ConfirmEmailContent />
      </Suspense>
    </div>
  )
}
