"use client";
import useIsMobile from "@/hooks/useIsMobile";
export default function AIIsATool() {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 60, alignItems:"center" }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 28 : 36, fontWeight:900, color:"#fff", margin:"0 0 8px" }}>AI is a tool.<br/><span style={{ color:"#5B4EFF" }}>Your results are the goal.</span></h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", margin:"0 0 24px", lineHeight:1.7 }}>See how mastering these tools transforms your specific workflow.</p>
          {[
            "Master AI tools to build practical AI skills and confidence",
            "Access the world's top AI tools: ChatGPT, Canva AI, and more",
            "Get AI Certificate and stand out from people who still struggle with AI",
          ].map((item,i) => (
            <div key={i} style={{ display:"flex", gap:12, marginBottom:14 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", border:"2px solid #5B4EFF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#5B4EFF" }}/>
              </div>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.6)", margin:0, lineHeight:1.6 }}>{item}</p>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:24, padding:24, display:"flex", flexDirection:"column", gap:14 }}>
          {[
            { label:"Marketing & Sales", pct:85, color:"#5B4EFF" },
            { label:"Content Creation", pct:72, color:"#8B5CF6" },
            { label:"Data Analysis", pct:68, color:"#06b6d4" },
            { label:"Customer Support", pct:91, color:"#22c55e" },
          ].map((item,i) => (
            <div key={i}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>{item.label}</span>
                <span style={{ fontSize:13, color:item.color, fontWeight:700 }}>{item.pct}%</span>
              </div>
              <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:999 }}>
                <div style={{ height:"100%", borderRadius:999, background:item.color, width:`${item.pct}%` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
