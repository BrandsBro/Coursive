"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PERKS = [
  "Track progress across all AI courses",
  "Earn verified certificates",
  "Join daily challenges & streaks",
  "Access 500+ AI prompts library",
];

export default function AuthPage({ mode }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    if (!isLogin && !form.name) { setError("Please enter your name"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    if (isLogin) {
      const { error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (err) { setError(err.message); setLoading(false); return; }
      router.push("/"); router.refresh();
    } else {
      const { error: err } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.name } } });
      if (err) { setError(err.message); setLoading(false); return; }
      setSuccess("Account created! Check your email to confirm.");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/` } });
  };

  /* ── Form panel (shared between mobile + desktop) ── */
  const FormPanel = (
    <div style={{ width:"100%", maxWidth: isMobile ? "100%" : "unset" }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",boxShadow:"0 6px 18px rgba(124,58,237,0.45)" }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <h1 style={{ color:"#fff",fontSize:20,fontWeight:800,margin:"0 0 4px" }}>
          {isLogin ? "Sign in" : "Create your account"}
        </h1>
        <p style={{ color:"rgba(255,255,255,0.38)",fontSize:12,margin:0 }}>
          {isLogin ? "Enter your credentials to continue" : "Free forever · No credit card needed"}
        </p>
      </div>

      {/* Alerts */}
      {error && <div style={{ background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"9px 12px",marginBottom:12,color:"#fca5a5",fontSize:12 }}>{error}</div>}
      {success && <div style={{ background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:10,padding:"9px 12px",marginBottom:12,color:"#86efac",fontSize:12 }}>{success}</div>}

      {/* Fields */}
      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
        {!isLogin && <Field icon={<User size={14} color="#818cf8" />} placeholder="Full name" value={form.name} onChange={v => update("name",v)} onEnter={handleSubmit} />}
        <Field icon={<Mail size={14} color="#818cf8" />} placeholder="Email address" type="email" value={form.email} onChange={v => update("email",v)} onEnter={handleSubmit} />
        <Field
          icon={<Lock size={14} color="#818cf8" />}
          placeholder="Password"
          type={showPw ? "text" : "password"}
          value={form.password}
          onChange={v => update("password",v)}
          onEnter={handleSubmit}
          suffix={
            <button onClick={() => setShowPw(!showPw)} style={{ background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",opacity:0.55 }}>
              {showPw ? <EyeOff size={13} color="#fff" /> : <Eye size={13} color="#fff" />}
            </button>
          }
        />
      </div>

      {isLogin && (
        <div style={{ textAlign:"right",marginTop:6 }}>
          <span style={{ color:"#a78bfa",fontSize:12,cursor:"pointer",fontWeight:600 }}>Forgot password?</span>
        </div>
      )}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading} style={{ width:"100%",marginTop:16,padding:"13px",borderRadius:12,border:"none",background:loading?"rgba(99,102,241,0.4)":"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:loading?"none":"0 4px 16px rgba(124,58,237,0.4)",transition:"all 0.2s" }}>
        {loading
          ? <><Spinner />{isLogin?"Signing in...":"Creating account..."}</>
          : <>{isLogin?"Sign in":"Create account"}<ArrowRight size={14} /></>}
      </button>

      {/* Divider */}
      <div style={{ display:"flex",alignItems:"center",gap:8,margin:"14px 0" }}>
        <div style={{ flex:1,height:1,background:"rgba(255,255,255,0.08)" }} />
        <span style={{ color:"rgba(255,255,255,0.22)",fontSize:11 }}>or</span>
        <div style={{ flex:1,height:1,background:"rgba(255,255,255,0.08)" }} />
      </div>

      {/* Google */}
      <button onClick={handleGoogle} style={{ width:"100%",padding:"11px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.65)",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.09)"}
        onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
        <GoogleIcon />
        Continue with Google
      </button>

      <p style={{ textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:12,margin:"14px 0 0" }}>
        {isLogin ? "No account? " : "Have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} style={{ color:"#a78bfa",fontWeight:700,textDecoration:"none" }}>
          {isLogin ? "Sign up free" : "Sign in"}
        </Link>
      </p>
    </div>
  );

  /* ── MOBILE layout ── */
  if (isMobile) {
    return (
      <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px" }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration:"none",marginBottom:28 }}>
          <span style={{ fontSize:24,fontWeight:900,color:"#fff",fontStyle:"italic" }}>✦ Coursiv</span>
        </Link>
        {/* Form card */}
        <div style={{ width:"100%",maxWidth:400,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:22,padding:"28px 24px",backdropFilter:"blur(20px)" }}>
          {FormPanel}
        </div>
        <p style={{ color:"rgba(255,255,255,0.18)",fontSize:11,textAlign:"center",marginTop:16 }}>
          By continuing you agree to our Terms of Service
        </p>
      </div>
    );
  }

  /* ── DESKTOP layout ── */
  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"32px 24px" }}>
      <div style={{ width:"100%",maxWidth:880,display:"grid",gridTemplateColumns:"1fr 1fr",borderRadius:26,overflow:"hidden",boxShadow:"0 28px 70px rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.07)" }}>

        {/* Left panel */}
        <div style={{ background:"rgba(255,255,255,0.03)",padding:"48px 40px",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:"1px solid rgba(255,255,255,0.07)",position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:-80,right:-60,width:250,height:250,borderRadius:"50%",background:"rgba(139,92,246,0.12)",filter:"blur(40px)",pointerEvents:"none" }} />
          <div style={{ position:"absolute",bottom:-60,left:-40,width:180,height:180,borderRadius:"50%",background:"rgba(99,102,241,0.1)",filter:"blur(30px)",pointerEvents:"none" }} />

          <div style={{ position:"relative",zIndex:1 }}>
            <Link href="/" style={{ textDecoration:"none" }}>
              <span style={{ fontSize:22,fontWeight:900,color:"#fff",fontStyle:"italic",display:"block",marginBottom:36 }}>✦ Coursiv</span>
            </Link>
            <h2 style={{ color:"#fff",fontSize:30,fontWeight:900,margin:"0 0 10px",lineHeight:1.2 }}>
              {isLogin ? "Welcome back! 👋" : "Start your AI journey."}
            </h2>
            <p style={{ color:"rgba(255,255,255,0.45)",fontSize:14,margin:"0 0 28px",lineHeight:1.6 }}>
              {isLogin ? "Sign in to continue building your AI skills." : "Join thousands mastering the AI tools that matter."}
            </p>
            <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:32 }}>
              {PERKS.map((perk, i) => (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:18,height:18,borderRadius:"50%",background:"rgba(167,139,250,0.2)",border:"1px solid rgba(167,139,250,0.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <CheckCircle2 size={10} color="#a78bfa" />
                  </div>
                  <span style={{ color:"rgba(255,255,255,0.55)",fontSize:13 }}>{perk}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:6 }}>
              {[["🎨","Canva AI"],["🤖","ChatGPT"],["🖼️","Midjourney"]].map(([e,t]) => (
                <div key={t} style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"6px 10px",display:"flex",alignItems:"center",gap:5 }}>
                  <span style={{ fontSize:14 }}>{e}</span>
                  <span style={{ color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:600 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ background:"rgba(255,255,255,0.02)",padding:"48px 40px",display:"flex",alignItems:"center",justifyContent:"center" }}>
          {FormPanel}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, type="text", value, onChange, suffix, onEnter }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:"flex",alignItems:"center",gap:9,background:"rgba(20,16,60,0.85)",border:`1.5px solid ${focused?"rgba(99,102,241,0.6)":"rgba(255,255,255,0.1)"}`,borderRadius:11,padding:"11px 13px",transition:"all 0.15s",boxShadow:focused?"0 0 0 3px rgba(99,102,241,0.12)":"none" }}>
      <span style={{ flexShrink:0,opacity:0.75 }}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key==="Enter" && onEnter?.()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ flex:1,background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:13,caretColor:"#a78bfa",WebkitTextFillColor:"#fff" }}
      />
      {suffix}
    </div>
  );
}

function Spinner() {
  return <div style={{ width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.2)",borderTopColor:"#fff",animation:"spin 0.7s linear infinite" }} />;
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
