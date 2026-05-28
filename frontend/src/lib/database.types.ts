export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      debate_topics: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      debates: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          participant_count: number | null
          started_at: string | null
          status: string | null
          topic_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          participant_count?: number | null
          started_at?: string | null
          status?: string | null
          topic_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          participant_count?: number | null
          started_at?: string | null
          status?: string | null
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debates_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "debate_topics"
            referencedColumns: ["id"]
          }
        ]
      }
      debate_arguments: {
        Row: {
          content: string
          created_at: string
          debate_id: string
          fact_check_score: number | null
          fallacies: string[] | null
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          debate_id: string
          fact_check_score?: number | null
          fallacies?: string[] | null
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          debate_id?: string
          fact_check_score?: number | null
          fallacies?: string[] | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debate_arguments_debate_id_fkey"
            columns: ["debate_id"]
            isOneToOne: false
            referencedRelation: "debates"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_activity_log: {
        Row: {
          action: string
          admin_id: string | null
          id: string
          metadata: Json | null
          performed_at: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          id?: string
          metadata?: Json | null
          performed_at?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          id?: string
          metadata?: Json | null
          performed_at?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          added_date: string | null
          author: string | null
          category_id: string | null
          cover_url: string | null
          curator_note: string | null
          description: string | null
          download_enabled: boolean | null
          downloads: number | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          is_published: boolean | null
          is_restricted: boolean | null
          language: string | null
          last_modified_at: string | null
          last_modified_by: string | null
          page_count: number | null
          publish_date: string | null
          tags: string[] | null
          title: string
          uploaded_by: string | null
          views: number | null
        }
        Insert: {
          added_date?: string | null
          author?: string | null
          category_id?: string | null
          cover_url?: string | null
          curator_note?: string | null
          description?: string | null
          download_enabled?: boolean | null
          downloads?: number | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          is_restricted?: boolean | null
          language?: string | null
          last_modified_at?: string | null
          last_modified_by?: string | null
          page_count?: number | null
          publish_date?: string | null
          tags?: string[] | null
          title: string
          uploaded_by?: string | null
          views?: number | null
        }
        Update: {
          added_date?: string | null
          author?: string | null
          category_id?: string | null
          cover_url?: string | null
          curator_note?: string | null
          description?: string | null
          download_enabled?: boolean | null
          downloads?: number | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          is_restricted?: boolean | null
          language?: string | null
          last_modified_at?: string | null
          last_modified_by?: string | null
          page_count?: number | null
          publish_date?: string | null
          tags?: string[] | null
          title?: string
          uploaded_by?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_last_modified_by_fkey"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          citations: Json | null
          content: string
          created_at: string
          expertise_level: string | null
          id: string
          role: string
          session_id: string
        }
        Insert: {
          citations?: Json | null
          content: string
          created_at?: string
          expertise_level?: string | null
          id?: string
          role: string
          session_id: string
        }
        Update: {
          citations?: Json | null
          content?: string
          created_at?: string
          expertise_level?: string | null
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          expertise_level: string | null
          id: string
          message_count: number | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expertise_level?: string | null
          id?: string
          message_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expertise_level?: string | null
          id?: string
          message_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      module_content: {
        Row: {
          content_md: string
          created_at: string
          id: string
          module_id: string
          section_order: number
          section_title: string
        }
        Insert: {
          content_md: string
          created_at?: string
          id?: string
          module_id: string
          section_order: number
          section_title: string
        }
        Update: {
          content_md?: string
          created_at?: string
          id?: string
          module_id?: string
          section_order?: number
          section_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_content_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_progress_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_content_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_embeddings: {
        Row: {
          content_id: string
          created_at: string
          embedding: string
          id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          embedding: string
          id?: string
        }
        Update: {
          content_id?: string
          created_at?: string
          embedding?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_embeddings_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: true
            referencedRelation: "module_content"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          category: Database["public"]["Enums"]["category"]
          created_at: string
          description: string
          expertise: Database["public"]["Enums"]["expertise_level"]
          id: string
          image_url: string
          read_time: string
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["category"]
          created_at?: string
          description: string
          expertise: Database["public"]["Enums"]["expertise_level"]
          id?: string
          image_url: string
          read_time: string
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["category"]
          created_at?: string
          description?: string
          expertise?: Database["public"]["Enums"]["expertise_level"]
          id?: string
          image_url?: string
          read_time?: string
          title?: string
        }
        Relationships: []
      }
      onboarding_questions: {
        Row: {
          category: string
          created_at: string
          id: string
          options: Json
          question_text: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          options: Json
          question_text: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          options?: Json
          question_text?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          expertise_level: string | null
          active_session_id?: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          expertise_level?: string | null
          active_session_id?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          expertise_level?: string | null
          active_session_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      query_cache: {
        Row: {
          created_at: string
          expertise_level: string
          query_hash: string
          response_json: Json
        }
        Insert: {
          created_at?: string
          expertise_level: string
          query_hash: string
          response_json: Json
        }
        Update: {
          created_at?: string
          expertise_level?: string
          query_hash?: string
          response_json?: Json
        }
        Relationships: []
      }
      sub_admin_permissions: {
        Row: {
          can_delete_books: boolean | null
          can_edit_books: boolean | null
          can_toggle_downloads: boolean | null
          can_toggle_publish: boolean | null
          can_upload_books: boolean | null
          can_view_users: boolean | null
          can_view_vault_queue: boolean | null
          granted_at: string | null
          granted_by: string | null
          user_id: string
        }
        Insert: {
          can_delete_books?: boolean | null
          can_edit_books?: boolean | null
          can_toggle_downloads?: boolean | null
          can_toggle_publish?: boolean | null
          can_upload_books?: boolean | null
          can_view_users?: boolean | null
          can_view_vault_queue?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          user_id: string
        }
        Update: {
          can_delete_books?: boolean | null
          can_edit_books?: boolean | null
          can_toggle_downloads?: boolean | null
          can_toggle_publish?: boolean | null
          can_upload_books?: boolean | null
          can_view_users?: boolean | null
          can_view_vault_queue?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_admin_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_admin_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_progress: {
        Row: {
          completed: boolean | null
          id: string
          last_read_at: string
          module_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          last_read_at?: string
          module_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          last_read_at?: string
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_progress_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          books_read_count: number | null
          created_at: string | null
          display_name: string | null
          email_notifications: boolean | null
          font_family: string | null
          font_size: string | null
          high_contrast: boolean | null
          id: string
          is_public: boolean | null
          last_active: string | null
          line_spacing: string | null
          location: string | null
          reading_focus: string[] | null
          reason_joined: string | null
          reduce_motion: boolean | null
          role: string
          show_reading_list: boolean | null
          theme_preference: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          books_read_count?: number | null
          created_at?: string | null
          display_name?: string | null
          email_notifications?: boolean | null
          font_family?: string | null
          font_size?: string | null
          high_contrast?: boolean | null
          id: string
          is_public?: boolean | null
          last_active?: string | null
          line_spacing?: string | null
          location?: string | null
          reading_focus?: string[] | null
          reason_joined?: string | null
          reduce_motion?: boolean | null
          role?: string
          show_reading_list?: boolean | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          books_read_count?: number | null
          created_at?: string | null
          display_name?: string | null
          email_notifications?: boolean | null
          font_family?: string | null
          font_size?: string | null
          high_contrast?: boolean | null
          id?: string
          is_public?: boolean | null
          last_active?: string | null
          line_spacing?: string | null
          location?: string | null
          reading_focus?: string[] | null
          reason_joined?: string | null
          reduce_motion?: boolean | null
          role?: string
          show_reading_list?: boolean | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vault_access_requests: {
        Row: {
          admin_note: string | null
          background: string | null
          book_id: string
          id: string
          reason: string
          requested_at: string | null
          reviewed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          background?: string | null
          book_id: string
          id?: string
          reason: string
          requested_at?: string | null
          reviewed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          background?: string | null
          book_id?: string
          id?: string
          reason?: string
          requested_at?: string | null
          reviewed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_access_requests_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_access_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      module_progress_view: {
        Row: {
          category: Database["public"]["Enums"]["category"] | null
          completed: boolean | null
          created_at: string | null
          description: string | null
          expertise: Database["public"]["Enums"]["expertise_level"] | null
          id: string | null
          image_url: string | null
          last_read_at: string | null
          read_time: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      keyword_match_module_content: {
        Args: { match_count: number; query_text: string }
        Returns: {
          content_md: string
          id: string
          module_id: string
          section_title: string
          similarity: number
        }[]
      }
      match_module_content: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content_md: string
          id: string
          module_id: string
          section_title: string
          similarity: number
        }[]
      }
      match_module_embeddings: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content_md: string
          id: string
          module_id: string
          section_title: string
          similarity: number
        }[]
      }
    }
    Enums: {
      category:
        | "Neuroanatomy"
        | "Methods"
        | "Computational"
        | "Psychology"
        | "Therapeutics"
      expertise_level: "Novice" | "Practitioner" | "Expert" | "Scholar"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      category: [
        "Neuroanatomy",
        "Methods",
        "Computational",
        "Psychology",
        "Therapeutics",
      ],
      expertise_level: ["Novice", "Practitioner", "Expert", "Scholar"],
    },
  },
} as const
