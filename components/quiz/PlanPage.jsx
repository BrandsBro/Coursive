"use client";
import { useState, useEffect } from "react";
import { useBranding } from "@/lib/useBranding";
import PaymentModal from "@/components/quiz/PaymentModal";
import { useRouter } from "next/navigation";

export default function PlanPage({ pricingData }) {
  const branding = useBranding();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("4-Week Plan");
  const [showPayment, setShowPayment] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [timeLeft, setTimeLeft] = useState(10 * 60);

  useEffect(() => {
    // Silently grab the user's info from the quiz flow to pass to the payment modal
    if (typeof window !== "undefined") {
      setEmail(sessionStorage.getItem("quiz_email") || "");
      setName(sessionStorage.getItem("quiz_name") || "");
    }

    const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const plans = pricingData?.plans ? pricingData.plans.map(p => ({
    name: p.name,
    price: p.salePrice,
    originalPrice: p.regularPrice,
    weeks: p.id === "weekly" ? 1 : p.id === "monthly" ? 4 : 12,
    popular: p.id === "monthly",
    legalText: p.legalText,
    duration: p.duration,
    id: p.id,
  })) : [
    { name:"1-Week Plan", price:"6.93", originalPrice:"13.86", weeks:1 },
    { name:"4-Week Plan", price:"19.99", originalPrice:"39.99", weeks:4, popular:true },
    { name:"12-Week Plan", price:"39.99", originalPrice:"79.99", weeks:12 },
  ];

  const handleGetPlan = () => {
    setShowPayment(true);
  };

  const selectedPlanData = pricingData?.plans?.find(p => p.name === selectedPlan);

  const getLegalText = () => {
    if (!selectedPlanData?.legalText) return null;
    return selectedPlanData.legalText
      .replace(/{salePrice}/g, "$" + selectedPlanData.salePrice)
      .replace(/{regularPrice}/g, "$" + (selectedPlanData.regularPrice || ""))
      .replace(/{4weekRegularPrice}/g, "$" + (pricingData?.plans?.find(p => p.id === "monthly")?.regularPrice || "39.99"))
      .replace(/{12weekRegularPrice}/g, "$" + (pricingData?.plans?.find(p => p.id === "quarterly")?.regularPrice || "69.99"))
      .replace(/{name}/g, selectedPlanData.name)
      .replace(/{duration}/g, String(selectedPlanData.duration))
      .replace(/1course\.io\/profile/g, "<a href='https://1course.io/profile' style='color:#5B4EFF;font-weight:700;text-decoration:underline'>my profile</a>");
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fff", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ padding:"14px 20px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {branding.logoApp
          ? <img src={branding.logoApp} alt="1Course" className="logo-app" style={{ objectFit:"contain", padding:4, maxHeight:40 }}/>
          : <span style={{ fontSize:20, fontWeight:900, color:"#0f172a" }}>✦ 1Course</span>
        }
      </div>

      {/* Content */}
      <div style={{ flex:1, maxWidth:560, margin:"0 auto", width:"100%", padding:"32px 20px 120px" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 6px" }}>Your A.I. Certificate Program is Ready!</h1>
          <p style={{ fontSize:14, color:"#5B4EFF", fontWeight:700, margin:"0 0 4px" }}>Become the Master of A.I.</p>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:8 }}>
            <span style={{ fontSize:13, color:"#64748B" }}>⏱ {mins}:{secs} left</span>
            <span style={{ fontSize:13, color:"#64748B" }}>🔒 Secure checkout</span>
          </div>
        </div>

        {/* Plans */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          {plans.map((plan) => (
            <div key={plan.name} onClick={() => setSelectedPlan(plan.name)}
              style={{ padding:"18px 20px", borderRadius:14, border:`2px solid ${selectedPlan===plan.name?"#5B4EFF":"#E2E8F0"}`, background:selectedPlan===plan.name?"#EEF2FF":"#fff", cursor:"pointer", position:"relative", transition:"all 0.15s" }}>
              {plan.popular && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:"#5B4EFF", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 12px", borderRadius:999, whiteSpace:"nowrap" }}>👍 MOST POPULAR</div>}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>{plan.name}</span>
                  <span style={{ background:"#ef4444", color:"#fff", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:999 }}>50% OFF</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14, color:"#94A3B8", textDecoration:"line-through" }}>${plan.originalPrice}</span>
                  <span style={{ fontSize:24, fontWeight:900, color:"#5B4EFF" }}>${plan.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legal */}
        {getLegalText() && (
          <p style={{ fontSize:11, color:"#94A3B8", lineHeight:1.7, margin:"0 0 16px", textAlign:"center" }} dangerouslySetInnerHTML={{ __html: getLegalText() }}/>
        )}

        {/* CTA */}
        <button onClick={handleGetPlan}
          style={{ width:"100%", padding:"18px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer", boxShadow:"0 8px 24px rgba(91,78,255,0.4)" }}>
          GET MY PLAN →
        </button>

        <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:14 }}>
          {["🔒 Secure payment","✅ Cancel anytime","🚀 Instant access"].map((b,i) => (
            <span key={i} style={{ fontSize:11, color:"#64748B" }}>{b}</span>
          ))}
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          plan={selectedPlan}
          paymentType="one_time"
          email={email}
          name={name}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { 
            setShowPayment(false); 
            sessionStorage.clear(); // Clear quiz data after successful payment
            router.push("/payment-success"); 
          }}
        />
      )}
    </div>
  );
}