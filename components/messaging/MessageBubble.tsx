'use client'

import { Message, Profile } from '@/types/database'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Image from 'next/image'

interface MessageBubbleProps {
  message: Message
  sender: Profile
  isCurrentUser: boolean
}

export function MessageBubble({ message, sender, isCurrentUser }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {sender.avatar_url ? (
          <Image
            src={sender.avatar_url}
            alt={sender.full_name}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-california-gold flex items-center justify-center">
            <span className="text-matte-black font-bold text-sm">
              {sender.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'max-w-[70%]',
          isCurrentUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isCurrentUser
              ? 'bg-california-gold text-matte-black rounded-tr-sm'
              : 'bg-charcoal-light text-warm-white rounded-tl-sm',
            message.is_quick_reply && 'border border-california-gold/30'
          )}
        >
          {message.content && (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}

          {message.attachment_url && (
            <div className="mt-2">
              <Image
                src={message.attachment_url}
                alt="Attachment"
                width={200}
                height={200}
                className="rounded-lg max-w-full"
              />
            </div>
          )}
        </div>

        <p
          className={cn(
            'text-xs text-warm-white/40 mt-1 px-1',
            isCurrentUser ? 'text-right' : 'text-left'
          )}
        >
          {format(new Date(message.created_at), 'h:mm a')}
        </p>
      </div>
    </div>
  )
}
