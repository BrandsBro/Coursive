import { NextResponse } from "next/server";
import { addToKlaviyoList, trackKlaviyoEvent } from "@/lib/klaviyo";

export async function POST(req) {
  try {
    const { email, name, plan, amount } = await req.json();
    const nameParts = (name || "").trim().split(" ");
    const listResult = await addToKlaviyoList(process.env.KLAVIYO_CUSTOMERS_LIST_ID, {
      email,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      properties: { plan, amount, source: "klaviyo_test" },
    });
    const eventResult = await trackKlaviyoEvent(email, "Purchase", { plan, amount, currency: "USD" });
    return NextResponse.json({ list: listResult, event: eventResult });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
