'use client'

import Link from 'next/link'
import { Scissors, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-matte-black flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <Scissors className="w-8 h-8 text-california-gold" />
          <span className="font-bebas text-2xl text-warm-white tracking-wider">RAND V</span>
        </Link>
        <h1 className="font-bebas text-4xl text-warm-white tracking-wide mb-4">
          Authentication Error
        </h1>
        <p className="text-warm-white/60 mb-6">
          There was a problem confirming your email. The link may have expired or already been used.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/auth/signup">
            <Button variant="gold-outline" className="w-full">Try Again</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full">Return Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
