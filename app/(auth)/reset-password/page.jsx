"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  const handleReset = async () => {
    setError("");
    if (!password || !confirm) { setError("Please fill in all fields"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthColor = ["","#ef4444","#f59e0b","#22c55e","#5B4EFF"][strength];
  const strengthLabel = ["","Weak","Fair","Good","Strong"][strength];

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:420, borderRadius:28, overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", padding:"32px 28px", textAlign:"center" }}>
          <Link href="/" style={{ textDecoration:"none" }}>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#fff", margin:"0 0 16px", fontStyle:"italic" }}>✦ 1Course</h1>
          </Link>
          <div style={{ width:60, height:60, borderRadius:20, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:28 }}>🔐</div>
          <h2 style={{ fontSize:20, fontWeight:900, color:"#fff", margin:"0 0 6px" }}>Set New Password</h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.75)", margin:0 }}>Choose a strong password for your account</p>
        </div>
        <div style={{ background:"#fff", padding:"28px" }}>
          {success ? (
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:"0 0 8px" }}>Password Updated!</h2>
              <p style={{ fontSize:14, color:"#64748B", margin:"0 0 20px" }}>Redirecting to login in 3 seconds...</p>
              <Link href="/login"><button style={{ padding:"12px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Go to Login →</button></Link>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {error && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"12px 14px" }}><p style={{ fontSize:13, color:"#991B1B", margin:0 }}>⚠️ {error}</p></div>}
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>New Password</label>
                <div style={{ position:"relative" }}>
                  <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 8 characters"
                    style={{ width:"100%", padding:"13px 44px 13px 16px", borderRadius:12, border:"2px solid #E2E8F0", fontSize:14, outline:"none", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.borderColor="#5B4EFF"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
                  <button onClick={() => setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", border:"none", background:"none", cursor:"pointer", color:"#94A3B8" }}>
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {password.length > 0 && (
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                      {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:4, borderRadius:999, background:i<=strength?strengthColor:"#F1F5F9" }}/>)}
                    </div>
                    <p style={{ fontSize:11, color:strengthColor, fontWeight:600, margin:0 }}>{strengthLabel}</p>
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Confirm Password</label>
                <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter password"
                  style={{ width:"100%", padding:"13px 16px", borderRadius:12, border:`2px solid ${confirm && password !== confirm?"#ef4444":"#E2E8F0"}`, fontSize:14, outline:"none", boxSizing:"border-box" }}/>
                {confirm && password !== confirm && <p style={{ fontSize:11, color:"#ef4444", margin:"4px 0 0" }}>Passwords do not match</p>}
              </div>
              <button onClick={handleReset} disabled={loading||!token}
                style={{ padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", opacity:loading||!token?0.7:1, boxShadow:"0 4px 14px rgba(91,78,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {loading ? <><Loader size={15} style={{ animation:"spin 0.7s linear infinite" }}/> Updating...</> : "Set New Password →"}
              </button>
              <p style={{ fontSize:12, color:"#94A3B8", textAlign:"center", margin:0 }}>
                Remember your password? <Link href="/login" style={{ color:"#5B4EFF", fontWeight:600, textDecoration:"none" }}>Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}><Loader size={28} color="#5B4EFF"/></div>}>
      <ResetPasswordForm/>
    </Suspense>
  );
}
