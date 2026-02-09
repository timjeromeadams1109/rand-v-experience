import Link from 'next/link'
import { Scissors, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SwipeContainer } from '@/components/lookbook/SwipeContainer'
import { LookbookItem } from '@/types/database'

export const metadata = {
  title: 'The Lookbook | The Rand V Experience',
  description: 'Browse our portfolio of signature styles. Save your favorites and bring your vision to life.',
}

// Mock data for when Supabase is not configured
const MOCK_LOOKBOOK: LookbookItem[] = [
  {
    id: '1',
    title: 'The Classic Fade',
    description: 'A timeless mid-fade with clean lines and precise blending.',
    image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    category: 'fade',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'The Executive',
    description: 'Sharp, professional cut with a modern twist. Perfect for the boardroom.',
    image_url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80',
    category: 'taper',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'The Textured Crop',
    description: 'Modern textured top with a skin fade. Low maintenance, high impact.',
    image_url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
    category: 'crop',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'The Beard Sculpt',
    description: 'Precision beard shaping with clean edges and perfect symmetry.',
    image_url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80',
    category: 'beard',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'The Low Taper',
    description: 'Subtle and sophisticated. A low taper that works with any style.',
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    category: 'taper',
    created_at: new Date().toISOString(),
  },
]

async function getLookbookItems(): Promise<LookbookItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lookbook')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return MOCK_LOOKBOOK
    }

    return data
  } catch {
    return MOCK_LOOKBOOK
  }
}

export default async function LookbookPage() {
  const items = await getLookbookItems()

  return (
    <div className="min-h-screen bg-matte-black">
      {/* Header */}
      <header className="border-b border-charcoal-light">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-warm-white/70 hover:text-california-gold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-california-gold" />
            <span className="font-bebas text-xl text-warm-white tracking-wider">RAND V</span>
          </div>
          <Link
            href="/booking"
            className="text-california-gold hover:text-california-gold-light transition-colors text-sm font-medium"
          >
            Book Now
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-bebas text-4xl md:text-5xl text-warm-white tracking-wide mb-4">
            The Lookbook
          </h1>
          <p className="text-warm-white/60 max-w-xl mx-auto">
            Swipe through our portfolio of signature styles. Like the ones that speak to you, and bring your vision to your next appointment.
          </p>
        </div>

        <SwipeContainer initialItems={items} />
      </main>
    </div>
  )
}
