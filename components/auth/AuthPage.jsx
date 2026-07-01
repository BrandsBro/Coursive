"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const isLogin = mode === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (nameParam) setName(decodeURIComponent(nameParam));
  }, [searchParams]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    if (!isLogin && !name) { setError("Please enter your name"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    if (isLogin) {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (err) {
        const msg = err.message.toLowerCase();
        if (msg.includes("not confirmed")) setError("Email not confirmed yet. Please check your inbox.");
        else if (msg.includes("invalid") || msg.includes("credentials")) setError("Wrong email or password.");
        else setError(err.message);
        return;
      }
      router.push("/home");
      router.refresh();
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      setLoading(false);
      if (err) { setError(err.message); return; }
      setSuccess("Account created! Check your email to confirm.");
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo: window.location.origin + "/home" } });
  };

  const handleForgot = async () => {
    if (!forgotEmail) { setForgotError("Please enter your email"); return; }
    setForgotLoading(true); setForgotError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (data.error) setForgotError(data.error);
      else setForgotSent(true);
    } catch(e) { setForgotError("Something went wrong"); }
    setForgotLoading(false);
  };

  const formContent = (
    <div style={{ width:"100%" }}>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", boxShadow:"0 6px 18px rgba(124,58,237,0.45)" }}>
          <Sparkles size={20} color="#fff"/>
        </div>
        <h1 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:"0 0 4px" }}>
          {isLogin ? "Sign in" : "Create your account"}
        </h1>
        <p style={{ color:"rgba(255,255,255,0.38)", fontSize:12, margin:0 }}>
          {isLogin ? "Enter your credentials to continue" : "Free forever · No credit card needed"}
        </p>
      </div>

      {error && <div style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.35)", borderRadius:10, padding:"10px 14px", marginBottom:14, color:"#fca5a5", fontSize:13 }}>{error}</div>}
      {success && <div style={{ background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.35)", borderRadius:10, padding:"10px 14px", marginBottom:14, color:"#86efac", fontSize:13 }}>{success}</div>}

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {!isLogin && <InputField icon={<User size={14} color="#818cf8"/>} placeholder="Full name" value={name} onChange={setName} onEnter={handleSubmit}/>}
        <InputField icon={<Mail size={14} color="#818cf8"/>} placeholder="Email address" type="email" value={email} onChange={setEmail} onEnter={handleSubmit}/>
        <InputField icon={<Lock size={14} color="#818cf8"/>} placeholder="Password" type={showPw?"text":"password"} value={password} onChange={setPassword} onEnter={handleSubmit}
          suffix={<button onClick={() => setShowPw(!showPw)} style={{ background:"none", border:"none", cursor:"pointer", padding:2, display:"flex", opacity:0.55 }}>{showPw ? <EyeOff size={13} color="#fff"/> : <Eye size={13} color="#fff"/>}</button>}/>
      </div>

      {isLogin && (
        <div style={{ textAlign:"right", marginTop:6 }}>
          <span onClick={() => { setShowForgot(true); setForgotEmail(email); }} style={{ color:"#a78bfa", fontSize:12, cursor:"pointer", fontWeight:600 }}>Forgot password?</span>
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading}
        style={{ width:"100%", marginTop:16, padding:"13px", borderRadius:12, border:"none", background:loading?"rgba(99,102,241,0.5)":"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:loading?"none":"0 4px 16px rgba(124,58,237,0.4)" }}>
        {loading ? <><div style={{ width:15, height:15, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin 0.7s linear infinite" }}/>{isLogin?"Signing in...":"Creating account..."}</> : <>{isLogin?"Sign in":"Create account"}<ArrowRight size={14}/></>}
      </button>

      <div style={{ display:"flex", alignItems:"center", gap:8, margin:"14px 0" }}>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
        <span style={{ color:"rgba(255,255,255,0.22)", fontSize:11 }}>or</span>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
      </div>

      <button onClick={handleGoogle} style={{ width:"100%", padding:"11px", borderRadius:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.65)", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        <svg width="15" height="15" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <p style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:12, margin:"14px 0 0" }}>
        {isLogin ? "No account? " : "Have an account? "}
        <Link href={isLogin ? "/quiz" : "/login"} style={{ color:"#a78bfa", fontWeight:700, textDecoration:"none" }}>
          {isLogin ? "Start for free →" : "Sign in"}
        </Link>
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 20px" }}>
          <Link href="/" style={{ textDecoration:"none", marginBottom:28 }}>
            <span style={{ fontSize:24, fontWeight:900, color:"#fff", fontStyle:"italic" }}>✦ 1Course</span>
          </Link>
          <div style={{ width:"100%", maxWidth:400, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:22, padding:"28px 24px" }}>
            {formContent}
          </div>
        </div>
      ) : (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
          <div style={{ width:"100%", maxWidth:880, display:"grid", gridTemplateColumns:"1fr 1fr", borderRadius:26, overflow:"hidden", boxShadow:"0 28px 70px rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ background:"rgba(255,255,255,0.03)", padding:"48px 40px", display:"flex", flexDirection:"column", justifyContent:"center", borderRight:"1px solid rgba(255,255,255,0.07)", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-80, right:-60, width:250, height:250, borderRadius:"50%", background:"rgba(139,92,246,0.12)", filter:"blur(40px)", pointerEvents:"none" }}/>
              <div style={{ position:"relative", zIndex:1 }}>
                <Link href="/" style={{ textDecoration:"none" }}>
                  <span style={{ fontSize:22, fontWeight:900, color:"#fff", fontStyle:"italic", display:"block", marginBottom:36 }}>✦ 1Course</span>
                </Link>
                <h2 style={{ color:"#fff", fontSize:30, fontWeight:900, margin:"0 0 10px", lineHeight:1.2 }}>
                  {isLogin ? "Welcome back!" : "Start your AI journey."}
                </h2>
                <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14, margin:"0 0 28px", lineHeight:1.6 }}>
                  {isLogin ? "Sign in to continue building your AI skills." : "Join thousands mastering AI tools that matter."}
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
                  {PERKS.map((perk,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:"rgba(167,139,250,0.2)", border:"1px solid rgba(167,139,250,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <CheckCircle2 size={10} color="#a78bfa"/>
                      </div>
                      <span style={{ color:"rgba(255,255,255,0.55)", fontSize:13 }}>{perk}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {[["🎨","Canva AI"],["🤖","ChatGPT"],["🖼️","Midjourney"]].map(([e,t]) => (
                    <div key={t} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"6px 10px", display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ fontSize:14 }}>{e}</span>
                      <span style={{ color:"rgba(255,255,255,0.6)", fontSize:11, fontWeight:600 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.02)", padding:"48px 40px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {formContent}
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgot && (
        <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(10,8,30,0.85)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#fff", borderRadius:28, width:"100%", maxWidth:400, boxShadow:"0 40px 100px rgba(0,0,0,0.4)", overflow:"hidden" }}>
            {!forgotSent ? (
              <>
                {/* Header */}
                <div style={{ background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", padding:"32px 28px", textAlign:"center", position:"relative" }}>
                  <button onClick={() => { setShowForgot(false); setForgotEmail(""); setForgotError(""); }}
                    style={{ position:"absolute", top:14, right:14, width:30, height:30, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.15)", color:"#fff", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                  <div style={{ width:60, height:60, borderRadius:20, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:28 }}>🔑</div>
                  <h2 style={{ fontSize:22, fontWeight:900, color:"#fff", margin:"0 0 6px" }}>Forgot Password?</h2>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.75)", margin:0 }}>We will send a temporary password to your email</p>
                </div>
                {/* Body */}
                <div style={{ padding:"24px 28px" }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Email Address</label>
                  <input value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} placeholder="your@email.com" type="email"
                    style={{ width:"100%", padding:"13px 16px", borderRadius:12, border:"2px solid #E2E8F0", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:8, transition:"border-color 0.2s" }}
                    onFocus={e=>e.target.style.borderColor="#5B4EFF"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
                  {forgotError && (
                    <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
                      <p style={{ fontSize:13, color:"#991B1B", margin:0 }}>⚠️ {forgotError}</p>
                    </div>
                  )}
                  <button onClick={handleForgot} disabled={forgotLoading}
                    style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:forgotLoading?"not-allowed":"pointer", marginBottom:10, opacity:forgotLoading?0.7:1, boxShadow:"0 4px 14px rgba(91,78,255,0.4)" }}>
                    {forgotLoading ? "⏳ Sending..." : "Send Reset Link →"}
                  </button>
                  <button onClick={() => { setShowForgot(false); setForgotEmail(""); setForgotError(""); }}
                    style={{ width:"100%", padding:"12px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#F8FAFC", fontSize:13, fontWeight:600, cursor:"pointer", color:"#64748B" }}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", padding:"32px 28px", textAlign:"center" }}>
                  <div style={{ width:60, height:60, borderRadius:20, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:28 }}>📧</div>
                  <h2 style={{ fontSize:22, fontWeight:900, color:"#fff", margin:"0 0 6px" }}>Email Sent!</h2>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.8)", margin:0 }}>Check your inbox and spam folder</p>
                </div>
                <div style={{ padding:"24px 28px" }}>
                  <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
                    <p style={{ fontSize:13, color:"#166534", margin:0, lineHeight:1.6 }}>
                      We sent a secure reset link to <strong>{forgotEmail}</strong>. Click the link in your email to set a new password. The link expires in 1 hour.
                    </p>
                  </div>
                  <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
                    style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(91,78,255,0.4)" }}>
                    Back to Login →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function InputField({ icon, placeholder, type="text", value, onChange, suffix, onEnter }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:9, background:"rgba(20,16,60,0.85)", border:`1.5px solid ${focused?"rgba(99,102,241,0.6)":"rgba(255,255,255,0.1)"}`, borderRadius:11, padding:"11px 13px", transition:"all 0.15s", boxShadow:focused?"0 0 0 3px rgba(99,102,241,0.12)":"none" }}>
      <span style={{ flexShrink:0, opacity:0.75 }}>{icon}</span>
      <input type={type} placeholder={placeholder} value={value} autoComplete="off"
        onChange={e=>onChange(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Enter") onEnter(); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:13, caretColor:"#a78bfa", WebkitTextFillColor:"#fff" }}
      />
      {suffix}
    </div>
  );
}
