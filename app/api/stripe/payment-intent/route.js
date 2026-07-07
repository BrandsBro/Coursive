import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Stripe key loaded dynamically from settings

const PLANS = {
  "1-Week Plan":  693,
  "4-Week Plan":  1999,
  "12-Week Plan": 3999,
};

export async function POST(req) {
  try {

    const { plan, email, name } = await req.json();
    const amount = PLANS[plan] || PLANS["4-Week Plan"];

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
