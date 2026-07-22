"use client";
import { trackEvent } from "@/lib/meta";
import { useSearchParams } from "next/navigation";
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
        @keyframes sp-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes sp-pop {
          0%   { opacity: 0.4; transform: scale(0.95); }
          60%  { opacity: 1;   transform: scale(1.04); }
          100% { opacity: 1;   transform: scale(1);    }
        }
      `;
      document.head.appendChild(el);
    }
  }, []);

  useEffect(() => {
    let timeout;
    const scheduleNext = () => {
      const delay = 45000 + Math.random() * 45000;
      timeout = setTimeout(() => {
        targetRef.current = Math.min(targetRef.current + 1, 231);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setDisplayCount(cur => {
        if (cur < targetRef.current) return cur + 1;
        return cur;
      });
    }, 120);
    return () => clearInterval(id);
  }, []);

  const planColor = (plan) => {
    if (plan.includes("12")) return "#7C3AED";
    if (plan.includes("4"))  return "#5B4EFF";
    return "#0EA5E9";
  };

  const doubled = [...RANDOM_NAMES, ...RANDOM_NAMES];
  const speed   = isMobile ? "28s" : "38s";

  return (
    <div style={{
      background:   "#F8FAFC",
      border:       "1px solid #E2E8F0",
      borderRadius: 12,
      padding:      isMobile ? "12px 0 12px" : "14px 0 14px",
      marginBottom: isMobile ? 14 : 20,
      overflow:     "hidden",
    }}>
      <p style={{
        fontSize:   isMobile ? 12 : 13,
        fontWeight: 700,
        color:      "#0f172a",
        margin:     "0 0 10px",
        textAlign:  "center",
        lineHeight: 1.4,
        padding:    "0 14px",
      }}>
        <span
          key={displayCount}
          style={{
            color:     "#5B4EFF",
            display:   "inline-block",
            animation: "sp-pop 0.5s ease",
          }}
        >
          {displayCount}
        </span>
        {" "}people enrolled in the AI Certification Program in the last hour
      </p>

      <div style={{ overflow: "hidden", width: "100%" }}>
        <div style={{
          display:        "flex",
          gap:            isMobile ? 8 : 10,
          width:          "max-content",
          animation:      `sp-scroll ${speed} linear infinite`,
          paddingLeft:    12,
        }}>
          {doubled.map((entry, i) => (
            <div
              key={i}
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          6,
                background:   "#fff",
                border:       "1px solid #E2E8F0",
                borderRadius: 20,
                padding:      isMobile ? "5px 11px" : "6px 14px",
                fontSize:     isMobile ? 11 : 12,
                fontWeight:   600,
                color:        "#374151",
                boxShadow:    "0 1px 4px rgba(0,0,0,0.05)",
                whiteSpace:   "nowrap",
                flexShrink:   0,
              }}
            >
              <span style={{
                width:        7,
                height:       7,
                borderRadius: "50%",
                background:   planColor(entry.plan),
                display:      "inline-block",
                flexShrink:   0,
              }} />
              {entry.name}{" "}
              <span style={{ color: planColor(entry.plan), fontWeight: 700 }}>
                {entry.plan}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Money-Back Guarantee Section ── */
function MoneyBackGuarantee({ isMobile }) {
  return (
    <div style={{
      background:   "#F0FDF4",
      border:       "1px solid #BBF7D0",
      borderRadius: 16,
      padding:      isMobile ? "22px 18px" : "28px 28px",
      marginTop:    isMobile ? 20 : 28,
      textAlign:    "center",
      display:      "flex",
      flexDirection:"column",
      alignItems:   "center",
    }}>
      {/* Badge icon — centered via flex parent */}
      <svg
        width={isMobile ? 64 : 76}
        height={isMobile ? 64 : 76}
        viewBox="0 0 76 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: isMobile ? 14 : 18, display: "block" }}
      >
        {/* Ribbon left */}
        <path d="M28 56 L20 74 L31 67 L38 74 L38 56 Z" fill="#16A34A"/>
        {/* Ribbon right */}
        <path d="M48 56 L56 74 L45 67 L38 74 L38 56 Z" fill="#16A34A"/>
        {/* Circle background */}
        <circle cx="38" cy="32" r="28" fill="#16A34A"/>
        {/* Dashed inner ring */}
        <circle cx="38" cy="32" r="23" fill="none" stroke="#fff" strokeWidth="1.8" strokeDasharray="4 2.5"/>
        {/* Checkmark */}
        <path d="M26 32 L34 40 L51 22" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      {/* Heading */}
      <h3 style={{
        fontSize:   isMobile ? 17 : 20,
        fontWeight: 900,
        color:      "#14532D",
        margin:     "0 0 10px",
        lineHeight: 1.25,
      }}>
        Money-Back Guarantee
      </h3>

      {/* Body text */}
      <p style={{
        fontSize:   isMobile ? 12 : 13,
        color:      "#166534",
        lineHeight: 1.75,
        margin:     "0 0 12px",
        maxWidth:   420,
      }}>
        We're confident you'll love 1Course. If you haven't started your course yet —
        zero progress and no activity beyond onboarding — you're eligible for a{" "}
        <strong>full refund within 14 days</strong> of your purchase date.
      </p>

      {/* Email line */}
      <p style={{
        fontSize:   isMobile ? 11 : 12,
        color:      "#166534",
        lineHeight: 1.6,
        margin:     0,
        fontWeight: 600,
      }}>
        Simply email{" "}
        <a
          href="mailto:support@1course.io"
          style={{ color: "#15803D", fontWeight: 700, textDecoration: "underline" }}
        >
          support@1course.io
        </a>
        {" "}— no hoops, no hassle.
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
      const e = params.get("email") || sessionStorage.getItem("quiz_email") || "";
      const n = params.get("name")  || sessionStorage.getItem("quiz_name")  || "";
      setEmail(e);
      setName(n);
    }
    const interval = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) return 10 * 60;
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

  const handleCtaClick = () => {
    if (!termsAccepted) { setTermsError(true); return; }
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

          {/* ── Countdown ── */}
          <div style={{ marginTop: isMobile ? 14 : 18, marginBottom: isMobile ? 4 : 6 }}>
            <p style={{ fontSize: isMobile ? 12 : 13, fontWeight:600, color:"#0f172a", margin:"0 0 10px", letterSpacing:0.2 }}>
              Discount expires in
            </p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap: isMobile ? 8 : 12 }}>
              {[{ label:"MIN", val: mins }, { label:"SEC", val: secs }].reduce((acc, item, i) => {
                if (i === 1) acc.push(
                  <span key="colon" style={{ fontSize: isMobile ? 28 : 34, fontWeight:900, color:"#0f172a", lineHeight:1, paddingBottom:14 }}>:</span>
                );
                acc.push(
                  <div key={item.label} style={{ background:"#fff", borderRadius:10, boxShadow:"0 2px 12px rgba(0,0,0,0.13)", padding: isMobile ? "10px 18px" : "12px 24px", textAlign:"center", minWidth: isMobile ? 62 : 76 }}>
                    <span style={{ fontSize: isMobile ? 30 : 36, fontWeight:800, color:"#0f172a", lineHeight:1, display:"block", fontVariantNumeric:"tabular-nums" }}>{item.val}</span>
                    <span style={{ fontSize: isMobile ? 9 : 10, fontWeight:700, color:"#94A3B8", letterSpacing:1.5, marginTop:4, display:"block" }}>{item.label}</span>
                  </div>
                );
                return acc;
              }, [])}
            </div>
          </div>
        </div>

        {/* ── Plans ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:0, marginBottom: isMobile ? 14 : 20 }}>
          {plans.map((plan, idx) => (
            <div key={plan.name}>
              {plan.popular && (
                <div style={{ background:"#7C3AED", color:"#fff", fontSize: t.popularBadge + 1, fontWeight:800, padding:"8px 16px", textAlign:"center", marginTop: idx === 0 ? 8 : 0, borderRadius:"10px 10px 0 0" }}>
                  👍 MOST POPULAR
                </div>
              )}
              <div
                onClick={() => setSelectedPlan(plan.name)}
                style={{ padding: t.cardPad, borderRadius: plan.popular ? "0 0 10px 10px" : 10, border: `2px solid ${selectedPlan === plan.name ? "#7C3AED" : "#E2E8F0"}`, background:"#fff", cursor:"pointer", marginBottom:10, transition:"all 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:1, minWidth:0 }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, border:`2px solid ${selectedPlan === plan.name ? "#7C3AED" : "#CBD5E1"}`, background: selectedPlan === plan.name ? "#7C3AED" : "#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {selectedPlan === plan.name && <div style={{ width:7, height:7, borderRadius:"50%", background:"#fff" }}/>}
                    </div>
                    <div>
                      <span style={{ fontSize: t.planName, fontWeight:800, color:"#0f172a", display:"block", letterSpacing:0.3 }}>
                        {plan.name.toUpperCase().replace(" ", "-")}
                      </span>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                        <span style={{ fontSize: t.origPrice, color:"#94A3B8", textDecoration:"line-through" }}>${plan.originalPrice}</span>
                        <span style={{ fontSize: t.origPrice, color:"#374151", fontWeight:700 }}>${plan.price}</span>
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
          <p style={{ fontSize: t.legal, color:"#94A3B8", lineHeight:1.7, margin:"0 0 16px", textAlign:"center" }}
            dangerouslySetInnerHTML={{ __html: getLegalText() }}/>
        )}

        {/* ── Terms checkbox ── */}
        <div style={{ marginBottom: isMobile ? 14 : 18 }}>
          <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer" }}>
            <div
              onClick={() => { setTermsAccepted(v => !v); setTermsError(false); }}
              style={{ width:18, height:18, minWidth:18, borderRadius:4, marginTop:1, border:`2px solid ${termsError ? "#ef4444" : termsAccepted ? "#5B4EFF" : "#CBD5E1"}`, background: termsAccepted ? "#5B4EFF" : "#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s" }}>
              {termsAccepted && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: isMobile ? 11 : 12, color:"#374151", lineHeight:1.6 }}>
              I agree to the 1Course{" "}
              <a href="https://1course.io/terms-condition" target="_blank" rel="noopener noreferrer" style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>Terms of Service</a>{", "}
              <a href="https://1course.io/privacy" target="_blank" rel="noopener noreferrer" style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>Privacy Policy</a>{", "}
              <a href="https://1course.io/subscription-terms" target="_blank" rel="noopener noreferrer" style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>Subscription Policy</a>{", and "}
              <a href="https://1course.io/refund-policy" target="_blank" rel="noopener noreferrer" style={{ color:"#5B4EFF", fontWeight:700, textDecoration:"underline" }}>Money Back Guarantee</a>{"."}
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
          style={{ width:"100%", padding: t.ctaPad, borderRadius:14, border:"none", background: termsAccepted ? "linear-gradient(135deg,#5B4EFF,#8B5CF6)" : "#E2E8F0", color: termsAccepted ? "#fff" : "#94A3B8", fontSize: t.ctaFont, fontWeight:800, cursor: termsAccepted ? "pointer" : "not-allowed", boxShadow: termsAccepted ? "0 8px 24px rgba(91,78,255,0.4)" : "none", transition:"all 0.2s" }}>
          GET MY PLAN →
        </button>

        {/* ── Trust badges ── */}
        <div style={{ display:"flex", justifyContent:"center", gap: t.trustGap, marginTop:8, flexWrap:"wrap" }}>
          {["🔒 Secure payment","✅ Cancel anytime","🚀 Instant access"].map((b, i) => (
            <span key={i} style={{ fontSize: t.trustFont, color:"#64748B" }}>{b}</span>
          ))}
        </div>

        {/* ── Money-Back Guarantee ── */}
        <MoneyBackGuarantee isMobile={isMobile} />

      </div>

      {/* ── Payment modal ── */}
      {showPayment && (
        <PaymentModal
          plan={selectedPlan}
          paymentType="one_time"
          email={email}
          name={name}
          onClose={() => setShowPayment(false)}
          onSuccess={(eventId) => { setShowPayment(false); sessionStorage.clear(); const planObj = plans.find(p=>p.name===selectedPlan); const value = planObj?.price || "19.99"; console.log('[Meta] Browser Purchase eventId:', eventId); router.push(`/payment-success?plan=${encodeURIComponent(selectedPlan)}&value=${value}&eid=${eventId||""}`); }}
        />
      )}
    </div>
  );
}
