"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

const PERKS = [
  "Track progress across all AI courses",
  "Earn verified certificates",
  "Join daily challenges & streaks",
  "Access 500+ AI prompts library",
];

export default function AuthPage({ mode }) {
  const router = useRouter();
  const isLogin = mode === "login";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    if (!isLogin && !form.name) { setError("Please enter your name"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    // Placeholder — will wire to Supabase Auth
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    router.push("/");
  };

  return (
    /* Outer wrapper centers the inner container on the screen */
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      
      {/* Inner container keeps the left and right panels close together */ }
      <div style={{ display: "flex", width: "100%", maxWidth: 1100, alignItems: "center", gap: "40px" }}>
        
        {/* ── Left panel (desktop only) ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px", position: "relative" }}
          className="hidden lg:flex">
          
          {/* Decorative background blobs */}
          <div style={{ position: "absolute", top: -80, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(139,92,246,0.08)", zIndex: 0 }} />
          <div style={{ position: "absolute", bottom: -60, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(99,102,241,0.07)", zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 420 }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontStyle: "italic" }}>✦ Coursiv</span>
            </Link>

            <h2 style={{ color: "#fff", fontSize: 36, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.2 }}>
              {isLogin ? "Welcome back!" : "Start your AI journey today."}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, margin: "0 0 40px", lineHeight: 1.6 }}>
              {isLogin
                ? "Continue where you left off and keep building your AI skills."
                : "Join thousands of learners mastering the AI tools that matter most."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {PERKS.map((perk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CheckCircle2 size={12} color="#a78bfa" />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>{perk}</span>
                </div>
              ))}
            </div>

            {/* Floating course cards */}
            <div style={{ display: "flex", gap: 10, marginTop: 48 }}>
              {[["🎨", "Canva AI", "#8b5cf6"], ["🤖", "ChatGPT", "#10a37f"], ["🖼️", "Midjourney", "#6366f1"]].map(([e, t, c]) => (
                <div key={t} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{e}</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}
          className="lg:max-w-[480px]">

          {/* Mobile logo */}
          <Link href="/" style={{ textDecoration: "none", marginBottom: 36, display: "block" }} className="lg:hidden">
            <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontStyle: "italic" }}>✦ Coursiv</span>
          </Link>

          <div style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "36px 32px", backdropFilter: "blur(20px)" }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(124,58,237,0.4)" }}>
                <Sparkles size={24} color="#fff" />
              </div>
              <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>
                {isLogin ? "Sign in to Coursiv" : "Create your account"}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0 }}>
                {isLogin ? "Enter your credentials to continue" : "Free forever. No credit card needed."}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 16, color: "#fca5a5", fontSize: 13 }}>
                {error}
              </div>
            )}

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {!isLogin && (
                <Field icon={<User size={15} color="#6366f1" />} placeholder="Full name" value={form.name} onChange={v => update("name", v)} />
              )}
              <Field icon={<Mail size={15} color="#6366f1" />} placeholder="Email address" type="email" value={form.email} onChange={v => update("email", v)} />
              <Field
                icon={<Lock size={15} color="#6366f1" />}
                placeholder="Password"
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={v => update("password", v)}
                suffix={
                  <button onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                    {showPw ? <EyeOff size={15} color="#94A3B8" /> : <Eye size={15} color="#94A3B8" />}
                  </button>
                }
              />
            </div>

            {isLogin && (
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <span style={{ color: "#a78bfa", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%", marginTop: 20, padding: "14px", borderRadius: 14, border: "none",
                background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: loading ? "none" : "0 6px 20px rgba(124,58,237,0.4)",
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign in" : "Create account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Google button */}
            <button style={{
              width: "100%", padding: "12px", borderRadius: 14,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Toggle */}
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 20, margin: "20px 0 0" }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Link href={isLogin ? "/signup" : "/login"} style={{ color: "#a78bfa", fontWeight: 700, textDecoration: "none" }}>
                {isLogin ? "Sign up free" : "Sign in"}
              </Link>
            </p>
          </div>

          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, textAlign: "center", marginTop: 20 }}>
            By continuing you agree to our Terms of Service & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, type = "text", value, onChange, suffix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.06)", border: `1.5px solid ${focused ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "12px 14px", transition: "all 0.15s", boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.15)" : "none" }}>
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, caretColor: "#a78bfa" }}
      />
      {suffix && <span style={{ flexShrink: 0 }}>{suffix}</span>}
    </div>
  );
}