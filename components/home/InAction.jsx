"use client";
import useIsMobile from "@/hooks/useIsMobile";
export default function InAction() {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", textAlign:"center" }}>
        <p style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:8 }}>COURSIV IN ACTION</p>
        <h2 style={{ fontSize: isMobile ? 28 : 36, fontWeight:900, color:"#fff", margin:"0 0 8px" }}>Coursiv <span style={{ color:"#5B4EFF" }}>in action</span></h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.4)", margin:"0 0 40px" }}>Real skills, real numbers. Real career growth.</p>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap:16 }}>
          {[
            { value:"1,027k+", label:"Members with AI certificates" },
            { value:"10,466k+", label:"Minutes of hands-on AI practice" },
            { value:"100k+", label:"Prompts built on real-world projects" },
          ].map((s,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"28px 24px" }}>
              <p style={{ fontSize: isMobile ? 28 : 36, fontWeight:900, color:"#5B4EFF", margin:"0 0 8px" }}>{s.value}</p>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", margin:0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
