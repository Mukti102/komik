import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Tambahkan proteksi agar tidak crash jika env belum siap
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Wah! Kunci Supabase belum terpasang di .env.local");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

if (supabaseUrl && supabaseAnonKey) {
  supabase
    .from("leaderboards") // sesuaikan dengan nama tabelmu
    .select("id", { count: "exact", head: true })
    .then(({ error }) => {
      if (error) {
        console.error("❌ Koneksi Supabase Gagal:", error.message);
      } else {
        console.log("✅ Koneksi Supabase Berhasil!");
      }
    });
}
