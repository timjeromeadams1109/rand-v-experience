'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Scissors, ArrowLeft, Calendar, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Conversation, Message, Profile } from '@/types/database'
import { MessageBubble } from '@/components/messaging/MessageBubble'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

type ConversationWithProfile = Conversation & {
  profile: Profile
  lastMessage?: Message | null
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<(Message & { sender: Profile })[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function fetchConversations() {
      const supabase = createClient()

      // Get current user (admin)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setAdminProfile(profile)
      }

      // Fetch all conversations with user profiles
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select(`
          *,
          profile:user_id(*)
        `)
        .order('created_at', { ascending: false })

      if (conversationsData) {
        // Fetch last message for each conversation
        const conversationsWithLastMessage = await Promise.all(
          conversationsData.map(async (conv: ConversationWithProfile) => {
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            return {
              ...conv,
              lastMessage,
            }
          })
        )

        setConversations(conversationsWithLastMessage as ConversationWithProfile[])
      }

      setLoading(false)
    }

    fetchConversations()
  }, [])

  useEffect(() => {
    if (!selectedConversation) return

    const conversationId = selectedConversation

    async function fetchMessages() {
      const supabase = createClient()

      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data as (Message & { sender: Profile })[])
      }
    }

    fetchMessages()

    // Set up realtime subscription
    const supabase = createClient()
    const channel = supabase
      .channel(`admin-messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: { new: { sender_id: string } & Record<string, unknown> }) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single()

          if (sender) {
            setMessages((prev) => [...prev, { ...payload.new as Message, sender }])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !adminProfile) return

    const supabase = createClient()

    await supabase.from('messages').insert({
      conversation_id: selectedConversation,
      sender_id: adminProfile.id,
      content: newMessage.trim(),
    })

    setNewMessage('')
  }

  const selectedConv = conversations.find((c) => c.id === selectedConversation)

  return (
    <div className="min-h-screen bg-matte-black">
      {/* Header */}
      <header className="border-b border-charcoal-light">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-warm-white/70 hover:text-california-gold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-california-gold" />
              <span className="font-bebas text-xl text-warm-white tracking-wider">MESSAGES</span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard/calendar"
              className="text-warm-white/70 hover:text-california-gold transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </Link>
            <Link href="/dashboard" className="text-warm-white/70 hover:text-california-gold transition-colors text-sm">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 min-h-[calc(100vh-73px)]">
          {/* Conversations List */}
          <div className="border-r border-charcoal-light overflow-y-auto">
            <div className="p-4 border-b border-charcoal-light">
              <h2 className="font-bebas text-xl text-warm-white tracking-wide">
                Conversations
              </h2>
            </div>

            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-charcoal animate-pulse rounded-lg" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-warm-white/50">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-charcoal-light">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={cn(
                      'w-full p-4 text-left hover:bg-charcoal transition-colors',
                      selectedConversation === conv.id && 'bg-charcoal'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-california-gold flex items-center justify-center flex-shrink-0">
                        <span className="text-matte-black font-bold">
                          {conv.profile.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-warm-white font-medium truncate">
                          {conv.profile.full_name}
                        </p>
                        <p className="text-warm-white/50 text-sm truncate">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      {conv.lastMessage && (
                        <p className="text-warm-white/30 text-xs flex-shrink-0">
                          {format(new Date(conv.lastMessage.created_at), 'MMM d')}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages View */}
          <div className="md:col-span-2 flex flex-col">
            {selectedConversation && selectedConv ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-charcoal-light">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-california-gold flex items-center justify-center">
                      <span className="text-matte-black font-bold">
                        {selectedConv.profile.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-warm-white font-medium">
                        {selectedConv.profile.full_name}
                      </p>
                      <p className="text-warm-white/50 text-sm">
                        {selectedConv.profile.phone || 'No phone'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      sender={message.sender}
                      isCurrentUser={message.sender_id === adminProfile?.id}
                    />
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-charcoal-light">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-charcoal-light border border-charcoal-light rounded-full px-4 py-2 text-warm-white placeholder-warm-white/40 focus:outline-none focus:border-california-gold transition-colors"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-warm-white/40 text-lg">
                    Select a conversation to view messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
