"use client";
import useIsMobile from "@/hooks/useIsMobile";
export default function StatsSection() {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <p style={{ fontSize: isMobile ? 20 : 28, fontWeight:900, color:"#514DEF", margin:"0 0 8px", lineHeight:1.3 }}>55K jobs lost to AI in 2025. <span style={{ color:"#fff" }}><br></br>12x more than two years ago</span></p>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", margin:0 }}>AI won't replace you. Someone using AI will. Be that person.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:16 }}>
          {[
            { value:"100K+", label:"AI-driven layoffs in 2025" },
            { value:"45K+", label:"Tech jobs cut in early 2026" },
            { value:"56%", label:"Wage premium for AI-skilled workers" },
            { value:"7.5%", label:"Growth in AI job postings" },
          ].map((s,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"20px 16px", textAlign:"center" }}>
              <p style={{ fontSize: isMobile ? 26 : 32, fontWeight:900, color:"white", margin:"0 0 8px" }}>{s.value}</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:0, lineHeight:1.5 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
