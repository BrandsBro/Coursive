import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { name, email } = await req.json();
    if (!email) return NextResponse.json({ ok: false });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase.from("leads").insert({ name, email }).select();
    console.log("Lead insert result:", data, error);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
