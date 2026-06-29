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
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // Check if user exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === email);
    if (!user) return NextResponse.json({ error: "No account found with this email" }, { status: 404 });

    // Generate new temp password
    const tempPassword = Math.random().toString(36).slice(2,10) + "A1!";

    // Update password
    await supabase.auth.admin.updateUserById(user.id, { password: tempPassword });

    // Send email
    await resend.emails.send({
      from: "Coursiv <noreply@kingbrandsbro.pro>",
      to: email,
      subject: "🔑 Your Coursiv password reset",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center">
            <h1 style="margin:0;font-size:28px;font-weight:900">✦ Coursiv</h1>
            <p style="margin:8px 0 0;opacity:0.8">Password Reset</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:22px;margin:0 0 12px;color:#5B4EFF">Password Reset Request 🔑</h2>
            <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 20px">We received a request to reset your Coursiv password. Here is your temporary password:</p>
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:24px;margin:0 0 20px;border:1px solid rgba(255,255,255,0.1)">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px">Email</p>
              <p style="margin:0 0 20px;font-weight:700;font-size:16px;color:#a78bfa">${email}</p>
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px">Temporary Password</p>
              <p style="margin:0;font-weight:900;font-size:24px;color:#fff;letter-spacing:2px;background:rgba(91,78,255,0.2);padding:14px;border-radius:8px;text-align:center;font-family:monospace">${tempPassword}</p>
            </div>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 24px">Please log in with this temporary password and change it from your profile settings immediately.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login?email=${encodeURIComponent(email)}" style="display:block;text-align:center;padding:16px 28px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px">
              Log In to Coursiv →
            </a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">If you did not request this, please ignore this email. © 2026 Coursiv.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Forgot password error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
