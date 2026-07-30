"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) { setError("Please enter your email"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setSent(true); }
    } catch(e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a081e,#1e1b4b)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, padding:"40px 32px" }}>
          <h1 style={{ fontSize:28, fontWeight:900, color:"#fff", margin:"0 0 8px", textAlign:"center" }}>Forgot Password</h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", textAlign:"center", margin:"0 0 28px" }}>Enter your email and we'll send you a reset link</p>

          {sent ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
              <p style={{ color:"#22c55e", fontWeight:700, fontSize:16, marginBottom:8 }}>Check your inbox!</p>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:14 }}>We sent a password reset link to <strong style={{ color:"#fff" }}>{email}</strong></p>
              <Link href="/login" style={{ display:"block", marginTop:24, color:"#5B4EFF", fontSize:14, textDecoration:"none" }}>← Back to login</Link>
            </div>
          ) : (
            <>
              {error && <p style={{ color:"#ef4444", fontSize:13, marginBottom:12, textAlign:"center" }}>{error}</p>}
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
                style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:"1.5px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:16 }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              <button onClick={handleSubmit} disabled={loading}
                style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", opacity:loading?0.7:1 }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <Link href="/login" style={{ display:"block", marginTop:16, color:"rgba(255,255,255,0.4)", fontSize:13, textDecoration:"none", textAlign:"center" }}>← Back to login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
