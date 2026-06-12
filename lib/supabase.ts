import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables"
      );
    }

    client = createClient(url, anonKey);
  }
  return client;
}

export type Tag = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  destination_url: string | null;
  claimed: boolean;
  created_at: string;
};
