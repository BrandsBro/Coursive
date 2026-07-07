import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data } = await supabase.from("settings").select("value").eq("key","payment_settings").single();
    const mode = data?.value?.mode || "test";
    return NextResponse.json({ mode });
  } catch(e) {
    return NextResponse.json({ mode: "test" });
  }
}
