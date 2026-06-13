import { getSupabaseServer } from "@/lib/supabaseServer";

export async function getLessonContentFromDB(lessonId) {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("lesson_content")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_index");
  if (error) console.error("getLessonContent error:", error);
  if (!data || data.length === 0) return null;
  return data.map(block => ({
    id: block.id,
    type: block.type,
    content: block.content,
    order_index: block.order_index,
  }));
}
