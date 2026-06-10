"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const token = searchParams.get("token_hash") || searchParams.get("token");
    const type = searchParams.get("type") || "signup";
    if (!token) { setStatus("invalid"); return; }
    verify(token, type);
  }, []);

  const verify = async (token, type) => {
    const { error } = await supabase.auth.verifyOtp({ token_hash: token, type });
    if (error) { setStatus("error"); return; }
    setStatus("success");
    let count = 5;
    const t = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) { clearInterval(t); router.push("/"); }
    }, 1000);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:"linear-gradient(135deg,#0f172a,#1e1b4b)" }}>
      <div style={{ width:"100%", maxWidth:420, textAlign:"center" }}>

        {status === "loading" && (
          <div>
            <div style={{ width:72, height:72, borderRadius:20, background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <Loader size={32} color="#a78bfa" className="bspin"/>
            </div>
            <h2 style={{ color:"#fff", fontSize:22, fontWeight:800, margin:"0 0 8px" }}>Confirming your email...</h2>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, margin:0 }}>Just a moment</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#22c55e,#16a34a)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 12px 40px rgba(34,197,94,0.4)" }}>
              <CheckCircle size={40} color="#fff"/>
            </div>
            <h2 style={{ color:"#fff", fontSize:28, fontWeight:900, margin:"0 0 10px" }}>Email confirmed!</h2>
            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:15, margin:"0 0 28px", lineHeight:1.6 }}>
              Your account is ready. Welcome to Coursiv!
            </p>
            <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:16, padding:"16px 20px", marginBottom:20, border:"1px solid rgba(255,255,255,0.1)" }}>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:13, margin:"0 0 4px" }}>Redirecting in</p>
              <p style={{ color:"#a78bfa", fontSize:36, fontWeight:900, margin:0, lineHeight:1 }}>{countdown}s</p>
            </div>
            <button onClick={() => router.push("/")} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer" }}>
              Go now
            </button>
          </div>
        )}

        {(status === "error" || status === "invalid") && (
          <div>
            <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#ef4444,#dc2626)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 12px 40px rgba(239,68,68,0.4)" }}>
              <XCircle size={40} color="#fff"/>
            </div>
            <h2 style={{ color:"#fff", fontSize:28, fontWeight:900, margin:"0 0 10px" }}>Link expired</h2>
            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:15, margin:"0 0 28px", lineHeight:1.6 }}>
              This link has expired or already been used.
            </p>
            <button onClick={() => router.push("/login")} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer" }}>
              Back to login
            </button>
          </div>
        )}

        <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
