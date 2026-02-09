'use client'

import { cn } from '@/lib/utils'

const QUICK_REPLIES = [
  { label: 'Hours', text: 'What are your hours?' },
  { label: 'Location', text: "Where are you located?" },
  { label: 'Prices', text: 'What are your prices?' },
  { label: 'Availability', text: 'Do you have any availability this week?' },
]

interface QuickRepliesProps {
  onSelect: (text: string) => void
  className?: string
}

export function QuickReplies({ onSelect, className }: QuickRepliesProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {QUICK_REPLIES.map((reply) => (
        <button
          key={reply.label}
          onClick={() => onSelect(reply.text)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm',
            'bg-charcoal-light text-warm-white/70',
            'border border-charcoal-light',
            'hover:border-california-gold hover:text-california-gold',
            'transition-all duration-200'
          )}
        >
          {reply.label}
        </button>
      ))}
    </div>
  )
}
