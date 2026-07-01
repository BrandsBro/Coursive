"use client";
import useIsMobile from "@/hooks/useIsMobile";
export default function HowItWorks() {
  const isMobile = useIsMobile();
  const steps = [
    { num:1, title:"Your personal learning plan, ready in minutes", desc:"Answer a few questions about your goals and skills and get a custom learning plan.", img:"⏳" },
    { num:2, title:"Learn on any device, anytime", desc:"Web or mobile — your lessons are always with you, built for quick daily progress.", img:"📱" },
    { num:3, title:"Finish the course. Walk away with a certificate.", desc:"Recognized AI certificates you can share on LinkedIn and your resume.", img:"🎓" },
  ];
  return (
    <section style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <p style={{ textAlign:"center", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:8 }}>HOW IT WORKS</p>
        <h2 style={{ textAlign:"center", fontSize: isMobile ? 28 : 36, fontWeight:900, color:"#fff", margin:"0 0 8px" }}>How <span style={{ color:"#5B4EFF" }}>1Course</span> works</h2>
        <p style={{ textAlign:"center", fontSize:15, color:"rgba(255,255,255,0.4)", margin:"0 0 48px" }}>Three steps from curious to mastery.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:32 }}>
          {steps.map((s,i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:32, alignItems:"center", direction: !isMobile && i%2!==0 ? "rtl" : "ltr" }}>
              <div style={{ direction:"ltr" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(91,78,255,0.2)", border:"1px solid rgba(91,78,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#a78bfa", marginBottom:16 }}>{s.num}</div>
                <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:"#fff", margin:"0 0 12px", lineHeight:1.3 }}>{s.title}</h3>
                <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", margin:0, lineHeight:1.7 }}>{s.desc}</p>
              </div>
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:24, height:180, display:"flex", alignItems:"center", justifyContent:"center", fontSize:72, direction:"ltr" }}>{s.img}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
