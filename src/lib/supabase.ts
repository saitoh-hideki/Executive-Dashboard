import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type KPI = {
  id: string;
  code: string;
  name: string;
  description?: string;
  unit_type: 'ratio' | 'currency' | 'count' | 'index' | 'per_capita';
  aggregation: 'sum' | 'avg' | 'median' | 'custom';
  source_type: 'manual' | 'internal' | 'external';
  source_connector?: string;
  calc_formula?: string;
  thresholds?: {
    goal?: number;
    warn?: number;
  };
  dimensions?: string[];
  visible_roles?: string[];
};

export type KPISnapshot = {
  id: number;
  org_id: string;
  department_id?: string;
  kpi_id: string;
  period_date: string;
  value: number;
  meta?: any;
  created_at: string;
  kpi?: KPI;
};

export type Organization = {
  id: string;
  name: string;
};

export type Department = {
  id: string;
  org_id: string;
  name: string;
};