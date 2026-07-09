"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const BrandingContext = createContext({ logoMain:"", logoApp:"", siteName:"1Course" });

let cachedBranding = null;

export function BrandingProvider({ children, initialBranding }) {
  const [branding, setBranding] = useState(initialBranding || cachedBranding || { logoMain:"", logoApp:"", siteName:"1Course" });

  useEffect(() => {
    if (cachedBranding) { setBranding(cachedBranding); return; }
    if (initialBranding) { cachedBranding = initialBranding; return; }
    supabase.from("settings").select("value").eq("key","branding").single().then(({ data }) => {
      if (data?.value) { cachedBranding = data.value; setBranding(data.value); }
    });
  }, []);

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
