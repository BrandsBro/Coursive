import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const attempts = new Map();

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error:"Email required" }, { status:400 });

    // Rate limit: max 3 per hour
    const key = email.toLowerCase();
    const now = Date.now();
    const recent = (attempts.get(key)||[]).filter(t => now-t < 3600000);
    if (recent.length >= 3) return NextResponse.json({ error:"Too many attempts. Try again in 1 hour." }, { status:429 });
    attempts.set(key, [...recent, now]);

    // Find user
    const { data: profile } = await supabase
      .from("profiles").select("id").eq("email", email).single();

    // Always return success (prevent email enumeration)
    if (!profile) return NextResponse.json({ success: true });

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete old tokens for this user
    await supabase.from("password_resets").delete().eq("user_id", profile.id);

    // Store token
    await supabase.from("password_resets").insert({
      user_id: profile.id,
      email,
      token,
      expires_at: expiresAt.toISOString(),
    });

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;

    // Send branded email via Resend
    await resend.emails.send({
      from: "1Course <noreply@kingbrandsbro.pro>",
      to: email,
      subject: "🔑 Reset your 1Course password",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center">
            <h1 style="margin:0;font-size:28px;font-weight:900">✦ 1Course</h1>
            <p style="margin:8px 0 0;opacity:0.8">Password Reset</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:22px;margin:0 0 12px;color:#5B4EFF">Reset Your Password 🔑</h2>
            <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 24px">
              We received a request to reset your 1Course password. Click the button below to set a new password.
            </p>
            <a href="${resetLink}" style="display:block;text-align:center;padding:16px 28px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;margin:0 0 24px">
              Reset My Password →
            </a>
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.1)">
              <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 8px">Or copy this link:</p>
              <p style="color:#a78bfa;font-size:12px;margin:0;word-break:break-all">${resetLink}</p>
            </div>
            <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:24px 0 0">⏰ This link expires in <strong>1 hour</strong>. If you did not request this, ignore this email.</p>
          </div>
          <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">© 2026 1Course. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch(e) {
    console.error("Forgot password error:", e);
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
