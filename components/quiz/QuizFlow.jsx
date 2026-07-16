"use client";
import { useBranding } from "@/lib/useBranding";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PaymentModal from "@/components/quiz/PaymentModal";
import QuizToast from "@/components/quiz/QuizToast";

const FIXED_REVIEWS = [
  { name:"Jeremy", stars:4, title:"Amazing to upgrade skills", text:"It is always amazing to upgrade skills and learn new things. Learning made simple, I am just wowed by the content." },
  { name:"Sarah M.", stars:5, title:"Best AI course platform", text:"I went from knowing nothing about AI to using it daily in my work. 1Course made it so easy and fun!" },
  { name:"Ahmed K.", stars:5, title:"Changed my career", text:"Within 2 weeks I was using AI tools at work and my manager noticed. Highly recommend to everyone." },
];

const END_SEQUENCE = ["loading", "summary", "comparison", "signup", "wheel"];

export default function QuizFlow({ blocks }) {
  const branding = useBranding();
  const router = useRouter();

  const [currentIdx, setCurrentIdx] = useState(() => {
    if (typeof window !== "undefined") return parseInt(sessionStorage.getItem("quiz_idx") || "0");
    return 0;
  });
  const [answers, setAnswers] = useState({});
  const [path, setPath] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("quiz_path") || "all";
    return "all";
  });
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("quiz_email") || "";
    return "";
  });
  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("quiz_name") || "";
    return "";
  });
  const [endStep, setEndStep] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("quiz_endstep") || null;
    return null;
  });
  const [loadingPct, setLoadingPct] = useState(0);
  const [toast, setToast] = useState("");
  const [showResume, setShowResume] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("quiz_endstep");
      return saved === "sales" || saved === "signup";
    }
    return false;
  });

  const loadingRef = useRef(null);

  const visibleBlocks = blocks.filter(b => b.path === "all" || b.path === path);
  const isInEndSequence = endStep !== null;
  const currentBlock = !isInEndSequence ? visibleBlocks[currentIdx] : null;

  const progress = isInEndSequence
    ? ((visibleBlocks.length + END_SEQUENCE.indexOf(endStep) + 1) / (visibleBlocks.length + END_SEQUENCE.length)) * 100
    : (currentIdx / (visibleBlocks.length + END_SEQUENCE.length)) * 100;

  useEffect(() => { sessionStorage.setItem("quiz_idx", currentIdx); }, [currentIdx]);
  useEffect(() => { sessionStorage.setItem("quiz_path", path); }, [path]);
  useEffect(() => { if (email) sessionStorage.setItem("quiz_email", email); }, [email]);
  useEffect(() => { if (name) sessionStorage.setItem("quiz_name", name); }, [name]);
  useEffect(() => { if (endStep) sessionStorage.setItem("quiz_endstep", endStep); }, [endStep]);

  const goNext = () => {
    if (isInEndSequence && endStep === "signup") {
      if (!name.trim()) { setToast("Please enter your full name"); return; }
      if (!email.trim() || !email.includes("@")) { setToast("Please enter a valid email address"); return; }
      try {
        fetch("/api/leads/save", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ name: name.trim(), email: email.trim() }) })
          .then(r => r.json()).then(d => console.log("Lead saved:", d)).catch(e => console.error("Lead error:", e));
      } catch(e) { console.error("Lead catch:", e); }
    }
    if (!isInEndSequence) {
      if (currentIdx < visibleBlocks.length - 1) {
        setCurrentIdx(i => i + 1);
      } else {
        setEndStep("loading");
      }
    } else {
      const idx = END_SEQUENCE.indexOf(endStep);
      if (idx < END_SEQUENCE.length - 1) {
        setEndStep(END_SEQUENCE[idx + 1]);
      } else {
        sessionStorage.clear();
        router.push(`/plan?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
      }
    }
  };

  const goBack = () => {
    if (isInEndSequence) {
      const idx = END_SEQUENCE.indexOf(endStep);
      if (idx === 0) { setEndStep(null); }
      else { setEndStep(END_SEQUENCE[idx - 1]); }
    } else if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
    }
  };

  const handleChoice = (blockId, value, isSplit, optionIndex) => {
    setAnswers(prev => ({ ...prev, [blockId]: value }));
    if (isSplit === "yes") {
      setPath(optionIndex === 0 ? "company" : "myself");
    }
  };

  useEffect(() => {
    if (endStep === "loading") {
      setLoadingPct(0);
      let step = 0;
      const steps = 60;
      loadingRef.current = setInterval(() => {
        step++;
        setLoadingPct(Math.min(Math.round((step / steps) * 100), 100));
        if (step >= steps) {
          clearInterval(loadingRef.current);
          setTimeout(() => setEndStep("summary"), 400);
        }
      }, 50);
      return () => clearInterval(loadingRef.current);
    }
  }, [endStep]);

  const showContinueBtn = !["question_choice", "question_icon", "loading", "sales", "wheel"].includes(
    isInEndSequence ? endStep : currentBlock?.type
  );

  return (
    <div style={{ minHeight:"100vh", background:"#fff", display:"flex", flexDirection:"column" }}>
      {toast && <QuizToast message={toast} onClose={() => setToast("")}/>}

      {/* Top bar */}
      <div style={{ position:"sticky", top:0, background:"#fff", zIndex:50 }}>
        <div style={{ padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ width:80 }}>
            {(currentIdx > 0 || isInEndSequence) && endStep !== "loading" && endStep !== "sales" && endStep !== "wheel" && (
              <button onClick={goBack} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", color:"#374151", fontSize:16, fontWeight:600, cursor:"pointer" }}>
                <ArrowLeft size={18}/>
              </button>
            )}
          </div>
          <img src={branding.logoApp||"https://i.postimg.cc/7Pd7vVJs/1course-Logo-Black-Version.png"} alt="1Course" className="logo-app" style={{ objectFit:"contain", padding:5 }}/>
          <div style={{ width:80, textAlign:"right" }}>
            {endStep !== "sales" && endStep !== "wheel" && (
              <span style={{ fontSize:13, fontWeight:700, color:"#94A3B8" }}>
                {isInEndSequence
                  ? `${visibleBlocks.length + END_SEQUENCE.indexOf(endStep) + 1} / ${visibleBlocks.length + END_SEQUENCE.length}`
                  : `${currentIdx + 1} / ${visibleBlocks.length + END_SEQUENCE.length}`
                }
              </span>
            )}
          </div>
        </div>
        {endStep !== "sales" && endStep !== "wheel" && (
          <div style={{ height:3, background:"#F1F5F9", width:"100%" }}>
            <div style={{ height:"100%", background:"linear-gradient(to right,#5B4EFF,#8B5CF6)", width:`${progress}%`, transition:"width 0.4s ease" }}/>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 12px 120px", maxWidth:650, margin:"0 auto", width:"100%" }}>
        {showResume && (
          <div style={{ width:"100%", background:"#EEF2FF", border:"1.5px solid #C7D2FE", borderRadius:16, padding:"16px 20px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"#4338CA", margin:"0 0 2px" }}>👋 Welcome back!</p>
              <p style={{ fontSize:13, color:"#6366f1", margin:0 }}>You were about to complete your purchase.</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { setShowResume(false); sessionStorage.clear(); setEndStep(null); setCurrentIdx(0); }} style={{ padding:"8px 14px", borderRadius:10, border:"1.5px solid #C7D2FE", background:"#fff", fontSize:12, fontWeight:600, color:"#6366f1", cursor:"pointer" }}>Start over</button>
              <button onClick={() => setShowResume(false)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", fontSize:12, fontWeight:700, color:"#fff", cursor:"pointer" }}>Continue →</button>
            </div>
          </div>
        )}
        {!isInEndSequence && currentBlock && (
          <QuizBlock block={currentBlock} answers={answers} onChoice={handleChoice} onNext={goNext}/>
        )}
        {isInEndSequence && (
          <EndBlock step={endStep} loadingPct={loadingPct} email={email} setEmail={setEmail} name={name} setName={setName} answers={answers} blocks={visibleBlocks} showToast={setToast} onNext={goNext}/>
        )}
      </div>

      {showContinueBtn && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"16px 20px", background:"#fff", borderTop:"1px solid #F1F5F9" }}>
          <div style={{ maxWidth:600, margin:"0 auto" }}>
            <button onClick={goNext} style={{ width:"100%", padding:"16px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(91,78,255,0.4)" }}>
              {endStep === "signup" ? "NEXT STEP" : "CONTINUE"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QuizBlock ─────────────────────────────────────────────────────────────────
function QuizBlock({ block, answers, onChoice, onNext }) {
  const c = block.content || {};

  if (block.type === "question_choice") {
    const options = (c.options || []).filter(Boolean);
    const optionImages = c.optionImages || [];
    const hasImages = optionImages.some(Boolean);
    const selected = answers[block.id];
    const labelColor = c.labelColor || "#5B4EFF";
    const textColor = c.textColor || "#ffffff";

    return (
      <div style={{ width:"100%", textAlign:"center" }}>
        <h1 style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2 }}>{c.question || "Question"}</h1>
        {c.subtitle && <p style={{ fontSize:15, color:"#64748B", margin:"0 0 32px" }}>{c.subtitle}</p>}
        <div style={{ display:"grid", gridTemplateColumns: hasImages && options.length === 2 ? "1fr 1fr" : "1fr", gap:20, alignItems:"stretch" }}>
          {options.map((opt, i) => (
            <button key={i}
              onClick={() => { onChoice(block.id, opt, c.isSplit, i); setTimeout(onNext, 250); }}
              style={{ padding:0, borderRadius:20, border:`2.5px solid ${selected===opt ? labelColor : "transparent"}`, background:"#F1F5F9", cursor:"pointer", overflow:"hidden", outline:"none", WebkitTapHighlightColor:"transparent", transition:"border-color 0.15s, box-shadow 0.15s", display:"flex", flexDirection:"column", boxShadow: selected===opt ? `0 0 0 4px ${labelColor}25` : "none" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = labelColor; }}
              onMouseLeave={e => { if (selected!==opt) e.currentTarget.style.borderColor = "transparent"; }}
            >
              {optionImages[i] && (
                <div style={{ position:"relative", width:"100%", height:260, background:"#E2E8F0", flexShrink:0, overflow:"hidden" }}>
                  <div className="quiz-shimmer" style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,#E2E8F0 25%,#CBD5E1 50%,#E2E8F0 75%)", backgroundSize:"200% 100%" }}/>
                  <img src={optionImages[i]} alt={opt} loading="eager" fetchPriority="high"
                    onLoad={e => { e.target.style.opacity = 1; const s = e.target.previousSibling; if (s) s.style.display = "none"; }}
                    style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 10%", display:"block", opacity:0, transition:"opacity 0.35s ease" }}/>
                </div>
              )}
              {!optionImages[i] && (
                <div style={{ flex:1, display:"flex", alignItems:"center", padding:"18px 20px", background:"#F8FAFC" }}>
                  <span style={{ fontSize:16, fontWeight:700, color: selected===opt ? labelColor : "#0f172a", flex:1, textAlign:"left" }}>{opt}</span>
                  <div style={{ width:28, height:28, borderRadius:"50%", background: selected===opt ? labelColor : "#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ChevronRight size={14} color={selected===opt ? textColor : "#94A3B8"}/>
                  </div>
                </div>
              )}
              {optionImages[i] && (
                <div style={{ padding:"14px 16px", background: labelColor, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexShrink:0 }}>
                  <span style={{ fontSize:15, fontWeight:700, color: textColor, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{opt}</span>
                  <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ChevronRight size={15} color={textColor}/>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
        <style>{`.quiz-shimmer { animation: quizShimmer 1.4s infinite; } @keyframes quizShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      </div>
    );
  }

  if (block.type === "question_icon") {
    const options = (c.options || []);
    const selected = answers[block.id];
    return (
      <div style={{ width:"100%" }}>
        <h1 style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2, textAlign:"center" }}>{c.question || "Question"}</h1>
        {c.subtitle && <p style={{ fontSize:15, color:"#64748B", margin:"0 0 32px", textAlign:"center" }}>{c.subtitle}</p>}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {options.map((opt, i) => (
            <button key={i}
              onClick={() => { onChoice(block.id, opt.label, c.isSplit, i); setTimeout(onNext, 250); }}
              style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 24px", borderRadius:16, border:`2px solid ${selected===opt.label?"#5B4EFF":"#E2E8F0"}`, background: selected===opt.label?"#EEF2FF":"#F8FAFC", cursor:"pointer", transition:"all 0.15s", textAlign:"left", outline:"none", WebkitTapHighlightColor:"transparent", boxShadow: selected===opt.label?"0 4px 14px rgba(91,78,255,0.2)":"none" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#5B4EFF"; e.currentTarget.style.background="#EEF2FF"; }}
              onMouseLeave={e => { if (selected!==opt.label) { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.background="#F8FAFC"; } }}
            >
              <span style={{ fontSize:32, width:48, textAlign:"center", flexShrink:0 }}>{opt.emoji||"•"}</span>
              <span style={{ fontSize:16, fontWeight:700, color:selected===opt.label?"#5B4EFF":"#0f172a" }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "image_section") {
    const c2 = block.content || {};
    const layout = c2.layout || "image-right";
    const bullets = (c2.bullets || []).filter(b => b && b.trim());
    const textContent = (
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <h1 style={{ fontSize:32, fontWeight:900, color:"#5B4EFF", margin:"0 0 8px", lineHeight:1.2 }}>{c2.heading}</h1>
        {c2.subtext && <p style={{ fontSize:16, color:"#374151", margin:"0 0 20px", lineHeight:1.7 }}>{c2.subtext}</p>}
        {bullets.map((b,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"#F8FAFC", borderRadius:12, marginBottom:8 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"#5B4EFF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Check size={14} color="#fff"/></div>
            <span style={{ fontSize:15, color:"#0f172a", fontWeight:500 }}>{b}</span>
          </div>
        ))}
      </div>
    );
    const imageContent = c2.imageUrl ? (
      <div style={{ flex:1, borderRadius:20, overflow:"hidden", minHeight:300 }}>
        <img src={c2.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:20 }}/>
      </div>
    ) : null;
    if (layout === "image-top") return <div style={{ width:"100%" }}>{imageContent && <div style={{ marginBottom: bullets.length > 0 ? 24 : 0 }}>{imageContent}</div>}{bullets.length > 0 && textContent}</div>;
    if (layout === "fullwidth") return <div style={{ width:"100%", position:"relative" }}>{c2.imageUrl && <div style={{ borderRadius:20, overflow:"hidden", marginBottom:20 }}><img src={c2.imageUrl} alt="" style={{ width:"100%", display:"block" }}/></div>}{textContent}</div>;
    return (
      <div style={{ width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"center" }}>
        {layout === "image-left" ? <>{imageContent}{textContent}</> : <>{textContent}{imageContent}</>}
      </div>
    );
  }

  return null;
}

// ─── WheelStep ─────────────────────────────────────────────────────────────────
function WheelStep({ name, onClaim }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState(false);
  const sz = 280;
  const segments = ["20%\noff","30%\noff","40%\noff","50%\noff","10%\noff","15%\noff"];
  const colors = ["#C4BFEE","#9E98E8","#C4BFEE","#9E98E8","#C4BFEE","#9E98E8"];
  const segCount = 6;
  const segAngle = (2 * Math.PI) / segCount;

  function drawWheel(rot) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = sz / 2, cy = sz / 2;
    const outerR = sz / 2 - 4;
    const innerR = outerR - 10;
    ctx.clearRect(0, 0, sz, sz);

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
    ctx.fillStyle = "#3730A3";
    ctx.fill();

    // Segments
    for (let i = 0; i < segCount; i++) {
      const startA = -Math.PI / 2 + rot + i * segAngle;
      const endA = startA + segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, innerR, startA, endA);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const midA = startA + segAngle / 2;
      ctx.save();
      ctx.translate(cx + innerR * 0.65 * Math.cos(midA), cy + innerR * 0.65 * Math.sin(midA));
      ctx.rotate(midA + Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#1e1b4b";
      ctx.font = `bold ${Math.round(sz * 0.065)}px sans-serif`;
      segments[i].split("\n").forEach((line, li, arr) => {
        ctx.fillText(line, 0, (li - (arr.length - 1) / 2) * sz * 0.08);
      });
      ctx.restore();
    }

    // Gold dots on outer ring
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx + (outerR - 5) * Math.cos(a), cy + (outerR - 5) * Math.sin(a), 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#D4AF37";
      ctx.fill();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, sz * 0.06, 0, 2 * Math.PI);
    ctx.fillStyle = "#3730A3";
    ctx.fill();

    // Pointer triangle at top
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR + 2);
    ctx.lineTo(cx - 10, cy - outerR + 20);
    ctx.lineTo(cx + 10, cy - outerR + 20);
    ctx.closePath();
    ctx.fillStyle = "#1e1b4b";
    ctx.fill();
  }

  useEffect(() => { drawWheel(0); }, []);

"use client";
import { useBranding } from "@/lib/useBranding";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PaymentModal from "@/components/quiz/PaymentModal";
import QuizToast from "@/components/quiz/QuizToast";

const FIXED_REVIEWS = [
  { name:"Jeremy", stars:4, title:"Amazing to upgrade skills", text:"It is always amazing to upgrade skills and learn new things. Learning made simple, I am just wowed by the content." },
  { name:"Sarah M.", stars:5, title:"Best AI course platform", text:"I went from knowing nothing about AI to using it daily in my work. 1Course made it so easy and fun!" },
  { name:"Ahmed K.", stars:5, title:"Changed my career", text:"Within 2 weeks I was using AI tools at work and my manager noticed. Highly recommend to everyone." },
];

const END_SEQUENCE = ["loading", "summary", "comparison", "signup", "wheel"];

export default function QuizFlow({ blocks }) {
  const branding = useBranding();
  const router = useRouter();

  const [currentIdx, setCurrentIdx] = useState(() => {
    if (typeof window !== "undefined") return parseInt(sessionStorage.getItem("quiz_idx") || "0");
    return 0;
  });
  const [answers, setAnswers] = useState({});
  const [path, setPath] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("quiz_path") || "all";
    return "all";
  });
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("quiz_email") || "";
    return "";
  });
  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("quiz_name") || "";
    return "";
  });
  const [endStep, setEndStep] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("quiz_endstep") || null;
    return null;
  });
  const [loadingPct, setLoadingPct] = useState(0);
  const [toast, setToast] = useState("");
  const [showResume, setShowResume] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("quiz_endstep");
      return saved === "sales" || saved === "signup";
    }
    return false;
  });

  const loadingRef = useRef(null);

  const visibleBlocks = blocks.filter(b => b.path === "all" || b.path === path);
  const isInEndSequence = endStep !== null;
  const currentBlock = !isInEndSequence ? visibleBlocks[currentIdx] : null;

  const progress = isInEndSequence
    ? ((visibleBlocks.length + END_SEQUENCE.indexOf(endStep) + 1) / (visibleBlocks.length + END_SEQUENCE.length)) * 100
    : (currentIdx / (visibleBlocks.length + END_SEQUENCE.length)) * 100;

  useEffect(() => { sessionStorage.setItem("quiz_idx", currentIdx); }, [currentIdx]);
  useEffect(() => { sessionStorage.setItem("quiz_path", path); }, [path]);
  useEffect(() => { if (email) sessionStorage.setItem("quiz_email", email); }, [email]);
  useEffect(() => { if (name) sessionStorage.setItem("quiz_name", name); }, [name]);
  useEffect(() => { if (endStep) sessionStorage.setItem("quiz_endstep", endStep); }, [endStep]);

  const goNext = () => {
    if (isInEndSequence && endStep === "signup") {
      if (!name.trim()) { setToast("Please enter your full name"); return; }
      if (!email.trim() || !email.includes("@")) { setToast("Please enter a valid email address"); return; }
      try {
        fetch("/api/leads/save", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ name: name.trim(), email: email.trim() }) })
          .then(r => r.json()).then(d => console.log("Lead saved:", d)).catch(e => console.error("Lead error:", e));
      } catch(e) { console.error("Lead catch:", e); }
    }
    if (!isInEndSequence) {
      if (currentIdx < visibleBlocks.length - 1) {
        setCurrentIdx(i => i + 1);
      } else {
        setEndStep("loading");
      }
    } else {
      const idx = END_SEQUENCE.indexOf(endStep);
      if (idx < END_SEQUENCE.length - 1) {
        setEndStep(END_SEQUENCE[idx + 1]);
      } else {
        sessionStorage.clear();
        router.push(`/plan?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
      }
    }
  };

  const goBack = () => {
    if (isInEndSequence) {
      const idx = END_SEQUENCE.indexOf(endStep);
      if (idx === 0) { setEndStep(null); }
      else { setEndStep(END_SEQUENCE[idx - 1]); }
    } else if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
    }
  };

  const handleChoice = (blockId, value, isSplit, optionIndex) => {
    setAnswers(prev => ({ ...prev, [blockId]: value }));
    if (isSplit === "yes") {
      setPath(optionIndex === 0 ? "company" : "myself");
    }
  };

  useEffect(() => {
    if (endStep === "loading") {
      setLoadingPct(0);
      let step = 0;
      const steps = 60;
      loadingRef.current = setInterval(() => {
        step++;
        setLoadingPct(Math.min(Math.round((step / steps) * 100), 100));
        if (step >= steps) {
          clearInterval(loadingRef.current);
          setTimeout(() => setEndStep("summary"), 400);
        }
      }, 50);
      return () => clearInterval(loadingRef.current);
    }
  }, [endStep]);

  const showContinueBtn = !["question_choice", "question_icon", "loading", "sales", "wheel"].includes(
    isInEndSequence ? endStep : currentBlock?.type
  );

  return (
    <div style={{ minHeight:"100vh", background:"#fff", display:"flex", flexDirection:"column" }}>
      {toast && <QuizToast message={toast} onClose={() => setToast("")}/>}

      {/* Top bar */}
      <div style={{ position:"sticky", top:0, background:"#fff", zIndex:50 }}>
        <div style={{ padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ width:80 }}>
            {(currentIdx > 0 || isInEndSequence) && endStep !== "loading" && endStep !== "sales" && endStep !== "wheel" && (
              <button onClick={goBack} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", color:"#374151", fontSize:16, fontWeight:600, cursor:"pointer" }}>
                <ArrowLeft size={18}/>
              </button>
            )}
          </div>
          <img src={branding.logoApp||"https://i.postimg.cc/7Pd7vVJs/1course-Logo-Black-Version.png"} alt="1Course" className="logo-app" style={{ objectFit:"contain", padding:5 }}/>
          <div style={{ width:80, textAlign:"right" }}>
            {endStep !== "sales" && endStep !== "wheel" && (
              <span style={{ fontSize:13, fontWeight:700, color:"#94A3B8" }}>
                {isInEndSequence
                  ? `${visibleBlocks.length + END_SEQUENCE.indexOf(endStep) + 1} / ${visibleBlocks.length + END_SEQUENCE.length}`
                  : `${currentIdx + 1} / ${visibleBlocks.length + END_SEQUENCE.length}`
                }
              </span>
            )}
          </div>
        </div>
        {endStep !== "sales" && endStep !== "wheel" && (
          <div style={{ height:3, background:"#F1F5F9", width:"100%" }}>
            <div style={{ height:"100%", background:"linear-gradient(to right,#5B4EFF,#8B5CF6)", width:`${progress}%`, transition:"width 0.4s ease" }}/>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 12px 120px", maxWidth:650, margin:"0 auto", width:"100%" }}>
        {showResume && (
          <div style={{ width:"100%", background:"#EEF2FF", border:"1.5px solid #C7D2FE", borderRadius:16, padding:"16px 20px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"#4338CA", margin:"0 0 2px" }}>👋 Welcome back!</p>
              <p style={{ fontSize:13, color:"#6366f1", margin:0 }}>You were about to complete your purchase.</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { setShowResume(false); sessionStorage.clear(); setEndStep(null); setCurrentIdx(0); }} style={{ padding:"8px 14px", borderRadius:10, border:"1.5px solid #C7D2FE", background:"#fff", fontSize:12, fontWeight:600, color:"#6366f1", cursor:"pointer" }}>Start over</button>
              <button onClick={() => setShowResume(false)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", fontSize:12, fontWeight:700, color:"#fff", cursor:"pointer" }}>Continue →</button>
            </div>
          </div>
        )}
        {!isInEndSequence && currentBlock && (
          <QuizBlock block={currentBlock} answers={answers} onChoice={handleChoice} onNext={goNext}/>
        )}
        {isInEndSequence && (
          <EndBlock step={endStep} loadingPct={loadingPct} email={email} setEmail={setEmail} name={name} setName={setName} answers={answers} blocks={visibleBlocks} showToast={setToast} onNext={goNext}/>
        )}
      </div>

      {showContinueBtn && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"16px 20px", background:"#fff", borderTop:"1px solid #F1F5F9" }}>
          <div style={{ maxWidth:600, margin:"0 auto" }}>
            <button onClick={goNext} style={{ width:"100%", padding:"16px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(91,78,255,0.4)" }}>
              {endStep === "signup" ? "NEXT STEP" : "CONTINUE"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QuizBlock ─────────────────────────────────────────────────────────────────
function QuizBlock({ block, answers, onChoice, onNext }) {
  const c = block.content || {};

  if (block.type === "question_choice") {
    const options = (c.options || []).filter(Boolean);
    const optionImages = c.optionImages || [];
    const hasImages = optionImages.some(Boolean);
    const selected = answers[block.id];
    const labelColor = c.labelColor || "#5B4EFF";
    const textColor = c.textColor || "#ffffff";

    return (
      <div style={{ width:"100%", textAlign:"center" }}>
        <h1 style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2 }}>{c.question || "Question"}</h1>
        {c.subtitle && <p style={{ fontSize:15, color:"#64748B", margin:"0 0 32px" }}>{c.subtitle}</p>}
        <div style={{ display:"grid", gridTemplateColumns: hasImages && options.length === 2 ? "1fr 1fr" : "1fr", gap:20, alignItems:"stretch" }}>
          {options.map((opt, i) => (
            <button key={i}
              onClick={() => { onChoice(block.id, opt, c.isSplit, i); setTimeout(onNext, 250); }}
              style={{ padding:0, borderRadius:20, border:`2.5px solid ${selected===opt ? labelColor : "transparent"}`, background:"#F1F5F9", cursor:"pointer", overflow:"hidden", outline:"none", WebkitTapHighlightColor:"transparent", transition:"border-color 0.15s, box-shadow 0.15s", display:"flex", flexDirection:"column", boxShadow: selected===opt ? `0 0 0 4px ${labelColor}25` : "none" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = labelColor; }}
              onMouseLeave={e => { if (selected!==opt) e.currentTarget.style.borderColor = "transparent"; }}
            >
              {optionImages[i] && (
                <div style={{ position:"relative", width:"100%", height:260, background:"#E2E8F0", flexShrink:0, overflow:"hidden" }}>
                  <div className="quiz-shimmer" style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,#E2E8F0 25%,#CBD5E1 50%,#E2E8F0 75%)", backgroundSize:"200% 100%" }}/>
                  <img src={optionImages[i]} alt={opt} loading="eager" fetchPriority="high"
                    onLoad={e => { e.target.style.opacity = 1; const s = e.target.previousSibling; if (s) s.style.display = "none"; }}
                    style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 10%", display:"block", opacity:0, transition:"opacity 0.35s ease" }}/>
                </div>
              )}
              {!optionImages[i] && (
                <div style={{ flex:1, display:"flex", alignItems:"center", padding:"18px 20px", background:"#F8FAFC" }}>
                  <span style={{ fontSize:16, fontWeight:700, color: selected===opt ? labelColor : "#0f172a", flex:1, textAlign:"left" }}>{opt}</span>
                  <div style={{ width:28, height:28, borderRadius:"50%", background: selected===opt ? labelColor : "#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ChevronRight size={14} color={selected===opt ? textColor : "#94A3B8"}/>
                  </div>
                </div>
              )}
              {optionImages[i] && (
                <div style={{ padding:"14px 16px", background: labelColor, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexShrink:0 }}>
                  <span style={{ fontSize:15, fontWeight:700, color: textColor, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{opt}</span>
                  <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ChevronRight size={15} color={textColor}/>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
        <style>{`.quiz-shimmer { animation: quizShimmer 1.4s infinite; } @keyframes quizShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      </div>
    );
  }

  if (block.type === "question_icon") {
    const options = (c.options || []);
    const selected = answers[block.id];
    return (
      <div style={{ width:"100%" }}>
        <h1 style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2, textAlign:"center" }}>{c.question || "Question"}</h1>
        {c.subtitle && <p style={{ fontSize:15, color:"#64748B", margin:"0 0 32px", textAlign:"center" }}>{c.subtitle}</p>}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {options.map((opt, i) => (
            <button key={i}
              onClick={() => { onChoice(block.id, opt.label, c.isSplit, i); setTimeout(onNext, 250); }}
              style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 24px", borderRadius:16, border:`2px solid ${selected===opt.label?"#5B4EFF":"#E2E8F0"}`, background: selected===opt.label?"#EEF2FF":"#F8FAFC", cursor:"pointer", transition:"all 0.15s", textAlign:"left", outline:"none", WebkitTapHighlightColor:"transparent", boxShadow: selected===opt.label?"0 4px 14px rgba(91,78,255,0.2)":"none" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#5B4EFF"; e.currentTarget.style.background="#EEF2FF"; }}
              onMouseLeave={e => { if (selected!==opt.label) { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.background="#F8FAFC"; } }}
            >
              <span style={{ fontSize:32, width:48, textAlign:"center", flexShrink:0 }}>{opt.emoji||"•"}</span>
              <span style={{ fontSize:16, fontWeight:700, color:selected===opt.label?"#5B4EFF":"#0f172a" }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "image_section") {
    const c2 = block.content || {};
    const layout = c2.layout || "image-right";
    const bullets = (c2.bullets || []).filter(b => b && b.trim());
    const textContent = (
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <h1 style={{ fontSize:32, fontWeight:900, color:"#5B4EFF", margin:"0 0 8px", lineHeight:1.2 }}>{c2.heading}</h1>
        {c2.subtext && <p style={{ fontSize:16, color:"#374151", margin:"0 0 20px", lineHeight:1.7 }}>{c2.subtext}</p>}
        {bullets.map((b,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"#F8FAFC", borderRadius:12, marginBottom:8 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"#5B4EFF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Check size={14} color="#fff"/></div>
            <span style={{ fontSize:15, color:"#0f172a", fontWeight:500 }}>{b}</span>
          </div>
        ))}
      </div>
    );
    const imageContent = c2.imageUrl ? (
      <div style={{ flex:1, borderRadius:20, overflow:"hidden", minHeight:300 }}>
        <img src={c2.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:20 }}/>
      </div>
    ) : null;
    if (layout === "image-top") return <div style={{ width:"100%" }}>{imageContent && <div style={{ marginBottom: bullets.length > 0 ? 24 : 0 }}>{imageContent}</div>}{bullets.length > 0 && textContent}</div>;
    if (layout === "fullwidth") return <div style={{ width:"100%", position:"relative" }}>{c2.imageUrl && <div style={{ borderRadius:20, overflow:"hidden", marginBottom:20 }}><img src={c2.imageUrl} alt="" style={{ width:"100%", display:"block" }}/></div>}{textContent}</div>;
    return (
      <div style={{ width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"center" }}>
        {layout === "image-left" ? <>{imageContent}{textContent}</> : <>{textContent}{imageContent}</>}
      </div>
    );
  }

  return null;
}

// ─── WheelStep ─────────────────────────────────────────────────────────────────
function WheelStep({ name, onClaim }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState(false);
  const sz = 280;
  const segments = ["20%\noff","30%\noff","40%\noff","50%\noff","10%\noff","15%\noff"];
  const colors = ["#C4BFEE","#9E98E8","#C4BFEE","#9E98E8","#C4BFEE","#9E98E8"];
  const segCount = 6;
  const segAngle = (2 * Math.PI) / segCount;

  function drawWheel(rot) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = sz / 2, cy = sz / 2;
    const outerR = sz / 2 - 4;
    const innerR = outerR - 10;
    ctx.clearRect(0, 0, sz, sz);

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
    ctx.fillStyle = "#3730A3";
    ctx.fill();

    // Segments
    for (let i = 0; i < segCount; i++) {
      const startA = -Math.PI / 2 + rot + i * segAngle;
      const endA = startA + segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, innerR, startA, endA);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const midA = startA + segAngle / 2;
      ctx.save();
      ctx.translate(cx + innerR * 0.65 * Math.cos(midA), cy + innerR * 0.65 * Math.sin(midA));
      ctx.rotate(midA + Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#1e1b4b";
      ctx.font = `bold ${Math.round(sz * 0.065)}px sans-serif`;
      segments[i].split("\n").forEach((line, li, arr) => {
        ctx.fillText(line, 0, (li - (arr.length - 1) / 2) * sz * 0.08);
      });
      ctx.restore();
    }

    // Gold dots on outer ring
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx + (outerR - 5) * Math.cos(a), cy + (outerR - 5) * Math.sin(a), 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#D4AF37";
      ctx.fill();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, sz * 0.06, 0, 2 * Math.PI);
    ctx.fillStyle = "#3730A3";
    ctx.fill();

    // Pointer triangle at top
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR + 2);
    ctx.lineTo(cx - 10, cy - outerR + 20);
    ctx.lineTo(cx + 10, cy - outerR + 20);
    ctx.closePath();
    ctx.fillStyle = "#1e1b4b";
    ctx.fill();
  }

  useEffect(() => { drawWheel(0); }, []);

  const spin = () => {
    if (spinning || won) return;
    setSpinning(true);
    // Always land on 50% off (segment index 3)
    // segment 3 center is at 3.5 * segAngle from top → need to bring it to top
    // target = 5 full rotations + offset to land segment 3 at top
    const targetRot = 10 * Math.PI + (5 * Math.PI) / 6;
    const duration = 5500;
    const start = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      drawWheel(targetRot * eased);
      if (progress < 1) requestAnimationFrame(animate);
      else { setSpinning(false); setWon(true); }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div style={{ width:"100%", textAlign:"center" }}>
      <h2 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Spin & Unlock Your</h2>
      <p style={{ fontSize:20, fontWeight:900, color:"#5B4EFF", margin:"0 0 8px" }}>Personal AI Challenge!</p>
      <p style={{ fontSize:14, color:"#64748B", margin:"0 0 24px" }}>Don't miss your chance to master AI with personalized offer 🎁</p>

      <canvas ref={canvasRef} width={sz} height={sz} style={{ display:"block", margin:"0 auto 24px" }}/>

      <button onClick={spin} disabled={spinning || won}
        style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", background: spinning||won ? "#94A3B8" : "linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor: spinning||won ? "not-allowed" : "pointer" }}>
        {spinning ? "SPINNING..." : "SPIN"}
      </button>

      {/* Win modal */}
      {won && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"24px 24px 0 0", padding:"28px 24px 48px", width:"100%", maxWidth:480, textAlign:"center" }}>
            <h3 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 16px" }}>Woo hoo! 🥳</h3>
            <div style={{ background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)", borderRadius:16, padding:"20px 16px", marginBottom:14, position:"relative", overflow:"hidden" }}>
              {[["#ef4444",5,10],["#22c55e",75,20],["#f59e0b",30,60],["#5B4EFF",85,15],["#ec4899",20,70],["#f59e0b",60,80],["#22c55e",45,5]].map(([c,l,t],i) => (
                <div key={i} style={{ position:"absolute", width:8, height:14, borderRadius:2, background:c, left:l+"%", top:t+"%", transform:`rotate(${i*25}deg)`, opacity:0.8 }}/>
              ))}
              <p style={{ fontSize:14, fontWeight:700, color:"#374151", margin:"0 0 6px", position:"relative", zIndex:1 }}>
                {name ? `${name}, you won a discount` : "You won a discount"}
              </p>
              <p style={{ fontSize:38, fontWeight:900, color:"#5B4EFF", margin:0, position:"relative", zIndex:1 }}>50% off</p>
            </div>
            <p style={{ fontSize:13, color:"#64748B", margin:"0 0 20px" }}>It will be applied automatically</p>
            <button onClick={onClaim} style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer" }}>
              CLAIM MY DISCOUNT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EndBlock ──────────────────────────────────────────────────────────────────
function EndBlock({ step, loadingPct, email, setEmail, name, setName, answers, blocks, showToast, onNext }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("4-Week Plan");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType] = useState("one_time");
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [pricingData, setPricingData] = useState(null);
  const [sliderPos, setSliderPos] = useState(0);

  useEffect(() => {
    if (step === "sales") {
      supabase.from("settings").select("value").eq("key","pricing").single().then(({ data }) => {
        if (data?.value) setPricingData(data.value);
      });
    }
  }, [step]);

  useEffect(() => {
    if (step === "sales") {
      const t = setInterval(() => setTimeLeft(p => Math.max(0, p-1)), 1000);
      return () => clearInterval(t);
    }
  }, [step]);

  useEffect(() => {
    if (step === "summary") {
      const t = setTimeout(() => setSliderPos(15), 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  const mins = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const secs = String(timeLeft%60).padStart(2,"0");

  const handleGetPlan = () => {
    if (!name || !email) { showToast("Please go back and fill in your name and email"); return; }
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    sessionStorage.clear();
    router.push("/payment-success");
  };

  // ── wheel ──────────────────────────────────────────────────────────────────
  if (step === "wheel") return <WheelStep name={name} onClaim={onNext}/>;

  // ── loading ────────────────────────────────────────────────────────────────
  if (step === "loading") {
    const reviewIdx = Math.floor((loadingPct / 100) * FIXED_REVIEWS.length);
    const review = FIXED_REVIEWS[Math.min(reviewIdx, FIXED_REVIEWS.length-1)];
    return (
      <div style={{ width:"100%", textAlign:"center", paddingTop:20 }}>
        <div style={{ position:"relative", width:140, height:140, margin:"0 auto 24px" }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="#F1F5F9" strokeWidth="10"/>
            <circle cx="70" cy="70" r="60" fill="none" stroke="#5B4EFF" strokeWidth="10"
              strokeDasharray={`${2*Math.PI*60}`}
              strokeDashoffset={`${2*Math.PI*60*(1-loadingPct/100)}`}
              strokeLinecap="round" transform="rotate(-90 70 70)"
              style={{ transition:"stroke-dashoffset 0.1s ease" }}/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:28, fontWeight:900, color:"#0f172a" }}>{loadingPct}%</span>
          </div>
        </div>
        <p style={{ fontSize:15, color:"#64748B", margin:"0 0 40px" }}>Analyzing answers to personalize your A.I. Certificate Program...</p>
        <hr style={{ border:"none", borderTop:"1px solid #F1F5F9", margin:"0 0 32px" }}/>
        <p style={{ fontSize:28, fontWeight:900, color:"#5B4EFF", margin:"0 0 4px" }}>2,000,000+ people</p>
        <p style={{ fontSize:18, fontWeight:700, color:"#0f172a", margin:"0 0 24px" }}>have chosen 1Course</p>
        <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"20px 24px", textAlign:"left", boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", gap:2, marginBottom:8 }}>
            {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:22, color:s<=review.stars?"#22c55e":"#E2E8F0" }}>★</span>)}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <p style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:0 }}>{review.title}</p>
            <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>{review.name}</p>
          </div>
          <p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.6 }}>"{review.text}"</p>
        </div>
        <p style={{ fontSize:12, color:"#94A3B8", marginTop:12 }}>Featured reviews from Trustpilot.</p>
      </div>
    );
  }

  // ── summary ────────────────────────────────────────────────────────────────
  if (step === "summary") {
    return (
      <div style={{ width:"100%" }}>
        <h2 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 8px", textAlign:"center" }}>Your Personal Summary</h2>
        <p style={{ fontSize:14, color:"#64748B", margin:"0 0 24px", textAlign:"center" }}>The quiz indicates that what's held you back is time, not capability</p>
        <div style={{ background:"#F8FAFC", borderRadius:16, padding:20, marginBottom:20 }}>
          <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 8px", textAlign:"center" }}>A.I. Skills</p>
          <p style={{ fontSize:48, fontWeight:900, color:"#0f172a", margin:"0 0 12px", textAlign:"center" }}>Low</p>
          <div style={{ height:12, borderRadius:999, background:"linear-gradient(to right,#ef4444,#f59e0b,#22c55e)", position:"relative", marginBottom:8 }}>
            <div style={{
              position:"absolute",
              left:`${sliderPos}%`,
              top:"50%",
              transform:"translate(-50%,-50%)",
              width:20, height:20,
              borderRadius:"50%",
              background:"#fff",
              border:"3px solid #374151",
              boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
              transition:"left 1.8s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:11, color:"#64748B" }}>Low</span>
            <span style={{ fontSize:11, color:"#64748B" }}>Medium</span>
            <span style={{ fontSize:11, color:"#64748B" }}>High</span>
          </div>
        </div>
        {[
          { icon:"🎯", label:"Your focus",          value:"Future-proofing your role" },
          { icon:"⭐", label:"Your readiness",       value:"Ready to learn online"     },
          { icon:"🕐", label:"Your pace",            value:"20 min a day"              },
          { icon:"📚", label:"Learning experience",  value:"Self-taught so far"        },
        ].map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"#fff", borderRadius:14, border:"1.5px solid #F1F5F9", marginBottom:10 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{item.icon}</div>
            <div>
              <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 2px" }}>{item.label}</p>
              <p style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:0 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── comparison ─────────────────────────────────────────────────────────────
  if (step === "comparison") {
    const withoutItems = ["AI feels too complex","No recognized credential","Don't know how to use AI","Invisible to employers"];
    const withItems = ["Clear, step-by-step path","Shareable AI credential","Reliable results from AI","Stand out from other workers"];
    const certDate = new Date(Date.now() + 28*24*60*60*1000).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
    const charH = 100;

    return (
      <div style={{ width:"100%", textAlign:"center" }}>
        <h2 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 6px", lineHeight:1.3 }}>Your Personalized AI<br/>Certificate Program</h2>
        <p style={{ fontSize:14, color:"#64748B", margin:"0 0 2px" }}>We expect you to earn your AI Certificate</p>
        <p style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:`0 0 ${charH/2}px`, textDecoration:"underline" }}>by {certDate}</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

          {/* Without column */}
          <div style={{ position:"relative", paddingTop: charH/2 }}>
            <img
              src="https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784114538455-Characters.webp"
              alt="without"
              style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%) translateY(10%)", height:charH, objectFit:"contain", zIndex:2 }}
            />
            <div style={{ borderRadius:16, border:"2px solid #FCA5A5", background:"#FFF5F5", padding:"60px 12px 16px", textAlign:"left", position:"relative", zIndex:1 }}>
              <p style={{ fontSize:12, color:"#64748B", margin:"0 0 2px" }}>You without</p>
              <p style={{ fontSize:16, fontWeight:900, color:"#0f172a", margin:"0 0 10px" }}>Coursiv</p>
              <div style={{ borderTop:"1.5px solid #FCA5A5", marginBottom:10 }}/>
              <p style={{ fontSize:13, fontWeight:800, color:"#0f172a", margin:"0 0 10px" }}>Struggles:</p>
              {withoutItems.map((item, i) => (
                <div key={i}>
                  <p style={{ fontSize:12, color:"#374151", margin:"0 0 8px", lineHeight:1.4 }}>{item}</p>
                  {i < withoutItems.length - 1 && <div style={{ borderTop:"1px solid #FCA5A5", marginBottom:8 }}/>}
                </div>
              ))}
            </div>
          </div>

          {/* With column */}
          <div style={{ position:"relative", paddingTop: charH/2 }}>
            <img
              src="https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784114541530-Characters-1.webp"
              alt="with"
              style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%) translateY(10%)", height:charH, objectFit:"contain", zIndex:2 }}
            />
            <div style={{ borderRadius:16, border:"2px solid #86EFAC", background:"#F0FDF4", padding:"60px 12px 16px", textAlign:"left", position:"relative", zIndex:1 }}>
              <p style={{ fontSize:12, color:"#64748B", margin:"0 0 2px" }}>You with</p>
              <p style={{ fontSize:16, fontWeight:900, color:"#0f172a", margin:"0 0 10px" }}>Coursiv:</p>
              <div style={{ borderTop:"1.5px solid #86EFAC", marginBottom:10 }}/>
              <p style={{ fontSize:13, fontWeight:800, color:"#0f172a", margin:"0 0 10px" }}>Solutions:</p>
              {withItems.map((item, i) => (
                <div key={i}>
                  <p style={{ fontSize:12, color:"#374151", margin:"0 0 8px", lineHeight:1.4 }}>{item}</p>
                  {i < withItems.length - 1 && <div style={{ borderTop:"1px solid #86EFAC", marginBottom:8 }}/>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── signup ─────────────────────────────────────────────────────────────────
  if (step === "signup") {
    return (
      <div style={{ width:"100%", maxWidth:480, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:28 }}>🎓</div>
          <h1 style={{ fontSize:26, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2 }}>Your A.I. Program is Ready!</h1>
          <p style={{ fontSize:15, color:"#64748B", margin:0 }}>Enter your details to continue</p>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:28 }}>
          {["🔒 Secure","✅ Free to start","🚀 Instant access"].map((b,i) => (
            <span key={i} style={{ fontSize:12, fontWeight:600, color:"#64748B" }}>{b}</span>
          ))}
        </div>
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #E2E8F0", padding:"28px 24px", boxShadow:"0 8px 32px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Full Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. John Smith"
                style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:"2px solid #E2E8F0", fontSize:15, outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#5B4EFF"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Email Address</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="e.g. john@gmail.com" type="email"
                style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:"2px solid #E2E8F0", fontSize:15, outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#5B4EFF"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
            </div>
          </div>
          <p style={{ fontSize:11, color:"#94A3B8", margin:"16px 0 0", textAlign:"center" }}>By continuing you agree to our Terms of Service</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginTop:20 }}>
          <div style={{ display:"flex" }}>
            {["👩","👨","👩🏽","👨🏿","👩🏻"].map((e,i) => (
              <div key={i} style={{ width:28, height:28, borderRadius:"50%", background:"#E2E8F0", border:"2px solid #fff", marginLeft:i>0?-8:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{e}</div>
            ))}
          </div>
          <p style={{ fontSize:12, color:"#64748B", margin:0 }}>Join <strong>2,000,000+</strong> A.I. learners</p>
        </div>
      </div>
    );
  }

  // ── sales ──────────────────────────────────────────────────────────────────
  if (step === "sales") {
    const plans = pricingData?.plans ? pricingData.plans.map(p => ({
      name: p.name, price: p.salePrice, originalPrice: p.regularPrice,
      weeks: p.id==="weekly" ? 1 : p.id==="monthly" ? 4 : 12, popular: p.id==="monthly",
    })) : [
      { name:"1-Week Plan",  price:"6.93",  originalPrice:"13.86", weeks:1 },
      { name:"4-Week Plan",  price:"19.99", originalPrice:"39.99", weeks:4, popular:true },
      { name:"12-Week Plan", price:"39.99", originalPrice:"79.99", weeks:12 },
    ];
    return (
      <>
        <div style={{ width:"100%", textAlign:"center", paddingBottom:40 }}>
          <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Your Personalized A.I. Certificate Program is Ready!</h1>
          <p style={{ fontSize:14, color:"#5B4EFF", fontWeight:700, margin:"0 0 24px" }}>Become the Master of A.I.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
            {plans.map((plan) => (
              <div key={plan.name} onClick={() => setSelectedPlan(plan.name)}
                style={{ padding:"20px 24px", borderRadius:16, border:`2px solid ${selectedPlan===plan.name?"#5B4EFF":"#E2E8F0"}`, background:selectedPlan===plan.name?"#EEF2FF":"#fff", cursor:"pointer", position:"relative", transition:"all 0.15s" }}>
                {plan.popular && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#5B4EFF", color:"#fff", fontSize:11, fontWeight:800, padding:"3px 14px", borderRadius:999, whiteSpace:"nowrap" }}>👍 MOST POPULAR</div>}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>{plan.name}</span>
                    <span style={{ background:"#ef4444", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:999 }}>50% OFF</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14, color:"#94A3B8", textDecoration:"line-through" }}>${plan.originalPrice}</span>
                    <span style={{ fontSize:24, fontWeight:900, color:"#5B4EFF" }}>${plan.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize:13, color:"#64748B", margin:"0 0 20px" }}>People using plan for 3 months achieve twice as many results as for 1 month</p>
          {pricingData && (() => {
            const planData = pricingData.plans?.find(p => p.name === selectedPlan);
            if (!planData?.legalText) return null;
            const legalHtml = planData.legalText
              .replace(/{salePrice}/g, "$" + planData.salePrice)
              .replace(/{regularPrice}/g, "$" + (planData.regularPrice||""))
              .replace(/{4weekRegularPrice}/g, "$" + (pricingData.plans?.find(p=>p.id==="monthly")?.regularPrice||"39.99"))
              .replace(/{12weekRegularPrice}/g, "$" + (pricingData.plans?.find(p=>p.id==="quarterly")?.regularPrice||"69.99"))
              .replace(/{name}/g, planData.name)
              .replace(/{duration}/g, String(planData.duration))
              .replace(/1course\.io\/profile/g, "<a href='https://1course.io/profile' style='color:#5B4EFF;font-weight:700;text-decoration:underline'>my profile</a>");
            return <p style={{ fontSize:11, color:"#94A3B8", lineHeight:1.7, margin:"0 0 16px", textAlign:"center" }} dangerouslySetInnerHTML={{ __html: legalHtml }}/>;
          })()}
          <button onClick={handleGetPlan} style={{ width:"100%", padding:"18px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer", boxShadow:"0 8px 24px rgba(91,78,255,0.4)", marginBottom:12 }}>
            GET MY PLAN →
          </button>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:12 }}>
            <span style={{ fontSize:12, color:"#64748B" }}>⏱ {mins}:{secs} left</span>
            <span style={{ fontSize:12, color:"#64748B" }}>🔒 Secure checkout</span>
          </div>
        </div>
        {showPayment && (
          <PaymentModal plan={selectedPlan} paymentType={paymentType} email={email} name={name} onClose={() => setShowPayment(false)} onSuccess={handlePaymentSuccess}/>
        )}
      </>
    );
  }

  return null;
}


  return (
    <div style={{ width:"100%", textAlign:"center" }}>
      <h2 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Spin & Unlock Your</h2>
      <p style={{ fontSize:20, fontWeight:900, color:"#5B4EFF", margin:"0 0 8px" }}>Personal AI Challenge!</p>
      <p style={{ fontSize:14, color:"#64748B", margin:"0 0 24px" }}>Don't miss your chance to master AI with personalized offer 🎁</p>

      <canvas ref={canvasRef} width={sz} height={sz} style={{ display:"block", margin:"0 auto 24px" }}/>

      <button onClick={spin} disabled={spinning || won}
        style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", background: spinning||won ? "#94A3B8" : "linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor: spinning||won ? "not-allowed" : "pointer" }}>
        {spinning ? "SPINNING..." : "SPIN"}
      </button>

      {/* Win modal */}
      {won && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"24px 24px 0 0", padding:"28px 24px 48px", width:"100%", maxWidth:480, textAlign:"center" }}>
            <h3 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 16px" }}>Woo hoo! 🥳</h3>
            <div style={{ background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)", borderRadius:16, padding:"20px 16px", marginBottom:14, position:"relative", overflow:"hidden" }}>
              {[["#ef4444",5,10],["#22c55e",75,20],["#f59e0b",30,60],["#5B4EFF",85,15],["#ec4899",20,70],["#f59e0b",60,80],["#22c55e",45,5]].map(([c,l,t],i) => (
                <div key={i} style={{ position:"absolute", width:8, height:14, borderRadius:2, background:c, left:l+"%", top:t+"%", transform:`rotate(${i*25}deg)`, opacity:0.8 }}/>
              ))}
              <p style={{ fontSize:14, fontWeight:700, color:"#374151", margin:"0 0 6px", position:"relative", zIndex:1 }}>
                {name ? `${name}, you won a discount` : "You won a discount"}
              </p>
              <p style={{ fontSize:38, fontWeight:900, color:"#5B4EFF", margin:0, position:"relative", zIndex:1 }}>50% off</p>
            </div>
            <p style={{ fontSize:13, color:"#64748B", margin:"0 0 20px" }}>It will be applied automatically</p>
            <button onClick={onClaim} style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer" }}>
              CLAIM MY DISCOUNT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EndBlock ──────────────────────────────────────────────────────────────────
function EndBlock({ step, loadingPct, email, setEmail, name, setName, answers, blocks, showToast, onNext }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("4-Week Plan");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType] = useState("one_time");
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [pricingData, setPricingData] = useState(null);
  const [sliderPos, setSliderPos] = useState(0);

  useEffect(() => {
    if (step === "sales") {
      supabase.from("settings").select("value").eq("key","pricing").single().then(({ data }) => {
        if (data?.value) setPricingData(data.value);
      });
    }
  }, [step]);

  useEffect(() => {
    if (step === "sales") {
      const t = setInterval(() => setTimeLeft(p => Math.max(0, p-1)), 1000);
      return () => clearInterval(t);
    }
  }, [step]);

  useEffect(() => {
    if (step === "summary") {
      const t = setTimeout(() => setSliderPos(15), 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  const mins = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const secs = String(timeLeft%60).padStart(2,"0");

  const handleGetPlan = () => {
    if (!name || !email) { showToast("Please go back and fill in your name and email"); return; }
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    sessionStorage.clear();
    router.push("/payment-success");
  };

  // ── wheel ──────────────────────────────────────────────────────────────────
  if (step === "wheel") return <WheelStep name={name} onClaim={onNext}/>;

  // ── loading ────────────────────────────────────────────────────────────────
  if (step === "loading") {
    const reviewIdx = Math.floor((loadingPct / 100) * FIXED_REVIEWS.length);
    const review = FIXED_REVIEWS[Math.min(reviewIdx, FIXED_REVIEWS.length-1)];
    return (
      <div style={{ width:"100%", textAlign:"center", paddingTop:20 }}>
        <div style={{ position:"relative", width:140, height:140, margin:"0 auto 24px" }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="#F1F5F9" strokeWidth="10"/>
            <circle cx="70" cy="70" r="60" fill="none" stroke="#5B4EFF" strokeWidth="10"
              strokeDasharray={`${2*Math.PI*60}`}
              strokeDashoffset={`${2*Math.PI*60*(1-loadingPct/100)}`}
              strokeLinecap="round" transform="rotate(-90 70 70)"
              style={{ transition:"stroke-dashoffset 0.1s ease" }}/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:28, fontWeight:900, color:"#0f172a" }}>{loadingPct}%</span>
          </div>
        </div>
        <p style={{ fontSize:15, color:"#64748B", margin:"0 0 40px" }}>Analyzing answers to personalize your A.I. Certificate Program...</p>
        <hr style={{ border:"none", borderTop:"1px solid #F1F5F9", margin:"0 0 32px" }}/>
        <p style={{ fontSize:28, fontWeight:900, color:"#5B4EFF", margin:"0 0 4px" }}>2,000,000+ people</p>
        <p style={{ fontSize:18, fontWeight:700, color:"#0f172a", margin:"0 0 24px" }}>have chosen 1Course</p>
        <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"20px 24px", textAlign:"left", boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", gap:2, marginBottom:8 }}>
            {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:22, color:s<=review.stars?"#22c55e":"#E2E8F0" }}>★</span>)}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <p style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:0 }}>{review.title}</p>
            <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>{review.name}</p>
          </div>
          <p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.6 }}>"{review.text}"</p>
        </div>
        <p style={{ fontSize:12, color:"#94A3B8", marginTop:12 }}>Featured reviews from Trustpilot.</p>
      </div>
    );
  }

  // ── summary ────────────────────────────────────────────────────────────────
  if (step === "summary") {
    return (
      <div style={{ width:"100%" }}>
        <h2 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 8px", textAlign:"center" }}>Your Personal Summary</h2>
        <p style={{ fontSize:14, color:"#64748B", margin:"0 0 24px", textAlign:"center" }}>The quiz indicates that what's held you back is time, not capability</p>
        <div style={{ background:"#F8FAFC", borderRadius:16, padding:20, marginBottom:20 }}>
          <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 8px", textAlign:"center" }}>A.I. Skills</p>
          <p style={{ fontSize:48, fontWeight:900, color:"#0f172a", margin:"0 0 12px", textAlign:"center" }}>Low</p>
          <div style={{ height:12, borderRadius:999, background:"linear-gradient(to right,#ef4444,#f59e0b,#22c55e)", position:"relative", marginBottom:8 }}>
            <div style={{
              position:"absolute",
              left:`${sliderPos}%`,
              top:"50%",
              transform:"translate(-50%,-50%)",
              width:20, height:20,
              borderRadius:"50%",
              background:"#fff",
              border:"3px solid #374151",
              boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
              transition:"left 1.8s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:11, color:"#64748B" }}>Low</span>
            <span style={{ fontSize:11, color:"#64748B" }}>Medium</span>
            <span style={{ fontSize:11, color:"#64748B" }}>High</span>
          </div>
        </div>
        {[
          { icon:"🎯", label:"Your focus",          value:"Future-proofing your role" },
          { icon:"⭐", label:"Your readiness",       value:"Ready to learn online"     },
          { icon:"🕐", label:"Your pace",            value:"20 min a day"              },
          { icon:"📚", label:"Learning experience",  value:"Self-taught so far"        },
        ].map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"#fff", borderRadius:14, border:"1.5px solid #F1F5F9", marginBottom:10 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{item.icon}</div>
            <div>
              <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 2px" }}>{item.label}</p>
              <p style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:0 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── comparison ─────────────────────────────────────────────────────────────
  if (step === "comparison") {
    const withoutItems = ["AI feels too complex","No recognized credential","Don't know how to use AI","Invisible to employers"];
    const withItems = ["Clear, step-by-step path","Shareable AI credential","Reliable results from AI","Stand out from other workers"];
    const certDate = new Date(Date.now() + 28*24*60*60*1000).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
    const charH = 100;

    return (
      <div style={{ width:"100%", textAlign:"center" }}>
        <h2 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 6px", lineHeight:1.3 }}>Your Personalized AI<br/>Certificate Program</h2>
        <p style={{ fontSize:14, color:"#64748B", margin:"0 0 2px" }}>We expect you to earn your AI Certificate</p>
        <p style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:`0 0 ${charH/2}px`, textDecoration:"underline" }}>by {certDate}</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

          {/* Without column */}
          <div style={{ position:"relative", paddingTop: charH/2 }}>
            <img
              src="https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784114538455-Characters.webp"
              alt="without"
              style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%) translateY(10%)", height:charH, objectFit:"contain", zIndex:2 }}
            />
            <div style={{ borderRadius:16, border:"2px solid #FCA5A5", background:"#FFF5F5", padding:"60px 12px 16px", textAlign:"left", position:"relative", zIndex:1 }}>
              <p style={{ fontSize:12, color:"#64748B", margin:"0 0 2px" }}>You without</p>
              <p style={{ fontSize:16, fontWeight:900, color:"#0f172a", margin:"0 0 10px" }}>Coursiv</p>
              <div style={{ borderTop:"1.5px solid #FCA5A5", marginBottom:10 }}/>
              <p style={{ fontSize:13, fontWeight:800, color:"#0f172a", margin:"0 0 10px" }}>Struggles:</p>
              {withoutItems.map((item, i) => (
                <div key={i}>
                  <p style={{ fontSize:12, color:"#374151", margin:"0 0 8px", lineHeight:1.4 }}>{item}</p>
                  {i < withoutItems.length - 1 && <div style={{ borderTop:"1px solid #FCA5A5", marginBottom:8 }}/>}
                </div>
              ))}
            </div>
          </div>

          {/* With column */}
          <div style={{ position:"relative", paddingTop: charH/2 }}>
            <img
              src="https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784114541530-Characters-1.webp"
              alt="with"
              style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%) translateY(10%)", height:charH, objectFit:"contain", zIndex:2 }}
            />
            <div style={{ borderRadius:16, border:"2px solid #86EFAC", background:"#F0FDF4", padding:"60px 12px 16px", textAlign:"left", position:"relative", zIndex:1 }}>
              <p style={{ fontSize:12, color:"#64748B", margin:"0 0 2px" }}>You with</p>
              <p style={{ fontSize:16, fontWeight:900, color:"#0f172a", margin:"0 0 10px" }}>Coursiv:</p>
              <div style={{ borderTop:"1.5px solid #86EFAC", marginBottom:10 }}/>
              <p style={{ fontSize:13, fontWeight:800, color:"#0f172a", margin:"0 0 10px" }}>Solutions:</p>
              {withItems.map((item, i) => (
                <div key={i}>
                  <p style={{ fontSize:12, color:"#374151", margin:"0 0 8px", lineHeight:1.4 }}>{item}</p>
                  {i < withItems.length - 1 && <div style={{ borderTop:"1px solid #86EFAC", marginBottom:8 }}/>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── signup ─────────────────────────────────────────────────────────────────
  if (step === "signup") {
    return (
      <div style={{ width:"100%", maxWidth:480, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:28 }}>🎓</div>
          <h1 style={{ fontSize:26, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2 }}>Your A.I. Program is Ready!</h1>
          <p style={{ fontSize:15, color:"#64748B", margin:0 }}>Enter your details to continue</p>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:28 }}>
          {["🔒 Secure","✅ Free to start","🚀 Instant access"].map((b,i) => (
            <span key={i} style={{ fontSize:12, fontWeight:600, color:"#64748B" }}>{b}</span>
          ))}
        </div>
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #E2E8F0", padding:"28px 24px", boxShadow:"0 8px 32px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Full Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. John Smith"
                style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:"2px solid #E2E8F0", fontSize:15, outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#5B4EFF"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Email Address</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="e.g. john@gmail.com" type="email"
                style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:"2px solid #E2E8F0", fontSize:15, outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#5B4EFF"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
            </div>
          </div>
          <p style={{ fontSize:11, color:"#94A3B8", margin:"16px 0 0", textAlign:"center" }}>By continuing you agree to our Terms of Service</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginTop:20 }}>
          <div style={{ display:"flex" }}>
            {["👩","👨","👩🏽","👨🏿","👩🏻"].map((e,i) => (
              <div key={i} style={{ width:28, height:28, borderRadius:"50%", background:"#E2E8F0", border:"2px solid #fff", marginLeft:i>0?-8:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{e}</div>
            ))}
          </div>
          <p style={{ fontSize:12, color:"#64748B", margin:0 }}>Join <strong>2,000,000+</strong> A.I. learners</p>
        </div>
      </div>
    );
  }

  // ── sales ──────────────────────────────────────────────────────────────────
  if (step === "sales") {
    const plans = pricingData?.plans ? pricingData.plans.map(p => ({
      name: p.name, price: p.salePrice, originalPrice: p.regularPrice,
      weeks: p.id==="weekly" ? 1 : p.id==="monthly" ? 4 : 12, popular: p.id==="monthly",
    })) : [
      { name:"1-Week Plan",  price:"6.93",  originalPrice:"13.86", weeks:1 },
      { name:"4-Week Plan",  price:"19.99", originalPrice:"39.99", weeks:4, popular:true },
      { name:"12-Week Plan", price:"39.99", originalPrice:"79.99", weeks:12 },
    ];
    return (
      <>
        <div style={{ width:"100%", textAlign:"center", paddingBottom:40 }}>
          <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Your Personalized A.I. Certificate Program is Ready!</h1>
          <p style={{ fontSize:14, color:"#5B4EFF", fontWeight:700, margin:"0 0 24px" }}>Become the Master of A.I.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
            {plans.map((plan) => (
              <div key={plan.name} onClick={() => setSelectedPlan(plan.name)}
                style={{ padding:"20px 24px", borderRadius:16, border:`2px solid ${selectedPlan===plan.name?"#5B4EFF":"#E2E8F0"}`, background:selectedPlan===plan.name?"#EEF2FF":"#fff", cursor:"pointer", position:"relative", transition:"all 0.15s" }}>
                {plan.popular && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#5B4EFF", color:"#fff", fontSize:11, fontWeight:800, padding:"3px 14px", borderRadius:999, whiteSpace:"nowrap" }}>👍 MOST POPULAR</div>}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>{plan.name}</span>
                    <span style={{ background:"#ef4444", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:999 }}>50% OFF</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14, color:"#94A3B8", textDecoration:"line-through" }}>${plan.originalPrice}</span>
                    <span style={{ fontSize:24, fontWeight:900, color:"#5B4EFF" }}>${plan.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize:13, color:"#64748B", margin:"0 0 20px" }}>People using plan for 3 months achieve twice as many results as for 1 month</p>
          {pricingData && (() => {
            const planData = pricingData.plans?.find(p => p.name === selectedPlan);
            if (!planData?.legalText) return null;
            const legalHtml = planData.legalText
              .replace(/{salePrice}/g, "$" + planData.salePrice)
              .replace(/{regularPrice}/g, "$" + (planData.regularPrice||""))
              .replace(/{4weekRegularPrice}/g, "$" + (pricingData.plans?.find(p=>p.id==="monthly")?.regularPrice||"39.99"))
              .replace(/{12weekRegularPrice}/g, "$" + (pricingData.plans?.find(p=>p.id==="quarterly")?.regularPrice||"69.99"))
              .replace(/{name}/g, planData.name)
              .replace(/{duration}/g, String(planData.duration))
              .replace(/1course\.io\/profile/g, "<a href='https://1course.io/profile' style='color:#5B4EFF;font-weight:700;text-decoration:underline'>my profile</a>");
            return <p style={{ fontSize:11, color:"#94A3B8", lineHeight:1.7, margin:"0 0 16px", textAlign:"center" }} dangerouslySetInnerHTML={{ __html: legalHtml }}/>;
          })()}
          <button onClick={handleGetPlan} style={{ width:"100%", padding:"18px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer", boxShadow:"0 8px 24px rgba(91,78,255,0.4)", marginBottom:12 }}>
            GET MY PLAN →
          </button>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:12 }}>
            <span style={{ fontSize:12, color:"#64748B" }}>⏱ {mins}:{secs} left</span>
            <span style={{ fontSize:12, color:"#64748B" }}>🔒 Secure checkout</span>
          </div>
        </div>
        {showPayment && (
          <PaymentModal plan={selectedPlan} paymentType={paymentType} email={email} name={name} onClose={() => setShowPayment(false)} onSuccess={handlePaymentSuccess}/>
        )}
      </>
    );
  }

  return null;
}
