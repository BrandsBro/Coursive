"use client";
import useIsMobile from "@/hooks/useIsMobile";
export default function AITools() {
  const isMobile = useIsMobile();
  const tools = [
    { icon:"🤖", name:"ChatGPT", desc:"Master prompting & automation" },
    { icon:"🎨", name:"Midjourney", desc:"Create stunning AI images" },
    { icon:"✨", name:"Canva AI", desc:"Design like a pro instantly" },
    { icon:"📊", name:"Jasper AI", desc:"Write content 10x faster" },
    { icon:"🎬", name:"RunwayML", desc:"AI video generation" },
    { icon:"🔍", name:"Perplexity", desc:"AI-powered research" },
  ];
  return (
    <section style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <p style={{ textAlign:"center", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:8 }}>MASTER THE WORLD'S</p>
        <h2 style={{ textAlign:"center", fontSize: isMobile ? 28 : 36, fontWeight:900, color:"#fff", margin:"0 0 8px" }}>Master the world's <span style={{ color:"#5B4EFF" }}>leading AI tools</span></h2>
        <p style={{ textAlign:"center", fontSize:15, color:"rgba(255,255,255,0.4)", margin:"0 0 40px" }}>Practical, step-by-step guides to the software shaping the future of work.</p>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap:14 }}>
          {tools.map((t,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"18px 16px", display:"flex", gap:12, alignItems:"flex-start" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(91,78,255,0.1)"; e.currentTarget.style.borderColor="rgba(91,78,255,0.3)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>
              <div style={{ width:40, height:40, borderRadius:12, background:"rgba(91,78,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{t.icon}</div>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 4px" }}>{t.name}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
