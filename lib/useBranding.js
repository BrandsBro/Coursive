import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

let cachedBranding = null;
let cacheTime = 0;
const CACHE_TTL = 30000;

export function useBranding() {
  const [branding, setBranding] = useState(cachedBranding || { logoMain:"", logoApp:"", siteName:"1Course" });

  useEffect(() => {
    const now = Date.now();
    if (cachedBranding && (now - cacheTime) < CACHE_TTL) { setBranding(cachedBranding); return; }
    supabase.from("settings").select("value").eq("key","branding").single().then(({ data }) => {
      if (data?.value) { cachedBranding = data.value; cacheTime = Date.now(); setBranding(data.value); }
    });
  }, []);

  return branding;
}

export async function getBranding() {
  if (cachedBranding) return cachedBranding;
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data } = await sb.from("settings").select("value").eq("key","branding").single();
  cachedBranding = data?.value || {};
  return cachedBranding;
}
