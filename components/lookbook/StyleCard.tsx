'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { LookbookItem } from '@/types/database'
import { cn } from '@/lib/utils'

interface StyleCardProps {
  item: LookbookItem
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

export function StyleCard({ item, onSwipe, isTop }: StyleCardProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      const direction = info.offset.x > 0 ? 'right' : 'left'
      setExitDirection(direction)
      onSwipe(direction)
    }
  }

  if (!isTop) {
    return (
      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-card-luxury">
        <Image
          src={item.image_url}
          alt={item.title}
          fill
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-matte-black via-transparent to-transparent" />
      </div>
    )
  }

  return (
    <motion.div
      className="absolute inset-0 rounded-2xl overflow-hidden shadow-card-luxury cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={
        exitDirection
          ? {
              x: exitDirection === 'right' ? 500 : -500,
              opacity: 0,
              transition: { duration: 0.3 }
            }
          : {}
      }
    >
      <Image
        src={item.image_url}
        alt={item.title}
        fill
        className="object-cover"
        priority
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-matte-black via-transparent to-transparent" />

      {/* Like indicator */}
      <motion.div
        className="absolute top-8 right-8 px-6 py-2 border-4 border-green-500 rounded-lg rotate-12"
        style={{ opacity: likeOpacity }}
      >
        <span className="text-green-500 font-bebas text-4xl tracking-wider">LIKE</span>
      </motion.div>

      {/* Nope indicator */}
      <motion.div
        className="absolute top-8 left-8 px-6 py-2 border-4 border-red-500 rounded-lg -rotate-12"
        style={{ opacity: nopeOpacity }}
      >
        <span className="text-red-500 font-bebas text-4xl tracking-wider">NOPE</span>
      </motion.div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="font-bebas text-3xl text-warm-white mb-2 tracking-wide">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-warm-white/70 text-sm mb-3">{item.description}</p>
        )}
        {item.category && (
          <span className="inline-block px-3 py-1 bg-california-gold/20 text-california-gold text-sm rounded-full">
            {item.category}
          </span>
        )}
      </div>
    </motion.div>
  )
}

interface StyleCardButtonsProps {
  onLike: () => void
  onPass: () => void
}

export function StyleCardButtons({ onLike, onPass }: StyleCardButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-8 mt-8">
      <button
        onClick={onPass}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center',
          'bg-charcoal border-2 border-red-500 text-red-500',
          'hover:bg-red-500 hover:text-white transition-all duration-300',
          'shadow-lg hover:shadow-red-500/20'
        )}
      >
        <X className="w-8 h-8" />
      </button>
      <button
        onClick={onLike}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center',
          'bg-charcoal border-2 border-california-gold text-california-gold',
          'hover:bg-california-gold hover:text-matte-black transition-all duration-300',
          'shadow-lg hover:shadow-gold-glow'
        )}
      >
        <Heart className="w-8 h-8" />
      </button>
    </div>
  )
}
