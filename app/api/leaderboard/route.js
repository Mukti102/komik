import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Ambil data skor tertinggi (GET)
export async function GET() {
  const { data, error } = await supabase
    .from("leaderboards")
    // Gabungkan kolom dalam satu string: "nama, skor, duration"
    .select("nama, skor, duration")
    // Urutan 1: Skor Terbesar (Descending)
    // Urutan 2: Durasi Terkecil/Tercepat (Ascending)
    .order("skor", { ascending: false })
    .order("duration", { ascending: true })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Simpan skor baru (POST)
export async function POST(request) {
  const { nama, skor, duration } = await request.json();

  const { data, error } = await supabase
    .from("leaderboards")
    .insert([{ nama, skor, duration }]);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Skor berhasil disimpan", data });
}

export async function DELETE() {
  // Menghapus semua baris di Supabase (Pastikan kebijakan RLS mengizinkan atau gunakan Service Role Key)
  const { error } = await supabase.from("leaderboards").delete().neq("id", 0); // Trik untuk menghapus semua baris (menghapus yang ID-nya bukan 0)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Data cleared successfully" });
}
