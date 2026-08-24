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
            foreignKeyName: "centre_sport_links_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "kd_v_sport_centres"
            referencedColumns: ["centre_id"]
          },
          {
            foreignKeyName: "centre_sport_links_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "centre_sport_links_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
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
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "disciplines_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
          },
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
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "event_overlap_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
          },
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
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "events_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
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
      kd_state_alias: {
        Row: {
          note: string | null
          relation: string
          state_canonical: string
          state_raw: string
        }
        Insert: {
          note?: string | null
          relation: string
          state_canonical: string
          state_raw: string
        }
        Update: {
          note?: string | null
          relation?: string
          state_canonical?: string
          state_raw?: string
        }
        Relationships: []
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
            foreignKeyName: "ncoe_capacity_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "kd_v_sport_centres"
            referencedColumns: ["centre_id"]
          },
          {
            foreignKeyName: "ncoe_capacity_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "ncoe_capacity_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
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
      oly_athlete_alias: {
        Row: {
          birth_year: number | null
          canonical_athlete_id: string
          canonical_name: string | null
          confidence: number | null
          created_at: string | null
          duplicate_athlete_id: string
          duplicate_name: string | null
          kd_sport_id: string | null
          method: string | null
          note: string | null
        }
        Insert: {
          birth_year?: number | null
          canonical_athlete_id: string
          canonical_name?: string | null
          confidence?: number | null
          created_at?: string | null
          duplicate_athlete_id: string
          duplicate_name?: string | null
          kd_sport_id?: string | null
          method?: string | null
          note?: string | null
        }
        Update: {
          birth_year?: number | null
          canonical_athlete_id?: string
          canonical_name?: string | null
          confidence?: number | null
          created_at?: string | null
          duplicate_athlete_id?: string
          duplicate_name?: string | null
          kd_sport_id?: string | null
          method?: string | null
          note?: string | null
        }
        Relationships: []
      }
      oly_athletes: {
        Row: {
          athlete_id: string
          birth_date: string | null
          birth_place: string | null
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
          birth_date?: string | null
          birth_place?: string | null
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
          birth_date?: string | null
          birth_place?: string | null
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
      oly_country_momentum_cache: {
        Row: {
          country_noc: string | null
          divergent_events: number | null
          events_live: number | null
          medal_gain: number | null
          refreshed_at: string | null
          season: string | null
          top8_gain: number | null
          topdecile_gain: number | null
        }
        Insert: {
          country_noc?: string | null
          divergent_events?: number | null
          events_live?: number | null
          medal_gain?: number | null
          refreshed_at?: string | null
          season?: string | null
          top8_gain?: number | null
          topdecile_gain?: number | null
        }
        Update: {
          country_noc?: string | null
          divergent_events?: number | null
          events_live?: number | null
          medal_gain?: number | null
          refreshed_at?: string | null
          season?: string | null
          top8_gain?: number | null
          topdecile_gain?: number | null
        }
        Relationships: []
      }
      oly_discipline_age_cache: {
        Row: {
          age_gap_yrs: number | null
          birth_cohort_for_2028: number | null
          birth_cohort_for_2036: number | null
          canonical_discipline: string | null
          entrant_age_p50: number | null
          era: string | null
          india_age_p50: number | null
          india_entrants_n: number | null
          medal_age_p10: number | null
          medal_age_p50: number | null
          medal_age_p90: number | null
          medal_age_window: number | null
          medallists_n: number | null
          refreshed_at: string | null
          season: string | null
        }
        Insert: {
          age_gap_yrs?: number | null
          birth_cohort_for_2028?: number | null
          birth_cohort_for_2036?: number | null
          canonical_discipline?: string | null
          entrant_age_p50?: number | null
          era?: string | null
          india_age_p50?: number | null
          india_entrants_n?: number | null
          medal_age_p10?: number | null
          medal_age_p50?: number | null
          medal_age_p90?: number | null
          medal_age_window?: number | null
          medallists_n?: number | null
          refreshed_at?: string | null
          season?: string | null
        }
        Update: {
          age_gap_yrs?: number | null
          birth_cohort_for_2028?: number | null
          birth_cohort_for_2036?: number | null
          canonical_discipline?: string | null
          entrant_age_p50?: number | null
          era?: string | null
          india_age_p50?: number | null
          india_entrants_n?: number | null
          medal_age_p10?: number | null
          medal_age_p50?: number | null
          medal_age_p90?: number | null
          medal_age_window?: number | null
          medallists_n?: number | null
          refreshed_at?: string | null
          season?: string | null
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
      oly_event_alias: {
        Row: {
          canonical_discipline: string
          canonical_event_name: string
          created_at: string
          method: string
          note: string | null
          paris_event_name: string
          relation: string
        }
        Insert: {
          canonical_discipline: string
          canonical_event_name: string
          created_at?: string
          method: string
          note?: string | null
          paris_event_name: string
          relation?: string
        }
        Update: {
          canonical_discipline?: string
          canonical_event_name?: string
          created_at?: string
          method?: string
          note?: string | null
          paris_event_name?: string
          relation?: string
        }
        Relationships: []
      }
      oly_event_board_cache: {
        Row: {
          alltime_leader_medals: number | null
          alltime_leader_noc: string | null
          alltime_leader_share_pct: number | null
          best_place_recent: number | null
          best_year: number | null
          board_tier: string | null
          canonical_discipline: string | null
          canonical_event: string | null
          depth_year: number | null
          distance_to_podium: number | null
          editions: number | null
          era_winners: string | null
          field_units: number | null
          first_year: number | null
          games_contested_recent: number | null
          games_held_recent: number | null
          gold_streak_len: number | null
          gold_streak_noc: string | null
          hhi: number | null
          is_team_event: boolean | null
          kd_sport_id: string | null
          last_year: number | null
          last3_leader_noc: string | null
          medalist_nations: number | null
          medals_total: number | null
          nations_medalling_recent: number | null
          openness_band: string | null
          pipeline_archetype: string | null
          pipeline_athletes: number | null
          ranked_coverage: number | null
          refreshed_at: string | null
          season: string | null
          trail: string | null
          trend: string | null
        }
        Insert: {
          alltime_leader_medals?: number | null
          alltime_leader_noc?: string | null
          alltime_leader_share_pct?: number | null
          best_place_recent?: number | null
          best_year?: number | null
          board_tier?: string | null
          canonical_discipline?: string | null
          canonical_event?: string | null
          depth_year?: number | null
          distance_to_podium?: number | null
          editions?: number | null
          era_winners?: string | null
          field_units?: number | null
          first_year?: number | null
          games_contested_recent?: number | null
          games_held_recent?: number | null
          gold_streak_len?: number | null
          gold_streak_noc?: string | null
          hhi?: number | null
          is_team_event?: boolean | null
          kd_sport_id?: string | null
          last_year?: number | null
          last3_leader_noc?: string | null
          medalist_nations?: number | null
          medals_total?: number | null
          nations_medalling_recent?: number | null
          openness_band?: string | null
          pipeline_archetype?: string | null
          pipeline_athletes?: number | null
          ranked_coverage?: number | null
          refreshed_at?: string | null
          season?: string | null
          trail?: string | null
          trend?: string | null
        }
        Update: {
          alltime_leader_medals?: number | null
          alltime_leader_noc?: string | null
          alltime_leader_share_pct?: number | null
          best_place_recent?: number | null
          best_year?: number | null
          board_tier?: string | null
          canonical_discipline?: string | null
          canonical_event?: string | null
          depth_year?: number | null
          distance_to_podium?: number | null
          editions?: number | null
          era_winners?: string | null
          field_units?: number | null
          first_year?: number | null
          games_contested_recent?: number | null
          games_held_recent?: number | null
          gold_streak_len?: number | null
          gold_streak_noc?: string | null
          hhi?: number | null
          is_team_event?: boolean | null
          kd_sport_id?: string | null
          last_year?: number | null
          last3_leader_noc?: string | null
          medalist_nations?: number | null
          medals_total?: number | null
          nations_medalling_recent?: number | null
          openness_band?: string | null
          pipeline_archetype?: string | null
          pipeline_athletes?: number | null
          ranked_coverage?: number | null
          refreshed_at?: string | null
          season?: string | null
          trail?: string | null
          trend?: string | null
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
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "olympic_medals_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
          },
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
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "olympic_participation_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
          },
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
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "olympic_timeline_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
          },
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
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "sport_notes_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
          },
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
            foreignKeyName: "stc_capacity_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "kd_v_sport_centres"
            referencedColumns: ["centre_id"]
          },
          {
            foreignKeyName: "stc_capacity_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "stc_capacity_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
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
      stg_athlete_birth: {
        Row: {
          athlete_id: string
          birth_date_raw: string | null
          birth_place: string | null
        }
        Insert: {
          athlete_id: string
          birth_date_raw?: string | null
          birth_place?: string | null
        }
        Update: {
          athlete_id?: string
          birth_date_raw?: string | null
          birth_place?: string | null
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
      kd_v_sport_centre_capacity: {
        Row: {
          centre_id: string | null
          centre_name: string | null
          centre_type: string | null
          district: string | null
          existing: number | null
          existing_girls: number | null
          has_para: boolean | null
          is_mappable: boolean | null
          sanctioned: number | null
          sanctioned_girls: number | null
          sport_id: string | null
          state: string | null
        }
        Relationships: []
      }
      kd_v_sport_centres: {
        Row: {
          centre_id: string | null
          centre_name: string | null
          centre_type: string | null
          district: string | null
          is_mappable: boolean | null
          latitude: number | null
          longitude: number | null
          operational_status: string | null
          region_unit: string | null
          sport_id: string | null
          sport_name: string | null
          state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centre_sport_links_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "centre_sport_links_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
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
      kd_v_sport_funds: {
        Row: {
          centre_name: string | null
          financial_year: string | null
          fund_id: number | null
          funds_released: number | null
          head: string | null
          kd_centre_id: string | null
          release_date: string | null
          sport_id: string | null
          state: string | null
          uc_pending: boolean | null
          uc_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centre_sport_links_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "centre_sport_links_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
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
      kd_v_sport_projects: {
        Row: {
          gps_in_india: boolean | null
          infra_type: string | null
          latitude: number | null
          longitude: number | null
          parent_centre_id: string | null
          parent_facility_name: string | null
          progress: number | null
          project_code: string | null
          project_name: string | null
          sport_id: string | null
          state: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centre_sport_links_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "centre_sport_links_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
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
      kd_v_sport_state: {
        Row: {
          centres: number | null
          centres_mappable: number | null
          existing: number | null
          kic: number | null
          kisce: number | null
          ncoe: number | null
          sanctioned: number | null
          sport_id: string | null
          sport_name: string | null
          state: string | null
          stc: number | null
        }
        Relationships: [
          {
            foreignKeyName: "centre_sport_links_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_pipeline"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "centre_sport_links_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "oly_v_sport_india"
            referencedColumns: ["kd_sport_id"]
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
      oly_v_athlete_career: {
        Row: {
          athletes: number | null
          avg_games_to_first_medal: number | null
          canonical_discipline: string | null
          debut_age_medallists: number | null
          debut_age_non_medallists: number | null
          first_medal_on_debut: number | null
          medallists: number | null
          medallists_multigames: number | null
          pct_on_debut_multigames: number | null
          pct_on_debut_raw: number | null
          season: string | null
        }
        Relationships: []
      }
      oly_v_athlete_games: {
        Row: {
          age: number | null
          athlete_id: string | null
          best_place: number | null
          country_noc: string | null
          events_entered: number | null
          games_no: number | null
          is_debut: boolean | null
          is_first_medal: boolean | null
          kd_sport_id: string | null
          medal_that_year: boolean | null
          primary_discipline: string | null
          season: string | null
          total_games: number | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_athlete_origin: {
        Row: {
          alias_relation: string | null
          appearances: number | null
          athlete_id: string | null
          birth_date: string | null
          birth_place: string | null
          birth_year: number | null
          city_raw: string | null
          display_name: string | null
          gender: string | null
          kd_sport_id: string | null
          medals: number | null
          state_canonical: string | null
          state_raw: string | null
          state_resolved: boolean | null
        }
        Relationships: []
      }
      oly_v_country_cycle: {
        Row: {
          athletes_sent: number | null
          bronze: number | null
          country_name: string | null
          country_noc: string | null
          edition_seq: number | null
          gold: number | null
          medals_per_100_athletes: number | null
          rolling3_gold: number | null
          rolling3_total: number | null
          silver: number | null
          total: number | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_country_games_strike: {
        Row: {
          athletes: number | null
          country_noc: string | null
          era: string | null
          events_contested: number | null
          events_medalled: number | null
          season: string | null
          strike_rate_pct: number | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_discipline_age: {
        Row: {
          age_gap_yrs: number | null
          birth_cohort_for_2028: number | null
          birth_cohort_for_2036: number | null
          canonical_discipline: string | null
          entrant_age_p50: number | null
          era: string | null
          india_age_p50: number | null
          india_entrants_n: number | null
          medal_age_p10: number | null
          medal_age_p50: number | null
          medal_age_p90: number | null
          medal_age_window: number | null
          medallists_n: number | null
          season: string | null
        }
        Relationships: []
      }
      oly_v_event_dominance: {
        Row: {
          alltime_leader_golds: number | null
          alltime_leader_medals: number | null
          alltime_leader_noc: string | null
          alltime_leader_share_pct: number | null
          canonical_discipline: string | null
          canonical_event: string | null
          editions: number | null
          era_winners: string | null
          first_year: number | null
          gold_streak_from: number | null
          gold_streak_len: number | null
          gold_streak_noc: string | null
          gold_streak_to: number | null
          hhi: number | null
          last_year: number | null
          last3_leader_golds: number | null
          last3_leader_medals: number | null
          last3_leader_noc: string | null
          medalist_nations: number | null
          medals_total: number | null
          season: string | null
        }
        Relationships: []
      }
      oly_v_event_field_depth: {
        Row: {
          athletes: number | null
          canonical_discipline: string | null
          canonical_event: string | null
          depth_index: number | null
          field_units: number | null
          is_team_event: boolean | null
          nations: number | null
          ranked_coverage: number | null
          ranked_positions: number | null
          season: string | null
          top_decile_cutoff: number | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_event_history: {
        Row: {
          bronze_noc: string | null
          canonical_discipline: string | null
          canonical_event: string | null
          entrants: number | null
          gold_noc: string | null
          india_best_place: number | null
          india_entrants: number | null
          kd_sport_id: string | null
          medal_rows: number | null
          nations: number | null
          season: string | null
          silver_noc: string | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_event_india: {
        Row: {
          alltime_leader_medals: number | null
          alltime_leader_noc: string | null
          canonical_discipline: string | null
          canonical_event: string | null
          event_editions: number | null
          event_first_year: number | null
          event_last_year: number | null
          hhi: number | null
          india_athletes: number | null
          india_best_athletes: string | null
          india_best_place: number | null
          india_best_year: number | null
          india_editions: number | null
          india_entries: number | null
          india_first_year: number | null
          india_last_year: number | null
          kd_sport_id: string | null
          last3_leader_medals: number | null
          last3_leader_noc: string | null
          medalist_nations: number | null
          on_2024_programme: boolean | null
          pipeline_archetype: string | null
          pipeline_athletes: number | null
          season: string | null
        }
        Relationships: []
      }
      oly_v_event_proximity: {
        Row: {
          best_place_recent: number | null
          best_year: number | null
          canonical_discipline: string | null
          canonical_event: string | null
          distance_to_podium: number | null
          games_contested_recent: number | null
          games_held_recent: number | null
          kd_sport_id: string | null
          nations_medalling_recent: number | null
          pipeline_archetype: string | null
          pipeline_athletes: number | null
          season: string | null
          trail: string | null
          trend: string | null
        }
        Relationships: []
      }
      oly_v_event_risers: {
        Row: {
          canonical_discipline: string | null
          canonical_event: string | null
          country_noc: string | null
          event_last_year: number | null
          medal_gain: number | null
          medals_last3: number | null
          medals_prev3: number | null
          season: string | null
          top8_gain: number | null
          top8_last3: number | null
          top8_prev3: number | null
          topdecile_gain: number | null
          topdecile_last3: number | null
          topdecile_prev3: number | null
        }
        Relationships: []
      }
      oly_v_gender: {
        Row: {
          country_noc: string | null
          gender: string | null
          kd_sport_id: string | null
          medal_rows: number | null
          medalists: number | null
          season: string | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_host_bump: {
        Row: {
          baseline: number | null
          baseline_editions: number | null
          bump: number | null
          bump_pct: number | null
          host_country_noc: string | null
          host_medals: number | null
          host_name: string | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_india_biometrics: {
        Row: {
          gender: string | null
          kd_sport_id: string | null
          max_height_cm: number | null
          median_height_cm: number | null
          median_weight_kg: number | null
          min_height_cm: number | null
          n_height: number | null
          n_weight: number | null
          sport_n_height: number | null
          sport_name: string | null
        }
        Relationships: []
      }
      oly_v_india_medalists: {
        Row: {
          athlete_id: string | null
          athlete_name: string | null
          birth_year: number | null
          canonical_discipline: string | null
          event: string | null
          gender: string | null
          kd_sport_id: string | null
          medal_type: string | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_india_near_miss_events: {
        Row: {
          athlete_count: number | null
          athletes: string | null
          canonical_discipline: string | null
          event_name: string | null
          is_medal: boolean | null
          kd_sport_id: string | null
          place: number | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_india_olympians: {
        Row: {
          appearances: number | null
          athlete_id: string | null
          best_place: number | null
          birth_year: number | null
          bronze: number | null
          display_name: string | null
          entry_rows: number | null
          events_contested: number | null
          first_year: number | null
          fourth_places: number | null
          gender: string | null
          gold: number | null
          height_cm: number | null
          kd_sport_id: string | null
          last_year: number | null
          medals: number | null
          silver: number | null
          sport_name: string | null
          top8_entries: number | null
          weight_kg: number | null
        }
        Relationships: []
      }
      oly_v_india_sport_timeline: {
        Row: {
          athletes: number | null
          bronze: number | null
          entries: number | null
          entries_without_place: number | null
          events_contested: number | null
          female_athletes: number | null
          fourth_entries: number | null
          gold: number | null
          kd_sport_id: string | null
          male_athletes: number | null
          medals: number | null
          silver: number | null
          top8_entries: number | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_leaps: {
        Row: {
          country_name: string | null
          country_noc: string | null
          from_avg: number | null
          from_year: number | null
          gain: number | null
          gain_rank_in_country: number | null
          horizon: number | null
          ratio: number | null
          to_avg: number | null
          to_year: number | null
        }
        Relationships: []
      }
      oly_v_medal_table: {
        Row: {
          bronze: number | null
          country_name: string | null
          country_noc: string | null
          edition_id: number | null
          gold: number | null
          host_city: string | null
          host_country_noc: string | null
          nations_ranked: number | null
          rank_gold: number | null
          rank_total: number | null
          season: string | null
          silver: number | null
          total: number | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_near_miss: {
        Row: {
          canonical_discipline: string | null
          conversion: number | null
          country_noc: string | null
          event_entries: number | null
          fourth: number | null
          kd_sport_id: string | null
          medals: number | null
          top8: number | null
          top8_no_medal: number | null
        }
        Relationships: []
      }
      oly_v_participations_canon: {
        Row: {
          athlete_id: string | null
          canonical_discipline: string | null
          canonical_event: string | null
          country_noc: string | null
          data_completeness: string | null
          edition_id: number | null
          event_alias_relation: string | null
          event_name: string | null
          event_was_realigned: boolean | null
          is_medal_winning: boolean | null
          kd_sport_id: string | null
          participation_id: number | null
          result_place: string | null
          season: string | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_pipeline: {
        Row: {
          ag2026_events: number | null
          archetype: string | null
          centres_linked: number | null
          centres_mappable: number | null
          existing_athletes: number | null
          india_bronze: number | null
          india_conversion: number | null
          india_conversion_is_reliable: boolean | null
          india_female_olympians: number | null
          india_first_medal_year: number | null
          india_first_year: number | null
          india_fourth: number | null
          india_games: number | null
          india_gold: number | null
          india_last_medal_year: number | null
          india_last_year: number | null
          india_medals: number | null
          india_medals_last3: number | null
          india_olympians: number | null
          india_place_coverage_pct: number | null
          india_podium_finishes: number | null
          india_silver: number | null
          india_top8: number | null
          india_top8_no_medal: number | null
          india_with_biometrics: number | null
          is_tagg: boolean | null
          is_teams: boolean | null
          is_tops: boolean | null
          kic_centres: number | null
          kisce_centres: number | null
          la28_events: number | null
          medals_per_100_trainees: number | null
          ncoe_centres: number | null
          present_ag2026: boolean | null
          present_la28: boolean | null
          sanctioned_capacity: number | null
          sport_category: string | null
          sport_id: string | null
          sport_name: string | null
          states: number | null
          stc_centres: number | null
          trainees_per_la28_event: number | null
          utilisation_pct: number | null
          world_gold_events_last3: number | null
          world_hhi: number | null
          world_leader_medals: number | null
          world_leader_name: string | null
          world_leader_noc: string | null
          world_nations_last3: number | null
          world_openness: number | null
        }
        Relationships: []
      }
      oly_v_rca: {
        Row: {
          canonical_discipline: string | null
          country_medals: number | null
          country_name: string | null
          country_noc: string | null
          era: string | null
          kd_sport_id: string | null
          medals: number | null
          rca: number | null
          sport_share_of_country: number | null
          world_sport_share: number | null
        }
        Relationships: []
      }
      oly_v_sport_country_year: {
        Row: {
          bronze: number | null
          country_name: string | null
          country_noc: string | null
          gold: number | null
          kd_sport_id: string | null
          silver: number | null
          sport_name: string | null
          total: number | null
          year: number | null
        }
        Relationships: []
      }
      oly_v_sport_discipline_map: {
        Row: {
          canonical_discipline: string | null
          kd_sport_id: string | null
          last_year: number | null
          participation_rows: number | null
          season: string | null
        }
        Relationships: []
      }
      oly_v_sport_india: {
        Row: {
          bronze: number | null
          conversion: number | null
          conversion_is_reliable: boolean | null
          entries_all: number | null
          entries_with_place: number | null
          event_entries: number | null
          female_olympians: number | null
          first_medal_year: number | null
          first_year: number | null
          fourth: number | null
          games_contested: number | null
          gold: number | null
          gold_last3: number | null
          kd_sport_id: string | null
          last_medal_year: number | null
          last_year: number | null
          medals: number | null
          medals_last3: number | null
          olympians: number | null
          place_coverage_pct: number | null
          podium_finishes: number | null
          silver: number | null
          sport_name: string | null
          top8: number | null
          top8_no_medal: number | null
          with_biometrics: number | null
        }
        Relationships: []
      }
      oly_v_sport_world: {
        Row: {
          era: string | null
          gold_events: number | null
          hhi: number | null
          kd_sport_id: string | null
          leader_medals: number | null
          leader_name: string | null
          leader_noc: string | null
          medals: number | null
          nations_medalling: number | null
          openness: number | null
          sport_name: string | null
        }
        Relationships: []
      }
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
      refresh_country_momentum_cache: { Args: never; Returns: number }
      refresh_discipline_age_cache: { Args: never; Returns: number }
      refresh_event_board_cache: { Args: never; Returns: number }
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
