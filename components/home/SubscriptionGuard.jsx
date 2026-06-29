"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SubscriptionGuard({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Skip check for admins
      const { data: profile } = await supabase
        .from("profiles").select("is_admin").eq("id", user.id).single();
      if (profile?.is_admin) { setStatus("active"); return; }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!sub) { window.location.href = "/expired"; return; }

      const now = new Date();
      const expires = new Date(sub.expires_at);
      const diff = expires - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (diff <= 0) {
        await supabase.from("subscriptions").update({ status:"expired" }).eq("id", sub.id);
        window.location.href = "/expired";
        return;
      }

      setDaysLeft(days);
      setStatus("active");
    };
    check();
  }, []);

  if (status === "loading") return children;

  return (
    <>
      {daysLeft !== null && daysLeft <= 3 && (
        <div style={{ background:"linear-gradient(135deg,#f59e0b,#ef4444)", padding:"12px 20px", textAlign:"center" }}>
          <p style={{ color:"#fff", fontSize:14, fontWeight:700, margin:0 }}>
            ⚠️ Your subscription expires in {daysLeft} day{daysLeft!==1?"s":""}!
            <a href="/quiz" style={{ color:"#fff", marginLeft:12, textDecoration:"underline", fontWeight:800 }}>Renew now →</a>
          </p>
        </div>
      )}
      {children}
    </>
  );
}
