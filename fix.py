content = open('app/api/stripe/create-account/route.js', encoding='utf-8').read()

old = '''    const weeks = PLAN_WEEKS[plan] || 4;
    const amount = PLAN_PRICES[plan]?.[paymentType] || 19.99;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
    const nextBillingAt = paymentType === "recurring" ? expiresAt : null;

    const { data: sub, error: subError } = await supabase.from("subscriptions").insert({
      user_id: userId, plan, type: paymentType, status: "active", amount_paid: amount,
      stripe_payment_intent_id: paymentIntentId, started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(), next_billing_at: nextBillingAt?.toISOString(),
    }).select().single();'''

new = '''    const weeks = PLAN_WEEKS[plan] || 4;
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
      await supabase.from("subscriptions").update({ status: "renewed" }).eq("user_id", userId);
    }

    const expiresAt = new Date(startFrom.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
    const nextBillingAt = paymentType === "recurring" ? expiresAt : null;

    const { data: sub, error: subError } = await supabase.from("subscriptions").insert({
      user_id: userId, plan, type: paymentType, status: "active", amount_paid: amount,
      stripe_payment_intent_id: paymentIntentId, started_at: startFrom.toISOString(),
      expires_at: expiresAt.toISOString(), next_billing_at: nextBillingAt?.toISOString(),
    }).select().single();'''

content = content.replace(old, new)
open('app/api/stripe/create-account/route.js', 'w', encoding='utf-8').write(content)
print("Done!" if "startFrom" in content else "FAILED")