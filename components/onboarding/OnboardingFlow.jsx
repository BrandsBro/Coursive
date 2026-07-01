"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, Sparkles, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const STEPS = ["welcome", "goal", "level", "interests", "done"];

const GOALS = [
  { id:"career",    emoji:"💼", label:"Advance my career",  desc:"Learn skills employers want" },
  { id:"freelance", emoji:"🚀", label:"Start freelancing",   desc:"Build a client-ready skillset" },
  { id:"business",  emoji:"🏢", label:"Grow my business",    desc:"Use AI to scale faster" },
  { id:"curious",   emoji:"🧠", label:"Stay up to date",     desc:"Explore what AI can do" },
];

const LEVELS = [
  { id:"beginner",     emoji:"🌱", label:"Beginner",     desc:"New to AI tools" },
  { id:"intermediate", emoji:"⚡", label:"Intermediate", desc:"Used a few AI tools" },
  { id:"advanced",     emoji:"🔥", label:"Advanced",     desc:"Using AI daily" },
];

const INTERESTS = [
  { id:"design",       emoji:"🎨", label:"Design" },
  { id:"writing",      emoji:"✍️", label:"Writing" },
  { id:"coding",       emoji:"💻", label:"Coding" },
  { id:"marketing",    emoji:"📣", label:"Marketing" },
  { id:"productivity", emoji:"⚡", label:"Productivity" },
  { id:"video",        emoji:"🎬", label:"Video" },
  { id:"business",     emoji:"📊", label:"Business" },
  { id:"nocode",       emoji:"🔧", label:"No-Code" },
];

export default function OnboardingFlow({ onComplete }) {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(null);
  const [level, setLevel] = useState(null);
  const [interests, setInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.full_name || "");

  const current = STEPS[step];
  const progress = (step / (STEPS.length - 1)) * 100;

  const toggleInterest = (id) =>
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));

  const finish = async () => {
    setSaving(true);
    try {
      await supabase.from("profiles").update({
        full_name: name || user?.user_metadata?.full_name,
        goal, skill_level: level, interests, onboarding_done: true,
      }).eq("id", user.id);
      await supabase.auth.updateUser({ data: { full_name: name } });
      await supabase.from("notifications").insert({
        user_id: user.id, type:"welcome",
        title:"You're all set! 🎉",
        message:"Your personalised learning path is ready.",
        emoji:"✦", action_url:"/courses",
      });
      onComplete?.();
      router.push("/courses");
    } catch(e) { alert(e.message); }
    setSaving(false);
  };

  const bg = { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f2744 100%)", position:"fixed", inset:0, zIndex:500 };

  return (
    <div style={bg}>
      <div style={{ width:"100%", maxWidth:520, position:"relative", zIndex:1 }}>

        {current !== "welcome" && current !== "done" && (
          <div style={{ height:3, background:"rgba(255,255,255,0.1)", borderRadius:999, marginBottom:28, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:999, background:"linear-gradient(to right,#7c3aed,#06b6d4)", width:progress+"%", transition:"width 0.5s ease" }}/>
          </div>
        )}

        {current === "welcome" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:80, height:80, borderRadius:24, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:40, boxShadow:"0 12px 40px rgba(124,58,237,0.5)" }}>✦</div>
            <h1 style={{ fontSize:34, fontWeight:900, color:"#fff", margin:"0 0 12px", lineHeight:1.15 }}>
              Welcome to{" "}
              <span style={{ background:"linear-gradient(135deg,#a78bfa,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>1Course</span>
            </h1>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.55)", margin:"0 0 28px", lineHeight:1.6 }}>
              The fastest way to master AI tools.<br/>Let's personalise your path.
            </p>
            <div style={{ marginBottom:24 }}>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="What should we call you?" style={{ width:"100%", padding:"14px 18px", borderRadius:14, border:"1.5px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.08)", color:"#fff", fontSize:16, outline:"none", boxSizing:"border-box", textAlign:"center" }}/>
            </div>
            <button onClick={next} style={bigBtn(false)}>Let's get started <ArrowRight size={18}/></button>
            <p style={{ color:"rgba(255,255,255,0.25)", fontSize:12, marginTop:14 }}>Takes about 60 seconds</p>
          </div>
        )}

        {current === "goal" && (
          <div>
            <StepHeader emoji="🎯" title="What's your main goal?" subtitle="We'll personalise your learning path" step="1 of 3"/>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
              {GOALS.map(g => <OptionCard key={g.id} {...g} selected={goal===g.id} onClick={()=>setGoal(g.id)}/>)}
            </div>
            <button onClick={next} disabled={!goal} style={bigBtn(!goal)}>Continue <ArrowRight size={18}/></button>
          </div>
        )}

        {current === "level" && (
          <div>
            <StepHeader emoji="⚡" title="Your AI experience?" subtitle="So we show you the right content" step="2 of 3"/>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
              {LEVELS.map(l => <OptionCard key={l.id} {...l} selected={level===l.id} onClick={()=>setLevel(l.id)}/>)}
            </div>
            <button onClick={next} disabled={!level} style={bigBtn(!level)}>Continue <ArrowRight size={18}/></button>
          </div>
        )}

        {current === "interests" && (
          <div>
            <StepHeader emoji="🌟" title="What interests you?" subtitle="Pick as many as you like" step="3 of 3"/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:24 }}>
              {INTERESTS.map(i => {
                const sel = interests.includes(i.id);
                return (
                  <button key={i.id} onClick={()=>toggleInterest(i.id)} style={{ padding:"14px 8px", borderRadius:14, border:`1.5px solid ${sel?"#7c3aed":"rgba(255,255,255,0.1)"}`, background:sel?"rgba(124,58,237,0.25)":"rgba(255,255,255,0.05)", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    {sel && <div style={{ position:"absolute", top:6, right:6, width:16, height:16, borderRadius:"50%", background:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center" }}><Check size={10} color="#fff"/></div>}
                    <span style={{ fontSize:22 }}>{i.emoji}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:sel?"#c4b5fd":"rgba(255,255,255,0.6)" }}>{i.label}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={next} disabled={interests.length===0} style={bigBtn(interests.length===0)}>Continue <ArrowRight size={18}/></button>
          </div>
        )}

        {current === "done" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:88, height:88, borderRadius:"50%", background:"linear-gradient(135deg,#22c55e,#16a34a)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 12px 40px rgba(34,197,94,0.5)" }}>
              <Check size={44} color="#fff" strokeWidth={3}/>
            </div>
            <h2 style={{ fontSize:28, fontWeight:900, color:"#fff", margin:"0 0 10px" }}>You're all set!</h2>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.55)", margin:"0 0 28px", lineHeight:1.6 }}>Your personalised path is ready. Time to start learning.</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:28 }}>
              {goal && <Pill label={GOALS.find(g=>g.id===goal)?.label} emoji={GOALS.find(g=>g.id===goal)?.emoji}/>}
              {level && <Pill label={LEVELS.find(l=>l.id===level)?.label} emoji={LEVELS.find(l=>l.id===level)?.emoji}/>}
              {interests.map(id => { const i=INTERESTS.find(x=>x.id===id); return i?<Pill key={id} label={i.label} emoji={i.emoji}/>:null; })}
            </div>
            <button onClick={finish} disabled={saving} style={bigBtn(false,"#22c55e")}>
              {saving?<><Loader size={16} className="bspin"/> Setting up...</>:<><Sparkles size={16}/> Start learning</>}
            </button>
          </div>
        )}
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function StepHeader({ emoji, title, subtitle, step }) {
  return (
    <div style={{ textAlign:"center", marginBottom:24 }}>
      <span style={{ fontSize:40 }}>{emoji}</span>
      <h2 style={{ fontSize:24, fontWeight:900, color:"#fff", margin:"10px 0 6px" }}>{title}</h2>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", margin:"0 0 4px" }}>{subtitle}</p>
      <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.25)", letterSpacing:1 }}>{step}</span>
    </div>
  );
}

function OptionCard({ emoji, label, desc, selected, onClick }) {
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 18px", borderRadius:16, border:`1.5px solid ${selected?"#7c3aed":"rgba(255,255,255,0.1)"}`, background:selected?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.04)", cursor:"pointer", textAlign:"left", transition:"all 0.15s", position:"relative" }}>
      {selected && <div style={{ position:"absolute", top:12, right:14, width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center" }}><Check size={13} color="#fff"/></div>}
      <span style={{ fontSize:26, flexShrink:0 }}>{emoji}</span>
      <div>
        <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 2px" }}>{label}</p>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", margin:0 }}>{desc}</p>
      </div>
    </button>
  );
}

function Pill({ emoji, label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:999, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)" }}>
      <span style={{ fontSize:13 }}>{emoji}</span>
      <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.8)" }}>{label}</span>
    </div>
  );
}

const bigBtn = (disabled, accent="#7c3aed") => ({
  width:"100%", padding:"14px", borderRadius:14, border:"none",
  background: disabled ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg,${accent},${accent==="22c55e"?"#16a34a":accent==="7c3aed"?"#4f46e5":accent})`,
  color: disabled?"rgba(255,255,255,0.3)":"#fff",
  fontSize:15, fontWeight:700, cursor:disabled?"not-allowed":"pointer",
  display:"flex", alignItems:"center", justifyContent:"center", gap:10,
  boxShadow: disabled?"none":`0 8px 24px ${accent}55`,
});
