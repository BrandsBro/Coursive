"use client";
import useIsMobile from "@/hooks/useIsMobile";
export default function AboutSection() {
  const isMobile = useIsMobile();
  return (
    <section id="about" style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <p style={{ textAlign:"center", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:8 }}>ABOUT US</p>
        <h2 style={{ textAlign:"center", fontSize: isMobile ? 26 : 36, fontWeight:900, color:"#fff", margin:"0 0 16px" }}>We're on a mission to make <span style={{ color:"#5B4EFF" }}>AI accessible</span> to everyone</h2>
        <p style={{ textAlign:"center", fontSize:15, color:"rgba(255,255,255,0.5)", margin:"0 auto 48px", maxWidth:600, lineHeight:1.8 }}>Coursiv was built by a team of AI enthusiasts who believe that anyone — regardless of background — can master AI tools and transform their career.</p>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap:20, marginBottom:48 }}>
          {[
            { icon:"🎯", title:"Our Mission", desc:"Make AI education practical, affordable, and accessible to every professional around the world." },
            { icon:"👥", title:"Our Team", desc:"A passionate team of educators, engineers, and designers building the future of AI learning." },
            { icon:"🌍", title:"Our Impact", desc:"2,000,000+ learners across 150+ countries have transformed their careers with Coursiv." },
          ].map((c,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"28px 24px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:16 }}>{c.icon}</div>
              <h3 style={{ fontSize:18, fontWeight:800, color:"#fff", margin:"0 0 10px" }}>{c.title}</h3>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", margin:0, lineHeight:1.7 }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ background:"linear-gradient(135deg,rgba(91,78,255,0.15),rgba(139,92,246,0.08))", border:"1px solid rgba(91,78,255,0.2)", borderRadius:24, padding: isMobile ? "28px 20px" : "40px 48px", display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:32, alignItems:"center" }}>
          <div>
            <h3 style={{ fontSize: isMobile ? 22 : 26, fontWeight:900, color:"#fff", margin:"0 0 12px" }}>Why we built Coursiv</h3>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.55)", margin:"0 0 16px", lineHeight:1.8 }}>We saw professionals struggling to keep up with AI — not because they weren't capable, but because the learning resources were too complex, too expensive, or too disconnected from real work.</p>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.55)", margin:0, lineHeight:1.8 }}>So we built Coursiv — bite-sized, practical AI education that fits into your life and actually changes your results.</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { year:"2023", event:"Coursiv founded with a vision to democratize AI education" },
              { year:"2024", event:"Reached 1,000,000 learners across 100+ countries" },
              { year:"2025", event:"Launched 28-Day AI Challenge with 500K+ participants" },
              { year:"2026", event:"2,000,000+ certified AI professionals and counting" },
            ].map((item,i) => (
              <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ background:"rgba(91,78,255,0.2)", border:"1px solid rgba(91,78,255,0.4)", borderRadius:8, padding:"4px 10px", flexShrink:0 }}>
                  <span style={{ fontSize:12, fontWeight:800, color:"#a78bfa" }}>{item.year}</span>
                </div>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.6)", margin:0, lineHeight:1.6 }}>{item.event}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
