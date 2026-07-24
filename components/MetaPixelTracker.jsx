"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/meta";

export default function MetaPixelTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !window.fbq) return;

    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? match[2] : undefined;
    };

    let externalId, email, name;
    try {
      externalId = localStorage.getItem("user_id") || undefined;
      email = localStorage.getItem("user_email") || undefined;
      name = localStorage.getItem("user_name") || undefined;
    } catch(e) {}

    if (externalId || email) {
      const nameParts = (name || "").trim().split(" ");
      window.fbq("init", "1707573550631351", {
        em: email,
        fn: nameParts[0] || undefined,
        ln: nameParts[1] || undefined,
        external_id: externalId,
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
      });
    }

    const pageName = pathname === "/" ? "Home" : pathname.replace("/", "").replace(/-/g, " ");
    trackEvent("PageView", { email, name, externalId });
    trackEvent("ViewContent", { contentName: pageName, contentType: "page", email, name, externalId });
  }, [pathname]);

  return null;
}
