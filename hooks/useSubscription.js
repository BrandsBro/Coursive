"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function useSubscription() {
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading, active, expired, none
  const [subscription, setSubscription] = useState(null);
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Skip for admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (profile?.is_admin) { setStatus("active"); return; }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!sub) { setStatus("none"); router.push("/expired"); return; }

      const now = new Date();
      const expires = new Date(sub.expires_at);
      const diff = expires - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      setSubscription(sub);
      setDaysLeft(days);

      if (diff <= 0) {
        // Mark as expired
        await supabase.from("subscriptions").update({ status:"expired" }).eq("id", sub.id);
        setStatus("expired");
        router.push("/expired");
      } else {
        setStatus("active");
      }
    };
    check();
  }, []);

  return { status, subscription, daysLeft };
}
