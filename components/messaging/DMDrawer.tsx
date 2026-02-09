'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Paperclip, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Message, Profile, Conversation } from '@/types/database'
import { MessageBubble } from './MessageBubble'
import { QuickReplies } from './QuickReplies'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface DMDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function DMDrawer({ isOpen, onClose }: DMDrawerProps) {
  const [messages, setMessages] = useState<(Message & { sender: Profile })[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!isOpen) return

    const supabase = createClient()

    async function initializeConversation() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setCurrentUser(profile)
      }

      // Get or create conversation
      let { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!existingConversation) {
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert({ user_id: user.id })
          .select()
          .single()

        existingConversation = newConversation
      }

      if (existingConversation) {
        setConversation(existingConversation)

        // Fetch messages
        const { data: messagesData } = await supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(*)
          `)
          .eq('conversation_id', existingConversation.id)
          .order('created_at', { ascending: true })

        if (messagesData) {
          setMessages(messagesData as (Message & { sender: Profile })[])
        }
      }

      setLoading(false)
    }

    initializeConversation()

    // Set up realtime subscription
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload: { new: { conversation_id: string; sender_id: string } & Record<string, unknown> }) => {
          if (payload.new && conversation && payload.new.conversation_id === conversation.id) {
            const { data: sender } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.new.sender_id)
              .single()

            if (sender) {
              setMessages((prev) => [...prev, { ...payload.new as Message, sender }])
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen, conversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text?: string) => {
    const messageText = text || newMessage.trim()
    if (!messageText || !conversation || !currentUser) return

    setSending(true)
    const supabase = createClient()

    try {
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        content: messageText
      })

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleQuickReply = (text: string) => {
    sendMessage(text)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-matte-black border-l border-charcoal-light z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-charcoal-light">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-california-gold flex items-center justify-center">
                  <span className="text-matte-black font-bold">RV</span>
                </div>
                <div>
                  <h3 className="font-bebas text-xl text-warm-white tracking-wide">
                    The Bridge
                  </h3>
                  <p className="text-sm text-warm-white/50">Direct message with Rand V</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-warm-white/60 hover:text-warm-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-8 h-8 border-2 border-california-gold border-t-transparent rounded-full" />
                </div>
              ) : !currentUser ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageCircle className="w-16 h-16 text-warm-white/20 mb-4" />
                  <h4 className="font-bebas text-2xl text-warm-white mb-2 tracking-wide">
                    Sign In to Message
                  </h4>
                  <p className="text-warm-white/60 mb-6">
                    Connect directly with Rand V for consultations and inquiries.
                  </p>
                  <Button onClick={() => {/* Navigate to auth */}}>
                    Sign In
                  </Button>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageCircle className="w-16 h-16 text-warm-white/20 mb-4" />
                  <h4 className="font-bebas text-2xl text-warm-white mb-2 tracking-wide">
                    Start a Conversation
                  </h4>
                  <p className="text-warm-white/60 mb-6">
                    Use the quick replies below or type your message.
                  </p>
                  <QuickReplies onSelect={handleQuickReply} />
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      sender={message.sender}
                      isCurrentUser={message.sender_id === currentUser.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            {currentUser && (
              <div className="p-4 border-t border-charcoal-light">
                {messages.length > 0 && (
                  <QuickReplies onSelect={handleQuickReply} className="mb-3" />
                )}
                <div className="flex items-center gap-3">
                  <button className="p-2 text-warm-white/60 hover:text-california-gold transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-charcoal-light border border-charcoal-light rounded-full px-4 py-2 text-warm-white placeholder-warm-white/40 focus:outline-none focus:border-california-gold transition-colors"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!newMessage.trim() || sending}
                    className={cn(
                      'p-2 rounded-full transition-all duration-200',
                      newMessage.trim()
                        ? 'bg-california-gold text-matte-black hover:bg-california-gold-light'
                        : 'bg-charcoal-light text-warm-white/40'
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
