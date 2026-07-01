"use client";
import Link from "next/link";
import useIsMobile from "@/hooks/useIsMobile";

export default function HeroSection() {
  const isMobile = useIsMobile();
  return (
    <section id="hero" style={{ paddingTop:60, display:"flex", alignItems:"center", padding: isMobile ? "80px 20px 40px" : "80px 32px 60px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width: isMobile ? 300 : 600, height: isMobile ? 300 : 600, borderRadius:"50%", background:"radial-gradient(circle,rgba(91,78,255,0.18) 0%,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ maxWidth:1100, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 60, alignItems:"center" }}>
        <div style={{ textAlign: isMobile ? "center" : "left" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(91,78,255,0.15)", border:"1px solid rgba(91,78,255,0.3)", borderRadius:999, padding:"5px 14px", marginBottom:20 }}>
            <span style={{ fontSize:12, color:"#a78bfa", fontWeight:600 }}>🔥 GALAX · DALL-E</span>
          </div>
          <h1 style={{ fontSize: isMobile ? 36 : 52, fontWeight:900, color:"#fff", margin:"0 0 16px", lineHeight:1.1 }}>
            Upgrade your life<br/>with practical <span style={{ color:"#5B4EFF" }}>AI skills</span>
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 16, color:"rgba(255,255,255,0.55)", margin:"0 0 32px", lineHeight:1.7 }}>
            Learn the tools. Build the skills.<br/>Get the certificate — in 28 days.
          </p>
          <Link href="/quiz" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:15, fontWeight:700, textDecoration:"none", boxShadow:"0 8px 24px rgba(91,78,255,0.45)" }}>
            Start now →
          </Link>
          <div style={{ marginTop:32, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { icon:"🏆", title:"Get your AI certificate", desc:"Earn your personal learning goal and get a custom learning plan" },
              { icon:"📅", title:"Join the 28-Day Challenge", desc:"Join 1Course in 28 days on your path to AI mastery" },
            ].map((c,i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"14px 16px", textAlign:"left" }}>
                <span style={{ fontSize:22 }}>{c.icon}</span>
                <p style={{ fontSize:13, fontWeight:700, color:"#fff", margin:"8px 0 4px" }}>{c.title}</p>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0, lineHeight:1.5 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {!isMobile && (
          <div style={{ position:"relative", height:420, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ position:"absolute", top:"10%", right:"10%", width:110, height:110, borderRadius:24, background:"linear-gradient(135deg,#1e1b4b,#312e81)", border:"1px solid rgba(91,78,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:48 }}>🤖</div>
            <div style={{ position:"absolute", top:"5%", left:"15%", width:90, height:90, borderRadius:20, background:"linear-gradient(135deg,#0c4a6e,#0284c7)", border:"1px solid rgba(2,132,199,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:38 }}>✨</div>
            <div style={{ position:"absolute", bottom:"15%", right:"5%", width:100, height:100, borderRadius:22, background:"linear-gradient(135deg,#14532d,#16a34a)", border:"1px solid rgba(22,163,74,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:42 }}>🎨</div>
            <div style={{ position:"absolute", bottom:"10%", left:"10%", width:95, height:95, borderRadius:22, background:"linear-gradient(135deg,#4c1d95,#7c3aed)", border:"1px solid rgba(124,58,237,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>🖼️</div>
            <div style={{ width:140, height:140, borderRadius:32, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:64, boxShadow:"0 20px 60px rgba(91,78,255,0.5)" }}>🧠</div>
          </div>
        )}
      </div>
    </section>
  );
}
