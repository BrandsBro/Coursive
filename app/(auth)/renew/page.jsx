"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PaymentModal from "@/components/quiz/PaymentModal";
import Link from "next/link";

const PLANS = [
  { name:"1-Week Plan",  price:"6.93",  recurringPrice:"5.99",  weeks:1,  desc:"Perfect for a quick refresh" },
  { name:"4-Week Plan",  price:"19.99", recurringPrice:"16.99", weeks:4,  popular:true, desc:"Most popular choice" },
  { name:"12-Week Plan", price:"39.99", recurringPrice:"32.99", weeks:12, desc:"Best value for serious learners" },
];

export default function RenewPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sub, setSub] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("4-Week Plan");
  const [paymentType, setPaymentType] = useState("one_time");
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const { data } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending:false }).limit(1).single();
      setSub(data);
      setLoading(false);
    };
    load();
  }, []);

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    router.push("/payment-success");
  };

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const email = user?.email || "";

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a081e 0%,#1e1b4b 60%,#0f2744 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 20px" }}>
      <div style={{ width:"100%", maxWidth:520 }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <Link href="/" style={{ textDecoration:"none" }}>
            <h1 style={{ fontSize:28, fontWeight:900, color:"#fff", fontStyle:"italic", margin:"0 0 20px" }}>✦ 1Course</h1>
          </Link>
          <div style={{ width:64, height:64, borderRadius:20, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:28 }}>🚀</div>
          <h2 style={{ fontSize:26, fontWeight:900, color:"#fff", margin:"0 0 8px" }}>Renew Your Access</h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.6)", margin:0 }}>
            {sub ? `Your ${sub.plan} expired — pick a plan to continue` : "Choose a plan to get started"}
          </p>
        </div>

        {/* Payment type toggle */}
        <div style={{ display:"flex", background:"rgba(255,255,255,0.08)", borderRadius:14, padding:4, marginBottom:24 }}>
          <button onClick={() => setPaymentType("one_time")}
            style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background:paymentType==="one_time"?"#fff":"transparent", fontWeight:700, fontSize:14, color:paymentType==="one_time"?"#0f172a":"rgba(255,255,255,0.6)", cursor:"pointer", transition:"all 0.15s" }}>
            One-time
          </button>
          <button onClick={() => setPaymentType("recurring")}
            style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background:paymentType==="recurring"?"#fff":"transparent", fontWeight:700, fontSize:14, color:paymentType==="recurring"?"#0f172a":"rgba(255,255,255,0.6)", cursor:"pointer", transition:"all 0.15s", position:"relative" }}>
            Auto-renew
            <span style={{ marginLeft:6, background:"#22c55e", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 6px", borderRadius:999 }}>SAVE 15%</span>
          </button>
        </div>

        {/* Plans */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
          {PLANS.map(plan => {
            const price = paymentType === "recurring" ? plan.recurringPrice : plan.price;
            const selected = selectedPlan === plan.name;
            return (
              <div key={plan.name} onClick={() => setSelectedPlan(plan.name)}
                style={{ padding:"20px 24px", borderRadius:18, border:`2px solid ${selected?"#5B4EFF":"rgba(255,255,255,0.12)"}`, background:selected?"rgba(91,78,255,0.2)":"rgba(255,255,255,0.05)", cursor:"pointer", position:"relative", transition:"all 0.15s" }}>
                {plan.popular && (
                  <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#5B4EFF", color:"#fff", fontSize:11, fontWeight:800, padding:"3px 14px", borderRadius:999, whiteSpace:"nowrap" }}>
                    👍 MOST POPULAR
                  </div>
                )}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ fontSize:16, fontWeight:800, color:"#fff", margin:"0 0 3px" }}>{plan.name}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:0 }}>{plan.desc}</p>
                    {paymentType==="recurring" && <p style={{ fontSize:11, color:"#4ade80", fontWeight:700, margin:"4px 0 0" }}>🔄 Renews every {plan.weeks} week{plan.weeks>1?"s":""}</p>}
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:26, fontWeight:900, color:selected?"#a78bfa":"#fff", margin:0 }}>${price}</p>
                    {paymentType==="recurring" && <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"2px 0 0", textDecoration:"line-through" }}>${plan.price}</p>}
                  </div>
                </div>
                {selected && (
                  <div style={{ position:"absolute", top:12, right:12, width:22, height:22, borderRadius:"50%", background:"#5B4EFF", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ color:"#fff", fontSize:12 }}>✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {paymentType==="recurring" && (
          <div style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:12, padding:"10px 16px", marginBottom:16, textAlign:"center" }}>
            <p style={{ fontSize:12, color:"#4ade80", fontWeight:600, margin:0 }}>✅ Cancel anytime from your profile settings</p>
          </div>
        )}

        <button onClick={() => setShowPayment(true)}
          style={{ width:"100%", padding:"18px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer", boxShadow:"0 8px 24px rgba(91,78,255,0.4)", marginBottom:12 }}>
          🔒 Continue to Payment
        </button>

        <div style={{ display:"flex", justifyContent:"center", gap:20 }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>🔒 Secure checkout</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>💳 All major cards</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>✅ Instant access</span>
        </div>

        <div style={{ textAlign:"center", marginTop:20 }}>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href="/login"; }}
            style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:13, cursor:"pointer" }}>
            Sign out
          </button>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          plan={selectedPlan}
          paymentType={paymentType}
          email={email}
          name={name}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
