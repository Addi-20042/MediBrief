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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          after_json: Json | null
          before_json: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          reason: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          reason?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          reason?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          granted_at: string
          granted_by: string | null
          is_active: boolean
          notes: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          is_active?: boolean
          notes?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          is_active?: boolean
          notes?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_feature_cards: {
        Row: {
          badge: string | null
          created_at: string
          created_by: string | null
          cta_label: string | null
          description: string
          details: string | null
          display_order: number
          href: string | null
          icon_name: string
          id: string
          is_external: boolean
          is_published: boolean
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          badge?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          description: string
          details?: string | null
          display_order?: number
          href?: string | null
          icon_name?: string
          id?: string
          is_external?: boolean
          is_published?: boolean
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          badge?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          description?: string
          details?: string | null
          display_order?: number
          href?: string | null
          icon_name?: string
          id?: string
          is_external?: boolean
          is_published?: boolean
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_diseases: {
        Row: {
          causes: string[]
          category: string
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          id: string
          is_published: boolean
          name: string
          prevention: string[]
          risk_factors: string[]
          symptoms: string[]
          treatment: string[]
          updated_at: string
          updated_by: string | null
          when_to_see_doctor: string
        }
        Insert: {
          causes?: string[]
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number
          id?: string
          is_published?: boolean
          name: string
          prevention?: string[]
          risk_factors?: string[]
          symptoms?: string[]
          treatment?: string[]
          updated_at?: string
          updated_by?: string | null
          when_to_see_doctor?: string
        }
        Update: {
          causes?: string[]
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          id?: string
          is_published?: boolean
          name?: string
          prevention?: string[]
          risk_factors?: string[]
          symptoms?: string[]
          treatment?: string[]
          updated_at?: string
          updated_by?: string | null
          when_to_see_doctor?: string
        }
        Relationships: []
      }
      custom_emergency_contacts: {
        Row: {
          country: string | null
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          id: string
          is_published: boolean
          name: string
          number: string
          priority: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number
          id?: string
          is_published?: boolean
          name: string
          number: string
          priority?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          id?: string
          is_published?: boolean
          name?: string
          number?: string
          priority?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      custom_first_aid_guides: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          do_not: string[]
          id: string
          is_published: boolean
          overview: string
          severity: string
          steps: string[]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          do_not?: string[]
          id?: string
          is_published?: boolean
          overview: string
          severity?: string
          steps?: string[]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          do_not?: string[]
          id?: string
          is_published?: boolean
          overview?: string
          severity?: string
          steps?: string[]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          blood_sugar: number | null
          created_at: string
          heart_rate: number | null
          id: string
          metric_date: string
          mood: string | null
          notes: string | null
          sleep_hours: number | null
          steps: number | null
          updated_at: string
          user_id: string
          water_intake: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          metric_date?: string
          mood?: string | null
          notes?: string | null
          sleep_hours?: number | null
          steps?: number | null
          updated_at?: string
          user_id: string
          water_intake?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          metric_date?: string
          mood?: string | null
          notes?: string | null
          sleep_hours?: number | null
          steps?: number | null
          updated_at?: string
          user_id?: string
          water_intake?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          reminder_id: string | null
          scheduled_time: string | null
          skipped: boolean
          taken_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          reminder_id?: string | null
          scheduled_time?: string | null
          skipped?: boolean
          taken_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          reminder_id?: string | null
          scheduled_time?: string | null
          skipped?: boolean
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "medication_reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_sms_logs: {
        Row: {
          created_at: string
          delivery_key: string
          id: string
          notification_type: string
          phone_number: string | null
          reminder_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_key: string
          id?: string
          notification_type: string
          phone_number?: string | null
          reminder_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_key?: string
          id?: string
          notification_type?: string
          phone_number?: string | null
          reminder_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_sms_logs_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "medication_reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_reminders: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          medication_name: string
          notes: string | null
          reminder_times: string[]
          start_date: string
          status_changed_at: string | null
          status_changed_by: string | null
          status_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean
          medication_name: string
          notes?: string | null
          reminder_times?: string[]
          start_date?: string
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          medication_name?: string
          notes?: string | null
          reminder_times?: string[]
          start_date?: string
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          created_at: string
          hidden_at: string | null
          hidden_by: string | null
          hidden_reason: string | null
          id: string
          input_data: string
          is_hidden: boolean
          predicted_diseases: Json
          prediction_type: string
          summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          hidden_at?: string | null
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          input_data: string
          is_hidden?: boolean
          predicted_diseases: Json
          prediction_type: string
          summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          hidden_at?: string | null
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          input_data?: string
          is_hidden?: boolean
          predicted_diseases?: Json
          prediction_type?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: string | null
          account_status_changed_at: string | null
          account_status_changed_by: string | null
          account_status_reason: string | null
          avatar_url: string | null
          blood_type: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          is_account_active: boolean
          medical_conditions: string | null
          phone_number: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          allergies?: string | null
          account_status_changed_at?: string | null
          account_status_changed_by?: string | null
          account_status_reason?: string | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          is_account_active?: boolean
          medical_conditions?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          allergies?: string | null
          account_status_changed_at?: string | null
          account_status_changed_by?: string | null
          account_status_reason?: string | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          is_account_active?: boolean
          medical_conditions?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_overview: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_get_user_detail: {
        Args: {
          target_user_id: string
        }
        Returns: Json
      }
      admin_list_audit_logs: {
        Args: {
          action_filter?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          action: string
          admin_name: string
          admin_user_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          reason: string | null
          target_user_id: string | null
          target_user_name: string
        }[]
      }
      admin_list_users: {
        Args: {
          search_term?: string
          status_filter?: string
        }
        Returns: {
          active_reminders_count: number
          admin_role: string | null
          created_at: string
          email: string | null
          full_name: string | null
          is_account_active: boolean
          phone_number: string | null
          predictions_count: number
          user_id: string
        }[]
      }
      admin_set_medication_reminder_status: {
        Args: {
          next_is_active: boolean
          reason?: string
          target_reminder_id: string
        }
        Returns: Json
      }
      admin_set_prediction_visibility: {
        Args: {
          next_is_hidden: boolean
          reason?: string
          target_prediction_id: string
        }
        Returns: Json
      }
      admin_set_user_status: {
        Args: {
          next_is_active: boolean
          reason?: string
          target_user_id: string
        }
        Returns: Json
      }
      get_my_account_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_account_active: boolean
          status_reason: string | null
        }[]
      }
      is_admin: {
        Args: {
          target_user_id: string
        }
        Returns: boolean
      }
      is_user_account_active: {
        Args: {
          target_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
