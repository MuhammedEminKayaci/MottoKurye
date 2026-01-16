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
      conversations: {
        Row: {
          id: string
          business_id: string
          courier_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          courier_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          courier_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      // ... existing tables (couriers, businesses) implied but not strictly needed to redefine here unless we use them in joined queries heavily
    }
  }
}
