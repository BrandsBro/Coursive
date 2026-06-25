"use client";
import useIsMobile from "@/hooks/useIsMobile";
export default function TrustedSection() {
  const isMobile = useIsMobile();
  const logos = ["Canva","Amazon","Apple","Bank of America","Anthropic"];
  return (
    <section style={{ padding: isMobile ? "24px 20px" : "24px 32px", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <p style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.3)", fontWeight:600, letterSpacing:1, marginBottom:16 }}>TRUSTED BY PROFESSIONALS AT</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap: isMobile ? 24 : 48, flexWrap:"wrap" }}>
          {logos.map((l,i) => (
            <span key={i} style={{ fontSize: isMobile ? 14 : 16, fontWeight:700, color:"rgba(255,255,255,0.25)" }}>{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
