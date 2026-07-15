"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ChangePassword from "@/components/profile/ChangePassword";
import PaymentModal from "@/components/quiz/PaymentModal";
import { Shield, CreditCard, ChevronRight, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("account");
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showManage, setShowManage] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [showRenew, setShowRenew] = useState(false);

  const email = user?.email || "";
  const displayName = user?.user_metadata?.full_name || email?.split("@")[0] || "Learner";

  useEffect(() => {
    if (!user) return;
    supabase.from("subscriptions").select("*").eq("user_id", user.id)
      .order("expires_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { setSub(data); setLoading(false); });
  }, [user]);

  const daysLeft = sub ? Math.max(0, Math.ceil((new Date(sub.expires_at) - new Date()) / 86400000)) : 0;
  const isActive = sub && daysLeft > 0 && sub.status !== "cancelled";

  const handleCancel = async () => {
    setCancelling(true);
    await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", sub.id);
    setCancelled(true);
    setSub(prev => ({ ...prev, status: "cancelled" }));
    setShowManage(false);
    setCancelling(false);
  };

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"24px 16px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <Link href="/profile" style={{ textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff" }}>
          <ArrowLeft size={16} color="#374151"/>
        </Link>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:0 }}>Settings</h1>
          <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Manage your account and security</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", background:"#F1F5F9", borderRadius:12, padding:4, marginBottom:24 }}>
        {[["account", CreditCard, "Account & Subscription"], ["security", Shield, "Security"]].map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px", borderRadius:9, border:"none", background:tab===key?"#fff":"transparent", fontWeight:700, fontSize:13, color:tab===key?"#0f172a":"#94A3B8", cursor:"pointer", boxShadow:tab===key?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>
            <Icon size={15}/> {label}
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {tab === "account" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:"#94A3B8" }}>Loading...</div>
          ) : sub ? (
            <>
              {/* Plan card */}
              <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
                <div style={{ background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", padding:"24px 28px" }}>
                  <p style={{ color:"rgba(255,255,255,0.7)", fontSize:12, fontWeight:700, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:1 }}>Current Plan</p>
                  <h2 style={{ color:"#fff", fontSize:24, fontWeight:900, margin:"0 0 4px" }}>{sub.plan}</h2>
                  <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13, margin:0 }}>
                    {isActive ? `${daysLeft} days remaining` : sub.status === "cancelled" ? "Cancelled — access until expiry" : "Expired"}
                  </p>
                </div>
                <div style={{ padding:"20px 28px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
                    {[
                      ["Status", isActive ? "✅ Active" : sub.status === "cancelled" ? "⏸ Cancelled" : "❌ Expired"],
                      ["Amount Paid", `$${parseFloat(sub.amount_paid||0).toFixed(2)}`],
                      ["Started", new Date(sub.started_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })],
                      ["Expires", new Date(sub.expires_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })],
                    ].map(([k,v]) => (
                      <div key={k} style={{ background:"#F8FAFC", borderRadius:10, padding:"12px 14px" }}>
                        <p style={{ fontSize:11, color:"#94A3B8", fontWeight:700, margin:"0 0 4px", textTransform:"uppercase" }}>{k}</p>
                        <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => setShowRenew(true)}
                      style={{ flex:2, padding:"13px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                      {isActive ? "🚀 Extend Plan" : "🔄 Renew Access"}
                    </button>
                    {isActive && sub.status !== "cancelled" && (
                      <button onClick={() => setShowManage(true)}
                        style={{ flex:1, padding:"13px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", color:"#64748B", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                        Manage
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div style={{ background:"#EEF2FF", border:"1.5px solid #C7D2FE", borderRadius:14, padding:"14px 18px" }}>
                <p style={{ fontSize:13, color:"#4338CA", margin:0, lineHeight:1.6 }}>
                  💡 Need help with your subscription? Contact us at <a href="mailto:support@1course.io" style={{ color:"#5B4EFF", fontWeight:700 }}>support@1course.io</a>
                </p>
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #E2E8F0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>💳</div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>No active subscription</h3>
              <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Get a plan to access all courses</p>
              <Link href="/quiz"><button style={{ padding:"12px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Get Started →</button></Link>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
          <ChangePassword/>
        </div>
      )}

      {/* Manage Subscription Modal */}
      {showManage && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:420, boxShadow:"0 32px 80px rgba(0,0,0,0.3)", overflow:"hidden" }}>
            <div style={{ background:"linear-gradient(135deg,#f97316,#ef4444)", padding:"28px 28px 24px", textAlign:"center" }}>
              <div style={{ fontSize:44, marginBottom:8 }}>⚠️</div>
              <h2 style={{ color:"#fff", fontSize:20, fontWeight:900, margin:"0 0 6px" }}>Manage Subscription</h2>
              <p style={{ color:"rgba(255,255,255,0.8)", fontSize:13, margin:0 }}>You still have {daysLeft} days of access remaining</p>
            </div>
            <div style={{ padding:"24px 28px" }}>
              <div style={{ background:"#FFF7ED", border:"1.5px solid #FED7AA", borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
                <p style={{ fontSize:13, color:"#9a3412", margin:0, lineHeight:1.6 }}>
                  If you cancel, you'll keep access until <strong>{new Date(sub.expires_at).toLocaleDateString("en-US", { month:"long", day:"numeric" })}</strong>. After that, you won't be able to access your courses.
                </p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <button onClick={() => { setShowManage(false); setShowRenew(true); }}
                  style={{ padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  🚀 Extend My Plan Instead
                </button>
                <button onClick={() => setShowManage(false)}
                  style={{ padding:"13px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  Keep My Subscription
                </button>
                <button onClick={handleCancel} disabled={cancelling}
                  style={{ padding:"11px", borderRadius:12, border:"none", background:"transparent", color:"#94A3B8", fontSize:12, cursor:"pointer", textDecoration:"underline" }}>
                  {cancelling ? "Cancelling..." : "Cancel subscription"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenew && (
        <PaymentModal
          plan={sub?.plan || "4-Week Plan"}
          paymentType="one_time"
          email={email}
          name={displayName}
          isRenewal={true}
          onClose={() => setShowRenew(false)}
          onSuccess={() => { setShowRenew(false); window.location.reload(); }}
        />
      )}
    </div>
  );
}
