"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ExpiredPage() {
  const router = useRouter();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      setSub(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a081e", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden" }}>
      {/* Blurred background */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"url('/placeholder-dashboard.png')", backgroundSize:"cover", filter:"blur(8px)", opacity:0.15 }}/>

      <div style={{ position:"relative", zIndex:10, textAlign:"center", maxWidth:500, width:"100%" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🔒</div>
        <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, padding:"40px 32px", backdropFilter:"blur(20px)" }}>
          <h1 style={{ fontSize:28, fontWeight:900, color:"#fff", margin:"0 0 12px" }}>Your Access Has Expired</h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.6)", margin:"0 0 24px", lineHeight:1.7 }}>
            Your 1Course subscription has ended. Renew now to continue learning and keep your progress.
          </p>

          {!loading && sub && (
            <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:14, padding:"14px 20px", marginBottom:24, border:"1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>Last plan</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#a78bfa" }}>{sub.plan}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>Expired on</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#f87171" }}>{new Date(sub.expires_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>Type</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{sub.type === "recurring" ? "Auto-renew" : "One-time"}</span>
              </div>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Link href="/renew" style={{ display:"block", padding:"16px", borderRadius:14, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, textDecoration:"none", boxShadow:"0 8px 24px rgba(91,78,255,0.4)" }}>
              🚀 Renew My Access
            </Link>
            <button onClick={handleSignOut} style={{ padding:"12px", borderRadius:14, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"rgba(255,255,255,0.6)", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              Sign Out
            </button>
          </div>

          <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginTop:20 }}>
            Need help? Contact us at support@kingbrandsbro.pro
          </p>
        </div>
      </div>
    </div>
  );
}
