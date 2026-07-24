import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_INTERVALS = {
  "1-Week Plan":  { interval: "week",  interval_count: 1,  amount: 693  },
  "4-Week Plan":  { interval: "week",  interval_count: 4,  amount: 1999 },
  "12-Week Plan": { interval: "week",  interval_count: 12, amount: 3999 },
};

export async function POST(req) {
  try {
    const { email, name, plan, paymentMethodId } = await req.json();
    const planConfig = PLAN_INTERVALS[plan] || PLAN_INTERVALS["4-Week Plan"];

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

    // Attach payment method
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    // Create price
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: planConfig.amount,
      recurring: {
        interval: planConfig.interval,
        interval_count: planConfig.interval_count,
      },
      product_data: { name: plan },
    });

    // Create subscription and pay immediately
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      default_payment_method: paymentMethodId,
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: { plan, email, name },
    });

    console.log("Sub status:", subscription.status);
    console.log("Invoice:", subscription.latest_invoice?.status);

    const paymentIntent = subscription.latest_invoice?.payment_intent;

    if (!paymentIntent?.client_secret) {
      // Try to pay the invoice manually
      const paidInvoice = await stripe.invoices.pay(subscription.latest_invoice.id, {
        expand: ["payment_intent"],
      });
      const pi = paidInvoice.payment_intent;
      if (!pi?.client_secret) throw new Error("Could not get payment intent");
      return NextResponse.json({
        subscriptionId: subscription.id,
        clientSecret: pi.client_secret,
        customerId,
      });
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      customerId,
    });
  } catch(e) {
    console.error("Subscription error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
