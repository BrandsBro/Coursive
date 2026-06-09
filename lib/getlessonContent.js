import { supabase } from "@/lib/supabase";

export async function getLessonContentFromDB(lessonId) {
  const { data } = await supabase
    .from("lesson_content")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_index");

  if (!data || data.length === 0) return null;

  return data.map(block => ({
    type: block.type,
    ...block.content,
    id: block.id,
  }));
}
