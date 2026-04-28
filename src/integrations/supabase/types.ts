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
      destinations: {
        Row: {
          best_time: string | null
          city: string
          created_at: string
          description: string | null
          entry_fee_foreigner: string | null
          entry_fee_indian: string | null
          id: string
          image_url: string | null
          name: string
          rating: number
          state: string
          tags: string[] | null
          timings: string | null
          type: string
        }
        Insert: {
          best_time?: string | null
          city: string
          created_at?: string
          description?: string | null
          entry_fee_foreigner?: string | null
          entry_fee_indian?: string | null
          id?: string
          image_url?: string | null
          name: string
          rating?: number
          state: string
          tags?: string[] | null
          timings?: string | null
          type: string
        }
        Update: {
          best_time?: string | null
          city?: string
          created_at?: string
          description?: string | null
          entry_fee_foreigner?: string | null
          entry_fee_indian?: string | null
          id?: string
          image_url?: string | null
          name?: string
          rating?: number
          state?: string
          tags?: string[] | null
          timings?: string | null
          type?: string
        }
        Relationships: []
      }
      hotels: {
        Row: {
          address: string | null
          amenities: string[] | null
          city: string
          contact: string | null
          created_at: string
          id: string
          name: string
          near: string | null
          near_destination: string | null
          price_per_night: number
          rating: number
          state: string | null
          type: string
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          city: string
          contact?: string | null
          created_at?: string
          id?: string
          name: string
          near?: string | null
          near_destination?: string | null
          price_per_night: number
          rating?: number
          state?: string | null
          type: string
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          city?: string
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
          near?: string | null
          near_destination?: string | null
          price_per_night?: number
          rating?: number
          state?: string | null
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          city: string
          contact: string | null
          created_at: string
          cuisine: string
          id: string
          name: string
          price_range: string
          rating: number
          specialty: string | null
        }
        Insert: {
          address?: string | null
          city: string
          contact?: string | null
          created_at?: string
          cuisine: string
          id?: string
          name: string
          price_range: string
          rating?: number
          specialty?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          contact?: string | null
          created_at?: string
          cuisine?: string
          id?: string
          name?: string
          price_range?: string
          rating?: number
          specialty?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          destination_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          destination_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          destination_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_queue: {
        Row: {
          created_at: string
          id: string
          query: string
          reviewed_at: string | null
          scraped_data: Json | null
          status: string
          triggered_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          reviewed_at?: string | null
          scraped_data?: Json | null
          status?: string
          triggered_by?: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          reviewed_at?: string | null
          scraped_data?: Json | null
          status?: string
          triggered_by?: string
        }
        Relationships: []
      }
      search_logs: {
        Row: {
          created_at: string
          id: string
          results_count: number
          search_query: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          results_count?: number
          search_query: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          results_count?: number
          search_query?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tour_plans: {
        Row: {
          created_at: string
          destinations: string[]
          end_date: string | null
          estimated_budget: number
          id: string
          notes: string | null
          num_people: number
          start_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destinations?: string[]
          end_date?: string | null
          estimated_budget?: number
          id?: string
          notes?: string | null
          num_people?: number
          start_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destinations?: string[]
          end_date?: string | null
          estimated_budget?: number
          id?: string
          notes?: string | null
          num_people?: number
          start_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transport: {
        Row: {
          cost_max: number
          cost_min: number
          created_at: string
          duration: string
          from_city: string
          id: string
          mode: string
          operator: string | null
          to_city: string
        }
        Insert: {
          cost_max: number
          cost_min: number
          created_at?: string
          duration: string
          from_city: string
          id?: string
          mode: string
          operator?: string | null
          to_city: string
        }
        Update: {
          cost_max?: number
          cost_min?: number
          created_at?: string
          duration?: string
          from_city?: string
          id?: string
          mode?: string
          operator?: string | null
          to_city?: string
        }
        Relationships: []
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
      wishlists: {
        Row: {
          added_at: string
          destination_id: string
          id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          destination_id: string
          id?: string
          user_id: string
        }
        Update: {
          added_at?: string
          destination_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "user" | "manager"
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
    Enums: {
      app_role: ["user", "manager"],
    },
  },
} as const
