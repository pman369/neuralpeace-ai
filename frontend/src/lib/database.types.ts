export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      modules: {
        Row: {
          id: string
          title: string
          description: string
          category: 'Neuroanatomy' | 'Methods' | 'Computational' | 'Psychology' | 'Therapeutics'
          expertise: 'Novice' | 'Practitioner' | 'Expert' | 'Scholar'
          image_url: string
          read_time: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: 'Neuroanatomy' | 'Methods' | 'Computational' | 'Psychology' | 'Therapeutics'
          expertise: 'Novice' | 'Practitioner' | 'Expert' | 'Scholar'
          image_url: string
          read_time: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: 'Neuroanatomy' | 'Methods' | 'Computational' | 'Psychology' | 'Therapeutics'
          expertise?: 'Novice' | 'Practitioner' | 'Expert' | 'Scholar'
          image_url?: string
          read_time?: string
          created_at?: string
        }
        Relationships: []
      }
      module_content: {
        Row: {
          id: string
          module_id: string
          section_title: string
          section_order: number
          content_md: string
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          section_title: string
          section_order: number
          content_md: string
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          section_title?: string
          section_order?: number
          content_md?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'module_content_module_id_fkey'
            columns: ['module_id']
            isRelationOneToOne: false
            referencedRelation: 'modules'
            referencedColumns: ['id']
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          expertise_level: string | null
          citations: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          expertise_level?: string | null
          citations?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          expertise_level?: string | null
          citations?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          email: string
          expertise_level: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          email: string
          expertise_level?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          email?: string
          expertise_level?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string | null
          title: string
          expertise_level: string | null
          message_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title?: string
          expertise_level?: string | null
          message_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          expertise_level?: string | null
          message_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      category: 'Neuroanatomy' | 'Methods' | 'Computational' | 'Psychology' | 'Therapeutics'
      expertise_level: 'Novice' | 'Practitioner' | 'Expert' | 'Scholar'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never
