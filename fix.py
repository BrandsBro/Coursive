import re

with open('app/api/stripe/create-account/route.js', encoding='utf-8') as f:
    content = f.read()

# Insert renewal logic after userId is confirmed
insert_after = '    if (!userId) throw new Error("Could not get user ID");'

renewal_code = '''

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
      await supabase.from("subscriptions").update({ status: "renewed" }).eq("user_id", userId);
    }'''

remove_old = "    const weeks = PLAN_WEEKS[plan] || 4;\n    const amount = PLAN_PRICES[plan]?.[paymentType] || 19.99;\n    const now = new Date();"

content = content.replace(remove_old, "")
content = content.replace(insert_after, insert_after + renewal_code)
content = content.replace(
    "    const expiresAt = new Date(now.getTime()",
    "    const expiresAt = new Date(startFrom.getTime()"
)
content = content.replace(
    "started_at: now.toISOString(),",
    "started_at: startFrom.toISOString(),"
)

with open('app/api/stripe/create-account/route.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!" if "startFrom" in content else "FAILED")