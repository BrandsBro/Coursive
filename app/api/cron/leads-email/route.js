import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function GET(req) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: settingsRow } = await supabase.from("settings").select("value").eq("key","email_templates").single();
  const templates = settingsRow?.value || [];

  // Get all active lead followup templates sorted by delay
  const leadTemplates = templates
    .filter(t => t.trigger?.startsWith("lead_followup") && t.active)
    .map(t => {
      let delayMinutes = t.delayMinutes || 30;
      if (t.delayUnit === "hours") delayMinutes = delayMinutes * 60;
      if (t.delayUnit === "days") delayMinutes = delayMinutes * 60 * 24;
      return { ...t, delayMinutes };
    })
    .sort((a, b) => a.delayMinutes - b.delayMinutes);

  const t1 = leadTemplates[0];
  const t2 = leadTemplates[1];
  const t3 = leadTemplates[2];

  const now = new Date();
  const { data: leads } = await supabase.from("leads").select("*").eq("converted", false);

  let sent = 0;

  for (const lead of leads || []) {
    const createdAt = new Date(lead.created_at);
    const minutesAgo = (now - createdAt) / 1000 / 60;

    if (minutesAgo >= 30 && !lead.email1_sent && t1) {
      const html = buildEmailHtml(t1, lead.name || "there");
      await resend.emails.send({ from:"1Course <noreply@1course.io>", to:lead.email, subject:t1.subject, html });
      await supabase.from("leads").update({ email1_sent: true }).eq("id", lead.id);
      sent++;
    }

    if (minutesAgo >= 1440 && !lead.email2_sent && t2) {
      const html = buildEmailHtml(t2, lead.name || "there");
      await resend.emails.send({ from:"1Course <noreply@1course.io>", to:lead.email, subject:t2.subject, html });
      await supabase.from("leads").update({ email2_sent: true }).eq("id", lead.id);
      sent++;
    }

    if (minutesAgo >= 4320 && !lead.email3_sent && t3) {
      const html = buildEmailHtml(t3, lead.name || "there");
      await resend.emails.send({ from:"1Course <noreply@1course.io>", to:lead.email, subject:t3.subject, html });
      await supabase.from("leads").update({ email3_sent: true }).eq("id", lead.id);
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent, total: leads?.length || 0 });
}

function buildEmailHtml(template, name) {
  const c = template.content || {};
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${c.bgColor||"#0a081e"};font-family:-apple-system,sans-serif">
    <div style="max-width:520px;margin:0 auto">
      <div style="background:linear-gradient(135deg,${c.headerGradientStart||"#5B4EFF"},${c.headerGradientEnd||"#8B5CF6"});padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900">${c.logoText||"✦ 1Course"}</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">${c.headerText||""}</p>
      </div>
      <div style="background:${c.cardBg||"#1a1830"};padding:28px 32px">
        <h2 style="color:${c.greetingColor||"#5B4EFF"};margin:0 0 12px">Hi ${name}!</h2>
        <p style="color:${c.bodyTextColor||"rgba(255,255,255,0.7)"};line-height:1.7;margin:0 0 24px">${(c.bodyText||"").replace(/{name}/g, name)}</p>
        <div style="text-align:center">
          <a href="https://1course.io/quiz" style="display:inline-block;padding:14px 28px;background:${c.buttonColor||"#5B4EFF"};color:${c.buttonTextColor||"#fff"};text-decoration:none;border-radius:12px;font-weight:700">${c.buttonText||"Get My Plan →"}</a>
        </div>
      </div>
      <div style="padding:16px 28px;text-align:center">
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">${c.footerText||"© 2026 1Course. All rights reserved."}</p>
      </div>
    </div>
  </body></html>`;
}
