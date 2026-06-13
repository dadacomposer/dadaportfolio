import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vqirisbdwkrzqsofqtlb.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxaXJpc2Jkd2tyenFzb2ZxdGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzkxMDQsImV4cCI6MjA5Njk1NTEwNH0.HK3rn1CGT2xeoOETPNji9jHUkqosFruZyflZ5M4PvP4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

