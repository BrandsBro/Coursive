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

    const { data: settingsData } = await supabase.from("settings").select("value").eq("key","email_templates").single();
    const templates = settingsData?.value || [];
    const tmpl = templates.find(t => t.trigger === "cancellation" && t.active !== false);

    let subject = "Your 1Course password was changed";
    let html = "";

    const pwTmpl = templates.find(t => t.trigger === "password_changed" && t.active !== false);
    if (pwTmpl?.blocks?.length > 0) {
      subject = pwTmpl.subject || subject;
      const cardBg = pwTmpl.cardBg || "#0a081e";
      const emailBg = pwTmpl.emailBg || "#050411";
      const replace = (text) => (text||"").replace(/{email}/g, user.email);
      const blockHtml = pwTmpl.blocks.map(b => {
        switch(b.type) {
          case "header": return `<div style="background:linear-gradient(135deg,${b.bg1||"#5B4EFF"},${b.bg2||"#8B5CF6"});padding:${b.padding||48}px 40px;text-align:center"></div>`;
          case "logo": return b.logoUrl ? `<div style="padding:20px 40px;text-align:${b.align||"center"}"><img src="${b.logoUrl}" alt="Logo" style="height:${b.logoHeight||44}px;object-fit:contain;display:inline-block"/></div>` : "";
          case "heading": return `<div style="padding:4px 40px"><p style="font-size:${b.size||22}px;margin:0 0 8px;color:${b.color||"#fff"};text-align:${b.align||"left"};font-weight:${b.bold?"900":"700"};line-height:1.3">${replace(b.text)}</p></div>`;
          case "text": return `<div style="padding:4px 40px"><div style="color:${b.color||"rgba(255,255,255,0.7)"};font-size:${b.size||15}px;line-height:${b.lineHeight||1.8};text-align:${b.align||"left"};margin:0 0 8px">${b.html ? replace(b.html) : (b.text||"").split("\n").join("<br/>")}</div></div>`;
          case "button": return `<div style="padding:12px 40px;text-align:${b.align||"center"}"><a href="${b.url||"#"}" style="display:inline-block;padding:${b.paddingV||16}px ${b.paddingH||32}px;background:linear-gradient(135deg,${b.bgFrom||"#5B4EFF"},${b.bgTo||"#8B5CF6"});color:${b.color||"#fff"};text-decoration:none;border-radius:${b.radius||14}px;font-weight:700;font-size:${b.size||16}px">${b.text||"Click here"}</a></div>`;
          case "divider": return `<div style="margin:${b.margin||24}px 40px;border-top:1px solid ${b.color||"rgba(255,255,255,0.08)"}"></div>`;
          case "spacer": return `<div style="height:${b.height||24}px"></div>`;
          case "footer": return `<div style="padding:${b.padding||24}px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:${b.align||"center"};background:${b.bg||"transparent"}"><p style="color:${b.color||"rgba(255,255,255,0.3)"};font-size:${b.size||12}px;margin:0;line-height:1.6">${replace(b.text)}</p></div>`;
          default: return "";
        }
      }).join("");
      html = `<div style="font-family:-apple-system,sans-serif;background:${emailBg};padding:32px 0"><div style="max-width:600px;margin:0 auto;background:${cardBg};border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4)">${blockHtml}</div></div>`;
    } else {
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden"><div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center"><h1 style="margin:0;font-size:28px;font-weight:900">✦ 1Course</h1></div><div style="padding:32px"><h2 style="color:#5B4EFF">Password Changed ✅</h2><p style="color:rgba(255,255,255,0.7)">Your password was successfully changed. If you did not make this change, please contact us immediately.</p><p style="color:rgba(255,255,255,0.5)">${user.email}</p></div></div>`;
    }

    await resend.emails.send({ from: "noreply@1course.io", to: user.email, subject, html });
    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
