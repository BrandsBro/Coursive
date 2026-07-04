import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, title, subtitle, description, emoji, image_url, gradient_bg, days, level } = body;
    if (!id || !title) return NextResponse.json({ error:"ID and Title required" }, { status:400 });
    const { error } = await supabase.from("challenges").upsert({
      id, title, subtitle, description, emoji,
      image_url: image_url||null, gradient_bg, days:parseInt(days),
      level, is_published:true,
    }, { onConflict:"id" });
    if (error) return NextResponse.json({ error: error.message }, { status:500 });
    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
