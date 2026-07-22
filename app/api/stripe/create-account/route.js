import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const PLAN_WEEKS = {
  "1-Week Plan": 1,
  "4-Week Plan": 4,
  "12-Week Plan": 12,
};

const PLAN_PRICES = {
  "1-Week Plan": { one_time: 6.93, recurring: 5.99 },
  "4-Week Plan": { one_time: 19.99, recurring: 16.99 },
  "12-Week Plan": { one_time: 39.99, recurring: 32.99 },
};

function generateEmailHtml(blocks, name, email, tempPassword, tmpl) {
  const cardBg = tmpl.cardBg || "#0a081e";
  const emailBg = tmpl.emailBg || "#050411";
  const replace = (text) =>
    (text || "").replace(/{name}/g, name).replace(/{email}/g, email);
  const blockHtml = blocks
    .map((b) => {
      switch (b.type) {
        case "header":
          return (
            '<div style="background:linear-gradient(135deg,' +
            (b.bg1 || "#5B4EFF") +
            "," +
            (b.bg2 || "#8B5CF6") +
            ");padding:" +
            (b.padding || 48) +
            'px 40px;text-align:center"></div>'
          );
        case "logo":
          return b.logoUrl
            ? '<div style="padding:20px 40px;text-align:' +
                (b.align || "center") +
                '"><img src="' +
                b.logoUrl +
                '" alt="Logo" style="height:' +
                (b.logoHeight || 44) +
                'px;object-fit:contain;display:inline-block"/></div>'
            : "";
        case "heading":
          return (
            '<div style="padding:4px 40px"><p style="font-size:' +
            (b.size || 22) +
            "px;margin:0 0 8px;color:" +
            (b.color || "#fff") +
            ";text-align:" +
            (b.align || "left") +
            ";font-weight:" +
            (b.bold ? "900" : "700") +
            ';line-height:1.3">' +
            replace(b.text) +
            "</p></div>"
          );
        case "text":
          return (
            '<div style="padding:4px 40px"><div style="color:' +
            (b.color || "rgba(255,255,255,0.7)") +
            ";font-size:" +
            (b.size || 15) +
            "px;line-height:" +
            (b.lineHeight || 1.8) +
            ";text-align:" +
            (b.align || "left") +
            ';margin:0 0 8px">' +
            (b.html
              ? replace(b.html)
              : (b.text || "").replace(/\n/g, "<br/>")) +
            "</div></div>"
          );
        case "button":
          return (
            '<div style="padding:12px 40px;text-align:' +
            (b.align || "center") +
            '"><a href="' +
            (b.url || "#") +
            '" style="display:inline-block;padding:' +
            (b.paddingV || 16) +
            "px " +
            (b.paddingH || 32) +
            "px;background:linear-gradient(135deg," +
            (b.bgFrom || "#5B4EFF") +
            "," +
            (b.bgTo || "#8B5CF6") +
            ");color:" +
            (b.color || "#fff") +
            ";text-decoration:none;border-radius:" +
            (b.radius || 14) +
            "px;font-weight:700;font-size:" +
            (b.size || 16) +
            'px">' +
            (b.text || "Click here") +
            "</a></div>"
          );
        case "divider":
          return (
            '<div style="margin:' +
            (b.margin || 24) +
            "px 40px;border-top:1px solid " +
            (b.color || "rgba(255,255,255,0.08)") +
            '"></div>'
          );
        case "spacer":
          return '<div style="height:' + (b.height || 24) + 'px"></div>';
        case "credentials":
          return (
            '<div style="background:' +
            (b.cardBg || "#1a1830") +
            ";border-radius:14px;padding:24px 28px;margin:8px 40px 16px;border:1px solid " +
            (b.cardBorder || "rgba(255,255,255,0.1)") +
            '"><p style="margin:0 0 4px;color:' +
            (b.labelColor || "rgba(255,255,255,0.5)") +
            ';font-size:11px;text-transform:uppercase">Email</p><p style="margin:0 0 20px;font-weight:700;color:' +
            (b.emailColor || "#a78bfa") +
            ';font-size:15px">' +
            email +
            '</p><p style="margin:0 0 4px;color:' +
            (b.labelColor || "rgba(255,255,255,0.5)") +
            ';font-size:11px;text-transform:uppercase">Temporary Password</p><p style="margin:0;font-weight:900;font-size:22px;color:' +
            (b.pwColor || "#fff") +
            ";background:" +
            (b.pwBg || "rgba(91,78,255,0.2)") +
            ';padding:14px;border-radius:10px;text-align:center;font-family:monospace;letter-spacing:2px">' +
            tempPassword +
            "</p></div>"
          );
        case "footer":
          return (
            '<div style="padding:' +
            (b.padding || 24) +
            "px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:" +
            (b.align || "center") +
            ";background:" +
            (b.bg || "transparent") +
            '"><p style="color:' +
            (b.color || "rgba(255,255,255,0.3)") +
            ";font-size:" +
            (b.size || 12) +
            'px;margin:0;line-height:1.6">' +
            replace(b.text) +
            "</p></div>"
          );
        default:
          return "";
      }
    })
    .join("");
  return (
    '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:' +
    emailBg +
    ';padding:32px 0"><div style="max-width:600px;margin:0 auto;background:' +
    cardBg +
    ';border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4)">' +
    blockHtml +
    "</div></div>"
  );
}

function fallbackEmailHtml(
  name,
  email,
  tempPassword,
  plan,
  paymentType,
  expiresAt,
  siteUrl,
) {
  return (
    '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden"><div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center"><h1 style="margin:0;font-size:28px;font-weight:900">✦ 1Course</h1></div><div style="padding:32px"><h2 style="font-size:22px;margin:0 0 12px;color:#5B4EFF">Welcome, ' +
    name +
    '! 🎉</h2><div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:24px;margin:0 0 20px;border:1px solid rgba(255,255,255,0.1)"><p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Email</p><p style="margin:0 0 16px;font-weight:700">' +
    email +
    '</p><p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Password</p><p style="margin:0;font-weight:900;font-size:22px;background:rgba(91,78,255,0.2);padding:12px;border-radius:8px;text-align:center;font-family:monospace">' +
    tempPassword +
    '</p></div><a href="' +
    siteUrl +
    "/login?email=" +
    encodeURIComponent(email) +
    '" style="display:block;text-align:center;padding:16px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:12px;font-weight:700">Log In to 1Course →</a></div></div>'
  );
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, plan, paymentType, paymentIntentId } = body;
    let purchaseEventId = body.purchaseEventId;
    console.log("Creating account for:", email, name, plan, paymentType);
    if (!purchaseEventId && paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        purchaseEventId = pi.metadata?.purchaseEventId || "";
      } catch(e) {}
    }

    const tempPassword = Math.random().toString(36).slice(2, 10) + "A1!";

    let userId = null;
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      const { data: userData, error: userError } =
        await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: name },
        });
      if (userError) {
        console.error("Create user error:", userError);
        throw userError;
      }
      userId = userData?.user?.id;
    }

    if (!userId) throw new Error("Could not get user ID");

    const weeks = PLAN_WEEKS[plan] || 4;
    const amount = PLAN_PRICES[plan]?.[paymentType] || 19.99;
    const now = new Date();

    // Extend from latest expiry for renewals
    let startFrom = now;
    if (existingProfile) {
      const { data: existingSubs } = await supabase
        .from("subscriptions")
        .select("expires_at")
        .eq("user_id", userId)
        .order("expires_at", { ascending: false })
        .limit(1);
      if (existingSubs && existingSubs.length > 0) {
        const latestExpiry = new Date(existingSubs[0].expires_at);
        if (latestExpiry > now) startFrom = latestExpiry;
      }
      await supabase
        .from("subscriptions")
        .update({ status: "renewed" })
        .eq("user_id", userId);
    }

    const expiresAt = new Date(
      startFrom.getTime() + weeks * 7 * 24 * 60 * 60 * 1000,
    );
    const nextBillingAt = paymentType === "recurring" ? expiresAt : null;

    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan,
        type: paymentType,
        status: "active",
        amount_paid: amount,
        stripe_payment_intent_id: paymentIntentId,
        started_at: startFrom.toISOString(),
        expires_at: expiresAt.toISOString(),
        next_billing_at: nextBillingAt?.toISOString(),
      })
      .select()
      .single();

    if (subError) console.error("Subscription error:", subError);

    await supabase.from("payment_history").insert({
      user_id: userId,
      subscription_id: sub?.id,
      amount,
      status: "succeeded",
      stripe_payment_id: paymentIntentId,
      plan,
      type: paymentType,
    });

    // Fire Meta CAPI Purchase event
    try {
      const { randomUUID } = await import("crypto");
      const eventId = randomUUID();
      console.log("[Meta] Server Purchase eventId:", purchaseEventId || eventId, "purchaseEventId from body:", purchaseEventId);
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}api/meta/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "Purchase",
          email,
          value: parseFloat(amount),
          currency: "USD",
          eventId: purchaseEventId || eventId,
        // Log for debugging

          contentName: plan,
          orderId: paymentIntentId,
        }),
      });
    } catch(e) { console.error("Meta CAPI error:", e); }


    // Mark lead as converted
    try {
      await supabase.from("leads").update({ converted: true }).eq("email", email);
    } catch(e) {}

    // Send admin notifications
    try {
      const { data: notifSettings } = await supabase
        .from("settings").select("value").eq("key","admin_notifications").single();
      const adminEmails = notifSettings?.value?.emails || [];
      if (adminEmails.length > 0) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "1Course <noreply@1course.io>",
          to: adminEmails,
          subject: `New Purchase: ${plan} - ${name}`,
          html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:40px auto;padding:0 16px">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#5B4EFF 0%,#8B5CF6 100%);border-radius:20px 20px 0 0;padding:32px 32px 28px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">🎉</div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px">New Purchase!</h1>
      <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:14px">A new user just subscribed to 1Course</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:28px 32px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0">
      
      <!-- Amount highlight -->
      <div style="background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:1.5px solid #BBF7D0;border-radius:14px;padding:16px 20px;text-align:center;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#166534;font-weight:600">AMOUNT PAID</p>
        <p style="margin:4px 0 0;font-size:36px;font-weight:900;color:#15803D">$${parseFloat(amount).toFixed(2)}</p>
      </div>

      <!-- Details -->
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;width:40%">
            <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Customer</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9">
            <span style="font-size:14px;font-weight:700;color:#0f172a">${name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9">
            <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Email</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9">
            <a href="mailto:${email}" style="font-size:14px;font-weight:600;color:#5B4EFF;text-decoration:none">${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9">
            <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Plan</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9">
            <span style="display:inline-block;background:#EEF2FF;color:#5B4EFF;font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px">${plan}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0">
            <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Type</span>
          </td>
          <td style="padding:12px 0">
            <span style="font-size:14px;font-weight:600;color:#374151">${paymentType}</span>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="margin-top:24px;text-align:center">
        <a href="https://1course.io/admin/users" style="display:inline-block;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:12px;text-decoration:none">
          View in Admin Panel →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 20px 20px;padding:16px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:#94A3B8">1Course Admin Notification • <a href="https://1course.io" style="color:#5B4EFF;text-decoration:none">1course.io</a></p>
    </div>

  </div>
</body>
</html>`,
        });
      }
    } catch(e) { console.error("Admin notify error:", e); }

    const isExistingUser = !!existingProfile;
    const triggerKey = isExistingUser ? "auto_renewal" : "after_payment";
    let emailSubject = isExistingUser
      ? "Your 1Course access has been renewed!"
      : "Welcome to 1Course! Your login details inside";
    let emailHtml = "";

    try {
      const { data: settingsData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "email_templates")
        .single();
      const templates = settingsData?.value || [];
      const tmpl = templates.find(
        (t) => t.trigger === triggerKey && t.active !== false,
      );
      if (tmpl && tmpl.blocks && tmpl.blocks.length > 0) {
        emailSubject = tmpl.subject || emailSubject;
        emailHtml = generateEmailHtml(
          tmpl.blocks,
          name,
          email,
          tempPassword,
          tmpl,
        );
      }
    } catch (e) {
      console.error("Template load error:", e);
    }

    if (!emailHtml) {
      emailHtml = fallbackEmailHtml(
        name,
        email,
        tempPassword,
        plan,
        paymentType,
        expiresAt,
        process.env.NEXT_PUBLIC_SITE_URL,
      );
    }

    const { error: emailError } = await resend.emails.send({
      from: "noreply@1course.io",
      to: email,
      subject: emailSubject,
      html: emailHtml,
    });

    if (emailError) console.error("Email error:", emailError);
    else console.log("Email sent to:", email);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Create account error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
