import QuizFlow from "@/components/quiz/QuizFlow";
import { createClient } from "@supabase/supabase-js";

export default async function QuizPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: blocks } = await supabase
    .from("quiz_blocks")
    .select("*")
    .order("order_index");

  return <QuizFlow blocks={blocks || []} />;
}
