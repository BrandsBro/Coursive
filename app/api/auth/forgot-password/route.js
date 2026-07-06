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
      from: "noreply@1course.io",
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

    // Load template from admin
    const { data: settingsData } = await supabase.from("settings").select("value").eq("key","email_templates").single();
    const templates = settingsData?.value || [];
    const tmpl = templates.find(t => t.trigger === "forgot_password" && t.active !== false);

    let subject = "🔑 Reset your 1Course password";
    let html = "";

    if (tmpl?.blocks?.length > 0) {
      subject = tmpl.subject || subject;
      const cardBg = tmpl.cardBg || "#0a081e";
      const emailBg = tmpl.emailBg || "#050411";
      const replace = (text) => (text||"").replace(/{resetLink}/g, resetLink).replace(/{email}/g, email);
      const blockHtml = tmpl.blocks.map(b => {
        switch(b.type) {
          case "header": return `<div style="background:linear-gradient(135deg,${b.bg1||"#5B4EFF"},${b.bg2||"#8B5CF6"});padding:${b.padding||48}px 40px;text-align:center"></div>`;
          case "logo": return b.logoUrl ? `<div style="padding:20px 40px;text-align:${b.align||"center"}"><img src="${b.logoUrl}" alt="Logo" style="height:${b.logoHeight||44}px;object-fit:contain;display:inline-block"/></div>` : "";
          case "heading": return `<div style="padding:4px 40px"><p style="font-size:${b.size||22}px;margin:0 0 8px;color:${b.color||"#fff"};text-align:${b.align||"left"};font-weight:${b.bold?"900":"700"};line-height:1.3">${replace(b.text)}</p></div>`;
          case "text": return `<div style="padding:4px 40px"><div style="color:${b.color||"rgba(255,255,255,0.7)"};font-size:${b.size||15}px;line-height:${b.lineHeight||1.8};text-align:${b.align||"left"};margin:0 0 8px">${b.html ? replace(b.html) : (b.text||"").split("\n").join("<br/>")}</div></div>`;
          case "button": return `<div style="padding:12px 40px;text-align:${b.align||"center"}"><a href="${b.url||resetLink}" style="display:inline-block;padding:${b.paddingV||16}px ${b.paddingH||32}px;background:linear-gradient(135deg,${b.bgFrom||"#5B4EFF"},${b.bgTo||"#8B5CF6"});color:${b.color||"#fff"};text-decoration:none;border-radius:${b.radius||14}px;font-weight:700;font-size:${b.size||16}px">${b.text||"Reset Password"}</a></div>`;
          case "divider": return `<div style="margin:${b.margin||24}px 40px;border-top:1px solid ${b.color||"rgba(255,255,255,0.08)"}"></div>`;
          case "spacer": return `<div style="height:${b.height||24}px"></div>`;
          case "footer": return `<div style="padding:${b.padding||24}px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:${b.align||"center"};background:${b.bg||"transparent"}"><p style="color:${b.color||"rgba(255,255,255,0.3)"};font-size:${b.size||12}px;margin:0;line-height:1.6">${replace(b.text)}</p></div>`;
          default: return "";
        }
      }).join("");
      html = `<div style="font-family:-apple-system,sans-serif;background:${emailBg};padding:32px 0"><div style="max-width:600px;margin:0 auto;background:${cardBg};border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4)">${blockHtml}</div></div>`;
    } else {
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden"><div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center"><h1 style="margin:0;font-size:28px;font-weight:900">✦ 1Course</h1></div><div style="padding:32px"><h2 style="color:#5B4EFF">Reset Your Password 🔑</h2><p style="color:rgba(255,255,255,0.7)">Click below to reset your password. Link expires in 1 hour.</p><a href="${resetLink}" style="display:block;text-align:center;padding:16px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;margin:20px 0">Reset My Password →</a><p style="color:rgba(255,255,255,0.4);font-size:12px">If you did not request this, ignore this email.</p></div></div>`;
    }

    await resend.emails.send({ from: "noreply@1course.io", to: email, subject, html });
    
