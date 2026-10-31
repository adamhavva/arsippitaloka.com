import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Supabase client untuk Server Components / Route Handlers / Server Actions.
 *
 * Dipakai untuk query tabel lewat Data API (REST), berdampingan dengan Prisma.
 * Memakai publishable key (aman di sisi klien), jadi query tunduk pada RLS —
 * pastikan tabel yang diakses sudah di-expose ke Data API dan punya policy RLS.
 *
 * Catatan: proyek ini memakai NextAuth untuk sesi, bukan Supabase Auth. Adapter
 * cookie di sini dibiarkan agar helper tetap siap bila nanti Supabase Auth
 * diaktifkan; tanpa sesi Supabase, cookie auth tidak akan ditemukan (tidak apa).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Dipanggil dari Server Component — abaikan. Refresh sesi (kalau
          // nanti pakai Supabase Auth) dilakukan di middleware/route handler.
        }
      },
    },
  });
}
