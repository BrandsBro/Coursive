"use client";
import { trackEvent } from "@/lib/meta";
import { useState, useEffect, useRef } from "react";
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

const RANDOM_NAMES = [
  { name: "Alison G***",    plan: "4-Week Plan"  },
  { name: "Sophie R***",    plan: "12-Week Plan" },
  { name: "Belle T***",     plan: "4-Week Plan"  },
  { name: "James K***",     plan: "1-Week Plan"  },
  { name: "Maria L***",     plan: "12-Week Plan" },
  { name: "David R***",     plan: "4-Week Plan"  },
  { name: "Emma T***",      plan: "1-Week Plan"  },
  { name: "Noah B***",      plan: "12-Week Plan" },
  { name: "Olivia M***",    plan: "4-Week Plan"  },
  { name: "Liam S***",      plan: "1-Week Plan"  },
  { name: "Ava C***",       plan: "12-Week Plan" },
  { name: "Ethan P***",     plan: "4-Week Plan"  },
  { name: "Isabella W***",  plan: "1-Week Plan"  },
  { name: "Mason H***",     plan: "12-Week Plan" },
  { name: "Mia F***",       plan: "4-Week Plan"  },
  { name: "Lucas D***",     plan: "1-Week Plan"  },
  { name: "Charlotte N***", plan: "12-Week Plan" },
  { name: "Aiden V***",     plan: "4-Week Plan"  },
  { name: "Amelia J***",    plan: "1-Week Plan"  },
  { name: "Harper O***",    plan: "12-Week Plan" },
];

function SocialProofBanner({ isMobile }) {
  const [displayCount, setDisplayCount] = useState(203);
  const targetRef = useRef(203);

  useEffect(() => {
    const id = "sp-marquee-style";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.innerHTML = `
        @keyframes sp-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes sp-pop { 0% { opacity:0.4; transform:scale(0.95); } 60% { opacity:1; transform:scale(1.04); } 100% { opacity:1; transform:scale(1); } }
      `;
      document.head.appendChild(el);
    }
  }, []);

  useEffect(() => {
    let timeout;
    const scheduleNext = () => {
      timeout = setTimeout(() => {
        targetRef.current = Math.min(targetRef.current + 1, 231);
        scheduleNext();
      }, 45000 + Math.random() * 45000);
    };
    scheduleNext();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setDisplayCount(cur => cur < targetRef.current ? cur + 1 : cur);
    }, 120);
    return () => clearInterval(id);
  }, []);

  const planColor = (plan) => plan.includes("12") ? "#7C3AED" : plan.includes("4") ? "#5B4EFF" : "#0EA5E9";
  const doubled = [...RANDOM_NAMES, ...RANDOM_NAMES];

  return (
    <div style={{ background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:10, padding: isMobile ? "8px 0" : "10px 0", marginBottom: isMobile ? 10 : 14, overflow:"hidden" }}>
      <p style={{ fontSize: isMobile ? 11 : 12, fontWeight:700, color:"#0f172a", margin:"0 0 8px", textAlign:"center", padding:"0 12px" }}>
        <span key={displayCount} style={{ color:"#5B4EFF", display:"inline-block", animation:"sp-pop 0.5s ease" }}>{displayCount}</span>
        {" "}people enrolled in the last hour
      </p>
      <div style={{ overflow:"hidden", width:"100%" }}>
        <div style={{ display:"flex", gap: isMobile ? 6 : 8, width:"max-content", animation:`sp-scroll ${isMobile ? "28s" : "38s"} linear infinite`, paddingLeft:10 }}>
          {doubled.map((entry, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:5, background:"#fff", border:"1px solid #E2E8F0", borderRadius:20, padding: isMobile ? "4px 10px" : "5px 12px", fontSize: isMobile ? 10 : 11, fontWeight:600, color:"#374151", whiteSpace:"nowrap", flexShrink:0 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:planColor(entry.plan), display:"inline-block" }}/>
              {entry.name}{" "}
              <span style={{ color:planColor(entry.plan), fontWeight:700 }}>{entry.plan}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MoneyBackGuarantee({ isMobile }) {
  return (
    <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:14, padding: isMobile ? "16px 14px" : "22px 24px", marginTop: isMobile ? 16 : 22, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <svg width={isMobile ? 48 : 58} height={isMobile ? 48 : 58} viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: isMobile ? 10 : 14 }}>
        <path d="M28 56 L20 74 L31 67 L38 74 L38 56 Z" fill="#16A34A"/>
        <path d="M48 56 L56 74 L45 67 L38 74 L38 56 Z" fill="#16A34A"/>
        <circle cx="38" cy="32" r="28" fill="#16A34A"/>
        <circle cx="38" cy="32" r="23" fill="none" stroke="#fff" strokeWidth="1.8" strokeDasharray="4 2.5"/>
        <path d="M26 32 L34 40 L51 22" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <h3 style={{ fontSize: isMobile ? 15 : 17, fontWeight:900, color:"#14532D", margin:"0 0 8px", lineHeight:1.25 }}>Money-Back Guarantee</h3>
      <p style={{ fontSize: isMobile ? 11 : 12, color:"#166534", lineHeight:1.7, margin:"0 0 8px", maxWidth:400 }}>
        If you haven't started your course yet — zero progress beyond onboarding — you're eligible for a <strong>full refund within 14 days</strong>.
      </p>
      <p style={{ fontSize: isMobile ? 10 : 11, color:"#166534", margin:0, fontWeight:600 }}>
        Email{" "}
        <a href="mailto:support@1course.io" style={{ color:"#15803D", fontWeight:700, textDecoration:"underline" }}>support@1course.io</a>
        {" "}— no hassle.
      </p>
    </div>
  );
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
      setEmail(params.get("email") || sessionStorage.getItem("quiz_email") || "");
      setName(params.get("name")  || sessionStorage.getItem("quiz_name")  || "");
    }
    const interval = setInterval(() => setTimeLeft(p => p <= 1 ? 10 * 60 : p - 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const plans = pricingData?.plans
    ? pricingData.plans.map(p => ({
        name: p.name, price: p.salePrice, originalPrice: p.regularPrice,
        weeks: p.id === "weekly" ? 1 : p.id === "monthly" ? 4 : 12,
        popular: p.id === "monthly", legalText: p.legalText,
        duration: p.duration, id: p.id,
        perDayPrice: p.perDayPrice || "", perDayOriginalPrice: p.perDayOriginalPrice || "",
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
      .replace(/{salePrice}/g,          "$" + selectedPlanData.salePrice)
      .replace(/{regularPrice}/g,       "$" + (selectedPlanData.regularPrice || ""))
      .replace(/{4weekRegularPrice}/g,  "$" + (pricingData?.plans?.find(p => p.id === "monthly")?.regularPrice   || "39.99"))
      .replace(/{12weekRegularPrice}/g, "$" + (pricingData?.plans?.find(p => p.id === "quarterly")?.regularPrice || "69.99"))
      .replace(/{name}/g,               selectedPlanData.name)
      .replace(/{duration}/g,           String(selectedPlanData.duration))
      .replace(/1course\.io\/profile/g, "<a href='https://1course.io/profile' style='color:#5B4EFF;font-weight:700;text-decoration:underline'>my profile</a>");
  };

  const renderPerDay = (plan) => {
    const isSelected = selectedPlan === plan.name;
    const col = isSelected ? "#5B4EFF" : "#94A3B8";
    const raw = plan.perDayPrice || "";
    const [whole, cents] = raw.includes(".") ? raw.split(".") : [raw, ""];
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:1 }}>
          <span style={{ fontSize: isMobile ? 11 : 15, fontWeight:800, color:col, marginTop:2 }}>$</span>
          <span style={{ fontSize: isMobile ? 24 : 38, fontWeight:900, color:col, lineHeight:1 }}>{whole || "0"}</span>
          <div style={{ display:"flex", flexDirection:"column", marginTop:2 }}>
            <span style={{ fontSize: isMobile ? 11 : 15, fontWeight:800, color:col, lineHeight:1 }}>{cents ? `.${cents}` : ""}</span>
            <span style={{ fontSize: isMobile ? 8 : 11, color:"#94A3B8", fontWeight:600, whiteSpace:"nowrap", marginTop:2 }}>/ day</span>
          </div>
        </div>
        {plan.perDayOriginalPrice && (
          <span style={{ fontSize: isMobile ? 9 : 12, color:"#94A3B8", textDecoration:"line-through" }}>${plan.perDayOriginalPrice}</span>
        )}
      </div>
    );
  };

  const handleCtaClick = () => {
    if (!termsAccepted) { setTermsError(true); return; }
    setTermsError(false);
    trackEvent("InitiateCheckout", { contentName: selectedPlan });
    setShowPayment(true);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fff", display:"flex", flexDirection:"column" }}>

      {/* ── Header ── */}
      <div style={{ padding: isMobile ? "8px 16px" : "12px 20px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {branding.logoApp
          ? <img src={branding.logoApp} alt="1Course" className="logo-app" style={{ objectFit:"contain", padding:2, maxHeight: isMobile ? 26 : 48 }}/>
          : <span style={{ fontSize: isMobile ? 15 : 24, fontWeight:900, color:"#0f172a" }}>✦ 1Course</span>
        }
      </div>

      {/* ── Content ── */}
      <div style={{ flex:1, maxWidth: isMobile ? 520 : 600, margin:"0 auto", width:"100%", padding: isMobile ? "12px 12px 110px" : "36px 28px 140px", boxSizing:"border-box" }}>

        {/* ── Title + countdown inline ── */}
        <div style={{ marginBottom: isMobile ? 10 : 16 }}>
          <h1 style={{ fontSize: isMobile ? 16 : 28, fontWeight:900, color:"#0f172a", margin:"0 0 4px", lineHeight:1.2, textAlign:"center" }}>
            Your A.I. Certificate Program is Ready!
          </h1>
          <p style={{ fontSize: isMobile ? 12 : 16, color:"#5B4EFF", fontWeight:700, margin:"0 0 10px", textAlign:"center" }}>
            Become the Master of A.I.
          </p>

          {/* Compact countdown */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:10, padding: isMobile ? "7px 14px" : "9px 18px" }}>
            <span style={{ fontSize: isMobile ? 11 : 15, fontWeight:600, color:"#9A3412" }}>⏱ Discount expires in</span>
            <span style={{ fontSize: isMobile ? 16 : 24, fontWeight:900, color:"#9A3412", fontVariantNumeric:"tabular-nums", letterSpacing:1 }}>{mins}:{secs}</span>
          </div>
        </div>

        {/* ── Plans ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:0, marginBottom: isMobile ? 10 : 14 }}>
          {plans.map((plan, idx) => (
            <div key={plan.name}>
              {plan.popular && (
                <div style={{ background:"#7C3AED", color:"#fff", fontSize: isMobile ? 9 : 12, fontWeight:800, padding: isMobile ? "5px 14px" : "8px 20px", textAlign:"center", borderRadius:"8px 8px 0 0", marginTop: idx === 0 ? 6 : 0 }}>
                  👍 MOST POPULAR
                </div>
              )}
              <div
                onClick={() => setSelectedPlan(plan.name)}
                style={{
                  padding: isMobile ? "10px 12px" : "18px 22px",
                  borderRadius: plan.popular ? "0 0 8px 8px" : 8,
                  border:`2px solid ${selectedPlan === plan.name ? "#7C3AED" : "#E2E8F0"}`,
                  background: selectedPlan === plan.name ? "#FAF8FF" : "#fff",
                  cursor:"pointer", marginBottom:7, transition:"all 0.15s"
                }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:1, minWidth:0 }}>
                    <div style={{ width: isMobile ? 16 : 20, height: isMobile ? 16 : 20, borderRadius:"50%", flexShrink:0, border:`2px solid ${selectedPlan === plan.name ? "#7C3AED" : "#CBD5E1"}`, background: selectedPlan === plan.name ? "#7C3AED" : "#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {selectedPlan === plan.name && <div style={{ width: isMobile ? 6 : 8, height: isMobile ? 6 : 8, borderRadius:"50%", background:"#fff" }}/>}
                    </div>
                    <div>
                      <span style={{ fontSize: isMobile ? 12 : 17, fontWeight:800, color:"#0f172a", display:"block", letterSpacing:0.3 }}>
                        {plan.name.toUpperCase().replace(" ", "-")}
                      </span>
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                        <span style={{ fontSize: isMobile ? 10 : 13, color:"#94A3B8", textDecoration:"line-through" }}>${plan.originalPrice}</span>
                        <span style={{ fontSize: isMobile ? 10 : 13, color:"#374151", fontWeight:700 }}>${plan.price}</span>

                      </div>
                    </div>
                  </div>
                  {renderPerDay(plan)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Social Proof Banner ── */}
        <SocialProofBanner isMobile={isMobile} />

        {/* ── Legal text ── */}
        {getLegalText() && (
          <p style={{ fontSize: isMobile ? 9 : 10, color:"#94A3B8", lineHeight:1.6, margin:"0 0 10px", textAlign:"center" }}
            dangerouslySetInnerHTML={{ __html: getLegalText() }}/>
        )}

        {/* ── Terms checkbox ── */}
        <div style={{ marginBottom: isMobile ? 10 : 14 }}>
          <label style={{ display:"flex", alignItems:"flex-start", gap:8, cursor:"pointer" }}>
            <div
              onClick={() => { setTermsAccepted(v => !v); setTermsError(false); }}
              style={{ width: isMobile ? 16 : 20, height: isMobile ? 16 : 20, minWidth: isMobile ? 16 : 20, borderRadius:4, marginTop:1, border:`2px solid ${termsError ? "#ef4444" : termsAccepted ? "#5B4EFF" : "#CBD5E1"}`, background: termsAccepted ? "#5B4EFF" : "#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s" }}>
              {termsAccepted && (
                <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: isMobile ? 10 : 13, color:"#374151", lineHeight:1.5 }}>
              I agree to the{" "}
              <a href="https://1course.io/terms-condition" target="_blank" rel="noopener noreferrer" style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>Terms</a>{", "}
              <a href="https://1course.io/privacy" target="_blank" rel="noopener noreferrer" style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>Privacy</a>{", "}
              <a href="https://1course.io/subscription-terms" target="_blank" rel="noopener noreferrer" style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>Subscription Policy</a>{" & "}
              <a href="https://1course.io/refund-policy" target="_blank" rel="noopener noreferrer" style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>Money Back Guarantee</a>.
            </span>
          </label>
          {termsError && (
            <p style={{ fontSize: isMobile ? 10 : 11, color:"#ef4444", margin:"4px 0 0 24px", fontWeight:600 }}>⚠️ Please accept the terms to continue.</p>
          )}
        </div>

        {/* ── CTA ── */}
        <button
          onClick={handleCtaClick}
          style={{ width:"100%", padding: isMobile ? "13px" : "20px", borderRadius:12, border:"none", background: termsAccepted ? "linear-gradient(135deg,#5B4EFF,#8B5CF6)" : "#E2E8F0", color: termsAccepted ? "#fff" : "#94A3B8", fontSize: isMobile ? 14 : 20, fontWeight:800, cursor: termsAccepted ? "pointer" : "not-allowed", boxShadow: termsAccepted ? "0 6px 20px rgba(91,78,255,0.4)" : "none", transition:"all 0.2s" }}>
          GET MY PLAN →
        </button>

        {/* ── Trust badges ── */}
        <div style={{ display:"flex", justifyContent:"center", gap: isMobile ? 10 : 18, marginTop:8, flexWrap:"wrap" }}>
          {["🔒 Secure","✅ Cancel anytime","🚀 Instant access"].map((b, i) => (
            <span key={i} style={{ fontSize: isMobile ? 10 : 14, color:"#64748B" }}>{b}</span>
          ))}
        </div>

        {/* ── Money-Back Guarantee (below fold, fine) ── */}
        <MoneyBackGuarantee isMobile={isMobile} />

      </div>

      {/* ── Payment modal ── */}
      {showPayment && (
        <PaymentModal
          plan={selectedPlan}
          paymentType="recurring"
          email={email}
          name={name}
          onClose={() => setShowPayment(false)}
          onSuccess={(eventId, paymentIntentId) => {
            setShowPayment(false);
            sessionStorage.clear();
            const planObj = plans.find(p => p.name === selectedPlan);
            router.push(`/payment-success?plan=${encodeURIComponent(selectedPlan)}&value=${planObj?.price || "19.99"}&eid=${eventId || ""}&pid=${paymentIntentId || ""}`);
          }}
        />
      )}
    </div>
  );
}
