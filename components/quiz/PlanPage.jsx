
"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useBranding } from "@/lib/useBranding";
import PaymentModal from "@/components/quiz/PaymentModal";
import { useRouter } from "next/navigation";

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
  const branding      = useBranding();
  const router        = useRouter();
  const isMobile      = useIsMobile();

  const [selectedPlan,  setSelectedPlan]  = useState("4-Week Plan");
  const [showPayment,   setShowPayment]   = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError,    setTermsError]    = useState(false);

  const [email,    setEmail]    = useState("");
  const [name,     setName]     = useState("");
  const [timeLeft, setTimeLeft] = useState(10 * 60);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const e = params.get("email") || sessionStorage.getItem("quiz_email") || "";
      const n = params.get("name")  || sessionStorage.getItem("quiz_name")  || "";
      setEmail(e);
      setName(n);
    }
    const interval = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) return 10 * 60; // reset back to 10 minutes when it hits 0
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const t = {
    h1:           isMobile ? 19  : 24,
    subtitle:     isMobile ? 13  : 14,
    cardPad:      isMobile ? "13px 14px" : "18px 20px",
    planName:     isMobile ? 13  : 15,
    origPrice:    isMobile ? 11  : 12,
    popularBadge: isMobile ? 9   : 10,
    legal:        isMobile ? 10  : 11,
    ctaFont:      isMobile ? 15  : 16,
    ctaPad:       isMobile ? "15px" : "18px",
    trustFont:    isMobile ? 10  : 11,
    trustGap:     isMobile ? 10  : 20,
    contentPad:   isMobile ? "20px 14px 100px" : "32px 20px 120px",
    mb:           isMobile ? 16  : 24,
  };

  const plans = pricingData?.plans
    ? pricingData.plans.map(p => ({
        name:                p.name,
        price:               p.salePrice,
        originalPrice:       p.regularPrice,
        weeks:               p.id === "weekly" ? 1 : p.id === "monthly" ? 4 : 12,
        popular:             p.id === "monthly",
        legalText:           p.legalText,
        duration:            p.duration,
        id:                  p.id,
        perDayPrice:         p.perDayPrice || "",
        perDayOriginalPrice: p.perDayOriginalPrice || "",
      }))
    : [
        { name:"1-Week Plan",  price:"6.93",  originalPrice:"13.86", weeks:1,  perDayPrice:"0.99", perDayOriginalPrice:"1.98" },
        { name:"4-Week Plan",  price:"19.99", originalPrice:"39.99", weeks:4,  popular:true, perDayPrice:"0.71", perDayOriginalPrice:"1.43" },
        { name:"12-Week Plan", price:"39.99", originalPrice:"79.99", weeks:12, perDayPrice:"0.48", perDayOriginalPrice:"0.95" },
      ];

  const selectedPlanData = pricingData?.plans?.find(p => p.name === selectedPlan);

  const getLegalText = () => {
    if (!selectedPlanData?.legalText) return null;
    return selectedPlanData.legalText
      .replace(/{salePrice}/g,         "$" + selectedPlanData.salePrice)
      .replace(/{regularPrice}/g,      "$" + (selectedPlanData.regularPrice || ""))
      .replace(/{4weekRegularPrice}/g, "$" + (pricingData?.plans?.find(p => p.id === "monthly")?.regularPrice   || "39.99"))
      .replace(/{12weekRegularPrice}/g,"$" + (pricingData?.plans?.find(p => p.id === "quarterly")?.regularPrice || "69.99"))
      .replace(/{name}/g,              selectedPlanData.name)
      .replace(/{duration}/g,          String(selectedPlanData.duration))
      .replace(/1course\.io\/profile/g,
        "<a href='https://1course.io/profile' style='color:#5B4EFF;font-weight:700;text-decoration:underline'>my profile</a>");
  };

  /* ── per-day price renderer ── */
  const renderPerDay = (plan) => {
    const isSelected  = selectedPlan === plan.name;
    const activeColor = isSelected ? "#5B4EFF" : "#94A3B8";
    const raw         = plan.perDayPrice || "";
    const [whole, cents] = raw.includes(".") ? raw.split(".") : [raw, ""];

    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:1 }}>
          <span style={{ fontSize: isMobile ? 13 : 14, fontWeight:800, color: activeColor, marginTop:3 }}>$</span>
          <span style={{ fontSize: isMobile ? 30 : 36, fontWeight:900, color: activeColor, lineHeight:1 }}>
            {whole || "0"}
          </span>
          <div style={{ display:"flex", flexDirection:"column", marginTop:3 }}>
            <span style={{ fontSize: isMobile ? 12 : 14, fontWeight:800, color: activeColor, lineHeight:1 }}>
              {cents ? `.${cents}` : ""}
            </span>
            <span style={{ fontSize: isMobile ? 9 : 10, color:"#94A3B8", fontWeight:600, whiteSpace:"nowrap", marginTop:2 }}>
              Per day
            </span>
          </div>
        </div>
        {plan.perDayOriginalPrice && (
          <span style={{ fontSize: isMobile ? 10 : 11, color:"#94A3B8", textDecoration:"line-through", marginTop:2 }}>
            ${plan.perDayOriginalPrice}
          </span>
        )}
      </div>
    );
  };

  /* ── CTA click handler ── */
  const handleCtaClick = () => {
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setShowPayment(true);
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

        {/* ── Title block ── */}
        <div style={{ textAlign:"center", marginBottom: t.mb }}>
          <h1 style={{ fontSize: t.h1, fontWeight:900, color:"#0f172a", margin:"0 0 6px", lineHeight:1.25 }}>
            Your A.I. Certificate Program is Ready!
          </h1>
          <p style={{ fontSize: t.subtitle, color:"#5B4EFF", fontWeight:700, margin:"0 0 4px" }}>
            Become the Master of A.I.
          </p>

          {/* ── Countdown timer ── */}
          <div style={{ marginTop: isMobile ? 14 : 18, marginBottom: isMobile ? 4 : 6 }}>
            <p style={{
              fontSize: isMobile ? 12 : 13,
              fontWeight: 600,
              color: "#0f172a",
              margin: "0 0 10px",
              letterSpacing: 0.2,
            }}>
              Discount expires in
            </p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap: isMobile ? 8 : 12 }}>

              {/* MIN box */}
              <div style={{
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 2px 12px rgba(0,0,0,0.13)",
                padding: isMobile ? "10px 18px" : "12px 24px",
                textAlign: "center",
                minWidth: isMobile ? 62 : 76,
              }}>
                <span style={{
                  fontSize: isMobile ? 30 : 36,
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {mins}
                </span>
                <span style={{
                  fontSize: isMobile ? 9 : 10,
                  fontWeight: 700,
                  color: "#94A3B8",
                  letterSpacing: 1.5,
                  marginTop: 4,
                  display: "block",
                }}>
                  MIN
                </span>
              </div>

              {/* Colon separator */}
              <span style={{
                fontSize: isMobile ? 28 : 34,
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1,
                paddingBottom: 14,
              }}>
                :
              </span>

              {/* SEC box */}
              <div style={{
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 2px 12px rgba(0,0,0,0.13)",
                padding: isMobile ? "10px 18px" : "12px 24px",
                textAlign: "center",
                minWidth: isMobile ? 62 : 76,
              }}>
                <span style={{
                  fontSize: isMobile ? 30 : 36,
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {secs}
                </span>
                <span style={{
                  fontSize: isMobile ? 9 : 10,
                  fontWeight: 700,
                  color: "#94A3B8",
                  letterSpacing: 1.5,
                  marginTop: 4,
                  display: "block",
                }}>
                  SEC
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Plans ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:0, marginBottom: isMobile ? 14 : 20 }}>
          {plans.map((plan, idx) => (
            <div key={plan.name}>

              {/* MOST POPULAR banner */}
              {plan.popular && (
                <div style={{
                  background:"#7C3AED",
                  color:"#fff",
                  fontSize: t.popularBadge + 1,
                  fontWeight:800,
                  padding:"8px 16px",
                  textAlign:"center",
                  marginTop: idx === 0 ? 8 : 0,
                  borderRadius:"10px 10px 0 0",
                }}>
                  👍 MOST POPULAR
                </div>
              )}

              {/* Plan card */}
              <div
                onClick={() => setSelectedPlan(plan.name)}
                style={{
                  padding:      t.cardPad,
                  borderRadius: plan.popular ? "0 0 10px 10px" : 10,
                  border:       `2px solid ${selectedPlan === plan.name ? "#7C3AED" : "#E2E8F0"}`,
                  background:   "#fff",
                  cursor:       "pointer",
                  marginBottom: 10,
                  transition:   "all 0.15s",
                }}>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>

                  {/* Left: radio + name + prices */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:1, minWidth:0 }}>
                    <div style={{
                      width:18, height:18, borderRadius:"50%", flexShrink:0,
                      border:`2px solid ${selectedPlan === plan.name ? "#7C3AED" : "#CBD5E1"}`,
                      background: selectedPlan === plan.name ? "#7C3AED" : "#fff",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      {selectedPlan === plan.name && (
                        <div style={{ width:7, height:7, borderRadius:"50%", background:"#fff" }}/>
                      )}
                    </div>

                    <div>
                      <span style={{ fontSize: t.planName, fontWeight:800, color:"#0f172a", display:"block", letterSpacing:0.3 }}>
                        {plan.name.toUpperCase().replace(" ", "-")}
                      </span>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                        <span style={{ fontSize: t.origPrice, color:"#94A3B8", textDecoration:"line-through" }}>
                          ${plan.originalPrice}
                        </span>
                        <span style={{ fontSize: t.origPrice, color:"#374151", fontWeight:700 }}>
                          ${plan.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: per-day price */}
                  {renderPerDay(plan)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Legal text ── */}
        {getLegalText() && (
          <p
            style={{ fontSize: t.legal, color:"#94A3B8", lineHeight:1.7, margin:"0 0 16px", textAlign:"center" }}
            dangerouslySetInnerHTML={{ __html: getLegalText() }}
          />
        )}

        {/* ── Terms & Conditions checkbox ── */}
        <div style={{ marginBottom: isMobile ? 14 : 18 }}>
          <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer" }}>
            <div
              onClick={() => { setTermsAccepted(v => !v); setTermsError(false); }}
              style={{
                width: 18, height: 18, minWidth: 18,
                borderRadius: 4, marginTop: 1,
                border: `2px solid ${termsError ? "#ef4444" : termsAccepted ? "#5B4EFF" : "#CBD5E1"}`,
                background: termsAccepted ? "#5B4EFF" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {termsAccepted && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            <span style={{ fontSize: isMobile ? 11 : 12, color:"#374151", lineHeight:1.6 }}>
              I agree to the 1Course{" "}
              <a href="https://1course.io/terms-condition" target="_blank" rel="noopener noreferrer"
                style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>
                Terms of Service
              </a>
              {", "}
              <a href="https://1course.io/privacy" target="_blank" rel="noopener noreferrer"
                style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>
                Privacy Policy
              </a>
              {", "}
              <a href="https://1course.io/subscription-terms" target="_blank" rel="noopener noreferrer"
                style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>
                Subscription Policy
              </a>
              {", and "}
              <a href="https://1course.io/refund-policy" target="_blank" rel="noopener noreferrer"
                style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>
                Money Back Guarantee
              </a>
              {"."}
            </span>
          </label>

          {termsError && (
            <p style={{ fontSize: isMobile ? 11 : 12, color:"#ef4444", margin:"6px 0 0 28px", fontWeight:600 }}>
              ⚠️ Please accept the terms to continue.
            </p>
          )}
        </div>

        {/* ── CTA ── */}
        <button
          onClick={handleCtaClick}
          style={{
            width:"100%", padding: t.ctaPad, borderRadius:14, border:"none",
            background: termsAccepted
              ? "linear-gradient(135deg,#5B4EFF,#8B5CF6)"
              : "#E2E8F0",
            color: termsAccepted ? "#fff" : "#94A3B8",
            fontSize: t.ctaFont, fontWeight:800,
            cursor: termsAccepted ? "pointer" : "not-allowed",
            boxShadow: termsAccepted ? "0 8px 24px rgba(91,78,255,0.4)" : "none",
            transition: "all 0.2s",
          }}>
          GET MY PLAN →
        </button>

        {/* ── Trust badges ── */}
        <div style={{ display:"flex", justifyContent:"center", gap: t.trustGap, marginTop:8, flexWrap:"wrap" }}>
          {["🔒 Secure payment","✅ Cancel anytime","🚀 Instant access"].map((b, i) => (
            <span key={i} style={{ fontSize: t.trustFont, color:"#64748B" }}>{b}</span>
          ))}
        </div>
      </div>

      {/* ── Payment modal ── */}
      {showPayment && (
        <PaymentModal
          plan={selectedPlan}
          paymentType="one_time"
          email={email}
          name={name}
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





