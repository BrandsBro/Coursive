import { NextResponse } from "next/server";
import { addToKlaviyoList } from "@/lib/klaviyo";

export async function POST(req) {
  try {
    const { email, name } = await req.json();
    const nameParts = (name || "").trim().split(" ");
    const result = await addToKlaviyoList(process.env.KLAVIYO_LEADS_LIST_ID, {
      email,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      properties: { source: "klaviyo_test" },
    });
    return NextResponse.json({ ok: result });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
