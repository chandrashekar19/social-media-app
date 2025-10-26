import { createClient } from "@supabase/supabase-js";

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL as string,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  userTable: import.meta.env.VITE_SUPABASE_USER_TABLE,
  postTable: import.meta.env.VITE_SUPABASE_POST_TABLE,
  savesTable: import.meta.env.VITE_SUPABASE_SAVES_TABLE,
  storageBucket: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET,
};


// Create Supabase Client
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
