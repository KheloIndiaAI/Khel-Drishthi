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
      access_requests: {
        Row: {
          id: string
          reason: string | null
          requested_at: string
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          reason?: string | null
          requested_at?: string
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          reason?: string | null
          requested_at?: string
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      centre_contacts: {
        Row: {
          contact_info: string | null
          contact_number: string | null
          created_at: string
          facility_name: string | null
          kd_centre_id: string | null
          map_facility_id: string
          state: string | null
        }
        Insert: {
          contact_info?: string | null
          contact_number?: string | null
          created_at?: string
          facility_name?: string | null
          kd_centre_id?: string | null
          map_facility_id: string
          state?: string | null
        }
        Update: {
          contact_info?: string | null
          contact_number?: string | null
          created_at?: string
          facility_name?: string | null
          kd_centre_id?: string | null
          map_facility_id?: string
          state?: string | null
        }
        Relationships: []
      }
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
      eco_categories: {
        Row: {
          ag2026_events: number | null
          created_at: string | null
          eco_category_id: string
          eco_category_name: string
          has_supply_any: boolean | null
          is_ecosystem_category: boolean | null
          kic_centres: number | null
          kisce_centres: number | null
          la28_events: number | null
          ncoe_centres: number | null
          notes: string | null
          present_ag2026: boolean | null
          present_both_games: boolean | null
          present_in_asmita_nis_sheet: boolean | null
          present_in_tops_tagg_teams_list: boolean | null
          present_kic: boolean | null
          present_kisce: boolean | null
          present_la28: boolean | null
          present_ncoe: boolean | null
          present_stc: boolean | null
          source: string | null
          stc_centres: number | null
        }
        Insert: {
          ag2026_events?: number | null
          created_at?: string | null
          eco_category_id: string
          eco_category_name: string
          has_supply_any?: boolean | null
          is_ecosystem_category?: boolean | null
          kic_centres?: number | null
          kisce_centres?: number | null
          la28_events?: number | null
          ncoe_centres?: number | null
          notes?: string | null
          present_ag2026?: boolean | null
          present_both_games?: boolean | null
          present_in_asmita_nis_sheet?: boolean | null
          present_in_tops_tagg_teams_list?: boolean | null
          present_kic?: boolean | null
          present_kisce?: boolean | null
          present_la28?: boolean | null
          present_ncoe?: boolean | null
          present_stc?: boolean | null
          source?: string | null
          stc_centres?: number | null
        }
        Update: {
          ag2026_events?: number | null
          created_at?: string | null
          eco_category_id?: string
          eco_category_name?: string
          has_supply_any?: boolean | null
          is_ecosystem_category?: boolean | null
          kic_centres?: number | null
          kisce_centres?: number | null
          la28_events?: number | null
          ncoe_centres?: number | null
          notes?: string | null
          present_ag2026?: boolean | null
          present_both_games?: boolean | null
          present_in_asmita_nis_sheet?: boolean | null
          present_in_tops_tagg_teams_list?: boolean | null
          present_kic?: boolean | null
          present_kisce?: boolean | null
          present_la28?: boolean | null
          present_ncoe?: boolean | null
          present_stc?: boolean | null
          source?: string | null
          stc_centres?: number | null
        }
        Relationships: []
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
      facility_crosswalk: {
        Row: {
          confidence: number | null
          kd_centre_id: string
          latitude: number
          longitude: number
          map_facility_id: string
          map_operational_status: string | null
          method: string | null
        }
        Insert: {
          confidence?: number | null
          kd_centre_id: string
          latitude: number
          longitude: number
          map_facility_id: string
          map_operational_status?: string | null
          method?: string | null
        }
        Update: {
          confidence?: number | null
          kd_centre_id?: string
          latitude?: number
          longitude?: number
          map_facility_id?: string
          map_operational_status?: string | null
          method?: string | null
        }
        Relationships: []
      }
      form_definitions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          fields: Json
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          data: Json
          form_id: string
          id: string
          submitted_at: string | null
          submitted_by: string | null
        }
        Insert: {
          data?: Json
          form_id: string
          id?: string
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Update: {
          data?: Json
          form_id?: string
          id?: string
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "form_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      kisce_funds: {
        Row: {
          created_at: string
          facility_id: string
          financial_year: string
          funds_released: number
          head: string | null
          id: number
          kd_centre_id: string | null
          release_date: string | null
          sanction_date: string | null
          state: string
          uc_pending: boolean
          uc_status: string | null
        }
        Insert: {
          created_at?: string
          facility_id: string
          financial_year: string
          funds_released: number
          head?: string | null
          id?: number
          kd_centre_id?: string | null
          release_date?: string | null
          sanction_date?: string | null
          state: string
          uc_pending?: boolean
          uc_status?: string | null
        }
        Update: {
          created_at?: string
          facility_id?: string
          financial_year?: string
          funds_released?: number
          head?: string | null
          id?: number
          kd_centre_id?: string | null
          release_date?: string | null
          sanction_date?: string | null
          state?: string
          uc_pending?: boolean
          uc_status?: string | null
        }
        Relationships: []
      }
      kisce_manpower: {
        Row: {
          created_at: string
          current_strength: number
          designation: string
          facility_id: string
          id: number
          kd_centre_id: string | null
          sanctioned: number
          staff_category: string
          state: string
          status_normalized: string
          status_raw: string | null
        }
        Insert: {
          created_at?: string
          current_strength?: number
          designation: string
          facility_id: string
          id?: number
          kd_centre_id?: string | null
          sanctioned?: number
          staff_category: string
          state: string
          status_normalized: string
          status_raw?: string | null
        }
        Update: {
          created_at?: string
          current_strength?: number
          designation?: string
          facility_id?: string
          id?: number
          kd_centre_id?: string | null
          sanctioned?: number
          staff_category?: string
          state?: string
          status_normalized?: string
          status_raw?: string | null
        }
        Relationships: []
      }
      kisce_manpower_people: {
        Row: {
          candidate_names: string | null
          created_at: string
          gender: string | null
          manpower_id: number
          mobile: string | null
        }
        Insert: {
          candidate_names?: string | null
          created_at?: string
          gender?: string | null
          manpower_id: number
          mobile?: string | null
        }
        Update: {
          candidate_names?: string | null
          created_at?: string
          gender?: string | null
          manpower_id?: number
          mobile?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kisce_manpower_people_manpower_id_fkey"
            columns: ["manpower_id"]
            isOneToOne: true
            referencedRelation: "kisce_manpower"
            referencedColumns: ["id"]
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
      oly_athletes: {
        Row: {
          athlete_id: string
          birth_year: number | null
          country_noc: string | null
          display_name: string | null
          era: string | null
          first_olympics_year: number | null
          gender: string | null
          height_cm: number | null
          kd_sport_id: string | null
          last_olympics_year: number | null
          medal_data_quality: string | null
          medal_summary: string | null
          primary_discipline: string | null
          total_medals: number | null
          weight_kg: number | null
        }
        Insert: {
          athlete_id: string
          birth_year?: number | null
          country_noc?: string | null
          display_name?: string | null
          era?: string | null
          first_olympics_year?: number | null
          gender?: string | null
          height_cm?: number | null
          kd_sport_id?: string | null
          last_olympics_year?: number | null
          medal_data_quality?: string | null
          medal_summary?: string | null
          primary_discipline?: string | null
          total_medals?: number | null
          weight_kg?: number | null
        }
        Update: {
          athlete_id?: string
          birth_year?: number | null
          country_noc?: string | null
          display_name?: string | null
          era?: string | null
          first_olympics_year?: number | null
          gender?: string | null
          height_cm?: number | null
          kd_sport_id?: string | null
          last_olympics_year?: number | null
          medal_data_quality?: string | null
          medal_summary?: string | null
          primary_discipline?: string | null
          total_medals?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      oly_countries: {
        Row: {
          country_name: string
          country_noc: string
        }
        Insert: {
          country_name: string
          country_noc: string
        }
        Update: {
          country_name?: string
          country_noc?: string
        }
        Relationships: []
      }
      oly_country_groups: {
        Row: {
          active_from: number | null
          active_to: number | null
          bloc: string | null
          modern_noc: string
          original_noc: string
        }
        Insert: {
          active_from?: number | null
          active_to?: number | null
          bloc?: string | null
          modern_noc: string
          original_noc: string
        }
        Update: {
          active_from?: number | null
          active_to?: number | null
          bloc?: string | null
          modern_noc?: string
          original_noc?: string
        }
        Relationships: []
      }
      oly_disciplines: {
        Row: {
          canonical_name: string
          discipline_id: number
          is_competition: boolean | null
          kd_sport_id: string | null
        }
        Insert: {
          canonical_name: string
          discipline_id: number
          is_competition?: boolean | null
          kd_sport_id?: string | null
        }
        Update: {
          canonical_name?: string
          discipline_id?: number
          is_competition?: boolean | null
          kd_sport_id?: string | null
        }
        Relationships: []
      }
      oly_editions: {
        Row: {
          display_city: string | null
          edition_id: number
          games_name: string | null
          host_city: string | null
          host_country_noc: string | null
          is_held: boolean | null
          is_intercalated: boolean | null
          season: string
          year: number
        }
        Insert: {
          display_city?: string | null
          edition_id: number
          games_name?: string | null
          host_city?: string | null
          host_country_noc?: string | null
          is_held?: boolean | null
          is_intercalated?: boolean | null
          season: string
          year: number
        }
        Update: {
          display_city?: string | null
          edition_id?: number
          games_name?: string | null
          host_city?: string | null
          host_country_noc?: string | null
          is_held?: boolean | null
          is_intercalated?: boolean | null
          season?: string
          year?: number
        }
        Relationships: []
      }
      oly_medal_tally: {
        Row: {
          bronze: number | null
          canonical_discipline: string | null
          country_name: string | null
          country_noc: string
          discipline_id: number | null
          edition_id: number
          gold: number | null
          host_city: string | null
          host_country_noc: string | null
          is_intercalated: boolean | null
          kd_sport_id: string | null
          season: string | null
          silver: number | null
          total: number | null
          year: number
        }
        Insert: {
          bronze?: number | null
          canonical_discipline?: string | null
          country_name?: string | null
          country_noc: string
          discipline_id?: number | null
          edition_id: number
          gold?: number | null
          host_city?: string | null
          host_country_noc?: string | null
          is_intercalated?: boolean | null
          kd_sport_id?: string | null
          season?: string | null
          silver?: number | null
          total?: number | null
          year: number
        }
        Update: {
          bronze?: number | null
          canonical_discipline?: string | null
          country_name?: string | null
          country_noc?: string
          discipline_id?: number | null
          edition_id?: number
          gold?: number | null
          host_city?: string | null
          host_country_noc?: string | null
          is_intercalated?: boolean | null
          kd_sport_id?: string | null
          season?: string | null
          silver?: number | null
          total?: number | null
          year?: number
        }
        Relationships: []
      }
      oly_medals: {
        Row: {
          athlete_id: string | null
          athlete_name: string | null
          canonical_discipline: string | null
          country_noc: string | null
          edition_id: number | null
          event: string | null
          kd_sport_id: string | null
          medal_id: number
          medal_type: string | null
          season: string | null
          year: number | null
        }
        Insert: {
          athlete_id?: string | null
          athlete_name?: string | null
          canonical_discipline?: string | null
          country_noc?: string | null
          edition_id?: number | null
          event?: string | null
          kd_sport_id?: string | null
          medal_id: number
          medal_type?: string | null
          season?: string | null
          year?: number | null
        }
        Update: {
          athlete_id?: string | null
          athlete_name?: string | null
          canonical_discipline?: string | null
          country_noc?: string | null
          edition_id?: number | null
          event?: string | null
          kd_sport_id?: string | null
          medal_id?: number
          medal_type?: string | null
          season?: string | null
          year?: number | null
        }
        Relationships: []
      }
      oly_meta: {
        Row: {
          key: string
          value: string | null
        }
        Insert: {
          key: string
          value?: string | null
        }
        Update: {
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      oly_participations: {
        Row: {
          athlete_id: string | null
          canonical_discipline: string | null
          country_noc: string | null
          data_completeness: string | null
          edition_id: number | null
          event_name: string | null
          is_medal_winning: boolean | null
          kd_sport_id: string | null
          participation_id: number
          result_place: string | null
          season: string | null
          year: number | null
        }
        Insert: {
          athlete_id?: string | null
          canonical_discipline?: string | null
          country_noc?: string | null
          data_completeness?: string | null
          edition_id?: number | null
          event_name?: string | null
          is_medal_winning?: boolean | null
          kd_sport_id?: string | null
          participation_id: number
          result_place?: string | null
          season?: string | null
          year?: number | null
        }
        Update: {
          athlete_id?: string | null
          canonical_discipline?: string | null
          country_noc?: string | null
          data_completeness?: string | null
          edition_id?: number | null
          event_name?: string | null
          is_medal_winning?: boolean | null
          kd_sport_id?: string | null
          participation_id?: number
          result_place?: string | null
          season?: string | null
          year?: number | null
        }
        Relationships: []
      }
      oly_search_aliases: {
        Row: {
          alias: string
          entity_key: string
          entity_type: string
        }
        Insert: {
          alias: string
          entity_key: string
          entity_type: string
        }
        Update: {
          alias?: string
          entity_key?: string
          entity_type?: string
        }
        Relationships: []
      }
      oly_sport_map: {
        Row: {
          canonical_discipline: string
          kd_sport_id: string
        }
        Insert: {
          canonical_discipline: string
          kd_sport_id: string
        }
        Update: {
          canonical_discipline?: string
          kd_sport_id?: string
        }
        Relationships: []
      }
      olympic_medals: {
        Row: {
          athlete_or_team: string | null
          created_at: string | null
          event_raw: string | null
          games_name: string | null
          id: string
          medal: string | null
          source: string | null
          sport_id: string | null
          sport_raw: string | null
          sport_std: string | null
          year: number | null
          year_raw: string | null
        }
        Insert: {
          athlete_or_team?: string | null
          created_at?: string | null
          event_raw?: string | null
          games_name?: string | null
          id?: string
          medal?: string | null
          source?: string | null
          sport_id?: string | null
          sport_raw?: string | null
          sport_std?: string | null
          year?: number | null
          year_raw?: string | null
        }
        Update: {
          athlete_or_team?: string | null
          created_at?: string | null
          event_raw?: string | null
          games_name?: string | null
          id?: string
          medal?: string | null
          source?: string | null
          sport_id?: string | null
          sport_raw?: string | null
          sport_std?: string | null
          year?: number | null
          year_raw?: string | null
        }
        Relationships: []
      }
      olympic_medals_legacy: {
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
          year: number | null
          year_raw: string | null
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
          year?: number | null
          year_raw?: string | null
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
          year?: number | null
          year_raw?: string | null
        }
        Relationships: []
      }
      olympic_participation_legacy: {
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
          assignment_type: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string
          organization: string | null
          requested_centre_id: string | null
          requested_region_id: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_type?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          last_login?: string | null
          name: string
          organization?: string | null
          requested_centre_id?: string | null
          requested_region_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_type?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          organization?: string | null
          requested_centre_id?: string | null
          requested_region_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_requested_region_id_fkey"
            columns: ["requested_region_id"]
            isOneToOne: false
            referencedRelation: "regional_centres"
            referencedColumns: ["id"]
          },
        ]
      }
      region_state_mappings: {
        Row: {
          created_at: string
          id: string
          region_id: string
          state_name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          region_id: string
          state_name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          region_id?: string
          state_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "region_state_mappings_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regional_centres"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_centres: {
        Row: {
          created_at: string
          display_name: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      sai_projects: {
        Row: {
          created_at: string
          gps_in_india: boolean
          infra_type: string | null
          latitude: number | null
          longitude: number | null
          parent_centre_id: string | null
          parent_facility_id: string | null
          parent_facility_name: string | null
          parent_is_ncoe: boolean | null
          progress: number | null
          project_code: string
          project_name: string
          remarks: string | null
          sort_order: number | null
          state: string
          status: string
          without_gps_images: boolean | null
        }
        Insert: {
          created_at?: string
          gps_in_india?: boolean
          infra_type?: string | null
          latitude?: number | null
          longitude?: number | null
          parent_centre_id?: string | null
          parent_facility_id?: string | null
          parent_facility_name?: string | null
          parent_is_ncoe?: boolean | null
          progress?: number | null
          project_code: string
          project_name: string
          remarks?: string | null
          sort_order?: number | null
          state: string
          status: string
          without_gps_images?: boolean | null
        }
        Update: {
          created_at?: string
          gps_in_india?: boolean
          infra_type?: string | null
          latitude?: number | null
          longitude?: number | null
          parent_centre_id?: string | null
          parent_facility_id?: string | null
          parent_facility_name?: string | null
          parent_is_ncoe?: boolean | null
          progress?: number | null
          project_code?: string
          project_name?: string
          remarks?: string | null
          sort_order?: number | null
          state?: string
          status?: string
          without_gps_images?: boolean | null
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
          category_list: string | null
          created_at: string | null
          discipline_labels_from_image: string | null
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
          present_in_asmita_nis_sheet: boolean | null
          present_in_tops_tagg_teams_list: boolean | null
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
          category_list?: string | null
          created_at?: string | null
          discipline_labels_from_image?: string | null
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
          present_in_asmita_nis_sheet?: boolean | null
          present_in_tops_tagg_teams_list?: boolean | null
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
          category_list?: string | null
          created_at?: string | null
          discipline_labels_from_image?: string | null
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
          present_in_asmita_nis_sheet?: boolean | null
          present_in_tops_tagg_teams_list?: boolean | null
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
      stc_competition_summary: {
        Row: {
          assessment_id: string
          centre_id: string
          competition_level: string
          created_at: string | null
          id: string
          medals_count: number | null
          participations_count: number | null
          top8_count: number | null
        }
        Insert: {
          assessment_id: string
          centre_id: string
          competition_level: string
          created_at?: string | null
          id?: string
          medals_count?: number | null
          participations_count?: number | null
          top8_count?: number | null
        }
        Update: {
          assessment_id?: string
          centre_id?: string
          competition_level?: string
          created_at?: string | null
          id?: string
          medals_count?: number | null
          participations_count?: number | null
          top8_count?: number | null
        }
        Relationships: []
      }
      stc_detailed_data: {
        Row: {
          assessment_id: string | null
          assessment_year: number | null
          athlete_details: Json | null
          centre_id: string
          centre_identity: Json | null
          centre_name: string | null
          challenges: Json | null
          created_at: string
          current_section: number | null
          data_quality_flags: Json | null
          derived_kpis: Json | null
          equipment_inventory: Json | null
          form_progress: number | null
          form_version: number | null
          hostel_facilities: Json | null
          id: string
          infrastructure: Json | null
          is_submitted: boolean | null
          last_section_completed: string | null
          medical_facilities: Json | null
          region: string | null
          respondent: Json | null
          scoring: Json | null
          staff_details: Json | null
          state: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          assessment_id?: string | null
          assessment_year?: number | null
          athlete_details?: Json | null
          centre_id: string
          centre_identity?: Json | null
          centre_name?: string | null
          challenges?: Json | null
          created_at?: string
          current_section?: number | null
          data_quality_flags?: Json | null
          derived_kpis?: Json | null
          equipment_inventory?: Json | null
          form_progress?: number | null
          form_version?: number | null
          hostel_facilities?: Json | null
          id?: string
          infrastructure?: Json | null
          is_submitted?: boolean | null
          last_section_completed?: string | null
          medical_facilities?: Json | null
          region?: string | null
          respondent?: Json | null
          scoring?: Json | null
          staff_details?: Json | null
          state?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          assessment_id?: string | null
          assessment_year?: number | null
          athlete_details?: Json | null
          centre_id?: string
          centre_identity?: Json | null
          centre_name?: string | null
          challenges?: Json | null
          created_at?: string
          current_section?: number | null
          data_quality_flags?: Json | null
          derived_kpis?: Json | null
          equipment_inventory?: Json | null
          form_progress?: number | null
          form_version?: number | null
          hostel_facilities?: Json | null
          id?: string
          infrastructure?: Json | null
          is_submitted?: boolean | null
          last_section_completed?: string | null
          medical_facilities?: Json | null
          region?: string | null
          respondent?: Json | null
          scoring?: Json | null
          staff_details?: Json | null
          state?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stc_discipline_strength: {
        Row: {
          assessment_id: string
          centre_id: string
          created_at: string | null
          discipline_code: string
          discipline_name: string | null
          equipment_adequacy_status: string | null
          existing_nonres_boys: number | null
          existing_nonres_girls: number | null
          existing_res_boys: number | null
          existing_res_girls: number | null
          existing_total: number | null
          facility_availability_status: string | null
          facility_distance_km: number | null
          facility_partner_name: string | null
          fop_condition_rating: number | null
          fop_count: number | null
          fop_location: string | null
          fop_maintenance_status: string | null
          fop_primary_type: string | null
          fop_surface_type: string | null
          id: string
          notes: string | null
          sanctioned_nonres_boys: number | null
          sanctioned_nonres_girls: number | null
          sanctioned_res_boys: number | null
          sanctioned_res_girls: number | null
          sanctioned_total: number | null
          surplus_total: number | null
          updated_at: string | null
          utilization_rate: number | null
          vacancy_total: number | null
        }
        Insert: {
          assessment_id: string
          centre_id: string
          created_at?: string | null
          discipline_code: string
          discipline_name?: string | null
          equipment_adequacy_status?: string | null
          existing_nonres_boys?: number | null
          existing_nonres_girls?: number | null
          existing_res_boys?: number | null
          existing_res_girls?: number | null
          existing_total?: number | null
          facility_availability_status?: string | null
          facility_distance_km?: number | null
          facility_partner_name?: string | null
          fop_condition_rating?: number | null
          fop_count?: number | null
          fop_location?: string | null
          fop_maintenance_status?: string | null
          fop_primary_type?: string | null
          fop_surface_type?: string | null
          id?: string
          notes?: string | null
          sanctioned_nonres_boys?: number | null
          sanctioned_nonres_girls?: number | null
          sanctioned_res_boys?: number | null
          sanctioned_res_girls?: number | null
          sanctioned_total?: number | null
          surplus_total?: number | null
          updated_at?: string | null
          utilization_rate?: number | null
          vacancy_total?: number | null
        }
        Update: {
          assessment_id?: string
          centre_id?: string
          created_at?: string | null
          discipline_code?: string
          discipline_name?: string | null
          equipment_adequacy_status?: string | null
          existing_nonres_boys?: number | null
          existing_nonres_girls?: number | null
          existing_res_boys?: number | null
          existing_res_girls?: number | null
          existing_total?: number | null
          facility_availability_status?: string | null
          facility_distance_km?: number | null
          facility_partner_name?: string | null
          fop_condition_rating?: number | null
          fop_count?: number | null
          fop_location?: string | null
          fop_maintenance_status?: string | null
          fop_primary_type?: string | null
          fop_surface_type?: string | null
          id?: string
          notes?: string | null
          sanctioned_nonres_boys?: number | null
          sanctioned_nonres_girls?: number | null
          sanctioned_res_boys?: number | null
          sanctioned_res_girls?: number | null
          sanctioned_total?: number | null
          surplus_total?: number | null
          updated_at?: string | null
          utilization_rate?: number | null
          vacancy_total?: number | null
        }
        Relationships: []
      }
      stc_equipment_gaps: {
        Row: {
          assessment_id: string
          centre_id: string
          created_at: string | null
          discipline_code: string | null
          gap_item_name: string
          gap_priority: string | null
          gap_qty_required: number | null
          id: string
        }
        Insert: {
          assessment_id: string
          centre_id: string
          created_at?: string | null
          discipline_code?: string | null
          gap_item_name: string
          gap_priority?: string | null
          gap_qty_required?: number | null
          id?: string
        }
        Update: {
          assessment_id?: string
          centre_id?: string
          created_at?: string | null
          discipline_code?: string | null
          gap_item_name?: string
          gap_priority?: string | null
          gap_qty_required?: number | null
          id?: string
        }
        Relationships: []
      }
      stc_staff_roster: {
        Row: {
          assessment_id: string
          centre_id: string
          created_at: string | null
          dedicated_to_stc: boolean | null
          discipline_code: string | null
          division_responsibility: string[] | null
          employment_nature: string | null
          id: string
          posted_since_date: string | null
          staff_designation: string | null
          staff_name: string | null
          staff_type: string
        }
        Insert: {
          assessment_id: string
          centre_id: string
          created_at?: string | null
          dedicated_to_stc?: boolean | null
          discipline_code?: string | null
          division_responsibility?: string[] | null
          employment_nature?: string | null
          id?: string
          posted_since_date?: string | null
          staff_designation?: string | null
          staff_name?: string | null
          staff_type: string
        }
        Update: {
          assessment_id?: string
          centre_id?: string
          created_at?: string | null
          dedicated_to_stc?: boolean | null
          discipline_code?: string | null
          division_responsibility?: string[] | null
          employment_nature?: string | null
          id?: string
          posted_since_date?: string | null
          staff_designation?: string | null
          staff_name?: string | null
          staff_type?: string
        }
        Relationships: []
      }
      user_centre_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          centre_id: string
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          centre_id: string
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          centre_id?: string
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_region_assignments: {
        Row: {
          access_level: string | null
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          region_id: string
          user_id: string
        }
        Insert: {
          access_level?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          region_id: string
          user_id: string
        }
        Update: {
          access_level?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          region_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_region_assignments_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regional_centres"
            referencedColumns: ["id"]
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
      user_table_permissions: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          table_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          table_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_centre: {
        Args: { _centre_id: string; _user_id: string }
        Returns: boolean
      }
      can_edit_table: {
        Args: { _table_name: string; _user_id: string }
        Returns: boolean
      }
      can_view_centre: {
        Args: { _centre_id: string; _user_id: string }
        Returns: boolean
      }
      get_user_accessible_centres: {
        Args: { _user_id: string }
        Returns: {
          centre_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      setup_first_admin: { Args: { _user_id: string }; Returns: boolean }
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
