import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { code, amount } = await req.json();
    if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: discount } = await supabase
      .from("discounts")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("active", true)
      .single();

    if (!discount) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    if (discount.expires_at && new Date(discount.expires_at) < new Date())
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    if (discount.max_uses && discount.uses >= discount.max_uses)
      return NextResponse.json({ error: "Coupon has reached its usage limit" }, { status: 400 });

    const discountAmount = discount.type === "percentage"
      ? Math.round(amount * discount.value / 100)
      : Math.round(discount.value * 100);

    const finalAmount = Math.max(amount - discountAmount, 50); // min 50 cents

    return NextResponse.json({
      ok: true,
      discount,
      discountAmount,
      finalAmount,
      label: discount.type === "percentage" ? `${discount.value}% off` : `$${discount.value} off`
    });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
