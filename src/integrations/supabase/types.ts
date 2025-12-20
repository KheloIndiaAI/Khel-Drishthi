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
      centre_sport_links: {
        Row: {
          bridge_id: string | null
          centre_id: string
          centre_type: string | null
          created_at: string | null
          discipline_id: string | null
          discipline_name: string | null
          district: string | null
          id: string
          operational_status: string | null
          programme_subtype: string | null
          source_dataset: string | null
          sport_id: string
          sport_name: string | null
          state: string | null
        }
        Insert: {
          bridge_id?: string | null
          centre_id: string
          centre_type?: string | null
          created_at?: string | null
          discipline_id?: string | null
          discipline_name?: string | null
          district?: string | null
          id?: string
          operational_status?: string | null
          programme_subtype?: string | null
          source_dataset?: string | null
          sport_id: string
          sport_name?: string | null
          state?: string | null
        }
        Update: {
          bridge_id?: string | null
          centre_id?: string
          centre_type?: string | null
          created_at?: string | null
          discipline_id?: string | null
          discipline_name?: string | null
          district?: string | null
          id?: string
          operational_status?: string | null
          programme_subtype?: string | null
          source_dataset?: string | null
          sport_id?: string
          sport_name?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centre_sport_links_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres"
            referencedColumns: ["centre_id"]
          },
          {
            foreignKeyName: "centre_sport_links_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["sport_id"]
          },
        ]
      }
      centres: {
        Row: {
          centre_id: string
          centre_name: string
          centre_name_raw: string | null
          centre_type: string
          created_at: string | null
          district: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          operational_status: string | null
          programme_subtype: string | null
          region_unit: string | null
          source_dataset: string | null
          state: string
          updated_at: string | null
        }
        Insert: {
          centre_id: string
          centre_name: string
          centre_name_raw?: string | null
          centre_type: string
          created_at?: string | null
          district?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          operational_status?: string | null
          programme_subtype?: string | null
          region_unit?: string | null
          source_dataset?: string | null
          state: string
          updated_at?: string | null
        }
        Update: {
          centre_id?: string
          centre_name?: string
          centre_name_raw?: string | null
          centre_type?: string
          created_at?: string | null
          district?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          operational_status?: string | null
          programme_subtype?: string | null
          region_unit?: string | null
          source_dataset?: string | null
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      disciplines: {
        Row: {
          ag2026_event_count: number | null
          created_at: string | null
          discipline_id: string
          discipline_raw: string | null
          discipline_std: string
          is_active: boolean | null
          la28_event_count: number | null
          present_ag2026: number | null
          present_la28: number | null
          sport_id: string
        }
        Insert: {
          ag2026_event_count?: number | null
          created_at?: string | null
          discipline_id: string
          discipline_raw?: string | null
          discipline_std: string
          is_active?: boolean | null
          la28_event_count?: number | null
          present_ag2026?: number | null
          present_la28?: number | null
          sport_id: string
        }
        Update: {
          ag2026_event_count?: number | null
          created_at?: string | null
          discipline_id?: string
          discipline_raw?: string | null
          discipline_std?: string
          is_active?: boolean | null
          la28_event_count?: number | null
          present_ag2026?: number | null
          present_la28?: number | null
          sport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplines_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["sport_id"]
          },
        ]
      }
      event_overlap: {
        Row: {
          ag_events: number | null
          both_events: number | null
          created_at: string | null
          events_total: number | null
          id: string
          la28_events: number | null
          only_ag: number | null
          only_la28: number | null
          sport_id: string | null
          sport_std: string | null
        }
        Insert: {
          ag_events?: number | null
          both_events?: number | null
          created_at?: string | null
          events_total?: number | null
          id?: string
          la28_events?: number | null
          only_ag?: number | null
          only_la28?: number | null
          sport_id?: string | null
          sport_std?: string | null
        }
        Update: {
          ag_events?: number | null
          both_events?: number | null
          created_at?: string | null
          events_total?: number | null
          id?: string
          la28_events?: number | null
          only_ag?: number | null
          only_la28?: number | null
          sport_id?: string | null
          sport_std?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_overlap_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["sport_id"]
          },
        ]
      }
      events: {
        Row: {
          ag2026_men: number | null
          ag2026_total: number | null
          ag2026_women: number | null
          both_games: number | null
          created_at: string | null
          discipline_id: string | null
          event_id: string
          event_raw: string | null
          event_std: string
          event_type_std: string | null
          gender_std: string | null
          la28_men: number | null
          la28_total: number | null
          la28_women: number | null
          participant_type: string | null
          present_ag2026: number | null
          present_la28: number | null
          sport_id: string
        }
        Insert: {
          ag2026_men?: number | null
          ag2026_total?: number | null
          ag2026_women?: number | null
          both_games?: number | null
          created_at?: string | null
          discipline_id?: string | null
          event_id: string
          event_raw?: string | null
          event_std: string
          event_type_std?: string | null
          gender_std?: string | null
          la28_men?: number | null
          la28_total?: number | null
          la28_women?: number | null
          participant_type?: string | null
          present_ag2026?: number | null
          present_la28?: number | null
          sport_id: string
        }
        Update: {
          ag2026_men?: number | null
          ag2026_total?: number | null
          ag2026_women?: number | null
          both_games?: number | null
          created_at?: string | null
          discipline_id?: string | null
          event_id?: string
          event_raw?: string | null
          event_std?: string
          event_type_std?: string | null
          gender_std?: string | null
          la28_men?: number | null
          la28_total?: number | null
          la28_women?: number | null
          participant_type?: string | null
          present_ag2026?: number | null
          present_la28?: number | null
          sport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["discipline_id"]
          },
          {
            foreignKeyName: "events_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["sport_id"]
          },
        ]
      }
      ncoe_capacity: {
        Row: {
          centre_id: string | null
          centre_name: string | null
          created_at: string | null
          discipline_raw: string | null
          ex_grand_total: number | null
          ex_nonres_boys: number | null
          ex_nonres_girls: number | null
          ex_nonres_total: number | null
          ex_res_boys: number | null
          ex_res_girls: number | null
          ex_res_total: number | null
          id: string
          is_para: boolean | null
          region: string | null
          san_grand_total: number | null
          san_nonres_boys: number | null
          san_nonres_girls: number | null
          san_nonres_total: number | null
          san_res_boys: number | null
          san_res_girls: number | null
          san_res_total: number | null
          sport_id: string | null
          state: string | null
        }
        Insert: {
          centre_id?: string | null
          centre_name?: string | null
          created_at?: string | null
          discipline_raw?: string | null
          ex_grand_total?: number | null
          ex_nonres_boys?: number | null
          ex_nonres_girls?: number | null
          ex_nonres_total?: number | null
          ex_res_boys?: number | null
          ex_res_girls?: number | null
          ex_res_total?: number | null
          id?: string
          is_para?: boolean | null
          region?: string | null
          san_grand_total?: number | null
          san_nonres_boys?: number | null
          san_nonres_girls?: number | null
          san_nonres_total?: number | null
          san_res_boys?: number | null
          san_res_girls?: number | null
          san_res_total?: number | null
          sport_id?: string | null
          state?: string | null
        }
        Update: {
          centre_id?: string | null
          centre_name?: string | null
          created_at?: string | null
          discipline_raw?: string | null
          ex_grand_total?: number | null
          ex_nonres_boys?: number | null
          ex_nonres_girls?: number | null
          ex_nonres_total?: number | null
          ex_res_boys?: number | null
          ex_res_girls?: number | null
          ex_res_total?: number | null
          id?: string
          is_para?: boolean | null
          region?: string | null
          san_grand_total?: number | null
          san_nonres_boys?: number | null
          san_nonres_girls?: number | null
          san_nonres_total?: number | null
          san_res_boys?: number | null
          san_res_girls?: number | null
          san_res_total?: number | null
          sport_id?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ncoe_capacity_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres"
            referencedColumns: ["centre_id"]
          },
          {
            foreignKeyName: "ncoe_capacity_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["sport_id"]
          },
        ]
      }
      olympic_medals: {
        Row: {
          athlete_or_team: string
          created_at: string | null
          event_raw: string | null
          games_name: string | null
          id: string
          medal: string
          source: string | null
          sport_id: string | null
          sport_raw: string | null
          sport_std: string | null
          year: number
          year_raw: number | null
        }
        Insert: {
          athlete_or_team: string
          created_at?: string | null
          event_raw?: string | null
          games_name?: string | null
          id?: string
          medal: string
          source?: string | null
          sport_id?: string | null
          sport_raw?: string | null
          sport_std?: string | null
          year: number
          year_raw?: number | null
        }
        Update: {
          athlete_or_team?: string
          created_at?: string | null
          event_raw?: string | null
          games_name?: string | null
          id?: string
          medal?: string
          source?: string | null
          sport_id?: string | null
          sport_raw?: string | null
          sport_std?: string | null
          year?: number
          year_raw?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "olympic_medals_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["sport_id"]
          },
        ]
      }
      olympic_participation: {
        Row: {
          athletes: number | null
          created_at: string | null
          games_name: string | null
          id: string
          source: string | null
          sport_id: string | null
          sport_raw: string | null
          sport_std: string | null
          year: number
          year_raw: number | null
        }
        Insert: {
          athletes?: number | null
          created_at?: string | null
          games_name?: string | null
          id?: string
          source?: string | null
          sport_id?: string | null
          sport_raw?: string | null
          sport_std?: string | null
          year: number
          year_raw?: number | null
        }
        Update: {
          athletes?: number | null
          created_at?: string | null
          games_name?: string | null
          id?: string
          source?: string | null
          sport_id?: string | null
          sport_raw?: string | null
          sport_std?: string | null
          year?: number
          year_raw?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "olympic_participation_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["sport_id"]
          },
        ]
      }
      olympic_timeline: {
        Row: {
          created_at: string | null
          id: string
          milestone_description: string | null
          milestone_title: string
          source: string | null
          source_url: string | null
          sport_guess_raw: string | null
          sport_id: string | null
          sport_std: string | null
          year_start: number | null
          years_list: string | null
          years_raw: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          milestone_description?: string | null
          milestone_title: string
          source?: string | null
          source_url?: string | null
          sport_guess_raw?: string | null
          sport_id?: string | null
          sport_std?: string | null
          year_start?: number | null
          years_list?: string | null
          years_raw?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          milestone_description?: string | null
          milestone_title?: string
          source?: string | null
          source_url?: string | null
          sport_guess_raw?: string | null
          sport_id?: string | null
          sport_std?: string | null
          year_start?: number | null
          years_list?: string | null
          years_raw?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "olympic_timeline_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["sport_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string
          organization: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          last_login?: string | null
          name: string
          organization?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          organization?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sport_notes: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          id: string
          is_pinned: boolean | null
          note_type: string
          sport_id: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          is_pinned?: boolean | null
          note_type: string
          sport_id: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          is_pinned?: boolean | null
          note_type?: string
          sport_id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sport_notes_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["sport_id"]
          },
        ]
      }
      sports: {
        Row: {
          ag2026_events: number | null
          asmita_league_status: string | null
          created_at: string | null
          existing_athletes: number | null
          is_tagg: boolean | null
          is_teams: boolean | null
          is_tops: boolean | null
          kic_centres: number | null
          kisce_centres: number | null
          la28_events: number | null
          ncoe_centres: number | null
          nis_diploma_status: string | null
          present_ag2026: boolean | null
          present_la28: boolean | null
          sanctioned_capacity: number | null
          sport_category: string | null
          sport_id: string
          sport_name: string
          stc_centres: number | null
          updated_at: string | null
        }
        Insert: {
          ag2026_events?: number | null
          asmita_league_status?: string | null
          created_at?: string | null
          existing_athletes?: number | null
          is_tagg?: boolean | null
          is_teams?: boolean | null
          is_tops?: boolean | null
          kic_centres?: number | null
          kisce_centres?: number | null
          la28_events?: number | null
          ncoe_centres?: number | null
          nis_diploma_status?: string | null
          present_ag2026?: boolean | null
          present_la28?: boolean | null
          sanctioned_capacity?: number | null
          sport_category?: string | null
          sport_id: string
          sport_name: string
          stc_centres?: number | null
          updated_at?: string | null
        }
        Update: {
          ag2026_events?: number | null
          asmita_league_status?: string | null
          created_at?: string | null
          existing_athletes?: number | null
          is_tagg?: boolean | null
          is_teams?: boolean | null
          is_tops?: boolean | null
          kic_centres?: number | null
          kisce_centres?: number | null
          la28_events?: number | null
          ncoe_centres?: number | null
          nis_diploma_status?: string | null
          present_ag2026?: boolean | null
          present_la28?: boolean | null
          sanctioned_capacity?: number | null
          sport_category?: string | null
          sport_id?: string
          sport_name?: string
          stc_centres?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stc_capacity: {
        Row: {
          centre_id: string | null
          centre_name: string | null
          created_at: string | null
          discipline_raw: string | null
          ex_grand_total: number | null
          ex_nonres_boys: number | null
          ex_nonres_girls: number | null
          ex_nonres_total: number | null
          ex_res_boys: number | null
          ex_res_girls: number | null
          ex_res_total: number | null
          id: string
          is_para: boolean | null
          region: string | null
          san_grand_total: number | null
          san_nonres_boys: number | null
          san_nonres_girls: number | null
          san_nonres_total: number | null
          san_res_boys: number | null
          san_res_girls: number | null
          san_res_total: number | null
          sport_id: string | null
          state: string | null
        }
        Insert: {
          centre_id?: string | null
          centre_name?: string | null
          created_at?: string | null
          discipline_raw?: string | null
          ex_grand_total?: number | null
          ex_nonres_boys?: number | null
          ex_nonres_girls?: number | null
          ex_nonres_total?: number | null
          ex_res_boys?: number | null
          ex_res_girls?: number | null
          ex_res_total?: number | null
          id?: string
          is_para?: boolean | null
          region?: string | null
          san_grand_total?: number | null
          san_nonres_boys?: number | null
          san_nonres_girls?: number | null
          san_nonres_total?: number | null
          san_res_boys?: number | null
          san_res_girls?: number | null
          san_res_total?: number | null
          sport_id?: string | null
          state?: string | null
        }
        Update: {
          centre_id?: string | null
          centre_name?: string | null
          created_at?: string | null
          discipline_raw?: string | null
          ex_grand_total?: number | null
          ex_nonres_boys?: number | null
          ex_nonres_girls?: number | null
          ex_nonres_total?: number | null
          ex_res_boys?: number | null
          ex_res_girls?: number | null
          ex_res_total?: number | null
          id?: string
          is_para?: boolean | null
          region?: string | null
          san_grand_total?: number | null
          san_nonres_boys?: number | null
          san_nonres_girls?: number | null
          san_nonres_total?: number | null
          san_res_boys?: number | null
          san_res_girls?: number | null
          san_res_total?: number | null
          sport_id?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stc_capacity_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres"
            referencedColumns: ["centre_id"]
          },
          {
            foreignKeyName: "stc_capacity_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["sport_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      app_role: "admin" | "editor" | "viewer"
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
      app_role: ["admin", "editor", "viewer"],
    },
  },
} as const
