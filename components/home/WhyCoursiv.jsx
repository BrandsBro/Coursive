"use client";
import useIsMobile from "@/hooks/useIsMobile";
export default function Why1Course() {
  const isMobile = useIsMobile();
  return (
    <section id="why" style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <p style={{ textAlign:"center", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:8 }}>WHY USERS CHOOSE</p>
        <h2 style={{ textAlign:"center", fontSize: isMobile ? 28 : 36, fontWeight:900, color:"#fff", margin:"0 0 12px" }}>Why users choose <span style={{ color:"#5B4EFF" }}>1Course</span></h2>
        <p style={{ textAlign:"center", fontSize:15, color:"rgba(255,255,255,0.45)", margin:"0 0 40px" }}>Thousands of users trust 1Course to learn AI.</p>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr", gap:20 }}>
          <div style={{ background:"linear-gradient(135deg,#1e1b4b,#2d2a5e)", border:"1px solid rgba(91,78,255,0.3)", borderRadius:24, padding:24, display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"rgba(91,78,255,0.2)", borderRadius:14, padding:"10px 14px", width:"fit-content" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#a78bfa" }}>📅 The 28-Day AI Challenge</span>
            </div>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.65)", margin:0, lineHeight:1.7 }}>Join only 28 days to transform your life on your pace to master AI tools and skills and get a custom learning plan.</p>
            <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:14, padding:16, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:32 }}>🐶</span>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:"#fff", margin:"0 0 2px" }}>Create a story about a doctor</p>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>AI Prompt example</p>
              </div>
            </div>
            <p style={{ fontSize:13, fontWeight:700, color:"#a78bfa", margin:0 }}>10+ leading AI tools</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              { icon:"🎧", title:"Learn on the go", desc:"Listen to lessons like a podcast and master AI hands-free" },
              { icon:"🏆", title:"4.5 Rating", desc:"4+ average based on AppStore, Play Store and Trustpilot" },
              { icon:"🎓", title:"Prove skills, get ahead", desc:"Earn a certificate that stands out on LinkedIn" },
            ].map((c,i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:20, display:"flex", gap:14, alignItems:"center" }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"rgba(91,78,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{c.icon}</div>
                <div>
                  <p style={{ fontSize:15, fontWeight:700, color:"#fff", margin:"0 0 4px" }}>{c.title}</p>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", margin:0 }}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
