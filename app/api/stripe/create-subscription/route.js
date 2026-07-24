import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_CONFIG = {
  "1-Week Plan":  { interval: "week",  interval_count: 1,  amount: 693  },
  "4-Week Plan":  { interval: "week",  interval_count: 4,  amount: 1999 },
  "12-Week Plan": { interval: "week",  interval_count: 12, amount: 3999 },
};

export async function POST(req) {
  try {
    const { email, name, plan, paymentMethodId } = await req.json();
    const config = PLAN_CONFIG[plan] || PLAN_CONFIG["4-Week Plan"];

    let customerId;
    const { data: profile } = await supabase
      .from("profiles").select("stripe_customer_id").eq("email", email).single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({ email, name });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("email", email);
    }

    // Attach payment method to customer
    try {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    } catch(e) {
      if (!e.message.includes("already been attached")) throw e;
    }

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    // Check for existing active subscription
    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    if (existingSubs.data.length > 0) {
      const existingSub = existingSubs.data[0];
      console.log("Customer already has active subscription:", existingSub.id);
      const invoice = await stripe.invoices.retrieve(existingSub.latest_invoice, { expand: ["payment_intent"] });
      return NextResponse.json({
        subscriptionId: existingSub.id,
        clientSecret: invoice.payment_intent?.client_secret || "",
        customerId,
        paymentIntentId: invoice.payment_intent?.id || "",
        status: "succeeded",
      });
    }

    // Create price
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: config.amount,
      recurring: { interval: config.interval, interval_count: config.interval_count },
      product_data: { name: plan },
    });

    // Create subscription with off_session to force immediate payment
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      default_payment_method: paymentMethodId,
      payment_behavior: "error_if_incomplete",
      off_session: true,
      metadata: { plan, email, name },
    });

    console.log("Sub created:", subscription.id, "status:", subscription.status);

    // Subscription paid immediately - create a payment intent for confirmation
    const paymentIntent = await stripe.paymentIntents.create({
      amount: config.amount,
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
      metadata: { plan, email, name, subscriptionId: subscription.id },
    });

    // Schedule price update to full price for next renewal
    const fullAmount = config.amount === 693 ? 1386 : config.amount === 1999 ? 3999 : 7999;
    if (fullAmount !== config.amount) {
      try {
        const fullPrice = await stripe.prices.create({
          currency: "usd",
          unit_amount: fullAmount,
          recurring: { interval: config.interval, interval_count: config.interval_count },
          product_data: { name: plan + " (Full Price)" },
        });
        await stripe.subscriptions.update(subscription.id, {
          items: [{ id: subscription.items.data[0].id, price: fullPrice.id }],
          proration_behavior: "none",
        });
        console.log("Updated to full price:", fullAmount / 100, "for next renewal");
      } catch(e) { console.error("Price update error:", e.message); }
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      customerId,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch(e) {
    console.error("Subscription error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
