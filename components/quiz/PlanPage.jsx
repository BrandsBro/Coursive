"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useBranding } from "@/lib/useBranding";
import PaymentModal from "@/components/quiz/PaymentModal";
import { useRouter } from "next/navigation";

/* ─── responsive hook ─────────────────────────────────── */
function useIsMobile(breakpoint = 480) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

export default function PlanPage({ pricingData }) {
  const branding   = useBranding();
  const router     = useRouter();
  const isMobile   = useIsMobile();

  const [selectedPlan, setSelectedPlan] = useState("4-Week Plan");
  const [showPayment,  setShowPayment]  = useState(false);
  const [couponCode,   setCouponCode]   = useState("");
  const [couponData,   setCouponData]   = useState(null);
  const [couponError,  setCouponError]  = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError(""); setCouponData(null);
    const plan = plans.find(p => p.name === selectedPlan);
    const amount = Math.round(parseFloat(plan?.price || 0) * 100);
    const res = await fetch("/api/discount/validate", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ code: couponCode, amount })
    });
    const data = await res.json();
    if (data.ok) setCouponData(data);
    else setCouponError(data.error || "Invalid code");
    setCouponLoading(false);
  };
  const [email,        setEmail]        = useState("");
  const [name,         setName]         = useState("");
  const [timeLeft,     setTimeLeft]     = useState(10 * 60);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Try URL params first, then sessionStorage
      const params = new URLSearchParams(window.location.search);
      const e = params.get("email") || sessionStorage.getItem("quiz_email") || "";
      const n = params.get("name")  || sessionStorage.getItem("quiz_name")  || "";
      setEmail(e);
      setName(n);
    }
    const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  /* ─── responsive size tokens ───────────────────────── */
  const t = {
    // headings
    h1:          isMobile ? 19  : 24,
    subtitle:    isMobile ? 13  : 14,
    timerBadge:  isMobile ? 11  : 13,

    // plan card
    cardPad:     isMobile ? "13px 14px" : "18px 20px",
    planName:    isMobile ? 14  : 16,
    saleBadge:   isMobile ? 8   : 9,
    origPrice:   isMobile ? 12  : 14,
    salePrice:   isMobile ? 20  : 24,
    popularBadge:isMobile ? 9   : 10,

    // legal / bottom
    legal:       isMobile ? 10  : 11,
    ctaFont:     isMobile ? 15  : 16,
    ctaPad:      isMobile ? "15px" : "18px",
    trustFont:   isMobile ? 10  : 11,
    trustGap:    isMobile ? 10  : 20,

    // layout
    contentPad:  isMobile ? "20px 14px 100px" : "32px 20px 120px",
    mb:          isMobile ? 16  : 24,
  };

  const plans = pricingData?.plans
    ? pricingData.plans.map(p => ({
        name:          p.name,
        price:         p.salePrice,
        originalPrice: p.regularPrice,
        weeks:         p.id === "weekly" ? 1 : p.id === "monthly" ? 4 : 12,
        popular:       p.id === "monthly",
        legalText:     p.legalText,
        duration:      p.duration,
        id:            p.id,
      }))
    : [
        { name:"1-Week Plan",  price:"6.93",  originalPrice:"13.86", weeks:1 },
        { name:"4-Week Plan",  price:"19.99", originalPrice:"39.99", weeks:4, popular:true },
        { name:"12-Week Plan", price:"39.99", originalPrice:"79.99", weeks:12 },
      ];

  const selectedPlanData = pricingData?.plans?.find(p => p.name === selectedPlan);

  const getLegalText = () => {
    if (!selectedPlanData?.legalText) return null;
    return selectedPlanData.legalText
      .replace(/{salePrice}/g,        "$" + selectedPlanData.salePrice)
      .replace(/{regularPrice}/g,     "$" + (selectedPlanData.regularPrice || ""))
      .replace(/{4weekRegularPrice}/g,"$" + (pricingData?.plans?.find(p => p.id === "monthly")?.regularPrice   || "39.99"))
      .replace(/{12weekRegularPrice}/g,"$"+ (pricingData?.plans?.find(p => p.id === "quarterly")?.regularPrice || "69.99"))
      .replace(/{name}/g,             selectedPlanData.name)
      .replace(/{duration}/g,         String(selectedPlanData.duration))
      .replace(/1course\.io\/profile/g,
        "<a href='https://1course.io/profile' style='color:#5B4EFF;font-weight:700;text-decoration:underline'>my profile</a>");
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fff", display:"flex", flexDirection:"column" }}>

      {/* ── Header ── */}
      <div style={{ padding:"14px 20px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {branding.logoApp
          ? <img src={branding.logoApp} alt="1Course" className="logo-app"
              style={{ objectFit:"contain", padding:4, maxHeight: isMobile ? 32 : 40 }}/>
          : <span style={{ fontSize: isMobile ? 17 : 20, fontWeight:900, color:"#0f172a" }}>✦ 1Course</span>
        }
      </div>

      {/* ── Content ── */}
      <div style={{ flex:1, maxWidth:560, margin:"0 auto", width:"100%", padding: t.contentPad, boxSizing:"border-box" }}>

        {/* Title block */}
        <div style={{ textAlign:"center", marginBottom: t.mb }}>
          <h1 style={{ fontSize: t.h1, fontWeight:900, color:"#0f172a", margin:"0 0 6px", lineHeight:1.25 }}>
            Your A.I. Certificate Program is Ready!
          </h1>
          <p style={{ fontSize: t.subtitle, color:"#5B4EFF", fontWeight:700, margin:"0 0 4px" }}>
            Become the Master of A.I.
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:8, flexWrap:"wrap" }}>
            <span style={{ fontSize: t.timerBadge, color:"#64748B" }}>⏱ {mins}:{secs} left</span>
            <span style={{ fontSize: t.timerBadge, color:"#64748B" }}>🔒 Secure checkout</span>
          </div>
        </div>

        {/* Coupon field */}
        <div style={{ margin:"12px 0" }}>
          <div style={{ display:"flex", gap:8 }}>
            <input value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponData(null); setCouponError(""); }}
              onKeyDown={e => e.key === "Enter" && applyCoupon()}
              placeholder="Have a coupon code?" maxLength={20}
              style={{ flex:1, padding:"11px 14px", borderRadius:12, border:`1.5px solid ${couponData?"#22c55e":couponError?"#ef4444":"#E2E8F0"}`, fontSize:13, outline:"none", textTransform:"uppercase", letterSpacing:1, background:"#fff" }}/>
            <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
              style={{ padding:"11px 16px", borderRadius:12, border:"none", background:"#0f172a", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", flexShrink:0, opacity:!couponCode.trim()?0.5:1 }}>
              {couponLoading ? "..." : "Apply"}
            </button>
          </div>
          {couponError && <p style={{ fontSize:12, color:"#ef4444", margin:"6px 0 0", fontWeight:600 }}>❌ {couponError}</p>}
          {couponData && (
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, padding:"10px 14px", background:"#F0FDF4", border:"1.5px solid #BBF7D0", borderRadius:12 }}>
              <span style={{ fontSize:18 }}>🎉</span>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:"#166534", margin:0 }}>{couponData.label} applied!</p>
                <p style={{ fontSize:11, color:"#166534", margin:"2px 0 0" }}>Discount: -${(couponData.discountAmount/100).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Plans */}
        <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? 8 : 10, marginBottom: isMobile ? 14 : 20 }}>
          {plans.map((plan) => (
            <div key={plan.name} onClick={async () => {
              setSelectedPlan(plan.name);
              if (couponCode.trim()) {
                const amount = Math.round(parseFloat(plan.price) * 100);
                const res = await fetch("/api/discount/validate", {
                  method:"POST", headers:{"Content-Type":"application/json"},
                  body: JSON.stringify({ code: couponCode, amount })
                });
                const data = await res.json();
                if (data.ok) setCouponData(data);
                else { setCouponData(null); setCouponError(data.error || "Invalid"); }
              }
            }}
              style={{
                padding:      t.cardPad,
                borderRadius: 14,
                border:       `2px solid ${selectedPlan === plan.name ? "#5B4EFF" : "#E2E8F0"}`,
                background:   selectedPlan === plan.name ? "#EEF2FF" : "#fff",
                cursor:       "pointer",
                position:     "relative",
                transition:   "all 0.15s",
              }}>

              {plan.popular && (
                <div style={{
                  position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)",
                  background:"#5B4EFF", color:"#fff",
                  fontSize: t.popularBadge, fontWeight:800,
                  padding:"2px 12px", borderRadius:999, whiteSpace:"nowrap",
                }}>
                  👍 MOST POPULAR
                </div>
              )}

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                {/* Left: name + sale badge */}
                <div style={{ display:"flex", alignItems:"center", gap: isMobile ? 6 : 8, flexShrink:1, minWidth:0 }}>
                  <span style={{ fontSize: t.planName, fontWeight:800, color:"#0f172a", whiteSpace:"nowrap" }}>
                    {plan.name}
                  </span>
                  <span style={{
                    background:"#ef4444", color:"#fff",
                    fontSize: t.saleBadge, fontWeight:800,
                    padding:"2px 6px", borderRadius:999, whiteSpace:"nowrap", flexShrink:0,
                  }}>
                    50% OFF
                  </span>
                </div>

                {/* Right: prices */}
                <div style={{ display:"flex", alignItems:"center", gap: isMobile ? 6 : 8, flexShrink:0 }}>
                  <span style={{ fontSize: t.origPrice, color:"#94A3B8", textDecoration:"line-through" }}>
                    ${plan.originalPrice}
                  </span>
                  {couponData ? (() => {
                    const planAmount = Math.round(parseFloat(plan.price) * 100);
                    const disc = couponData.discount?.type === "percentage"
                      ? Math.round(planAmount * couponData.discount.value / 100)
                      : Math.round(couponData.discount?.value * 100 || 0);
                    const final = Math.max(planAmount - disc, 0) / 100;
                    return (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end" }}>
                        <span style={{ fontSize:11, color:"#94A3B8", textDecoration:"line-through" }}>${plan.price}</span>
                        <span style={{ fontSize: t.salePrice, fontWeight:900, color:"#22c55e" }}>${final.toFixed(2)}</span>
                      </div>
                    );
                  })() : (
                    <span style={{ fontSize: t.salePrice, fontWeight:900, color:"#5B4EFF" }}>${plan.price}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legal text */}
        {getLegalText() && (
          <p style={{ fontSize: t.legal, color:"#94A3B8", lineHeight:1.7, margin:"0 0 16px", textAlign:"center" }}
            dangerouslySetInnerHTML={{ __html: getLegalText() }}/>
        )}

        {/* CTA */}
        <button onClick={() => setShowPayment(true)}
          style={{
            width:"100%", padding: t.ctaPad, borderRadius:14, border:"none",
            background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)",
            color:"#fff", fontSize: t.ctaFont, fontWeight:800,
            cursor:"pointer", boxShadow:"0 8px 24px rgba(91,78,255,0.4)",
          }}>
          GET MY PLAN →
        </button>


        {/* Trust badges */}
        <div style={{ display:"flex", justifyContent:"center", gap: t.trustGap, marginTop:8, flexWrap:"wrap" }}>
          {["🔒 Secure payment","✅ Cancel anytime","🚀 Instant access"].map((b, i) => (
            <span key={i} style={{ fontSize: t.trustFont, color:"#64748B" }}>{b}</span>
          ))}
        </div>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <PaymentModal
          plan={selectedPlan}
          paymentType="one_time"
          email={email}
          name={name}
          discountCode={couponData ? couponCode : null}
          discountAmount={couponData ? (() => {
            const planAmount = Math.round(parseFloat(plans.find(p=>p.name===selectedPlan)?.price||0) * 100);
            return couponData.discount?.type === "percentage"
              ? Math.round(planAmount * couponData.discount.value / 100)
              : Math.round(couponData.discount?.value * 100 || 0);
          })() : 0}
          displayPrice={couponData ? (() => {
            const planAmount = Math.round(parseFloat(plans.find(p=>p.name===selectedPlan)?.price||0) * 100);
            const disc = couponData.discount?.type === "percentage"
              ? Math.round(planAmount * couponData.discount.value / 100)
              : Math.round(couponData.discount?.value * 100 || 0);
            return `$${(Math.max(planAmount - disc, 0)/100).toFixed(2)}`;
          })() : null}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            sessionStorage.clear();
            router.push("/payment-success");
          }}
        />
      )}
    </div>
  );
}
