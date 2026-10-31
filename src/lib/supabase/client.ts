import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Supabase client untuk Client Components (browser).
 *
 * Memakai publishable key (NEXT_PUBLIC_*), jadi query tunduk pada RLS.
 */
export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!);
