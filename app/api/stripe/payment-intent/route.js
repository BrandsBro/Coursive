import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getPlanAmount(planName) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data } = await supabase.from("settings").select("value").eq("key","pricing").single();
    const plans = data?.value?.plans || [];
    const found = plans.find(p => p.name === planName);
    if (found?.salePrice) return Math.round(parseFloat(found.salePrice) * 100);
  } catch(e) {}
  const PLANS = { "1-Week Plan":693, "4-Week Plan":1999, "12-Week Plan":3999 };
  return PLANS[planName] || 1999;
}

export async function POST(req) {
  try {
    const { plan, email, name } = await req.json();
    const amount = await getPlanAmount(plan);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { plan, email, name },
      ...(email && email.includes("@") ? { receipt_email: email } : {}),
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    console.error("Payment intent error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
