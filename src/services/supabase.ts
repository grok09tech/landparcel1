import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      parcels: {
        Row: {
          id: number;
          parcel_id: string;
          geometry: any; // PostGIS geometry
          region: string;
          district: string | null;
          ward: string | null;
          area_sqm: number | null;
          perimeter_m: number | null;
          owner_name: string | null;
          owner_id: string | null;
          address: string | null;
          land_use: string | null;
          zoning: string | null;
          valuation: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          parcel_id: string;
          geometry: any;
          region: string;
          district?: string | null;
          ward?: string | null;
          area_sqm?: number | null;
          perimeter_m?: number | null;
          owner_name?: string | null;
          owner_id?: string | null;
          address?: string | null;
          land_use?: string | null;
          zoning?: string | null;
          valuation?: number | null;
        };
        Update: {
          parcel_id?: string;
          geometry?: any;
          region?: string;
          district?: string | null;
          ward?: string | null;
          area_sqm?: number | null;
          perimeter_m?: number | null;
          owner_name?: string | null;
          owner_id?: string | null;
          address?: string | null;
          land_use?: string | null;
          zoning?: string | null;
          valuation?: number | null;
        };
      };
      shapefile_imports: {
        Row: {
          id: number;
          filename: string | null;
          upload_date: string;
          processed_date: string | null;
          status: string | null;
          records_count: number | null;
          error_log: string | null;
        };
        Insert: {
          filename?: string | null;
          processed_date?: string | null;
          status?: string | null;
          records_count?: number | null;
          error_log?: string | null;
        };
        Update: {
          filename?: string | null;
          processed_date?: string | null;
          status?: string | null;
          records_count?: number | null;
          error_log?: string | null;
        };
      };
    };
  };
}