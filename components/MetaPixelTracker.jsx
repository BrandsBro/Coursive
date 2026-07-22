"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/meta";

export default function MetaPixelTracker() {
  const pathname = usePathname();
  useEffect(() => {
    trackEvent("PageView", {});
  }, [pathname]);
  return null;
}
