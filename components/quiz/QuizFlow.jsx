"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronRight, Check, ArrowLeft } from "lucide-react";

const FIXED_REVIEWS = [
  { name:"Jeremy", stars:4, title:"Amazing to upgrade skills", text:"It is always amazing to upgrade skills and learn new things. Learning made simple, I am just wowed by the content." },
  { name:"Sarah M.", stars:5, title:"Best AI course platform", text:"I went from knowing nothing about AI to using it daily in my work. Coursiv made it so easy and fun!" },
  { name:"Ahmed K.", stars:5, title:"Changed my career", text:"Within 2 weeks I was using AI tools at work and my manager noticed. Highly recommend to everyone." },
];

const END_SEQUENCE = ["loading", "summary", "comparison", "signup", "sales"];

export default function QuizFlow({ blocks }) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [path, setPath] = useState("all");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loadingPct, setLoadingPct] = useState(0);
  const [endStep, setEndStep] = useState(null); // null = not in end sequence yet
  const loadingRef = useRef(null);

  const visibleBlocks = blocks.filter(b => b.path === "all" || b.path === path);
  const isInEndSequence = endStep !== null;
  const currentBlock = !isInEndSequence ? visibleBlocks[currentIdx] : null;
  const currentEndStep = isInEndSequence ? endStep : null;

  const progress = isInEndSequence
    ? ((visibleBlocks.length + END_SEQUENCE.indexOf(endStep) + 1) / (visibleBlocks.length + END_SEQUENCE.length)) * 100
    : (currentIdx / (visibleBlocks.length + END_SEQUENCE.length)) * 100;

  const goNext = () => {
    if (isInEndSequence && endStep === "signup") {
      if (!name.trim()) { alert("Please enter your full name"); return; }
      if (!email.trim() || !email.includes("@")) { alert("Please enter a valid email address"); return; }
    }
    if (!isInEndSequence) {
      if (currentIdx < visibleBlocks.length - 1) {
        setCurrentIdx(i => i + 1);
      } else {
        // Start end sequence
        setEndStep("loading");
      }
    } else {
      const idx = END_SEQUENCE.indexOf(endStep);
      if (idx < END_SEQUENCE.length - 1) {
        setEndStep(END_SEQUENCE[idx + 1]);
      } else {
        // Done — all finished
        router.push("/");
      }
    }
  };

  const goBack = () => {
    if (isInEndSequence) {
      const idx = END_SEQUENCE.indexOf(endStep);
      if (idx === 0) {
        setEndStep(null);
      } else {
        setEndStep(END_SEQUENCE[idx - 1]);
      }
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

  // Auto-advance loading screen
  useEffect(() => {
    if (endStep === "loading") {
      setLoadingPct(0);
      let step = 0;
      const steps = 60; // 3 seconds
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

  const showContinueBtn = !["question_choice", "loading"].includes(
    isInEndSequence ? endStep : currentBlock?.type
  );

  return (
    <div style={{ minHeight:"100vh", background:"#fff", display:"flex", flexDirection:"column" }}>

      {/* Top bar */}
      <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid #F1F5F9", position:"sticky", top:0, background:"#fff", zIndex:50 }}>
        <span style={{ fontSize:20, fontWeight:900, color:"#5B4EFF", fontStyle:"italic", flexShrink:0 }}>✦ Coursiv</span>
        {endStep !== "loading" && endStep !== "sales" && (
          <div style={{ flex:1, height:6, background:"#F1F5F9", borderRadius:999, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:999, background:"linear-gradient(to right,#5B4EFF,#8B5CF6)", width:`${progress}%`, transition:"width 0.4s ease" }}/>
          </div>
        )}
        {(currentIdx > 0 || isInEndSequence) && endStep !== "loading" && endStep !== "sales" && (
          <button onClick={goBack} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", color:"#64748B", fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 }}>
            <ArrowLeft size={14}/> Back
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 20px 120px", maxWidth:600, margin:"0 auto", width:"100%" }}>
        {!isInEndSequence && currentBlock && (
          <QuizBlock block={currentBlock} answers={answers} onChoice={handleChoice} onNext={goNext}/>
        )}
        {isInEndSequence && (
          <EndBlock step={endStep} loadingPct={loadingPct} email={email} setEmail={setEmail} name={name} setName={setName} answers={answers} blocks={visibleBlocks}/>
        )}
      </div>

      {/* Continue button */}
      {showContinueBtn && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"16px 20px", background:"#fff", borderTop:"1px solid #F1F5F9" }}>
          <div style={{ maxWidth:600, margin:"0 auto" }}>
            <button onClick={goNext} style={{ width:"100%", padding:"16px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(91,78,255,0.4)" }}>
              CONTINUE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizBlock({ block, answers, onChoice, onNext }) {
  const c = block.content || {};

  if (block.type === "question_choice") {
    const options = (c.options || []).filter(Boolean);
    const optionImages = c.optionImages || [];
    const hasImages = optionImages.some(Boolean);
    const selected = answers[block.id];

    return (
      <div style={{ width:"100%", textAlign:"center" }}>
        <h1 style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2 }}>{c.question || "Question"}</h1>
        {c.subtitle && <p style={{ fontSize:15, color:"#64748B", margin:"0 0 32px" }}>{c.subtitle}</p>}
        <div style={{ display:"grid", gridTemplateColumns: hasImages && options.length === 2 ? "1fr 1fr" : "1fr", gap:12 }}>
          {options.map((opt, i) => (
            <button key={i}
              onClick={() => { onChoice(block.id, opt, c.isSplit, i); setTimeout(onNext, 250); }}
              style={{
                padding: optionImages[i] ? "0" : "18px 24px",
                borderRadius:16,
                border:`2px solid ${selected===opt?"#5B4EFF":"#E2E8F0"}`,
                background: selected===opt?"#EEF2FF":"#F8FAFC",
                cursor:"pointer", overflow:"hidden",
                transition:"all 0.15s", textAlign:"left",
                boxShadow: selected===opt?"0 4px 14px rgba(91,78,255,0.2)":"none",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#5B4EFF"; e.currentTarget.style.background="#EEF2FF"; }}
              onMouseLeave={e => { if (selected!==opt) { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.background="#F8FAFC"; } }}
            >
              {optionImages[i] && (
                <div style={{ height:150, overflow:"hidden" }}>
                  <img src={optionImages[i]} alt={opt} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                </div>
              )}
              <div style={{ padding: optionImages[i] ? "14px 16px" : "0", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                <span style={{ fontSize:16, fontWeight:700, color:selected===opt?"#5B4EFF":"#0f172a" }}>{opt}</span>
                <div style={{ width:28, height:28, borderRadius:"50%", background:selected===opt?"#5B4EFF":"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {selected===opt ? <Check size={14} color="#fff"/> : <ChevronRight size={14} color="#94A3B8"/>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "image_section") {
    const c2 = block.content || {};
    const layout = c2.layout || "image-right";
    const bullets = (c2.bullets || []).filter(Boolean);

    if (layout === "image-top") {
      return (
        <div style={{ width:"100%", textAlign:"center" }}>
          {c2.imageUrl && <div style={{ borderRadius:20, overflow:"hidden", marginBottom:24 }}><img src={c2.imageUrl} alt="" style={{ width:"100%", display:"block" }}/></div>}
          <h1 style={{ fontSize:26, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>{c2.heading}</h1>
          {c2.subtext && <p style={{ fontSize:15, color:"#64748B", margin:"0 0 20px", lineHeight:1.6 }}>{c2.subtext}</p>}
          {bullets.map((b,i) => <BulletItem key={i} text={b}/>)}
        </div>
      );
    }

    if (layout === "fullwidth") {
      return (
        <div style={{ width:"100%" }}>
          {c2.imageUrl && (
            <div style={{ borderRadius:20, overflow:"hidden", marginBottom:20, position:"relative" }}>
              <img src={c2.imageUrl} alt="" style={{ width:"100%", display:"block" }}/>
            </div>
          )}
          <h1 style={{ fontSize:26, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>{c2.heading}</h1>
          {c2.subtext && <p style={{ fontSize:15, color:"#64748B", margin:"0 0 20px", lineHeight:1.6 }}>{c2.subtext}</p>}
          {bullets.map((b,i) => <BulletItem key={i} text={b}/>)}
        </div>
      );
    }

    // image-left or image-right
    const isRight = layout === "image-right";
    return (
      <div style={{ width:"100%" }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>{c2.heading}</h1>
        {c2.subtext && <p style={{ fontSize:15, color:"#64748B", margin:"0 0 20px", lineHeight:1.6 }}>{c2.subtext}</p>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"center" }}>
          {!isRight && c2.imageUrl && <div style={{ borderRadius:16, overflow:"hidden" }}><img src={c2.imageUrl} alt="" style={{ width:"100%", display:"block" }}/></div>}
          <div>{bullets.map((b,i) => <BulletItem key={i} text={b}/>)}</div>
          {isRight && c2.imageUrl && <div style={{ borderRadius:16, overflow:"hidden" }}><img src={c2.imageUrl} alt="" style={{ width:"100%", display:"block" }}/></div>}
        </div>
      </div>
    );
  }

  return null;
}

function BulletItem({ text }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"#F8FAFC", borderRadius:12, marginBottom:8 }}>
      <div style={{ width:28, height:28, borderRadius:"50%", background:"#5B4EFF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Check size={14} color="#fff"/>
      </div>
      <span style={{ fontSize:15, color:"#0f172a", fontWeight:500 }}>{text}</span>
    </div>
  );
}

function EndBlock({ step, loadingPct, email, setEmail, name, setName, answers, blocks }) {
  const [selectedPlan, setSelectedPlan] = useState("4-Week Plan");
  const [signingUp, setSigningUp] = useState(false);

  const handleGetPlan = async () => {
    if (!name || !email) {
      alert("Please go back and fill in your name and email");
      return;
    }
    setSigningUp(true);
    try {
      // Generate random password
      const tempPassword = Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,10).toUpperCase() + "!1";

      // Create account
      const { data, error } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: { data: { full_name: name } },
      });

      if (error) throw error;

      // Send welcome + password email
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Welcome to Coursiv! Here are your login details 🎉",
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center">
                <h1 style="margin:0;font-size:28px;font-weight:900">✦ Coursiv</h1>
                <p style="margin:8px 0 0;opacity:0.8">Welcome aboard!</p>
              </div>
              <div style="padding:32px">
                <h2 style="font-size:22px;margin:0 0 12px">Hi ${name}! 👋</h2>
                <p style="color:rgba(255,255,255,0.7);line-height:1.7">Your account has been created. Here are your login details:</p>
                <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin:20px 0">
                  <p style="margin:0 0 8px;color:rgba(255,255,255,0.5);font-size:12px">EMAIL</p>
                  <p style="margin:0 0 16px;font-weight:700;font-size:16px">${email}</p>
                  <p style="margin:0 0 8px;color:rgba(255,255,255,0.5);font-size:12px">TEMPORARY PASSWORD</p>
                  <p style="margin:0;font-weight:700;font-size:16px;color:#a78bfa">${tempPassword}</p>
                </div>
                <p style="color:rgba(255,255,255,0.5);font-size:13px">You can change your password anytime from your profile settings.</p>
                <a href="https://coursiv-six.vercel.app/login" style="display:inline-block;margin-top:20px;padding:14px 28px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
                  Start Learning →
                </a>
              </div>
            </div>
          `
        }),
      });

      // Redirect to courses
      router.push("/home");
    } catch(e) {
      alert("Something went wrong: " + e.message);
    }
    setSigningUp(false);
  };
  const [timeLeft, setTimeLeft] = useState(10 * 60);

  useEffect(() => {
    if (step === "sales") {
      const t = setInterval(() => setTimeLeft(p => Math.max(0, p-1)), 1000);
      return () => clearInterval(t);
    }
  }, [step]);

  const mins = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const secs = String(timeLeft%60).padStart(2,"0");

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
        <p style={{ fontSize:18, fontWeight:700, color:"#0f172a", margin:"0 0 24px" }}>have chosen Coursiv</p>
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

  if (step === "summary") {
    return (
      <div style={{ width:"100%" }}>
        <h2 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 8px", textAlign:"center" }}>Your Personal Summary</h2>
        <p style={{ fontSize:14, color:"#64748B", margin:"0 0 24px", textAlign:"center" }}>The quiz indicates that what's held you back is time, not capability</p>
        <div style={{ background:"#F8FAFC", borderRadius:16, padding:20, marginBottom:20 }}>
          <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 8px", textAlign:"center" }}>A.I. Skills</p>
          <p style={{ fontSize:48, fontWeight:900, color:"#0f172a", margin:"0 0 12px", textAlign:"center" }}>Low</p>
          <div style={{ height:12, borderRadius:999, background:"linear-gradient(to right,#ef4444,#f59e0b,#22c55e)", position:"relative", marginBottom:8 }}>
            <div style={{ position:"absolute", left:"15%", top:-4, width:20, height:20, borderRadius:"50%", background:"#fff", border:"3px solid #374151", transform:"translateX(-50%)" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:11, color:"#64748B" }}>Low</span>
            <span style={{ fontSize:11, color:"#64748B" }}>Medium</span>
            <span style={{ fontSize:11, color:"#64748B" }}>High</span>
          </div>
        </div>
        {[
          { icon:"🎯", label:"Your focus", value:"Future-proofing your role" },
          { icon:"⭐", label:"Your readiness", value:"Ready to learn online" },
          { icon:"🕐", label:"Your pace", value:"20 min a day" },
          { icon:"📚", label:"Learning experience", value:"Self-taught so far" },
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

  if (step === "comparison") {
    const withoutItems = ["No time to get started", "No recognized credential", "A.I. feels hard to use", "Invisible to employers"];
    const withItems = ["Clear, step-by-step path", "Shareable A.I. credential", "Reliable results from A.I.", "Stand out from other workers"];
    return (
      <div style={{ width:"100%", textAlign:"center" }}>
        <h2 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>Your Personalized A.I. Certificate Program</h2>
        <p style={{ fontSize:14, color:"#64748B", margin:"0 0 4px" }}>We expect you to earn your A.I. Certificate</p>
        <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 24px", textDecoration:"underline" }}>
          by {new Date(Date.now() + 28*24*60*60*1000).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ borderRadius:16, border:"2px solid #FEE2E2", overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", background:"#FEF2F2", borderBottom:"1px solid #FEE2E2", textAlign:"center" }}>
              <p style={{ fontSize:13, color:"#64748B", margin:"0 0 2px" }}>You without</p>
              <p style={{ fontSize:14, fontWeight:800, color:"#991B1B", margin:0 }}>Coursiv</p>
            </div>
            <div style={{ padding:"16px" }}>
              {withoutItems.map((item, i) => (
                <div key={i} style={{ paddingBottom:12, marginBottom:12, borderBottom:i<withoutItems.length-1?"1px solid #FEE2E2":"none", textAlign:"left" }}>
                  <p style={{ fontSize:12, color:"#991B1B", margin:"0 0 2px", fontWeight:700 }}>Struggles:</p>
                  <p style={{ fontSize:13, color:"#374151", margin:0 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderRadius:16, border:"2px solid #BBF7D0", overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", background:"#F0FDF4", borderBottom:"1px solid #BBF7D0", textAlign:"center" }}>
              <p style={{ fontSize:13, color:"#64748B", margin:"0 0 2px" }}>You with</p>
              <p style={{ fontSize:14, fontWeight:800, color:"#166534", margin:0 }}>Coursiv:</p>
            </div>
            <div style={{ padding:"16px" }}>
              {withItems.map((item, i) => (
                <div key={i} style={{ paddingBottom:12, marginBottom:12, borderBottom:i<withItems.length-1?"1px solid #BBF7D0":"none", textAlign:"left" }}>
                  <p style={{ fontSize:12, color:"#166534", margin:"0 0 2px", fontWeight:700 }}>Solutions:</p>
                  <p style={{ fontSize:13, color:"#374151", margin:0 }}>{item}</p>
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
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:28 }}>🎓</div>
          <h1 style={{ fontSize:26, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2 }}>Your A.I. Program is Ready!</h1>
          <p style={{ fontSize:15, color:"#64748B", margin:0 }}>Create your free account to get started</p>
        </div>

        {/* Trust badges */}
        <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:28 }}>
          {["🔒 Secure","✅ Free to start","🚀 Instant access"].map((b,i) => (
            <span key={i} style={{ fontSize:12, fontWeight:600, color:"#64748B" }}>{b}</span>
          ))}
        </div>

        {/* Form */}
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #E2E8F0", padding:"28px 24px", boxShadow:"0 8px 32px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Full Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. John Smith"
                style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:"2px solid #E2E8F0", fontSize:15, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" }}
                onFocus={e=>e.target.style.borderColor="#5B4EFF"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Email Address</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="e.g. john@gmail.com" type="email"
                style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:"2px solid #E2E8F0", fontSize:15, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" }}
                onFocus={e=>e.target.style.borderColor="#5B4EFF"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
            </div>

          </div>
          <p style={{ fontSize:11, color:"#94A3B8", margin:"16px 0 0", textAlign:"center" }}>By continuing you agree to our Terms of Service and Privacy Policy</p>
        </div>

        {/* Social proof */}
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginTop:20 }}>
          <div style={{ display:"flex" }}>
            {["👩","👨","👩🏽","👨🏿","👩🏻"].map((e,i) => (
              <div key={i} style={{ width:28, height:28, borderRadius:"50%", background:"#E2E8F0", border:"2px solid #fff", marginLeft:i>0?-8:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{e}</div>
            ))}
          </div>
          <p style={{ fontSize:12, color:"#64748B", margin:0 }}>Join <strong>2,000,000+</strong> AI learners</p>
        </div>
      </div>
    );
  }

  if (step === "sales") {
    const plans = [
      { name:"1-Week Plan", price:"6.93", original:"13.86", weeks:1 },
      { name:"4-Week Plan", price:"19.99", original:"39.99", weeks:4, popular:true },
      { name:"12-Week Plan", price:"39.99", original:"79.99", weeks:12 },
    ];
    return (
      <div style={{ width:"100%", textAlign:"center", paddingBottom:40 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", background:"#FFF7ED", borderRadius:999, padding:"6px 16px", marginBottom:16, width:"fit-content", margin:"0 auto 16px" }}>
          <span style={{ fontSize:16 }}>🎁</span>
          <span style={{ fontSize:13, fontWeight:700, color:"#c2410c" }}>Special discount:</span>
          <span style={{ background:"#EF4444", color:"#fff", fontSize:12, fontWeight:800, padding:"2px 8px", borderRadius:999 }}>50%</span>
        </div>
        <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Your Personalized A.I. Certificate Program is Ready!</h1>
        <p style={{ fontSize:14, color:"#5B4EFF", fontWeight:700, margin:"0 0 24px" }}>Become the Master of A.I.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
          {plans.map((plan) => (
            <div key={plan.name} onClick={() => setSelectedPlan(plan.name)}
              style={{ padding:"20px 24px", borderRadius:16, border:`2px solid ${selectedPlan===plan.name?"#5B4EFF":"#E2E8F0"}`, background:selectedPlan===plan.name?"#EEF2FF":"#fff", cursor:"pointer", position:"relative", transition:"all 0.15s" }}>
              {plan.popular && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#5B4EFF", color:"#fff", fontSize:11, fontWeight:800, padding:"3px 14px", borderRadius:999, whiteSpace:"nowrap" }}>👍 MOST POPULAR</div>}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ textAlign:"left" }}>
                  <span style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>{plan.name}</span>
                  <span style={{ fontSize:11, background:"#EF4444", color:"#fff", fontWeight:700, padding:"2px 7px", borderRadius:999, marginLeft:8 }}>50% OFF</span>
                </div>
                <div>
                  <span style={{ fontSize:24, fontWeight:900, color:"#5B4EFF" }}>${plan.price}</span>
                  <span style={{ fontSize:14, color:"#94A3B8", textDecoration:"line-through", marginLeft:6 }}>${plan.original}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:13, color:"#64748B", margin:"0 0 20px" }}>People using plan for 3 months achieve twice as many results as for 1 month</p>
        <button onClick={handleGetPlan} disabled={signingUp} style={{ width:"100%", padding:"18px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer", boxShadow:"0 8px 24px rgba(91,78,255,0.4)", marginBottom:12 }}>
          {signingUp ? "Creating your account..." : "GET MY PLAN →"}
        </button>
        <div style={{ background:"#F0FDF4", border:"1.5px solid #BBF7D0", borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Check size={16} color="#22c55e"/>
            <span style={{ fontSize:13, fontWeight:600, color:"#166534" }}>Your promo code applied!</span>
          </div>
          <div style={{ background:"#fff", borderRadius:8, padding:"4px 12px", border:"1px solid #BBF7D0" }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#22c55e" }}>{mins}:{secs}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
