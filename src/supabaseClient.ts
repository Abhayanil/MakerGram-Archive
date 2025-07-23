import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmxschcnzsetrexxpjlm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZteHNjaGNuenNldHJleHhwamxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTAyMTQsImV4cCI6MjA2ODgyNjIxNH0.M85AbJklOn3BYlscux2LTogcEhhgqH22gul__lvPv2Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
