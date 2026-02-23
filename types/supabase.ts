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
      deleted_users: {
        Row: {
          id: string
          user_id: string
          email: string | null
          role: 'kurye' | 'isletme'
          phone: string | null
          contact_preference: string | null
          province: string | null
          district: Json | null
          working_type: string | null
          earning_model: string | null
          working_days: Json | null
          daily_package_estimate: string | null
          avatar_url: string | null
          first_name: string | null
          last_name: string | null
          age: number | null
          gender: string | null
          nationality: string | null
          experience: string | null
          license_type: string | null
          has_motorcycle: string | null
          moto_brand: string | null
          moto_cc: string | null
          has_bag: string | null
          p1_certificate: string | null
          src_certificate: string | null
          criminal_record: string | null
          p1_certificate_file_url: string | null
          src_certificate_file_url: string | null
          criminal_record_file_url: string | null
          business_name: string | null
          business_sector: string | null
          manager_name: string | null
          manager_contact: string | null
          accept_terms: boolean | null
          accept_privacy: boolean | null
          accept_kvkk: boolean | null
          accept_commercial: boolean | null
          plan: string | null
          plan_expires_at: string | null
          is_visible: boolean | null
          original_created_at: string | null
          deleted_at: string
          deletion_reason: string | null
          deleted_by_ip: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email?: string | null
          role: 'kurye' | 'isletme'
          phone?: string | null
          contact_preference?: string | null
          province?: string | null
          district?: Json | null
          working_type?: string | null
          earning_model?: string | null
          working_days?: Json | null
          daily_package_estimate?: string | null
          avatar_url?: string | null
          first_name?: string | null
          last_name?: string | null
          age?: number | null
          gender?: string | null
          nationality?: string | null
          experience?: string | null
          license_type?: string | null
          has_motorcycle?: string | null
          moto_brand?: string | null
          moto_cc?: string | null
          has_bag?: string | null
          p1_certificate?: string | null
          src_certificate?: string | null
          criminal_record?: string | null
          p1_certificate_file_url?: string | null
          src_certificate_file_url?: string | null
          criminal_record_file_url?: string | null
          business_name?: string | null
          business_sector?: string | null
          manager_name?: string | null
          manager_contact?: string | null
          accept_terms?: boolean | null
          accept_privacy?: boolean | null
          accept_kvkk?: boolean | null
          accept_commercial?: boolean | null
          plan?: string | null
          plan_expires_at?: string | null
          is_visible?: boolean | null
          original_created_at?: string | null
          deleted_at?: string
          deletion_reason?: string | null
          deleted_by_ip?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string | null
          role?: 'kurye' | 'isletme'
          phone?: string | null
          contact_preference?: string | null
          province?: string | null
          district?: Json | null
          working_type?: string | null
          earning_model?: string | null
          working_days?: Json | null
          daily_package_estimate?: string | null
          avatar_url?: string | null
          first_name?: string | null
          last_name?: string | null
          age?: number | null
          gender?: string | null
          nationality?: string | null
          experience?: string | null
          license_type?: string | null
          has_motorcycle?: string | null
          moto_brand?: string | null
          moto_cc?: string | null
          has_bag?: string | null
          p1_certificate?: string | null
          src_certificate?: string | null
          criminal_record?: string | null
          p1_certificate_file_url?: string | null
          src_certificate_file_url?: string | null
          criminal_record_file_url?: string | null
          business_name?: string | null
          business_sector?: string | null
          manager_name?: string | null
          manager_contact?: string | null
          accept_terms?: boolean | null
          accept_privacy?: boolean | null
          accept_kvkk?: boolean | null
          accept_commercial?: boolean | null
          plan?: string | null
          plan_expires_at?: string | null
          is_visible?: boolean | null
          original_created_at?: string | null
          deleted_at?: string
          deletion_reason?: string | null
          deleted_by_ip?: string | null
        }
      }
      // ... existing tables (couriers, businesses) implied but not strictly needed to redefine here unless we use them in joined queries heavily
    }
  }
}
