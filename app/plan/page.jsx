export const dynamic = "force-dynamic";
import PlanPage from "@/components/quiz/PlanPage";
import { createClient } from "@supabase/supabase-js";

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data } = await supabase.from("settings").select("value").eq("key","pricing").single();
  return <PlanPage pricingData={data?.value || null}/>;
}
