import Link from 'next/link'
import { Scissors, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SwipeContainer } from '@/components/lookbook/SwipeContainer'
import { LookbookItem } from '@/types/database'

export const metadata = {
  title: 'The Lookbook | The Rand V Experience',
  description: 'Browse our portfolio of signature styles. Save your favorites and bring your vision to life.',
}

// Mock data for when Supabase is not configured - featuring African American barbershop imagery
const MOCK_LOOKBOOK: LookbookItem[] = [
  {
    id: '1',
    title: 'The Clean Fade',
    description: 'A crisp mid-fade with sharp lines and flawless blending. The signature Rand V precision.',
    image_url: 'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=800&q=80',
    category: 'fade',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'The Executive Cut',
    description: 'Sharp, professional styling for the modern gentleman. Boardroom ready.',
    image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
    category: 'taper',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'The High Top Fade',
    description: 'Classic high top with precision edges. A timeless look reimagined.',
    image_url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80',
    category: 'fade',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'The Beard Sculpt',
    description: 'Precision beard shaping with clean edges and perfect symmetry. Full service excellence.',
    image_url: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&q=80',
    category: 'beard',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'The Low Skin Fade',
    description: 'Subtle and sophisticated. A low skin fade that transitions seamlessly.',
    image_url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80',
    category: 'fade',
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'The Fresh Cut',
    description: 'The complete transformation. Clean lines, perfect shape, confidence restored.',
    image_url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80',
    category: 'signature',
    created_at: new Date().toISOString(),
  },
  {
    id: '7',
    title: 'The Wave Check',
    description: 'Brush work excellence with a crisp lineup. 360 waves perfected.',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    category: 'waves',
    created_at: new Date().toISOString(),
  },
  {
    id: '8',
    title: 'The Temple Fade',
    description: 'Clean temple fade with natural texture on top. Versatile and sharp.',
    image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
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
      <header className="border-b border-charcoal-light sticky top-0 bg-matte-black/95 backdrop-blur-sm z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 text-warm-white/70 hover:text-california-gold transition-colors">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-california-gold" />
            <span className="font-bebas text-lg sm:text-xl text-warm-white tracking-wider">RAND V</span>
          </div>
          <Link
            href="/booking"
            className="text-california-gold hover:text-california-gold-light transition-colors text-xs sm:text-sm font-medium"
          >
            Book Now
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-bebas text-3xl sm:text-4xl md:text-5xl text-warm-white tracking-wide mb-3 sm:mb-4">
            The Lookbook
          </h1>
          <p className="text-warm-white/60 max-w-xl mx-auto text-sm sm:text-base px-4">
            Swipe through our portfolio of signature styles. Like the ones that speak to you, and bring your vision to your next appointment.
          </p>
        </div>

        <SwipeContainer initialItems={items} />
      </main>
    </div>
  )
}
