"use client";
import { useEffect } from "react";

export default function QuizToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", zIndex:999, background:"#1e1b4b", border:"1.5px solid #5B4EFF", borderRadius:14, padding:"14px 20px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 32px rgba(91,78,255,0.3)", minWidth:280, maxWidth:400 }}>
      <span style={{ fontSize:20 }}>⚠️</span>
      <p style={{ fontSize:14, fontWeight:600, color:"#fff", margin:0 }}>{message}</p>
      <button onClick={onClose} style={{ marginLeft:"auto", background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:18, padding:0 }}>✕</button>
    </div>
  );
}
