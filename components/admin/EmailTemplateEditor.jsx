import os

# Create cron API route
os.makedirs('app/api/cron', exist_ok=True)

code = '''import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

function generateEmailHtml(blocks, name, email, template, extraVars = {}) {
  const cardBg = template?.cardBg || "#0a081e";
  const emailBg = template?.emailBg || "#050411";
  const replace = (text) => {
    if (!text) return "";
    let t = text.replace(/&#123;/g,"{").replace(/&#125;/g,"}");
    t = t.replace(/{name}/g, name);
    t = t.replace(/{email}/g, email);
    t = t.replace(/{Renewal Date}/g, extraVars.renewalDate || "");
    t = t.replace(/{Plan Name}/g, extraVars.plan || "");
    t = t.replace(/{Amount}/g, extraVars.amount || "");
    t = t.replace(/{Plan}/g, extraVars.plan || "");
    return t;
  };
  const blockHtml = (blocks || []).map(b => {
    switch(b.type) {
      case "header": return "<div style=\\"background:linear-gradient(135deg," + (b.bg1||"#5B4EFF") + "," + (b.bg2||"#8B5CF6") + ");padding:" + (b.padding||48) + "px 40px;text-align:center\\"></div>";
      case "logo": return b.logoUrl ? "<div style=\\"padding:20px 40px;text-align:" + (b.align||"center") + "\\"><img src=\\"" + b.logoUrl + "\\" alt=\\"Logo\\" style=\\"height:" + (b.logoHeight||44) + "px;object-fit:contain;display:inline-block\\"/></div>" : "";
      case "heading": return "<div style=\\"padding:4px 40px\\"><p style=\\"font-size:" + (b.size||22) + "px;margin:0 0 8px;color:" + (b.color||"#fff") + ";text-align:" + (b.align||"left") + ";font-weight:" + (b.bold?"900":"700") + ";line-height:1.3\\">" + replace(b.text) + "</p></div>";
      case "text": return "<div style=\\"padding:4px 40px\\"><div style=\\"color:" + (b.color||"rgba(255,255,255,0.7)") + ";font-size:" + (b.size||15) + "px;line-height:" + (b.lineHeight||1.8) + ";text-align:" + (b.align||"left") + ";margin:0 0 8px\\">" + replace(b.html || (b.text||"")) + "</div></div>";
      case "button": return "<div style=\\"padding:12px 40px;text-align:" + (b.align||"center") + "\\"><a href=\\"" + (b.url||"#") + "\\" style=\\"display:inline-block;padding:" + (b.paddingV||16) + "px " + (b.paddingH||32) + "px;background:linear-gradient(135deg," + (b.bgFrom||"#5B4EFF") + "," + (b.bgTo||"#8B5CF6") + ");color:" + (b.color||"#fff") + ";text-decoration:none;border-radius:" + (b.radius||14) + "px;font-weight:700;font-size:" + (b.size||16) + "px\\">" + (b.text||"Click here") + "</a></div>";
      case "divider": return "<div style=\\"margin:" + (b.margin||24) + "px 40px;border-top:1px solid " + (b.color||"rgba(255,255,255,0.08)") + "\\"></div>";
      case "spacer": return "<div style=\\"height:" + (b.height||24) + "px\\"></div>";
      case "footer": return "<div style=\\"padding:" + (b.padding||24) + "px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:" + (b.align||"center") + ";background:" + (b.bg||"transparent") + "\\"><p style=\\"color:" + (b.color||"rgba(255,255,255,0.3)") + ";font-size:" + (b.size||12) + "px;margin:0\\">" + replace(b.text) + "</p></div>";
      default: return "";
    }
  }).join("");
  return "<div style=\\"font-family:-apple-system,sans-serif;background:" + emailBg + ";padding:32px 0\\"><div style=\\"max-width:600px;margin:0 auto;background:" + cardBg + ";border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4)\\">" + blockHtml + "</div></div>";
}

async function getTemplate(trigger) {
  const { data } = await supabase.from("settings").select("value").eq("key","email_templates").single();
  const templates = data?.value || [];
  return templates.find(t => t.trigger === trigger && t.active !== false);
}

async function sendEmail(to, name, subject, html) {
  const { error } = await resend.emails.send({ from: "noreply@1course.io", to, subject, html });
  if (error) console.error("Email error:", error);
  return !error;
}

export async function GET(req) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== "Bearer " + process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = { sent: 0, errors: 0 };

  try {
    // 1. Send 3-day expiry warnings
    const in3days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in3daysEnd = new Date(in3days.getTime() + 24 * 60 * 60 * 1000);

    const { data: expiring3 } = await supabase
      .from("subscriptions")
      .select("*, profiles(email, full_name)")
      .eq("status", "active")
      .eq("type", "recurring")
      .gte("expires_at", in3days.toISOString())
      .lt("expires_at", in3daysEnd.toISOString());

    const tmpl3 = await getTemplate("expiry_warning_3");
    for (const sub of expiring3 || []) {
      const email = sub.profiles?.email;
      const name = sub.profiles?.full_name || "there";
      if (!email) continue;
      const renewalDate = new Date(sub.expires_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
      const amount = "$" + (sub.amount_paid || "19.99");
      const html = tmpl3 ? generateEmailHtml(tmpl3.blocks, name, email, tmpl3, { renewalDate, plan: sub.plan, amount }) : null;
      if (html) {
        const ok = await sendEmail(email, name, tmpl3.subject || "Your subscription renews in 3 days", html);
        if (ok) results.sent++; else results.errors++;
      }
    }

    // 2. Send 1-day expiry warnings
    const in1day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const in1dayEnd = new Date(in1day.getTime() + 24 * 60 * 60 * 1000);

    const { data: expiring1 } = await supabase
      .from("subscriptions")
      .select("*, profiles(email, full_name)")
      .eq("status", "active")
      .eq("type", "recurring")
      .gte("expires_at", in1day.toISOString())
      .lt("expires_at", in1dayEnd.toISOString());

    const tmpl1 = await getTemplate("expiry_warning_1");
    for (const sub of expiring1 || []) {
      const email = sub.profiles?.email;
      const name = sub.profiles?.full_name || "there";
      if (!email) continue;
      const renewalDate = new Date(sub.expires_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
      const amount = "$" + (sub.amount_paid || "19.99");
      const html = tmpl1 ? generateEmailHtml(tmpl1.blocks, name, email, tmpl1, { renewalDate, plan: sub.plan, amount }) : null;
      if (html) {
        const ok = await sendEmail(email, name, tmpl1.subject || "Your subscription renews tomorrow", html);
        if (ok) results.sent++; else results.errors++;
      }
    }

    console.log("Cron results:", results);
    return NextResponse.json({ success: true, ...results });
  } catch(e) {
    console.error("Cron error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
'''

open('app/api/cron/route.js', 'w', encoding='utf-8').write(code)
print("Created cron route!")

# Create vercel.json with cron config
vercel = '''{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 9 * * *"
    }
  ]
}
'''
open('vercel.json', 'w', encoding='utf-8').write(vercel)
print("Created vercel.json!")