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
  public: {
    Tables: {
      inscriptions: {
        Row: {
          access_granted_at: string | null
          created_at: string
          customer_name: string
          id: string
          note: string | null
          programme: string
          status: string
          tracking_code: string
          updated_at: string
          user_id: string | null
          validated_at: string | null
          whatsapp: string
        }
        Insert: {
          access_granted_at?: string | null
          created_at?: string
          customer_name: string
          id?: string
          note?: string | null
          programme: string
          status?: string
          tracking_code: string
          updated_at?: string
          user_id?: string | null
          validated_at?: string | null
          whatsapp: string
        }
        Update: {
          access_granted_at?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          note?: string | null
          programme?: string
          status?: string
          tracking_code?: string
          updated_at?: string
          user_id?: string | null
          validated_at?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          amount: number
          code: string
          created_at: string
          customer_name: string
          expires_at: string | null
          id: string
          issued_at: string
          programme: string | null
          reference: string | null
          status: string
          transaction_id: string
        }
        Insert: {
          amount: number
          code: string
          created_at?: string
          customer_name: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          programme?: string | null
          reference?: string | null
          status?: string
          transaction_id: string
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string
          customer_name?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          programme?: string | null
          reference?: string | null
          status?: string
          transaction_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_name: string
          environment: string
          id: string
          msisdn: string
          paid_at: string | null
          programme: string | null
          provider: string
          raw: Json | null
          reference: string | null
          status: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_name: string
          environment?: string
          id?: string
          msisdn: string
          paid_at?: string | null
          programme?: string | null
          provider?: string
          raw?: Json | null
          reference?: string | null
          status?: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_name?: string
          environment?: string
          id?: string
          msisdn?: string
          paid_at?: string | null
          programme?: string | null
          provider?: string
          raw?: Json | null
          reference?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quran_progress: {
        Row: {
          id: string
          memorization_percent: number
          revision_percent: number
          surah_name: string | null
          surah_number: number
          teacher_note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          memorization_percent?: number
          revision_percent?: number
          surah_name?: string | null
          surah_number: number
          teacher_note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          memorization_percent?: number
          revision_percent?: number
          surah_name?: string | null
          surah_number?: number
          teacher_note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_assessments: {
        Row: {
          assessed_at: string
          id: string
          max_score: number | null
          score: number | null
          subject: string | null
          teacher_note: string | null
          title: string
          user_id: string
        }
        Insert: {
          assessed_at?: string
          id?: string
          max_score?: number | null
          score?: number | null
          subject?: string | null
          teacher_note?: string | null
          title: string
          user_id: string
        }
        Update: {
          assessed_at?: string
          id?: string
          max_score?: number | null
          score?: number | null
          subject?: string | null
          teacher_note?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      student_attendance: {
        Row: {
          course_id: string | null
          id: string
          notes: string | null
          session_date: string
          status: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          id?: string
          notes?: string | null
          session_date: string
          status?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          id?: string
          notes?: string | null
          session_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "student_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_courses: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          level: string | null
          schedule: string | null
          slug: string
          subject: string | null
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          level?: string | null
          schedule?: string | null
          slug: string
          subject?: string | null
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          level?: string | null
          schedule?: string | null
          slug?: string
          subject?: string | null
          title?: string
        }
        Relationships: []
      }
      student_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          inscription_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          inscription_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          inscription_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "student_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "inscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          level: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          level?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          level?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      student_progress: {
        Row: {
          course_id: string
          created_at: string
          id: string
          last_activity_at: string | null
          progress: number
          teacher_note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          last_activity_at?: string | null
          progress?: number
          teacher_note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          last_activity_at?: string | null
          progress?: number
          teacher_note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "student_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_resources: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          resource_type: string
          title: string
          url: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          resource_type?: string
          title: string
          url: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          resource_type?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "student_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
