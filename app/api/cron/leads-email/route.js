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

  // Get all active lead templates sorted by delay
  const leadTemplates = templates
    .filter(t => t.trigger?.startsWith("lead_followup") && t.active)
    .map(t => {
      let delayMinutes = t.delayMinutes || 30;
      if (t.delayUnit === "hours") delayMinutes = delayMinutes * 60;
      if (t.delayUnit === "days") delayMinutes = delayMinutes * 1440;
      return { ...t, delayMinutes };
    })
    .sort((a, b) => a.delayMinutes - b.delayMinutes);

  const now = new Date();
  const { data: leads } = await supabase.from("leads").select("*").eq("converted", false);

  let sent = 0;

  for (const lead of leads || []) {
    const createdAt = new Date(lead.created_at);
    const minutesAgo = (now - createdAt) / 1000 / 60;

    // Email 1
    if (leadTemplates[0] && minutesAgo >= leadTemplates[0].delayMinutes && !lead.email1_sent) {
      const html = buildEmailHtml(leadTemplates[0], lead.name || "there", lead.email);
      await resend.emails.send({ from:"1Course <noreply@1course.io>", to:lead.email, subject:leadTemplates[0].subject, html });
      await supabase.from("leads").update({ email1_sent: true }).eq("id", lead.id);
      sent++;
    }

    // Email 2
    if (leadTemplates[1] && minutesAgo >= leadTemplates[1].delayMinutes && !lead.email2_sent) {
      const html = buildEmailHtml(leadTemplates[1], lead.name || "there", lead.email);
      await resend.emails.send({ from:"1Course <noreply@1course.io>", to:lead.email, subject:leadTemplates[1].subject, html });
      await supabase.from("leads").update({ email2_sent: true }).eq("id", lead.id);
      sent++;
    }

    // Email 3
    if (leadTemplates[2] && minutesAgo >= leadTemplates[2].delayMinutes && !lead.email3_sent) {
      const html = buildEmailHtml(leadTemplates[2], lead.name || "there", lead.email);
      await resend.emails.send({ from:"1Course <noreply@1course.io>", to:lead.email, subject:leadTemplates[2].subject, html });
      await supabase.from("leads").update({ email3_sent: true }).eq("id", lead.id);
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent, total: leads?.length || 0 });
}

function buildEmailHtml(template, name, email) {
  const c = template.content || {};
  
  // If template has blocks, render them
  if (template.blocks?.length) {
    let blocksHtml = "";
    for (const block of template.blocks) {
      if (block.type === "header") {
        blocksHtml += `<div style="background:linear-gradient(135deg,${block.bg1||"#5B4EFF"},${block.bg2||"#8B5CF6"});padding:${block.padding||32}px;"></div>`;
      } else if (block.type === "logo") {
        blocksHtml += `<div style="text-align:${block.align||"center"};padding:16px;"><img src="${block.logoUrl||""}" height="${block.logoHeight||44}" style="height:${block.logoHeight||44}px;object-fit:contain;"/></div>`;
      } else if (block.type === "heading") {
        blocksHtml += `<h2 style="font-size:${block.size||22}px;color:${block.color||"#0f172a"};text-align:${block.align||"left"};font-weight:${block.bold?"900":"700"};padding:0 32px;">${(block.text||"").replace(/{name}/g,name).replace(/{email}/g,email)}</h2>`;
      } else if (block.type === "text") {
        const html = block.html || block.text || "";
        blocksHtml += `<div style="font-size:${block.size||15}px;color:${block.color||"#374151"};line-height:${block.lineHeight||1.7};padding:8px 32px;text-align:${block.align||"left"};">${html.replace(/{name}/g,name).replace(/{email}/g,email)}</div>`;
      } else if (block.type === "button") {
        const url = (block.url||"https://1course.io/plan").replace(/{name}/g,encodeURIComponent(name)).replace(/{email}/g,encodeURIComponent(email));
        blocksHtml += `<div style="text-align:${block.align||"center"};padding:16px 32px;"><a href="${url}" style="display:inline-block;padding:${block.paddingV||14}px ${block.paddingH||28}px;background:linear-gradient(135deg,${block.bgFrom||"#5B4EFF"},${block.bgTo||"#8B5CF6"});color:${block.color||"#fff"};text-decoration:none;border-radius:${block.radius||12}px;font-weight:700;font-size:${block.size||15}px;">${block.text||"Get My Plan →"}</a></div>`;
      } else if (block.type === "footer") {
        blocksHtml += `<div style="text-align:${block.align||"center"};padding:${block.padding||24}px;background:${block.bg||"transparent"};font-size:${block.size||12}px;color:${block.color||"#94A3B8"};">${block.text||""}</div>`;
      } else if (block.type === "spacer") {
        blocksHtml += `<div style="height:${block.height||16}px;"></div>`;
      } else if (block.type === "divider") {
        blocksHtml += `<div style="border-top:1px solid ${block.color||"#E2E8F0"};margin:${block.margin||16}px 32px;"></div>`;
      }
    }
    return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${template.emailBg||"#F8FAFC"};font-family:-apple-system,sans-serif"><div style="max-width:520px;margin:0 auto;background:${template.cardBg||"#fff"};">${blocksHtml}</div></body></html>`;
  }

  // Fallback to content object
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${c.bgColor||"#0a081e"};font-family:-apple-system,sans-serif">
    <div style="max-width:520px;margin:0 auto">
      <div style="background:linear-gradient(135deg,${c.headerGradientStart||"#5B4EFF"},${c.headerGradientEnd||"#8B5CF6"});padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900">${c.logoText||"✦ 1Course"}</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">${c.headerText||""}</p>
      </div>
      <div style="background:${c.cardBg||"#1a1830"};padding:28px 32px">
        <h2 style="color:${c.greetingColor||"#5B4EFF"};margin:0 0 12px">Hi ${name}!</h2>
        <p style="color:${c.bodyTextColor||"rgba(255,255,255,0.7)"};line-height:1.7;margin:0 0 24px">${(c.bodyText||"").replace(/{name}/g,name).replace(/{email}/g,email)}</p>
        <div style="text-align:center">
          <a href="https://1course.io/plan?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}" style="display:inline-block;padding:14px 28px;background:${c.buttonColor||"#5B4EFF"};color:${c.buttonTextColor||"#fff"};text-decoration:none;border-radius:12px;font-weight:700">${c.buttonText||"Get My Plan →"}</a>
        </div>
      </div>
      <div style="padding:16px 28px;text-align:center">
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">${c.footerText||"© 2026 1Course. All rights reserved."}</p>
      </div>
    </div>
  </body></html>`;
}
