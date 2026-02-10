'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence } from 'framer-motion'
import { Bookmark, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LookbookItem } from '@/types/database'
import { StyleCard, StyleCardButtons } from './StyleCard'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface SwipeContainerProps {
  initialItems: LookbookItem[]
}

export function SwipeContainer({ initialItems }: SwipeContainerProps) {
  const [items] = useState<LookbookItem[]>(initialItems)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedItems, setLikedItems] = useState<LookbookItem[]>([])
  const [showSaved, setShowSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserLikes() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        // Load existing likes
        const { data: likesData } = await supabase
          .from('lookbook_likes')
          .select('lookbook_id')
          .eq('user_id', user.id)

        if (likesData) {
          const likedIds = new Set(likesData.map((l: { lookbook_id: string }) => l.lookbook_id))
          const liked = initialItems.filter((item) => likedIds.has(item.id))
          setLikedItems(liked)
        }
      }
    }

    loadUserLikes()
  }, [initialItems])

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentItem = items[currentIndex]

    if (direction === 'right' && currentItem) {
      // Like
      setLikedItems((prev) => [...prev, currentItem])

      if (userId) {
        const supabase = createClient()
        await supabase.from('lookbook_likes').upsert({
          user_id: userId,
          lookbook_id: currentItem.id
        })
      }
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 300)
  }

  const handleLike = () => handleSwipe('right')
  const handlePass = () => handleSwipe('left')

  const resetStack = () => {
    setCurrentIndex(0)
  }

  const removeLiked = async (itemId: string) => {
    setLikedItems((prev) => prev.filter((item) => item.id !== itemId))

    if (userId) {
      const supabase = createClient()
      await supabase
        .from('lookbook_likes')
        .delete()
        .eq('user_id', userId)
        .eq('lookbook_id', itemId)
    }
  }

  const currentItem = items[currentIndex]
  const nextItem = items[currentIndex + 1]
  const isComplete = currentIndex >= items.length

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-bebas text-2xl sm:text-3xl text-warm-white tracking-wide">
          The Lookbook
        </h2>
        <button
          onClick={() => setShowSaved(!showSaved)}
          className="flex items-center gap-1 sm:gap-2 text-california-gold hover:text-california-gold-light transition-colors"
        >
          <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-sm sm:text-base">{likedItems.length} Saved</span>
        </button>
      </div>

      {showSaved ? (
        // Saved items view
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-warm-white/70">Your Saved Styles</h3>
            <button
              onClick={() => setShowSaved(false)}
              className="text-california-gold text-sm hover:underline"
            >
              Back to Lookbook
            </button>
          </div>

          {likedItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bookmark className="w-12 h-12 mx-auto mb-4 text-warm-white/30" />
                <p className="text-warm-white/60">
                  No saved styles yet. Swipe right on styles you like!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {likedItems.map((item) => (
                <Card key={item.id} className="overflow-hidden group relative">
                  <div className="aspect-square relative">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-matte-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="font-bebas text-lg text-warm-white">
                        {item.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => removeLiked(item.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : isComplete ? (
        // All cards swiped
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="font-bebas text-2xl text-warm-white mb-4 tracking-wide">
              You&apos;ve Seen All Styles
            </h3>
            <p className="text-warm-white/60 mb-6">
              You liked {likedItems.length} {likedItems.length === 1 ? 'style' : 'styles'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={resetStack} variant="gold-outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              {likedItems.length > 0 && (
                <Button onClick={() => setShowSaved(true)}>
                  View Saved
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Card stack
        <>
          <div className="relative h-[400px] sm:h-[500px] w-full">
            <AnimatePresence>
              {nextItem && (
                <StyleCard
                  key={nextItem.id}
                  item={nextItem}
                  onSwipe={() => {}}
                  isTop={false}
                />
              )}
              {currentItem && (
                <StyleCard
                  key={currentItem.id}
                  item={currentItem}
                  onSwipe={handleSwipe}
                  isTop={true}
                />
              )}
            </AnimatePresence>
          </div>

          <StyleCardButtons onLike={handleLike} onPass={handlePass} />

          <p className="text-center text-warm-white/40 text-xs sm:text-sm mt-3 sm:mt-4">
            {currentIndex + 1} of {items.length}
          </p>
        </>
      )}
    </div>
  )
}
