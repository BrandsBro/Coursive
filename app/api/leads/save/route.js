import { NextResponse } from "next/server";
import { addToKlaviyoList } from "@/lib/klaviyo";
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

        try {
      const nameParts = (name || "").trim().split(" ");
      await addToKlaviyoList(process.env.KLAVIYO_LEADS_LIST_ID, {
        email,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        properties: { source: "quiz_lead" },
      });
    } catch(e) { console.error("Klaviyo leads error:", e); }
    return NextResponse.json({ ok: true });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
