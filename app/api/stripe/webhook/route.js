import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("Webhook signature error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { name, email } = session.metadata;

    // Generate temp password
    const tempPassword = Math.random().toString(36).slice(2,10) + "A1!";

    // Create account
    const { error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (error && !error.message.includes("already registered")) {
      console.error("Create user error:", error);
    }

    // Send welcome email
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "🎉 Welcome to 1Course! Your login details inside",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center">
            <h1 style="margin:0;font-size:28px;font-weight:900">✦ 1Course</h1>
            <p style="margin:8px 0 0;opacity:0.8">Welcome aboard!</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:22px;margin:0 0 12px">Hi ${name}! 🎉</h2>
            <p style="color:rgba(255,255,255,0.7);line-height:1.7">Your payment was successful! Here are your login details:</p>
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin:20px 0;border:1px solid rgba(255,255,255,0.1)">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase">Email</p>
              <p style="margin:0 0 16px;font-weight:700;font-size:16px">${email}</p>
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase">Temporary Password</p>
              <p style="margin:0;font-weight:700;font-size:18px;color:#a78bfa;letter-spacing:1px">${tempPassword}</p>
            </div>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 24px">Change your password anytime from profile settings.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px">
              Start Learning Now →
            </a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">© 2026 1Course. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("Payment complete for:", email);
  }

  return NextResponse.json({ received: true });
}
