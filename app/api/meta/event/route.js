import { NextResponse } from "next/server";
import crypto from "crypto";

const hash = (val) => val ? crypto.createHash("sha256").update(val.trim().toLowerCase()).digest("hex") : undefined;

export async function POST(req) {
  try {
    const body = await req.json();
    const { eventName, email, phone, value, currency, eventId, contentName, orderId, fbp, fbc } = body;
    const clientIp = body.clientIp || req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "";
    const clientUserAgent = body.clientUserAgent || req.headers.get("user-agent") || "";
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CAPI_TOKEN;
    if (!pixelId || !accessToken || accessToken === "your_access_token_here") {
      return NextResponse.json({ ok: false, error: "CAPI not configured" });
    }
    const userData = {
      ...(email && { em: [hash(email)] }),
      ...(phone && { ph: [hash(phone)] }),
      ...(clientIp && { client_ip_address: clientIp }),
      ...(clientUserAgent && { client_user_agent: clientUserAgent }),
      ...(fbp && { fbp }),
      ...(fbc && { fbc }),
    };
    const testCode = process.env.META_TEST_CODE;
    const payload = {
      ...(testCode && { test_event_code: testCode }),
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId || crypto.randomUUID(),
        action_source: "website",
        event_source_url: "https://1course.io",
        user_data: userData,
        custom_data: {
          ...(value && { value, currency: currency || "USD" }),
          ...(contentName && { content_name: contentName, content_type: "product" }),
          ...(orderId && { order_id: orderId }),
        },
      }],
    };
    const res = await fetch(`https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return NextResponse.json({ ok: true, data });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
