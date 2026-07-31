import { NextResponse } from "next/server";
import Stripe from "stripe";
import { trackKlaviyoEvent } from "@/lib/klaviyo";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {
    const { subscriptionId, email, plan } = await req.json();

    // Cancel Stripe subscription if exists
    if (subscriptionId && subscriptionId !== "null") {
      await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    }

    // Fire Klaviyo cancellation event
    try {
      let klaviyoEmail = email;
      let klaviyoPlan = plan;
      if (!klaviyoEmail && subscriptionId && subscriptionId !== "null") {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        klaviyoEmail = sub.metadata?.email;
        klaviyoPlan = sub.metadata?.plan;
      }
      if (klaviyoEmail) {
        await trackKlaviyoEvent(klaviyoEmail, "Subscription Cancelled", { plan: klaviyoPlan });
        console.log("Klaviyo cancel fired for:", klaviyoEmail);
      }
    } catch(e) { console.error("Klaviyo cancel error:", e.message); }

    return NextResponse.json({ ok: true });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
