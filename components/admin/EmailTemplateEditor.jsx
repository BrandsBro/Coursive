import os
os.makedirs('app/api/cron', exist_ok=True)

code = open('app/api/cron/route.js', 'w', encoding='utf-8') if False else None

content = '''import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

async function getTemplate(trigger) {
  const { data } = await supabase.from("settings").select("value").eq("key","email_templates").single();
  const templates = data?.value || [];
  return templates.find(t => t.trigger === trigger && t.active !== false);
}

async function sendEmail(to, subject, html) {
  const { error } = await resend.emails.send({ from: "noreply@1course.io", to, subject, html });
  if (error) console.error("Email error:", error);
  return !error;
}

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== "Bearer " + process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = { sent: 0, errors: 0 };

  try {
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
      if (!email || !tmpl3) continue;
      const renewalDate = new Date(sub.expires_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
      const ok = await sendEmail(email, tmpl3.subject || "Subscription renews in 3 days", "<p>Hi " + name + ", your subscription renews on " + renewalDate + "</p>");
      if (ok) results.sent++; else results.errors++;
    }

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
      if (!email || !tmpl1) continue;
      const renewalDate = new Date(sub.expires_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
      const ok = await sendEmail(email, tmpl1.subject || "Subscription renews tomorrow", "<p>Hi " + name + ", your subscription renews tomorrow on " + renewalDate + "</p>");
      if (ok) results.sent++; else results.errors++;
    }

    return NextResponse.json({ success: true, ...results });
  } catch(e) {
    console.error("Cron error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
'''

open('app/api/cron/route.js', 'w', encoding='utf-8').write(content)
print("Done!")