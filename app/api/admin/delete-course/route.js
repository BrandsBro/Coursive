import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error:"No course ID" }, { status:400 });

    const { data: lessons } = await supabase.from("lessons").select("id").eq("course_id", courseId);
    const lessonIds = (lessons||[]).map(l => l.id);

    if (lessonIds.length > 0) {
      await supabase.from("lesson_content").delete().in("lesson_id", lessonIds);
    }

    await supabase.from("lessons").delete().eq("course_id", courseId);
    await supabase.from("course_units").delete().eq("course_id", courseId);
    await supabase.from("course_reviews").delete().eq("course_id", courseId);

    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) return NextResponse.json({ error: error.message }, { status:500 });

    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
