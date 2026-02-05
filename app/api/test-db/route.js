import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase.from('leaderboards').select('*').limit(1);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      status: "Connected!", 
      message: "Berhasil mengambil data dari Supabase",
      data 
    });
  } catch (err) {
    return NextResponse.json({ 
      status: "Error", 
      message: err.message,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "URL Terpasang" : "URL Kosong!"
    }, { status: 500 });
  }
}