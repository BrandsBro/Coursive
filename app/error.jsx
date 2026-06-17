"use client";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F8FAFC", padding:20 }}>
      <div style={{ textAlign:"center", maxWidth:420 }}>
        <div style={{ fontSize:72, marginBottom:8 }}>⚠️</div>
        <h1 style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>Something went wrong</h1>
        <p style={{ fontSize:14, color:"#64748B", margin:"0 0 28px", lineHeight:1.6 }}>
          An unexpected error occurred. You can try again or head back home.
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={() => reset()} style={{ padding:"12px 24px", borderRadius:14, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:14, fontWeight:700, cursor:"pointer" }}>
            Try again
          </button>
          <a href="/" style={{ padding:"12px 24px", borderRadius:14, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, textDecoration:"none" }}>
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
