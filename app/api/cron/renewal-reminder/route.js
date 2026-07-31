import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { trackKlaviyoEvent } from "@/lib/klaviyo";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find subscriptions renewing in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysStart = new Date(threeDaysFromNow);
    threeDaysStart.setHours(0, 0, 0, 0);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*, profiles(email, full_name)")
      .eq("status", "active")
      .gte("expires_at", threeDaysStart.toISOString())
      .lte("expires_at", threeDaysFromNow.toISOString());

    if (!subscriptions?.length) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    let count = 0;
    for (const sub of subscriptions) {
      const email = sub.profiles?.email;
      if (!email) continue;
      await trackKlaviyoEvent(email, "Subscription Renewing Soon", {
        plan: sub.plan,
        renews_on: sub.expires_at,
      });
      count++;
    }

    return NextResponse.json({ ok: true, count });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
