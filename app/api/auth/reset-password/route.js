import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error:"Missing fields" }, { status:400 });
    if (password.length < 8) return NextResponse.json({ error:"Password must be at least 8 characters" }, { status:400 });

    // Find token
    const { data: reset } = await supabase
      .from("password_resets")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (!reset) return NextResponse.json({ error:"Invalid or expired reset link" }, { status:400 });

    // Check expiry
    if (new Date(reset.expires_at) < new Date()) {
      await supabase.from("password_resets").delete().eq("id", reset.id);
      return NextResponse.json({ error:"Reset link has expired. Please request a new one." }, { status:400 });
    }

    // Update password in Supabase
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      reset.user_id,
      { password }
    );

    if (updateError) return NextResponse.json({ error: updateError.message }, { status:500 });

    // Mark token as used and delete
    await supabase.from("password_resets").delete().eq("id", reset.id);

    // Send confirmation email
    await resend.emails.send({
      from: "1Course <noreply@kingbrandsbro.pro>",
      to: reset.email,
      subject: "🔐 Your 1Course password was changed",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:40px 32px;text-align:center">
            <h1 style="margin:0;font-size:28px;font-weight:900">✦ 1Course</h1>
            <p style="margin:8px 0 0;opacity:0.8">Security Alert</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:22px;margin:0 0 12px;color:#22c55e">Password Changed ✅</h2>
            <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 20px">Your 1Course password was successfully changed. If you did not make this change, contact us immediately.</p>
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.1);margin:0 0 24px">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Account</p>
              <p style="margin:0;font-weight:700;color:#a78bfa">${reset.email}</p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:12px">Changed at: ${new Date().toLocaleString("en-US",{dateStyle:"full",timeStyle:"short"})}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="display:block;text-align:center;padding:16px 28px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px">
              Log In to 1Course →
            </a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">© 2026 1Course. If this wasn't you, contact support immediately.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch(e) {
    console.error("Reset password error:", e);
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
