import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Ambil data skor tertinggi (GET)
export async function GET() {
  const { data, error } = await supabase
    .from('leaderboards')
    .select('nama, skor')
    .order('skor', { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Simpan skor baru (POST)
export async function POST(request) {
  const { nama, skor } = await request.json();

  const { data, error } = await supabase
    .from('leaderboards')
    .insert([{ nama, skor }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Skor berhasil disimpan", data });
}