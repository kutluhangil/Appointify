export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          industry: string | null
          phone: string | null
          email: string | null
          address: string | null
          locale: string | null
          currency: string | null
          timezone: string | null
          logo_url: string | null
          settings: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          industry?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          locale?: string | null
          currency?: string | null
          timezone?: string | null
          logo_url?: string | null
          settings?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          industry?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          locale?: string | null
          currency?: string | null
          timezone?: string | null
          logo_url?: string | null
          settings?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          id: string
          tenant_id: string | null
          user_id: string | null
          full_name: string
          title: string | null
          phone: string | null
          email: string | null
          color: string | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          user_id?: string | null
          full_name: string
          title?: string | null
          phone?: string | null
          email?: string | null
          color?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string | null
          user_id?: string | null
          full_name?: string
          title?: string | null
          phone?: string | null
          email?: string | null
          color?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          id: string
          tenant_id: string | null
          name: string
          description: string | null
          duration_min: number
          price: number | null
          currency: string | null
          color: string | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          name: string
          description?: string | null
          duration_min?: number
          price?: number | null
          currency?: string | null
          color?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string | null
          name?: string
          description?: string | null
          duration_min?: number
          price?: number | null
          currency?: string | null
          color?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          tenant_id: string | null
          full_name: string
          phone: string | null
          email: string | null
          tag: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          full_name: string
          phone?: string | null
          email?: string | null
          tag?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string | null
          full_name?: string
          phone?: string | null
          email?: string | null
          tag?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      appointments: {
        Row: {
          id: string
          tenant_id: string | null
          customer_id: string | null
          staff_id: string | null
          service_id: string | null
          starts_at: string
          ends_at: string
          status: string | null
          notes: string | null
          price: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          customer_id?: string | null
          staff_id?: string | null
          service_id?: string | null
          starts_at: string
          ends_at: string
          status?: string | null
          notes?: string | null
          price?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string | null
          customer_id?: string | null
          staff_id?: string | null
          service_id?: string | null
          starts_at?: string
          ends_at?: string
          status?: string | null
          notes?: string | null
          price?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          tenant_id: string | null
          appointment_id: string | null
          customer_id: string | null
          amount: number
          currency: string | null
          method: string | null
          status: string | null
          paid_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          appointment_id?: string | null
          customer_id?: string | null
          amount: number
          currency?: string | null
          method?: string | null
          status?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string | null
          appointment_id?: string | null
          customer_id?: string | null
          amount?: number
          currency?: string | null
          method?: string | null
          status?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          job_title: string | null
          updated_at: string
          user_id: string
          tenant_id: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          job_title?: string | null
          updated_at?: string
          user_id: string
          tenant_id?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          job_title?: string | null
          updated_at?: string
          user_id?: string
          tenant_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
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
