import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { subscriptionId } = await req.json();
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    return NextResponse.json({ ok: true });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
