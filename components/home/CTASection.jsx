"use client";
import Link from "next/link";
import useIsMobile from "@/hooks/useIsMobile";
export default function CTASection() {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ background:"linear-gradient(135deg,rgba(91,78,255,0.2),rgba(139,92,246,0.1))", border:"1px solid rgba(91,78,255,0.3)", borderRadius:28, padding: isMobile ? "36px 24px" : "56px 48px", display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap:32, alignItems:"center", textAlign: isMobile ? "center" : "left" }}>
          <div>
            <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight:900, color:"#fff", margin:"0 0 12px", lineHeight:1.2 }}>Ready to lead the <span style={{ color:"#5B4EFF" }}>AI revolution?</span></h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", margin:0, lineHeight:1.7 }}>Get unlimited access to all courses, practical toolkits, and weekly updates. Join Coursiv and start building your AI-powered future now.</p>
          </div>
          <Link href="/quiz" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, padding:"16px 32px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:15, fontWeight:700, textDecoration:"none", whiteSpace:"nowrap", boxShadow:"0 8px 24px rgba(91,78,255,0.45)" }}>
            Get started now →
          </Link>
        </div>
      </div>
    </section>
  );
}
