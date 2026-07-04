import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { challenge_id, day_number, topic, emoji, course_id, lesson_id } = body;

    const { error } = await supabase.from("challenge_days").upsert(
      { challenge_id, day_number, topic, emoji, course_id: course_id||null, lesson_id: lesson_id||null },
      { onConflict:"challenge_id,day_number" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status:500 });
    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
