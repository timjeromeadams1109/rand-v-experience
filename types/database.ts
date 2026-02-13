export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          tier: 'standard' | 'foundational'
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          tier?: 'standard' | 'foundational'
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          tier?: 'standard' | 'foundational'
          is_admin?: boolean
          created_at?: string
        }
      }
      availability: {
        Row: {
          id: string
          date: string
          start_time: string
          end_time: string
          is_blocked: boolean
          block_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          start_time: string
          end_time: string
          is_blocked?: boolean
          block_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          start_time?: string
          end_time?: string
          is_blocked?: boolean
          block_reason?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          availability_id: string
          service_type: string
          notes: string | null
          liked_styles: string[] | null
          status: 'confirmed' | 'completed' | 'cancelled'
          contact_email: string | null
          contact_phone: string | null
          confirmation_sent: boolean
          reminder_sent: boolean
          reminder_24h_sent: boolean
          reminder_1h_sent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          availability_id: string
          service_type: string
          notes?: string | null
          liked_styles?: string[] | null
          status?: 'confirmed' | 'completed' | 'cancelled'
          contact_email?: string | null
          contact_phone?: string | null
          confirmation_sent?: boolean
          reminder_sent?: boolean
          reminder_24h_sent?: boolean
          reminder_1h_sent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          availability_id?: string
          service_type?: string
          notes?: string | null
          liked_styles?: string[] | null
          status?: 'confirmed' | 'completed' | 'cancelled'
          contact_email?: string | null
          contact_phone?: string | null
          confirmation_sent?: boolean
          reminder_sent?: boolean
          reminder_24h_sent?: boolean
          reminder_1h_sent?: boolean
          created_at?: string
        }
      }
      lookbook: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string
          category?: string | null
          created_at?: string
        }
      }
      lookbook_likes: {
        Row: {
          id: string
          user_id: string
          lookbook_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lookbook_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lookbook_id?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string | null
          attachment_url: string | null
          is_quick_reply: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content?: string | null
          attachment_url?: string | null
          is_quick_reply?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string | null
          attachment_url?: string | null
          is_quick_reply?: boolean
          created_at?: string
        }
      }
      quick_replies: {
        Row: {
          id: string
          trigger_keyword: string
          response_text: string
        }
        Insert: {
          id?: string
          trigger_keyword: string
          response_text: string
        }
        Update: {
          id?: string
          trigger_keyword?: string
          response_text?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Availability = Database['public']['Tables']['availability']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type LookbookItem = Database['public']['Tables']['lookbook']['Row']
export type LookbookLike = Database['public']['Tables']['lookbook_likes']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type QuickReply = Database['public']['Tables']['quick_replies']['Row']

export type AppointmentWithDetails = Appointment & {
  availability: Availability
  profile: Profile
}

export type MessageWithSender = Message & {
  sender: Profile
}
