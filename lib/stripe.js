import { createClient } from "@supabase/supabase-js";

export async function getStripeKey() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data } = await supabase.from("settings").select("value").eq("key","payment_settings").single();
  const settings = data?.value || {};
  const mode = settings.mode || "test";
  if (mode === "live" && settings.liveSecretKey) return settings.liveSecretKey;
  if (mode === "test" && settings.testSecretKey) return settings.testSecretKey;
  // Fallback to env var
  return process.env.STRIPE_SECRET_KEY;
}

export async function getStripePublishableKey() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data } = await supabase.from("settings").select("value").eq("key","payment_settings").single();
  const settings = data?.value || {};
  const mode = settings.mode || "test";
  if (mode === "live" && settings.livePublishableKey) return settings.livePublishableKey;
  if (mode === "test" && settings.testPublishableKey) return settings.testPublishableKey;
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

export async function getWebhookSecret() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data } = await supabase.from("settings").select("value").eq("key","payment_settings").single();
  const settings = data?.value || {};
  const mode = settings.mode || "test";
  if (mode === "live" && settings.liveWebhookSecret) return settings.liveWebhookSecret;
  if (mode === "test" && settings.testWebhookSecret) return settings.testWebhookSecret;
  return process.env.STRIPE_WEBHOOK_SECRET;
}
