"use client";
import useIsMobile from "@/hooks/useIsMobile";
export default function Testimonials() {
  const isMobile = useIsMobile();
  const reviews = [
    { name:"Sarah M.", stars:5, text:"I went from knowing nothing about AI to using it daily at work. 1Course made it so easy and fun!", role:"Marketing Manager" },
    { name:"Ahmed K.", stars:5, text:"Within 2 weeks I was using AI tools at work and my manager noticed. Highly recommend!", role:"Sales Executive" },
    { name:"Lisa T.", stars:5, text:"The 28-day challenge kept me accountable. I earned my certificate and got a promotion!", role:"Content Creator" },
  ];
  return (
    <section id="reviews" style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <p style={{ textAlign:"center", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:8 }}>WHAT PROFESSIONALS LIKE YOU ARE SAYING</p>
        <h2 style={{ textAlign:"center", fontSize: isMobile ? 26 : 36, fontWeight:900, color:"#fff", margin:"0 0 8px" }}>What professionals <span style={{ color:"#5B4EFF" }}>like you are saying</span></h2>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, flexWrap:"wrap", justifyContent:"center" }}>
            {[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:20, color:"#f59e0b" }}>★</span>)}
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginLeft:4 }}>4.5 rating · Based on reviews across iOS, Android and Web</span>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap:16 }}>
          {reviews.map((r,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:24 }}>
              <div style={{ display:"flex", gap:2, marginBottom:12 }}>
                {[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:16, color:s<=r.stars?"#f59e0b":"rgba(255,255,255,0.15)" }}>★</span>)}
              </div>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.7)", margin:"0 0 16px", lineHeight:1.7 }}>"{r.text}"</p>
              <p style={{ fontSize:13, fontWeight:700, color:"#fff", margin:"0 0 2px" }}>{r.name}</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:0 }}>{r.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
