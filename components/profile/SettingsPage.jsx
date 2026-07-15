"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ChangePassword from "@/components/profile/ChangePassword";
import PaymentModal from "@/components/quiz/PaymentModal";
import { Shield, CreditCard, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("account");
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showManage, setShowManage] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
    setSub(prev => ({ ...prev, status: "cancelled" }));
    setShowManage(false);
    setCancelling(false);
  };

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom: isMobile ? 20 : 28 }}>
        <Link href="/profile" style={{ textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", flexShrink:0 }}>
          <ArrowLeft size={16} color="#374151"/>
        </Link>
        <div>
          <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight:900, color:"#0f172a", margin:0 }}>Settings</h1>
          <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Manage your account and security</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", background:"#F1F5F9", borderRadius:12, padding:4, marginBottom:20 }}>
        {[["account", CreditCard, isMobile ? "Account" : "Account & Subscription"], ["security", Shield, "Security"]].map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding: isMobile ? "9px 6px" : "10px", borderRadius:9, border:"none", background:tab===key?"#fff":"transparent", fontWeight:700, fontSize: isMobile ? 12 : 13, color:tab===key?"#0f172a":"#94A3B8", cursor:"pointer", boxShadow:tab===key?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>
            <Icon size={14}/> {label}
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {tab === "account" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:"#94A3B8" }}>Loading...</div>
          ) : sub ? (
            <>
              <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
                <div style={{ background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", padding: isMobile ? "20px 20px" : "24px 28px" }}>
                  <p style={{ color:"rgba(255,255,255,0.7)", fontSize:12, fontWeight:700, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:1 }}>Current Plan</p>
                  <h2 style={{ color:"#fff", fontSize: isMobile ? 20 : 24, fontWeight:900, margin:"0 0 4px" }}>{sub.plan}</h2>
                  <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13, margin:0 }}>
                    {isActive ? `${daysLeft} days remaining` : sub.status === "cancelled" ? "Cancelled — access until expiry" : "Expired"}
                  </p>
                </div>
                <div style={{ padding: isMobile ? "16px" : "20px 28px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: isMobile ? 10 : 16, marginBottom:16 }}>
                    {[
                      ["Status", isActive ? "✅ Active" : sub.status === "cancelled" ? "⏸ Cancelled" : "❌ Expired"],
                      ["Amount Paid", `$${parseFloat(sub.amount_paid||0).toFixed(2)}`],
                      ["Started", new Date(sub.started_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })],
                      ["Expires", new Date(sub.expires_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })],
                    ].map(([k,v]) => (
                      <div key={k} style={{ background:"#F8FAFC", borderRadius:10, padding: isMobile ? "10px 12px" : "12px 14px" }}>
                        <p style={{ fontSize:10, color:"#94A3B8", fontWeight:700, margin:"0 0 3px", textTransform:"uppercase" }}>{k}</p>
                        <p style={{ fontSize: isMobile ? 13 : 14, fontWeight:700, color:"#0f172a", margin:0 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <div style={{ display:"flex", gap:10 }}>
                      <button onClick={() => setShowRenew(true)}
                        style={{ flex:2, padding: isMobile ? "12px" : "13px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize: isMobile ? 13 : 14, fontWeight:700, cursor:"pointer" }}>
                        {isActive ? "🚀 Extend Plan" : "🔄 Renew Access"}
                      </button>
                      {isActive && sub.status !== "cancelled" && (
                        <button onClick={() => setShowManage(true)}
                          style={{ flex:1, padding: isMobile ? "12px" : "13px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", color:"#64748B", fontSize: isMobile ? 12 : 13, fontWeight:600, cursor:"pointer" }}>
                          Manage
                        </button>
                      )}
                    </div>
                    {isActive && sub.plan === "1-Week Plan" && (
                      <div style={{ display:"flex", gap:10, flexDirection: isMobile ? "column" : "row" }}>
                        <button onClick={() => { setUpgradePlan("4-Week Plan"); setShowRenew(true); }}
                          style={{ flex:1, padding:"11px", borderRadius:12, border:"1.5px solid #5B4EFF", background:"#EEF2FF", color:"#5B4EFF", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                          ⬆ Upgrade to 4-Week
                        </button>
                        <button onClick={() => { setUpgradePlan("12-Week Plan"); setShowRenew(true); }}
                          style={{ flex:1, padding:"11px", borderRadius:12, border:"1.5px solid #7c3aed", background:"#F5F3FF", color:"#7c3aed", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                          ⬆ Upgrade to 12-Week
                        </button>
                      </div>
                    )}
                    {isActive && sub.plan === "4-Week Plan" && (
                      <button onClick={() => { setUpgradePlan("12-Week Plan"); setShowRenew(true); }}
                        style={{ width:"100%", padding:"11px", borderRadius:12, border:"1.5px solid #7c3aed", background:"#F5F3FF", color:"#7c3aed", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                        ⬆ Upgrade to 12-Week Plan
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ background:"#EEF2FF", border:"1.5px solid #C7D2FE", borderRadius:14, padding:"14px 18px" }}>
                <p style={{ fontSize:13, color:"#4338CA", margin:0, lineHeight:1.6 }}>
                  💡 Need help? Contact us at <a href="mailto:support@1course.io" style={{ color:"#5B4EFF", fontWeight:700 }}>support@1course.io</a>
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
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding: isMobile ? 16 : 24 }}>
          <ChangePassword/>
        </div>
      )}

      {/* Manage Modal */}
      {showManage && (
        <div onClick={() => setShowManage(false)} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems: isMobile ? "flex-end" : "center", justifyContent:"center", padding: isMobile ? 0 : 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius: isMobile ? "20px 20px 0 0" : 24, width:"100%", maxWidth: isMobile ? "100%" : 420, boxShadow:"0 32px 80px rgba(0,0,0,0.3)", overflow:"hidden" }}>
            <div style={{ padding: isMobile ? "24px 20px" : "24px 28px" }}>
              <h2 style={{ fontSize:20, fontWeight:900, color:"#0f172a", margin:"0 0 12px" }}>Manage Subscription</h2>
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
                <button onClick={() => setShowConfirmCancel(true)}
                  style={{ padding:"11px", borderRadius:12, border:"none", background:"transparent", color:"#94A3B8", fontSize:12, cursor:"pointer", textDecoration:"underline" }}>
                  Cancel subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      {showConfirmCancel && (
        <div onClick={() => setShowConfirmCancel(false)} style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(15,23,42,0.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:380, boxShadow:"0 32px 80px rgba(0,0,0,0.3)", padding:"28px 24px" }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>😢</div>
              <h2 style={{ fontSize:18, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>Are you sure?</h2>
              <p style={{ fontSize:14, color:"#64748B", margin:0, lineHeight:1.6 }}>
                You'll lose access to all your courses on <strong style={{ color:"#0f172a" }}>{new Date(sub?.expires_at).toLocaleDateString("en-US", { month:"long", day:"numeric" })}</strong>.
              </p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button onClick={() => { setShowConfirmCancel(false); }}
                style={{ padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                Keep My Subscription
              </button>
              <button onClick={() => { setShowConfirmCancel(false); handleCancel(); }} disabled={cancelling}
                style={{ padding:"13px", borderRadius:12, border:"1.5px solid #FEE2E2", background:"#fff", color:"#ef4444", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                {cancelling ? "Cancelling..." : "Yes, cancel my subscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenew && (
        <PaymentModal
          plan={upgradePlan || sub?.plan || "4-Week Plan"}
          paymentType="one_time"
          email={email}
          name={displayName}
          isRenewal={true}
          onClose={() => { setShowRenew(false); setUpgradePlan(null); }}
          onSuccess={() => { setShowRenew(false); setUpgradePlan(null); window.location.reload(); }}
        />
      )}
    </div>
  );
}
