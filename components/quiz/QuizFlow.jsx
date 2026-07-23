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

const PROOF_IMAGES = [
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784795498476-Web_riview_.jpg",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784797454351-Alex_Charter_.png",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784795497390-Sara.jpg",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784795496332-James_.jpg",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784795495453-Emilly_.jpg",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784795494244-Comment_and_reply_Mobile_ss_.jpg.png",
];

const END_SEQUENCE = ["loading", "summary", "comparison", "signup", "social_proof"];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ── Separate component so hooks run unconditionally ──────────────────────────
function SocialProofStep({ isMobile }) {
  const stats = [
    { value: "200K+",   label: "Users learned\nnew skills" },
    { value: "50k+", label: "Users earned\nAI certificates" },
    { value: "93%",   label: "Positive reviews\non Trustpilot\n(as of June 2026)" },
  ];

  return (
    <div style={{ width: "100%", textAlign: "center" }}>

      {/* Title */}
      <h2 style={{
        fontSize: isMobile ? 20 : 26, fontWeight: 900, color: "#0f172a",
        margin: "0 0 20px", lineHeight: 1.25
      }}>
        See How 1Course<br/>Empowers Learners
      </h2>

      {/* Stats row */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: isMobile ? 8 : 16, marginBottom: isMobile ? 24 : 32
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: "#F8FAFC", borderRadius: 14,
            padding: isMobile ? "12px 6px" : "18px 12px",
            border: "1.5px solid #E2E8F0"
          }}>
            <p style={{
              fontSize: isMobile ? 20 : 28, fontWeight: 900,
              color: "#5B4EFF", margin: "0 0 4px"
            }}>{s.value}</p>
            <p style={{
              fontSize: isMobile ? 10 : 12, color: "#64748B",
              margin: 0, lineHeight: 1.4, whiteSpace: "pre-line"
            }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Label */}
      <div style={{
        background: "#EEF2FF", borderRadius: 12,
        padding: isMobile ? "10px 14px" : "12px 20px", marginBottom: 20
      }}>
        <p style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, color: "#4338CA", margin: 0 }}>
          Hear What Others Are Saying About 1Course
        </p>
      </div>

      {/* Images stacked vertically */}
      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 16 }}>
        {PROOF_IMAGES.map((src, i) => (
          <div key={i} style={{
            width: "100%", borderRadius: 16, overflow: "hidden",
            background: "#F1F5F9",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
          }}>
            <img
              src={src}
              alt={`proof-${i}`}
              style={{
                width: "100%", display: "block",
                objectFit: "cover"
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QuizFlow({ blocks }) {
  const branding = useBranding();
  const router = useRouter();
  const isMobile = useIsMobile();

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

  useEffect(() => {
    (blocks || []).forEach((block, idx) => {
      const c = block.content || {};
      const srcs = [...(c.optionImages || []), c.imageUrl, c.headerImage].filter(Boolean);
      srcs.forEach(src => {
        const img = new Image();
        if (idx === 0) img.fetchPriority = "high";
        img.src = src;
      });
    });
  }, []);

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
    if (!isInEndSequence && currentBlock) {
      const isQuestion = currentBlock.type === "question_choice" || currentBlock.type === "question_icon";
      if (isQuestion && !answers[currentBlock.id]) {
        setToast("Please select an option to continue");
        return;
      }
    }
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
        // last step = social_proof → go to plan
        sessionStorage.clear();
        router.push(`/plan?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
      }
    }
  };

  const goBack = () => {
    if (isInEndSequence) {
      const idx = END_SEQUENCE.indexOf(endStep);
      if (idx === 0) { setEndStep(null); } else { setEndStep(END_SEQUENCE[idx - 1]); }
    } else if (currentIdx > 0) { setCurrentIdx(i => i - 1); }
  };

  const handleChoice = (blockId, value, isSplit, optionIndex) => {
    setAnswers(prev => ({ ...prev, [blockId]: value }));
    if (isSplit === "yes") { setPath(optionIndex === 0 ? "company" : "myself"); }
    setTimeout(() => {
      setCurrentIdx(prev => {
        const vb = blocks.filter(b => b.path === "all" || b.path === (optionIndex === 0 && isSplit === "yes" ? "company" : isSplit === "yes" ? "myself" : path));
        if (prev < vb.length - 1) return prev + 1;
        return prev;
      });
      setEndStep(prev => {
        const vb = blocks.filter(b => b.path === "all" || b.path === path);
        if (currentIdx >= vb.length - 1) return "loading";
        return prev;
      });
    }, 280);
  };

  useEffect(() => {
    if (endStep === "loading") {
      setLoadingPct(0);
      let step = 0;
      const steps = 60;
      loadingRef.current = setInterval(() => {
        step++;
        setLoadingPct(Math.min(Math.round((step / steps) * 100), 100));
        if (step >= steps) { clearInterval(loadingRef.current); setTimeout(() => setEndStep("summary"), 400); }
      }, 50);
      return () => clearInterval(loadingRef.current);
    }
  }, [endStep]);

  const showNextStepBtn = !["question_choice", "question_challenge", "question_icon", "loading", "sales"].includes(
    isInEndSequence ? endStep : currentBlock?.type
  );

  const getMaxWidth = () => {
    if (currentBlock?.type === "question_challenge") return 550;
    if (currentBlock?.type === "image_section") return 1200;
    return 600;
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fff", display:"flex", flexDirection:"column" }}>
      {toast && <QuizToast message={toast} onClose={() => setToast("")}/>}

      <div style={{ position:"sticky", top:0, background:"#fff", zIndex:50 }}>
        <div style={{ padding: isMobile ? "10px 14px" : "14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ width:56 }}>
            {(currentIdx > 0 || isInEndSequence) && endStep !== "loading" && endStep !== "sales" && (
              <button onClick={goBack} style={{ display:"flex", alignItems:"center", background:"none", border:"none", color:"#374151", cursor:"pointer" }}>
                <ArrowLeft size={isMobile ? 16 : 18}/>
              </button>
            )}
          </div>
          {branding.logoApp && <img src={branding.logoApp} alt="1Course" className="logo-app" style={{ objectFit:"contain", padding:4, maxHeight: isMobile ? 30 : 40 }}/>}
          <div style={{ width:56, textAlign:"right" }}>
            {endStep !== "sales" && (
              <span style={{ fontSize: isMobile ? 11 : 13, fontWeight:700, color:"#94A3B8" }}>
                {isInEndSequence
                  ? `${visibleBlocks.length + END_SEQUENCE.indexOf(endStep) + 1} / ${visibleBlocks.length + END_SEQUENCE.length}`
                  : `${currentIdx + 1} / ${visibleBlocks.length + END_SEQUENCE.length}`}
              </span>
            )}
          </div>
        </div>
        {endStep !== "sales" && (
          <div style={{ height:3, background:"#F1F5F9" }}>
            <div style={{ height:"100%", background:"linear-gradient(to right,#5B4EFF,#8B5CF6)", width:`${progress}%`, transition:"width 0.4s ease" }}/>
          </div>
        )}
      </div>

      <div style={{
        flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding: isMobile ? "20px 12px 100px" : "32px 20px 120px",
        maxWidth: getMaxWidth(), margin:"0 auto", width:"100%"
      }}>
        {showResume && (
          <div style={{ width:"100%", background:"#EEF2FF", border:"1.5px solid #C7D2FE", borderRadius:14, padding:"12px 14px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#4338CA", margin:"0 0 1px" }}>Welcome back!</p>
              <p style={{ fontSize:12, color:"#6366f1", margin:0 }}>You were about to complete your purchase.</p>
            </div>
            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              <button onClick={() => { setShowResume(false); sessionStorage.clear(); setEndStep(null); setCurrentIdx(0); }} style={{ padding:"6px 10px", borderRadius:8, border:"1.5px solid #C7D2FE", background:"#fff", fontSize:11, fontWeight:600, color:"#6366f1", cursor:"pointer" }}>Restart</button>
              <button onClick={() => setShowResume(false)} style={{ padding:"6px 10px", borderRadius:8, border:"none", background:"#5B4EFF", fontSize:11, fontWeight:700, color:"#fff", cursor:"pointer" }}>Next Step</button>
            </div>
          </div>
        )}
        {!isInEndSequence && currentBlock && (
          <QuizBlock block={currentBlock} answers={answers} onChoice={handleChoice} onNext={goNext} isMobile={isMobile}/>
        )}
        {isInEndSequence && (
          <EndBlock step={endStep} loadingPct={loadingPct} email={email} setEmail={setEmail} name={name} setName={setName} answers={answers} blocks={visibleBlocks} showToast={setToast} isMobile={isMobile} onNext={goNext}/>
        )}
      </div>

      {showNextStepBtn && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, padding: isMobile ? "10px 14px" : "16px 20px", background:"#fff", borderTop:"1px solid #F1F5F9" }}>
          <div style={{ maxWidth:600, margin:"0 auto" }}>
            <button onClick={goNext} style={{ width:"100%", padding: isMobile ? "13px" : "16px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize: isMobile ? 14 : 16, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(91,78,255,0.4)" }}>
            {endStep === "signup" ? "NEXT STEP" : "CONTINUE"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .quiz-shimmer { animation: quizShimmer 1.4s infinite; }
        @keyframes quizShimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
      `}</style>
    </div>
  );
}

function QuizBlock({ block, answers, onChoice, onNext, isMobile }) {
  const c = block.content || {};
  const clicked = useRef(false);

  const handleSelect = (blockId, value, isSplit, idx) => {
    if (clicked.current) return;
    clicked.current = true;
    onChoice(blockId, value, isSplit, idx);
    setTimeout(() => { clicked.current = false; }, 600);
  };

  if (block.type === "question_choice") {
    const options = (c.options || []).filter(Boolean);
    const optionImages = c.optionImages || [];
    const hasImages = optionImages.some(Boolean);
    const selected = answers[block.id];
    const labelColor = c.labelColor || "#5B4EFF";
    const textColor = c.textColor || "#ffffff";
    const imgH = isMobile ? 150 : 260;
    return (
      <div style={{ width:"100%", textAlign:"center" }}>
        <h1 style={{ fontSize: isMobile ? 20 : 28, fontWeight:900, color:"#0f172a", margin:"0 0 6px", lineHeight:1.2 }}>{c.question || "Question"}</h1>
        {c.subtitle && <p style={{ fontSize: isMobile ? 13 : 15, color:"#64748B", margin: isMobile ? "0 0 18px" : "0 0 32px" }}>{c.subtitle}</p>}
        <div style={{ display:"grid", gridTemplateColumns: hasImages && options.length === 2 ? "1fr 1fr" : "1fr", gap: isMobile ? 10 : 20, alignItems:"stretch" }}>
          {options.map((opt, i) => (
            <button key={i} onClick={() => handleSelect(block.id, opt, c.isSplit, i)}
              style={{ padding:0, borderRadius: isMobile ? 14 : 20, border:`2.5px solid ${selected===opt?labelColor:"transparent"}`, background:"#F1F5F9", cursor:"pointer", overflow:"hidden", outline:"none", WebkitTapHighlightColor:"transparent", transition:"border-color 0.15s, box-shadow 0.15s", display:"flex", flexDirection:"column", boxShadow:selected===opt?`0 0 0 4px ${labelColor}25`:"none" }}>
              {optionImages[i] && (
                <div style={{ position:"relative", width:"100%", height:imgH, background:"#E2E8F0", flexShrink:0, overflow:"hidden" }}>
                  <div className="quiz-shimmer" style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,#E2E8F0 25%,#CBD5E1 50%,#E2E8F0 75%)", backgroundSize:"200% 100%" }}/>
                  <img src={optionImages[i]} alt={opt} loading="eager" fetchPriority="high" decoding="async"
                    onLoad={e => { e.target.style.opacity=1; const s=e.target.previousSibling; if(s) s.style.display="none"; }}
                    style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 15%", display:"block", opacity:0, transition:"opacity 0.3s ease" }}/>
                </div>
              )}
              {!optionImages[i] && (
                <div style={{ flex:1, display:"flex", alignItems:"center", padding: isMobile ? "13px 14px" : "18px 20px", background:selected===opt?`${labelColor}15`:"#F8FAFC" }}>
                  <span style={{ fontSize: isMobile ? 14 : 16, fontWeight:700, color:"#0f172a", flex:1, textAlign:"left" }}>{opt}</span>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:selected===opt?labelColor:"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ChevronRight size={13} color={selected===opt?textColor:"#94A3B8"}/>
                  </div>
                </div>
              )}
              {optionImages[i] && (
                <div style={{ padding: isMobile ? "10px 12px" : "14px 16px", background:labelColor, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexShrink:0, minHeight: isMobile ? 52 : 56 }}>
                  <span style={{ fontSize: isMobile ? 12 : 15, fontWeight:700, color:textColor, textAlign:"left", wordBreak:"break-word", whiteSpace: isMobile ? "normal" : "nowrap", overflow:"hidden", textOverflow: isMobile ? "clip" : "ellipsis", flex:1, lineHeight:1.3 }}>{opt}</span>
                  <div style={{ width: isMobile ? 22 : 30, height: isMobile ? 22 : 30, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ChevronRight size={isMobile ? 11 : 15} color={textColor}/>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

if (block.type === "question_challenge") {
  const options = (c.options || []).filter(Boolean);
  const optionImages = c.optionImages || [];
  const labelColor = c.labelColor || "#5B4EFF";
  const cols = options.length <= 3 ? options.length : 2;
  const cardH = isMobile ? 160 : 200;
  const imgH = isMobile ? 180 : 220;
  return (
    <div style={{ width:"100%", textAlign:"center" }}>

      {/* 1. Main title first */}
      {c.challengeTitle && (
        <h1 style={{ fontSize: isMobile ? 18 : 26, fontWeight:900, color:"#0f172a", margin:"0 0 8px", letterSpacing:"0.5px" }}>
          {c.challengeTitle}
        </h1>
      )}

      {/* 2. preTitle block AFTER main title */}
      {(c.preTitle || c.preTitleLine2) && (
  <div style={{ textAlign:"center", marginBottom: isMobile ? 10 : 14 }}>
    {c.preTitle && (
      <p style={{ fontSize: isMobile ? c.preTitleSize || 14 : (c.preTitleSize || 14) + 2, margin:"0 0 3px", lineHeight:1.4, fontWeight:700 }}>
        {c.preTitle}
      </p>
    )}
    {c.preTitleLine2 && (
      <p style={{ fontSize: isMobile ? (c.preTitleSize || 14) - 2 : c.preTitleSize || 14, color:"#64748B", margin:0, lineHeight:1.4, fontWeight:700 }}>
        {c.preTitleLine2}
      </p>
    )}
  </div>
)}
      {/* 3. Question subtitle */}
      {c.question && (
        <p style={{ fontSize: isMobile ? 14 : 17, color:"#64748B", margin: isMobile ? "0 0 60px" : "0 0 16px" }}>
          {c.question}
        </p>
      )}

        <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap: isMobile ? 16 : 32, maxWidth: isMobile ? "92%" : 480, margin:"0 auto", paddingTop: isMobile ? 0 : 90 }}>
          {options.map((opt, i) => {
            const label = typeof opt === "object" ? opt.label : opt;
            const imgUrl = optionImages[i] || (typeof opt === "object" ? opt.imageUrl : "");
            const selected = answers[block.id] === label;
            return (
              <button key={i} onClick={() => handleSelect(block.id, label, c.isSplit, i)}
                style={{ position:"relative", padding:0, height:cardH, borderRadius: isMobile ? 16 : 20, border:`2.5px solid ${selected?labelColor:"#E2E8F0"}`, background:"#F1F5F9", cursor:"pointer", outline:"none", WebkitTapHighlightColor:"transparent", display:"flex", flexDirection:"column", justifyContent:"flex-end", overflow:"visible", boxShadow:selected?`0 0 0 4px ${labelColor}25`:"none", transition:"border-color 0.15s, box-shadow 0.15s" }}>
                {imgUrl && (
                  <>
                    <div className="quiz-shimmer" style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", height:imgH, background:"linear-gradient(90deg,#E2E8F0 25%,#CBD5E1 50%,#E2E8F0 75%)", backgroundSize:"200% 100%", borderRadius: isMobile ? 14 : 18, zIndex:1 }}/>
                    <img src={imgUrl} alt={label} loading="eager" fetchPriority="high" decoding="async"
                      onLoad={e => { e.target.style.opacity=1; const s=e.target.previousSibling; if(s) s.style.display="none"; }}
                      style={{ position:"absolute", bottom: isMobile ? 20 : 52, left:"50%", transform:"translateX(-50%)", width:"100%", height:imgH, objectFit:"cover", objectPosition:"center top", display:"block", opacity:0, transition:"opacity 0.3s ease", zIndex:2, pointerEvents:"none" }}/>
                  </>
                )}
                <div style={{ position:"relative", zIndex:3, padding: isMobile ? "10px 12px" : "12px 16px", background:labelColor, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexShrink:0, minHeight: isMobile ? 48 : 52, borderRadius:`0 0 ${isMobile?14:18}px ${isMobile?14:18}px` }}>
                  <span style={{ fontSize: isMobile ? 12 : 15, fontWeight:700, color:"#fff", textAlign:"left", flex:1, lineHeight:1.3 }}>{label}</span>
                  <div style={{ width: isMobile ? 24 : 28, height: isMobile ? 24 : 28, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ChevronRight size={isMobile ? 12 : 14} color="#fff"/>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (block.type === "question_icon") {
    const options = (c.options || []);
    const selected = answers[block.id];
    return (
      <div style={{ width:"100%" }}>
        <h1 style={{ fontSize: isMobile ? 20 : 28, fontWeight:900, color:"#0f172a", margin:"0 0 6px", lineHeight:1.2, textAlign:"center" }}>{c.question || "Question"}</h1>
        {c.subtitle && <p style={{ fontSize: isMobile ? 13 : 15, color:"#64748B", margin: isMobile ? "0 0 16px" : "0 0 32px", textAlign:"center" }}>{c.subtitle}</p>}
        <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? 8 : 12 }}>
          {options.map((opt, i) => (
            <button key={i} onClick={() => handleSelect(block.id, opt.label, c.isSplit, i)}
              style={{ display:"flex", alignItems:"center", gap: isMobile ? 12 : 16, padding: isMobile ? "12px 14px" : "18px 24px", borderRadius: isMobile ? 12 : 16, border:`2px solid ${selected===opt.label?"#5B4EFF":"#E2E8F0"}`, background:selected===opt.label?"#EEF2FF":"#F8FAFC", cursor:"pointer", transition:"all 0.15s", textAlign:"left", outline:"none", WebkitTapHighlightColor:"transparent", boxShadow:selected===opt.label?"0 4px 14px rgba(91,78,255,0.2)":"none" }}>
              <span style={{ fontSize: isMobile ? 24 : 32, width: isMobile ? 36 : 48, textAlign:"center", flexShrink:0 }}>{opt.emoji||"•"}</span>
              <span style={{ fontSize: isMobile ? 14 : 16, fontWeight:700, color:selected===opt.label?"#5B4EFF":"#0f172a" }}>{opt.label}</span>
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
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems: isMobile ? "center" : "flex-start", textAlign: isMobile ? "center" : "left" }}>
        <h1 style={{ fontSize: isMobile ? 20 : 28, fontWeight:900, color:"#5B4EFF", margin:"0 0 8px", lineHeight:1.2 }}>{c2.heading}</h1>
        {c2.subtext && <p style={{ fontSize: isMobile ? 13 : 16, color:"#374151", margin:"0 0 14px", lineHeight:1.6 }}>{c2.subtext}</p>}
        {bullets.map((b,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding: isMobile ? "9px 12px" : "12px 16px", background:"#F8FAFC", borderRadius:12, marginBottom:8, width:"100%" }}>
            <div style={{ width: isMobile ? 22 : 28, height: isMobile ? 22 : 28, borderRadius:"50%", background:"#5B4EFF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Check size={isMobile ? 11 : 14} color="#fff"/>
            </div>
            <span style={{ fontSize: isMobile ? 13 : 15, color:"#0f172a", fontWeight:500 }}>{b}</span>
          </div>
        ))}
      </div>
    );
const imageContent = c2.imageUrl ? (
  <img
    src={c2.imageUrl}
    alt=""
    loading="eager"
    fetchPriority="high"
    style={{
      width: "100%",
      height: isMobile ? 280 : "100%",
      objectFit: "cover",
      objectPosition: "center top",
      display: "block",
      borderRadius: 16,
      maxHeight: isMobile ? "auto" : 420,
    }}
  />
) : null;
    if (isMobile) return <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:16, alignItems:"center" }}>{textContent}{imageContent}</div>;
    if (layout === "image-top") return <div style={{ width:"100%" }}>{imageContent && <div style={{ marginBottom:24 }}>{imageContent}</div>}{textContent}</div>;
    if (layout === "fullwidth") return <div style={{ width:"100%" }}>{c2.imageUrl && <div style={{ borderRadius:16, overflow:"hidden", marginBottom:20 }}><img src={c2.imageUrl} alt="" loading="eager" style={{ width:"100%", display:"block" }}/></div>}{textContent}</div>;
   return (
  <div style={{ width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"stretch" }}>
    {layout === "image-left" ? <>{imageContent}{textContent}</> : <>{textContent}{imageContent}</>}
  </div>
);
  }

  return null;
}

function EndBlock({ step, loadingPct, email, setEmail, name, setName, answers, blocks, showToast, isMobile, onNext }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("4-Week Plan");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType] = useState("one_time");
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [pricingData, setPricingData] = useState(null);
  const [sliderPos, setSliderPos] = useState(0);

  useEffect(() => {
    if (step === "summary") {
      const t = setTimeout(() => setSliderPos(15), 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (step === "sales") {
      supabase.from("settings").select("value").eq("key","pricing").single().then(({ data }) => { if (data?.value) setPricingData(data.value); });
    }
  }, [step]);

  useEffect(() => {
    if (step === "sales") {
      const t = setInterval(() => setTimeLeft(p => Math.max(0, p-1)), 1000);
      return () => clearInterval(t);
    }
  }, [step]);

  const mins = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const secs = String(timeLeft%60).padStart(2,"0");
  const handleGetPlan = () => { if (!name || !email) { showToast("Please go back and fill in your name and email"); return; } setShowPayment(true); };
  const handlePaymentSuccess = () => { setShowPayment(false); sessionStorage.clear(); router.push("/payment-success"); };

  if (step === "loading") {
    const reviewIdx = Math.floor((loadingPct / 100) * FIXED_REVIEWS.length);
    const review = FIXED_REVIEWS[Math.min(reviewIdx, FIXED_REVIEWS.length-1)];
    const cs = isMobile ? 100 : 140;
    const r = isMobile ? 42 : 60;
    return (
      <div style={{ width:"100%", textAlign:"center", paddingTop:8 }}>
        <div style={{ position:"relative", width:cs, height:cs, margin:"0 auto 18px" }}>
          <svg width={cs} height={cs} viewBox={`0 0 ${cs} ${cs}`}>
            <circle cx={cs/2} cy={cs/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth="8"/>
            <circle cx={cs/2} cy={cs/2} r={r} fill="none" stroke="#5B4EFF" strokeWidth="8"
              strokeDasharray={`${2*Math.PI*r}`} strokeDashoffset={`${2*Math.PI*r*(1-loadingPct/100)}`}
              strokeLinecap="round" transform={`rotate(-90 ${cs/2} ${cs/2})`} style={{ transition:"stroke-dashoffset 0.1s ease" }}/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize: isMobile ? 20 : 28, fontWeight:900, color:"#0f172a" }}>{loadingPct}%</span>
          </div>
        </div>
        <p style={{ fontSize: isMobile ? 13 : 15, color:"#64748B", margin:"0 0 24px" }}>Analyzing answers to personalize your A.I. Certificate Program...</p>
        <hr style={{ border:"none", borderTop:"1px solid #F1F5F9", margin:"0 0 20px" }}/>
        <p style={{ fontSize: isMobile ? 20 : 28, fontWeight:900, color:"#5B4EFF", margin:"0 0 4px" }}>2,000,000+ people</p>
        <p style={{ fontSize: isMobile ? 14 : 18, fontWeight:700, color:"#0f172a", margin:"0 0 18px" }}>have chosen 1Course</p>
        <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding: isMobile ? "14px" : "20px 24px", textAlign:"left", boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", gap:2, marginBottom:8 }}>
            {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: isMobile ? 16 : 22, color:s<=review.stars?"#22c55e":"#E2E8F0" }}>★</span>)}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, flexWrap:"wrap", gap:4 }}>
            <p style={{ fontSize: isMobile ? 13 : 15, fontWeight:700, color:"#0f172a", margin:0 }}>{review.title}</p>
            <p style={{ fontSize: isMobile ? 11 : 13, color:"#94A3B8", margin:0 }}>{review.name}</p>
          </div>
          <p style={{ fontSize: isMobile ? 12 : 14, color:"#374151", margin:0, lineHeight:1.6 }}>"{review.text}"</p>
        </div>
        <p style={{ fontSize:11, color:"#94A3B8", marginTop:10 }}>Featured reviews from Trustpilot.</p>
      </div>
    );
  }

  if (step === "summary") {
    return (
      <div style={{ width:"100%" }}>
        <h2 style={{ fontSize: isMobile ? 18 : 24, fontWeight:900, color:"#0f172a", margin:"0 0 6px", textAlign:"center" }}>Your Personal Summary</h2>
        <p style={{ fontSize: isMobile ? 12 : 14, color:"#64748B", margin:"0 0 18px", textAlign:"center" }}>The quiz indicates that what's held you back is time, not capability</p>
        <div style={{ background:"#F8FAFC", borderRadius:16, padding: isMobile ? 14 : 20, marginBottom:14 }}>
          <p style={{ fontSize: isMobile ? 12 : 14, fontWeight:700, color:"#0f172a", margin:"0 0 6px", textAlign:"center" }}>A.I. Skills</p>
          <p style={{ fontSize: isMobile ? 32 : 48, fontWeight:900, color:"#0f172a", margin:"0 0 10px", textAlign:"center" }}>Low</p>
          <div style={{ height: isMobile ? 10 : 12, borderRadius:999, background:"linear-gradient(to right,#ef4444,#f59e0b,#22c55e)", position:"relative", marginBottom:8 }}>
            <div style={{ position:"absolute", left:`${sliderPos}%`, transition:"left 1.8s cubic-bezier(0.25,0.46,0.45,0.94)", top:-4, width:18, height:18, borderRadius:"50%", background:"#fff", border:"3px solid #374151", transform:"translateX(-50%)" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            {["Low","Medium","High"].map(l => <span key={l} style={{ fontSize:11, color:"#64748B" }}>{l}</span>)}
          </div>
        </div>
        {[
          { icon:"🎯", label:"Your focus", value:"Future-proofing your role" },
          { icon:"⭐", label:"Your readiness", value:"Ready to learn online" },
          { icon:"🕐", label:"Your pace", value:"20 min a day" },
          { icon:"📚", label:"Learning experience", value:"Self-taught so far" },
        ].map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding: isMobile ? "11px 12px" : "14px 16px", background:"#fff", borderRadius:12, border:"1.5px solid #F1F5F9", marginBottom:8 }}>
            <div style={{ width: isMobile ? 34 : 40, height: isMobile ? 34 : 40, borderRadius:10, background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize: isMobile ? 16 : 20, flexShrink:0 }}>{item.icon}</div>
            <div>
              <p style={{ fontSize: isMobile ? 11 : 12, color:"#94A3B8", margin:"0 0 1px" }}>{item.label}</p>
              <p style={{ fontSize: isMobile ? 13 : 15, fontWeight:700, color:"#0f172a", margin:0 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (step === "comparison") {
    const withoutItems = ["AI feels too complex","No recognized credential","Don't know how to use AI","Invisible to employers"];
    const withItems = ["Clear, step-by-step path","Shareable AI credential","Reliable results from AI","Stand out from other workers"];
    const certDate = new Date(Date.now() + 28*24*60*60*1000).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
    const charH = isMobile ? 130 : 150;
    return (
      <div style={{ width:"100%", textAlign:"center" }}>
        <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight:900, color:"#0f172a", margin:"0 0 6px", lineHeight:1.3 }}>Your Personalized AI<br/>Certificate Program</h2>
        <p style={{ fontSize: isMobile ? 12 : 14, color:"#64748B", margin:"0 0 2px" }}>We expect you to earn your AI Certificate</p>
        <p style={{ fontSize: isMobile ? 13 : 14, fontWeight:800, color:"#0f172a", margin:`0 0 ${charH/2}px`, textDecoration:"underline" }}>by {certDate}</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: isMobile ? 10 : 14 }}>
          <div style={{ position:"relative", paddingTop: charH/2 }}>
            <img src="https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784114538455-Characters.webp" alt="without"
              style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%) translateY(-26%)", height:charH, objectFit:"contain", zIndex:2 }}/>
            <div style={{ borderRadius:16, border:"2px solid #FCA5A5", background:"#FFF5F5", padding: isMobile ? "40px 12px 14px" : "40px 16px 18px", textAlign:"left", position:"relative", zIndex:1 }}>
              <p style={{ fontSize: isMobile ? 11 : 12, color:"#64748B", margin:"0 0 2px" }}>You without</p>
              <p style={{ fontSize: isMobile ? 15 : 17, fontWeight:900, color:"#0f172a", margin:"0 0 10px" }}>1Course</p>
              <div style={{ borderTop:"1.5px solid #FCA5A5", marginBottom:10 }}/>
              <p style={{ fontSize: isMobile ? 12 : 13, fontWeight:800, color:"#0f172a", margin:"0 0 10px" }}>Struggles:</p>
              {withoutItems.map((item, i) => (
                <div key={i}>
                  <p style={{ fontSize: isMobile ? 12 : 13, color:"#374151", margin:"0 0 8px", lineHeight:1.4 }}>{item}</p>
                  {i < withoutItems.length-1 && <div style={{ borderTop:"1px solid #FCA5A5", marginBottom:8 }}/>}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position:"relative", paddingTop: charH/2 }}>
            <img src="https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784114541530-Characters-1.webp" alt="with"
              style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%) translateY(-26%)", height:charH, objectFit:"contain", zIndex:2 }}/>
            <div style={{ borderRadius:16, border:"2px solid #86EFAC", background:"#F0FDF4", padding: isMobile ? "40px 12px 14px" : "40px 16px 18px", textAlign:"left", position:"relative", zIndex:1 }}>
              <p style={{ fontSize: isMobile ? 11 : 12, color:"#64748B", margin:"0 0 2px" }}>You with</p>
              <p style={{ fontSize: isMobile ? 15 : 17, fontWeight:900, color:"#0f172a", margin:"0 0 10px" }}>1Course:</p>
              <div style={{ borderTop:"1.5px solid #86EFAC", marginBottom:10 }}/>
              <p style={{ fontSize: isMobile ? 12 : 13, fontWeight:800, color:"#0f172a", margin:"0 0 10px" }}>Solutions:</p>
              {withItems.map((item, i) => (
                <div key={i}>
                  <p style={{ fontSize: isMobile ? 12 : 13, color:"#374151", margin:"0 0 8px", lineHeight:1.4 }}>{item}</p>
                  {i < withItems.length-1 && <div style={{ borderTop:"1px solid #86EFAC", marginBottom:8 }}/>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "signup") {
    return (
      <div style={{ width:"100%", maxWidth:480, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom: isMobile ? 18 : 32 }}>
          <div style={{ width: isMobile ? 50 : 64, height: isMobile ? 50 : 64, borderRadius:18, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize: isMobile ? 22 : 28 }}>🎓</div>
          <h1 style={{ fontSize: isMobile ? 19 : 26, fontWeight:900, color:"#0f172a", margin:"0 0 6px", lineHeight:1.2 }}>Your A.I. Program is Ready!</h1>
          <p style={{ fontSize: isMobile ? 13 : 15, color:"#64748B", margin:0 }}>Enter your details to continue</p>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap: isMobile ? 10 : 20, marginBottom: isMobile ? 16 : 28, flexWrap:"wrap" }}>
          {["🔒 Secure","✅ Free to start","🚀 Instant access"].map((b,i) => (
            <span key={i} style={{ fontSize: isMobile ? 11 : 12, fontWeight:600, color:"#64748B" }}>{b}</span>
          ))}
        </div>
        <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #E2E8F0", padding: isMobile ? "18px 14px" : "28px 24px", boxShadow:"0 8px 32px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Full Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. John Smith"
                style={{ width:"100%", padding: isMobile ? "11px 13px" : "14px 16px", borderRadius:12, border:"2px solid #E2E8F0", fontSize: isMobile ? 14 : 15, outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#5B4EFF"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Email Address</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="e.g. john@gmail.com" type="email"
                style={{ width:"100%", padding: isMobile ? "11px 13px" : "14px 16px", borderRadius:12, border:"2px solid #E2E8F0", fontSize: isMobile ? 14 : 15, outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#5B4EFF"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
            </div>
          </div>
          <p style={{ fontSize:11, color:"#94A3B8", margin:"12px 0 0", textAlign:"center" }}>By continuing you agree to our Terms of Service</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginTop:14 }}>
          <div style={{ display:"flex" }}>
            {["👩","👨","👩🏽","👨🏿","👩🏻"].map((e,i) => (
              <div key={i} style={{ width:26, height:26, borderRadius:"50%", background:"#E2E8F0", border:"2px solid #fff", marginLeft:i>0?-8:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{e}</div>
            ))}
          </div>
          <p style={{ fontSize: isMobile ? 11 : 12, color:"#64748B", margin:0 }}>Join <strong>2,000,000+</strong> A.I. learners</p>
        </div>
      </div>
    );
  }

  // ── Social proof step — rendered via separate component for clean hook usage
  if (step === "social_proof") {
    return <SocialProofStep isMobile={isMobile} />;
  }

  if (step === "sales") {
    const plans = pricingData?.plans ? pricingData.plans.map(p => ({
      name:p.name, price:p.salePrice, originalPrice:p.regularPrice,
      weeks:p.id==="weekly"?1:p.id==="monthly"?4:12, popular:p.id==="monthly",
    })) : [
      { name:"1-Week Plan", price:"6.93", originalPrice:"13.86", weeks:1 },
      { name:"4-Week Plan", price:"19.99", originalPrice:"39.99", weeks:4, popular:true },
      { name:"12-Week Plan", price:"39.99", originalPrice:"79.99", weeks:12 },
    ];
    return (
      <>
        <div style={{ width:"100%", textAlign:"center", paddingBottom:40 }}>
          <h1 style={{ fontSize: isMobile ? 17 : 24, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Your Personalized A.I. Certificate Program is Ready!</h1>
          <p style={{ fontSize: isMobile ? 13 : 14, color:"#5B4EFF", fontWeight:700, margin:"0 0 18px" }}>Become the Master of A.I.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
            {plans.map((plan) => (
              <div key={plan.name} onClick={() => setSelectedPlan(plan.name)}
                style={{ padding: isMobile ? "14px 16px" : "20px 24px", borderRadius:14, border:`2px solid ${selectedPlan===plan.name?"#5B4EFF":"#E2E8F0"}`, background:selectedPlan===plan.name?"#EEF2FF":"#fff", cursor:"pointer", position:"relative", transition:"all 0.15s" }}>
                {plan.popular && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:"#5B4EFF", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 12px", borderRadius:999, whiteSpace:"nowrap" }}>👍 MOST POPULAR</div>}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize: isMobile ? 14 : 16, fontWeight:800, color:"#0f172a" }}>{plan.name}</span>
                    <span style={{ background:"#ef4444", color:"#fff", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:999 }}>50% OFF</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize: isMobile ? 12 : 14, color:"#94A3B8", textDecoration:"line-through" }}>${plan.originalPrice}</span>
                    <span style={{ fontSize: isMobile ? 20 : 24, fontWeight:900, color:"#5B4EFF" }}>${plan.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: isMobile ? 11 : 13, color:"#64748B", margin:"0 0 14px" }}>People using plan for 3 months achieve twice as many results as for 1 month</p>
          {pricingData && (() => {
            const planData = pricingData.plans?.find(p => p.name === selectedPlan);
            if (!planData?.legalText) return null;
            const legalHtml = planData.legalText
              .replace(/{salePrice}/g, "$"+planData.salePrice)
              .replace(/{regularPrice}/g, "$"+(planData.regularPrice||""))
              .replace(/{4weekRegularPrice}/g, "$"+(pricingData.plans?.find(p=>p.id==="monthly")?.regularPrice||"39.99"))
              .replace(/{12weekRegularPrice}/g, "$"+(pricingData.plans?.find(p=>p.id==="quarterly")?.regularPrice||"69.99"))
              .replace(/{name}/g, planData.name)
              .replace(/{duration}/g, String(planData.duration))
              .replace(/1course\.io\/profile/g, "<a href='https://1course.io/profile' style='color:#5B4EFF;font-weight:700;text-decoration:underline'>my profile</a>");
            return <p style={{ fontSize:11, color:"#94A3B8", lineHeight:1.7, margin:"0 0 14px", textAlign:"center" }} dangerouslySetInnerHTML={{ __html:legalHtml }}/>;
          })()}
          <button onClick={handleGetPlan} style={{ width:"100%", padding: isMobile ? "14px" : "18px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize: isMobile ? 14 : 16, fontWeight:800, cursor:"pointer", boxShadow:"0 8px 24px rgba(91,78,255,0.4)", marginBottom:10 }}>
            GET MY PLAN →
          </button>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:8 }}>
            <span style={{ fontSize: isMobile ? 11 : 12, color:"#64748B" }}>⏱ {mins}:{secs} left</span>
            <span style={{ fontSize: isMobile ? 11 : 12, color:"#64748B" }}>🔒 Secure checkout</span>
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
