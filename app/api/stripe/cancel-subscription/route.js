import { NextResponse } from "next/server";
import { trackKlaviyoEvent } from "@/lib/klaviyo";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { subscriptionId, email, plan } = await req.json();
    if (subscriptionId) await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });

    // Get customer email and notify via Klaviyo
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const { email, plan } = sub.metadata;
      console.log("Cancel - email:", email, "plan:", plan);
      if (email) {
        const result = await trackKlaviyoEvent(email, "Subscription Cancelled", { plan });
        console.log("Klaviyo cancel event result:", result);
      }
    } catch(e) { console.error("Klaviyo cancel error:", e); }
    return NextResponse.json({ ok: true });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
