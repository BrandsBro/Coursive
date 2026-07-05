content = open('app/api/stripe/create-account/route.js', encoding='utf-8').read()

old = '''    // For renewals, extend from current expiry if not expired yet
    let startFrom = now;
    if (existingProfile) {
      const { data: existingSubs } = await supabase.from("subscriptions")
        .select("expires_at, status")
        .eq("user_id", userId)
        .order("expires_at", { ascending: false })
        .limit(1);
      const existingSub = existingSubs?.[0];
      console.log("Existing sub:", existingSub);
      if (existingSub?.expires_at) {
        const currentExpiry = new Date(existingSub.expires_at);
        if (currentExpiry > now) {
          startFrom = currentExpiry;
          console.log("Extending from:", startFrom);
        }
      }
      // Mark old subscriptions as renewed
      await supabase.from("subscriptions").update({ status:"renewed" })
        .eq("user_id", userId)
        .neq("status","renewed");
    }
    console.log("startFrom:", startFrom, "expiresAt will be:", new Date(startFrom.getTime() + weeks * 7 * 24 * 60 * 60 * 1000));'''

new = '''    // For renewals, extend from latest expiry
    let startFrom = now;
    if (existingProfile) {
      // Get the latest expiry across all subscriptions
      const { data: existingSubs } = await supabase.from("subscriptions")
        .select("expires_at")
        .eq("user_id", userId)
        .order("expires_at", { ascending: false })
        .limit(1);
      if (existingSubs && existingSubs.length > 0) {
        const latestExpiry = new Date(existingSubs[0].expires_at);
        if (latestExpiry > now) startFrom = latestExpiry;
      }
      // Mark all old subscriptions as renewed
      await supabase.from("subscriptions")
        .update({ status: "renewed" })
        .eq("user_id", userId);
    }'''

content = content.replace(old, new)
open('app/api/stripe/create-account/route.js', 'w', encoding='utf-8').write(content)
print("Done!")