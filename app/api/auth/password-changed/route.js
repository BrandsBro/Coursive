import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });

    await resend.emails.send({
      from: "noreply@1course.io",
      to: user.email,
      subject: "🔐 Your 1Course password was changed",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center">
            <h1 style="margin:0;font-size:28px;font-weight:900">✦ 1Course</h1>
            <p style="margin:8px 0 0;opacity:0.8">Security Alert</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:22px;margin:0 0 12px;color:#5B4EFF">Password Changed ✅</h2>
            <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 20px">Your 1Course account password was successfully changed. If you did not make this change, please contact us immediately.</p>
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin:0 0 24px;border:1px solid rgba(255,255,255,0.1)">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Account</p>
              <p style="margin:0;font-weight:700;color:#a78bfa">${user.email}</p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:12px">Changed at: ${new Date().toLocaleString("en-US",{dateStyle:"full",timeStyle:"short"})}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="display:block;text-align:center;padding:16px 28px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px">
              Go to 1Course →
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
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
