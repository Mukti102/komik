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
