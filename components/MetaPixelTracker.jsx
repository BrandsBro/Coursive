"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/meta";

export default function MetaPixelTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const pageName = pathname === "/" ? "Home" : pathname.replace("/", "").replace(/-/g, " ");
    trackEvent("PageView", {});
    trackEvent("ViewContent", { contentName: pageName, contentType: "page" });
  }, [pathname]);
  return null;
}
