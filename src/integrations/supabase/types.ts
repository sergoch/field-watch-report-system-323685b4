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
      engineer_regions: {
        Row: {
          assigned_at: string | null
          engineer_id: string | null
          id: string
          region_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          engineer_id?: string | null
          id?: string
          region_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          engineer_id?: string | null
          id?: string
          region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_regions_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_regions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      engineers: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          password_hash: string
          phone: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          password_hash: string
          phone?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          password_hash?: string
          phone?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string | null
          dailysalary: number
          fueltype: string
          id: string
          license_plate: string
          operator_id: string
          operator_name: string
          region_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dailysalary: number
          fueltype: string
          id?: string
          license_plate: string
          operator_id: string
          operator_name: string
          region_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dailysalary?: number
          fueltype?: string
          id?: string
          license_plate?: string
          operator_id?: string
          operator_name?: string
          region_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          engineer_id: string
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          region_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          engineer_id: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          region_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          engineer_id?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          region_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      report_equipment: {
        Row: {
          created_at: string | null
          equipment_id: string | null
          fuel_amount: number
          id: string
          report_id: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_id?: string | null
          fuel_amount?: number
          id?: string
          report_id?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_id?: string | null
          fuel_amount?: number
          id?: string
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_equipment_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_workers: {
        Row: {
          created_at: string | null
          id: string
          report_id: string | null
          worker_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_id?: string | null
          worker_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          report_id?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_workers_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_workers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          engineer_id: string
          id: string
          image_url: string | null
          materials_received: string | null
          materials_used: string | null
          region_id: string | null
          total_fuel: number | null
          total_worker_salary: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          description?: string | null
          engineer_id: string
          id?: string
          image_url?: string | null
          materials_received?: string | null
          materials_used?: string | null
          region_id?: string | null
          total_fuel?: number | null
          total_worker_salary?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          engineer_id?: string
          id?: string
          image_url?: string | null
          materials_received?: string | null
          materials_used?: string | null
          region_id?: string | null
          total_fuel?: number | null
          total_worker_salary?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      workers: {
        Row: {
          created_at: string | null
          dailysalary: number
          full_name: string
          id: string
          personal_id: string
          region_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dailysalary: number
          full_name: string
          id?: string
          personal_id: string
          region_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dailysalary?: number
          full_name?: string
          id?: string
          personal_id?: string
          region_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workers_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_engineer: {
        Args: { p_username: string; p_password: string }
        Returns: {
          id: string
          username: string
          full_name: string
          email: string
        }[]
      }
      clean_test_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_engineer_id_from_auth: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
