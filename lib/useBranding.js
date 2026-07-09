// Re-export from BrandingContext for backward compatibility
export { useBranding } from "@/lib/BrandingContext";

export async function getBranding() {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data } = await sb.from("settings").select("value").eq("key","branding").single();
  return data?.value || {};
}
