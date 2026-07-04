import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_WEEKS = {
  "1-Week Plan": 1,
  "4-Week Plan": 4,
  "12-Week Plan": 12,
};

const PLAN_PRICES = {
  "1-Week Plan":  { one_time: 6.93,  recurring: 5.99  },
  "4-Week Plan":  { one_time: 19.99, recurring: 16.99 },
  "12-Week Plan": { one_time: 39.99, recurring: 32.99 },
};

export async function POST(req) {
  try {
    const { email, name, plan, paymentType, paymentIntentId } = await req.json();
    console.log("Creating account for:", email, name, plan, paymentType);

    const tempPassword = Math.random().toString(36).slice(2,10) + "A1!";

    // Check if user already exists
    let userId = null;
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingProfile) {
      // Existing user — just update subscription, no new account needed
      userId = existingProfile.id;
    } else {
      // New user — create account
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: name },
      });
      if (userError) {
        console.error("Create user error:", userError);
        throw userError;
      }
      userId = userData?.user?.id;
    }

    if (!userId) throw new Error("Could not get user ID");

    // Calculate expiry
    const weeks = PLAN_WEEKS[plan] || 4;
    const amount = PLAN_PRICES[plan]?.[paymentType] || 19.99;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
    const nextBillingAt = paymentType === "recurring" ? expiresAt : null;

    // Save subscription
    const { data: sub, error: subError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan,
      type: paymentType,
      status: "active",
      amount_paid: amount,
      stripe_payment_intent_id: paymentIntentId,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      next_billing_at: nextBillingAt?.toISOString(),
    }).select().single();

    if (subError) console.error("Subscription error:", subError);

    // Save payment history
    await supabase.from("payment_history").insert({
      user_id: userId,
      subscription_id: sub?.id,
      amount,
      status: "succeeded",
      stripe_payment_id: paymentIntentId,
      plan,
      type: paymentType,
    });

    // Send email - welcome for new users, renewal confirmation for existing
    const isExistingUser = !!existingProfile;
    const emailSubject = isExistingUser ? "🎉 Your 1Course access has been renewed!" : "🎉 Welcome to 1Course! Your login details inside";
    const { error: emailError } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: emailSubject,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center">
            <h1 style="margin:0;font-size:28px;font-weight:900">✦ 1Course</h1>
            <p style="margin:8px 0 0;opacity:0.8">Welcome aboard!</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:22px;margin:0 0 12px;color:#5B4EFF">Congratulations, ${name}! 🎉</h2>
            <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 20px">Your payment was successful! Use the details below to log in:</p>
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:24px;margin:0 0 20px;border:1px solid rgba(255,255,255,0.1)">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px">Plan</p>
              <p style="margin:0 0 16px;font-weight:700;font-size:15px;color:#a78bfa">${plan} · ${paymentType === "recurring" ? "Auto-renew" : "One-time"}</p>
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px">Email</p>
              <p style="margin:0 0 16px;font-weight:700;font-size:16px">${email}</p>
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px">Temporary Password</p>
              <p style="margin:0;font-weight:900;font-size:22px;color:#fff;letter-spacing:2px;background:rgba(91,78,255,0.2);padding:12px;border-radius:8px;text-align:center;font-family:monospace">${tempPassword}</p>
            </div>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 24px">Access expires: ${expiresAt.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login?email=${encodeURIComponent(email)}" style="display:block;text-align:center;padding:16px 28px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px">
              Log In to 1Course →
            </a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">© 2026 1Course. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    if (emailError) console.error("Email error:", emailError);
    else console.log("Email sent to:", email);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Create account error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
