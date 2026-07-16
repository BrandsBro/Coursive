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