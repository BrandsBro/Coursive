import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { challengeId } = await req.json();
    if (!challengeId) return NextResponse.json({ error:"No challenge ID" }, { status:400 });
    await supabase.from("challenge_days").delete().eq("challenge_id", challengeId);
    await supabase.from("challenge_reviews").delete().eq("challenge_id", challengeId);
    await supabase.from("challenge_progress").delete().eq("challenge_id", challengeId);
    await supabase.from("challenge_joins").delete().eq("challenge_id", challengeId);
    const { error } = await supabase.from("challenges").delete().eq("id", challengeId);
    if (error) return NextResponse.json({ error: error.message }, { status:500 });
    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
