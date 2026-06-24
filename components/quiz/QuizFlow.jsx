"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, ArrowLeft } from "lucide-react";

export default function QuizFlow({ blocks }) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [path, setPath] = useState("all");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loadingPct, setLoadingPct] = useState(0);
  const loadingRef = useRef(null);

  // Filter blocks based on current path
  const visibleBlocks = blocks.filter(b => b.path === "all" || b.path === path);
  const current = visibleBlocks[currentIdx];

  const goNext = () => {
    if (currentIdx < visibleBlocks.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      // End of quiz — go to signup
      router.push(`/signup?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
    }
  };

  const goBack = () => {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  };

  const handleChoice = (blockId, value, isSplit, optionIndex) => {
    setAnswers(prev => ({ ...prev, [blockId]: value }));
    // If this is the path splitter question
    if (isSplit === "yes") {
      setPath(optionIndex === 0 ? "company" : "myself");
    }
  };

  // Auto-advance loading screen
  useEffect(() => {
    if (current?.type === "loading") {
      setLoadingPct(0);
      const duration = (current.content?.duration || 3) * 1000;
      const interval = 50;
      const steps = duration / interval;
      let step = 0;
      loadingRef.current = setInterval(() => {
        step++;
        setLoadingPct(Math.min(Math.round((step / steps) * 100), 100));
        if (step >= steps) {
          clearInterval(loadingRef.current);
          setTimeout(goNext, 400);
        }
      }, interval);
      return () => clearInterval(loadingRef.current);
    }
  }, [currentIdx]);

  if (!current) return null;

  const progress = ((currentIdx) / visibleBlocks.length) * 100;

  return (
    <div style={{ minHeight:"100vh", background:"#fff", display:"flex", flexDirection:"column" }}>

      {/* Top bar */}
      <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #F1F5F9", position:"sticky", top:0, background:"#fff", zIndex:50 }}>
        <span style={{ fontSize:22, fontWeight:900, color:"#5B4EFF", fontStyle:"italic" }}>✦ Coursiv</span>
        {current.type !== "loading" && current.type !== "sales" && (
          <div style={{ flex:1, maxWidth:300, margin:"0 20px", height:6, background:"#F1F5F9", borderRadius:999, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:999, background:"linear-gradient(to right,#5B4EFF,#8B5CF6)", width:`${progress}%`, transition:"width 0.4s ease" }}/>
          </div>
        )}
        {currentIdx > 0 && current.type !== "loading" && (
          <button onClick={goBack} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", color:"#64748B", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            <ArrowLeft size={14}/> Back
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 20px 100px", maxWidth:600, margin:"0 auto", width:"100%" }}>
        <BlockRenderer
          block={current}
          answers={answers}
          onChoice={handleChoice}
          onNext={goNext}
          email={email} setEmail={setEmail}
          name={name} setName={setName}
          loadingPct={loadingPct}
        />
      </div>

      {/* Bottom CTA for non-auto-advance blocks */}
      {!["loading","question_choice"].includes(current.type) && (
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

function BlockRenderer({ block, answers, onChoice, onNext, email, setEmail, name, setName, loadingPct }) {
  const c = block.content || {};

  switch(block.type) {

    case "question_choice": {
      const options = (c.options || []).filter(Boolean);
      const images = c.optionImages ? c.optionImages.split(",").map(s => s.trim()) : [];
      const selected = answers[block.id];
      return (
        <div style={{ width:"100%", textAlign:"center" }}>
          <h1 style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 32px", lineHeight:1.2 }}>{c.question || "Question"}</h1>
          <div style={{ display:"grid", gridTemplateColumns:images.length > 0 ? "1fr 1fr" : "1fr", gap:12 }}>
            {options.map((opt, i) => (
              <button key={i} onClick={() => { onChoice(block.id, opt, c.isSplit, i); setTimeout(onNext, 300); }}
                style={{
                  padding: images[i] ? "0" : "18px 24px",
                  borderRadius:16, border:`2px solid ${selected===opt?"#5B4EFF":"#E2E8F0"}`,
                  background: selected===opt?"#EEF2FF":"#fff",
                  cursor:"pointer", overflow:"hidden",
                  transition:"all 0.15s", textAlign:"left",
                  boxShadow: selected===opt?"0 4px 14px rgba(91,78,255,0.2)":"none",
                }}>
                {images[i] && (
                  <div style={{ height:160, overflow:"hidden", borderRadius:"14px 14px 0 0" }}>
                    <img src={images[i]} alt={opt} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  </div>
                )}
                <div style={{ padding: images[i] ? "14px 16px" : "0", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                  <span style={{ fontSize:16, fontWeight:700, color:selected===opt?"#5B4EFF":"#0f172a" }}>{opt}</span>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:selected===opt?"#5B4EFF":"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {selected===opt ? <Check size={14} color="#fff"/> : <ChevronRight size={14} color="#94A3B8"/>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    case "question_text":
      return (
        <div style={{ width:"100%", textAlign:"center" }}>
          <h1 style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 32px", lineHeight:1.2 }}>{c.question || "Question"}</h1>
          <input
            value={answers[block.id] || ""}
            onChange={e => onChoice(block.id, e.target.value, "no", 0)}
            placeholder={c.placeholder || "Type your answer..."}
            style={{ width:"100%", padding:"16px 20px", borderRadius:14, border:"2px solid #E2E8F0", fontSize:16, outline:"none", boxSizing:"border-box", textAlign:"center" }}
            onFocus={e => e.target.style.borderColor="#5B4EFF"}
            onBlur={e => e.target.style.borderColor="#E2E8F0"}
          />
        </div>
      );

    case "image_section":
      return (
        <div style={{ width:"100%", textAlign:"center" }}>
          <h1 style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2 }}>{c.heading}</h1>
          {c.subtext && <p style={{ fontSize:15, color:"#64748B", margin:"0 0 24px", lineHeight:1.6 }}>{c.subtext}</p>}
          {c.imageUrl && (
            <div style={{ borderRadius:20, overflow:"hidden", marginBottom:24 }}>
              <img src={c.imageUrl} alt="" style={{ width:"100%", display:"block" }}/>
            </div>
          )}
          {(c.bullets||[]).filter(Boolean).map((b, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"#F8FAFC", borderRadius:12, marginBottom:8, textAlign:"left" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"#5B4EFF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Check size={14} color="#fff"/>
              </div>
              <span style={{ fontSize:15, color:"#0f172a", fontWeight:500 }}>{b}</span>
            </div>
          ))}
        </div>
      );

    case "insight": {
      const items = (c.items||[]).filter(Boolean).map(item => {
        const parts = item.split("|");
        return { label: parts[0], value: parts[1] };
      });
      const ICONS = ["🎯","⭐","🕐","📚","💡","🔥"];
      return (
        <div style={{ width:"100%" }}>
          <h2 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 8px", textAlign:"center" }}>{c.title}</h2>
          {c.subtitle && <p style={{ fontSize:14, color:"#64748B", margin:"0 0 24px", textAlign:"center", lineHeight:1.6 }}>{c.subtitle}</p>}
          <div style={{ background:"#F8FAFC", borderRadius:16, padding:20, marginBottom:20 }}>
            <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 8px", textAlign:"center" }}>{c.statLabel || "AI Skills"}</p>
            <p style={{ fontSize:48, fontWeight:900, color:"#0f172a", margin:"0 0 12px", textAlign:"center" }}>Low</p>
            <div style={{ height:12, borderRadius:999, background:"linear-gradient(to right,#ef4444,#f59e0b,#22c55e)", position:"relative", marginBottom:8 }}>
              <div style={{ position:"absolute", left:"10%", top:-4, width:20, height:20, borderRadius:"50%", background:"#fff", border:"3px solid #374151", transform:"translateX(-50%)" }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:"#64748B" }}>Low</span>
              <span style={{ fontSize:11, color:"#64748B" }}>Medium</span>
              <span style={{ fontSize:11, color:"#64748B" }}>High</span>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"#fff", borderRadius:14, border:"1.5px solid #F1F5F9" }}>
                <div style={{ width:40, height:40, borderRadius:12, background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{ICONS[i]||"📌"}</div>
                <div>
                  <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 2px" }}>{item.label}</p>
                  <p style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:0 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "comparison": {
      const withoutItems = (c.without||[]).filter(Boolean);
      const withItems = (c.with||[]).filter(Boolean);
      return (
        <div style={{ width:"100%", textAlign:"center" }}>
          <h2 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>{c.title}</h2>
          {c.dateLabel && <p style={{ fontSize:14, color:"#64748B", margin:"0 0 24px" }}>We expect you to earn your AI Certificate <strong style={{ textDecoration:"underline" }}>{c.dateLabel}</strong></p>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
            <div style={{ borderRadius:16, border:"2px solid #FEE2E2", overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", background:"#FEF2F2", borderBottom:"1px solid #FEE2E2" }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#991B1B", margin:0 }}>You without Coursiv</p>
              </div>
              <div style={{ padding:"16px" }}>
                {withoutItems.map((item, i) => (
                  <div key={i} style={{ paddingBottom:12, marginBottom:12, borderBottom:i<withoutItems.length-1?"1px solid #FEE2E2":"none" }}>
                    <p style={{ fontSize:13, color:"#374151", margin:0, fontWeight:600 }}>Struggles:</p>
                    <p style={{ fontSize:13, color:"#374151", margin:0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderRadius:16, border:"2px solid #BBF7D0", overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", background:"#F0FDF4", borderBottom:"1px solid #BBF7D0" }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#166534", margin:0 }}>You with Coursiv</p>
              </div>
              <div style={{ padding:"16px" }}>
                {withItems.map((item, i) => (
                  <div key={i} style={{ paddingBottom:12, marginBottom:12, borderBottom:i<withItems.length-1?"1px solid #BBF7D0":"none" }}>
                    <p style={{ fontSize:13, color:"#374151", margin:0, fontWeight:600 }}>Solutions:</p>
                    <p style={{ fontSize:13, color:"#374151", margin:0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "review":
      return (
        <div style={{ width:"100%", textAlign:"center" }}>
          <div style={{ marginBottom:32 }}>
            <p style={{ fontSize:42, fontWeight:900, color:"#5B4EFF", margin:"0 0 4px" }}>{c.stat}</p>
            <p style={{ fontSize:18, fontWeight:700, color:"#0f172a", margin:0 }}>{c.statSub}</p>
          </div>
          <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"20px 24px", textAlign:"left", boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", gap:2, marginBottom:8 }}>
              {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:20, color:s<=4?"#22c55e":"#E2E8F0" }}>★</span>)}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <p style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:0 }}>{c.reviewTitle}</p>
              <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>{c.reviewer}</p>
            </div>
            <p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.6 }}>"{c.reviewText}"</p>
          </div>
          {c.source && <p style={{ fontSize:12, color:"#94A3B8", marginTop:12 }}>Featured reviews from {c.source}</p>}
        </div>
      );

    case "loading":
      return (
        <div style={{ width:"100%", textAlign:"center", paddingTop:40 }}>
          <div style={{ position:"relative", width:140, height:140, margin:"0 auto 24px" }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="#F1F5F9" strokeWidth="10"/>
              <circle cx="70" cy="70" r="60" fill="none" stroke="#5B4EFF" strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - loadingPct / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{ transition:"stroke-dashoffset 0.1s ease" }}
              />
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:28, fontWeight:900, color:"#0f172a" }}>{loadingPct}%</span>
            </div>
          </div>
          <p style={{ fontSize:15, color:"#64748B", margin:"0 0 32px", lineHeight:1.6 }}>{c.text}</p>
        </div>
      );

    case "signup":
      return (
        <div style={{ width:"100%", textAlign:"center" }}>
          <h1 style={{ fontSize:26, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2 }}>{c.heading}</h1>
          {c.subtext && <p style={{ fontSize:15, color:"#64748B", margin:"0 0 32px" }}>{c.subtext}</p>}
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
              style={{ width:"100%", padding:"16px 20px", borderRadius:14, border:"2px solid #E2E8F0", fontSize:16, outline:"none", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor="#5B4EFF"}
              onBlur={e => e.target.style.borderColor="#E2E8F0"}
            />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" type="email"
              style={{ width:"100%", padding:"16px 20px", borderRadius:14, border:"2px solid #E2E8F0", fontSize:16, outline:"none", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor="#5B4EFF"}
              onBlur={e => e.target.style.borderColor="#E2E8F0"}
            />
          </div>
        </div>
      );

    case "sales": {
      const plans = (c.plans||[]).filter(Boolean).map(p => {
        const parts = p.split("|");
        return { name: parts[0], price: parts[1], original: parts[2] };
      });
      const [selected, setSelected] = useState(plans[1]?.name || "");
      return (
        <div style={{ width:"100%", textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#FFF7ED", borderRadius:999, padding:"6px 14px", marginBottom:16 }}>
            <span style={{ fontSize:16 }}>🎁</span>
            <span style={{ fontSize:13, fontWeight:700, color:"#c2410c" }}>Special discount: </span>
            <span style={{ background:"#EF4444", color:"#fff", fontSize:12, fontWeight:800, padding:"2px 8px", borderRadius:999 }}>{c.discount||50}%</span>
          </div>
          <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 32px", lineHeight:1.2 }}>{c.heading}</h1>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
            {plans.map((plan, i) => (
              <div key={i} onClick={() => setSelected(plan.name)}
                style={{ padding:"20px 24px", borderRadius:16, border:`2px solid ${selected===plan.name?"#5B4EFF":"#E2E8F0"}`, background:selected===plan.name?"#EEF2FF":"#fff", cursor:"pointer", position:"relative", transition:"all 0.15s" }}>
                {i===1 && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#5B4EFF", color:"#fff", fontSize:11, fontWeight:800, padding:"3px 12px", borderRadius:999 }}>👍 MOST POPULAR</div>}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>{plan.name}</span>
                  <div style={{ textAlign:"right" }}>
                    <span style={{ fontSize:24, fontWeight:900, color:"#5B4EFF" }}>${plan.price}</span>
                    <span style={{ fontSize:14, color:"#94A3B8", textDecoration:"line-through", marginLeft:6 }}>${plan.original}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    default: return null;
  }
}
