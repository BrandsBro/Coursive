"use client";
import useIsMobile from "@/hooks/useIsMobile";
import { useEffect, useRef } from "react";

const reviews = [
  { name:"Sarah M.", stars:5, text:"I went from knowing nothing about AI to using it daily at work. 1Course made it so easy and fun!", role:"Marketing Manager" },
  { name:"Ahmed K.", stars:5, text:"Within 2 weeks I was using AI tools at work and my manager noticed. Highly recommend!", role:"Sales Executive" },
  { name:"Lisa T.", stars:5, text:"The 28-day challenge kept me accountable. I earned my certificate and got a promotion!", role:"Content Creator" },
  { name:"James R.", stars:5, text:"Best investment I made this year. The AI skills I learned helped me land a new job!", role:"Product Manager" },
  { name:"Priya S.", stars:5, text:"I was skeptical at first but 1Course completely changed how I work. I save 3 hours every day!", role:"HR Manager" },
  { name:"Michael B.", stars:5, text:"The course structure is perfect. I finished the 4-week plan and immediately applied everything.", role:"Software Engineer" },
  { name:"Emma W.", stars:5, text:"I recommended 1Course to my entire team. Everyone is now using AI to supercharge their work.", role:"Team Lead" },
  { name:"Carlos D.", stars:5, text:"Incredible value. I learned more in 4 weeks than I did in years of trying to self-teach AI.", role:"Entrepreneur" },
  { name:"Fatima A.", stars:5, text:"The certificate I earned helped me stand out in my job application. Got hired within a week!", role:"Data Analyst" },
  { name:"Tom H.", stars:5, text:"Simple, practical, and powerful. 1Course gives you real skills you can use immediately.", role:"Business Owner" },
  { name:"Aisha N.", stars:5, text:"I use ChatGPT and other AI tools so much better now. My productivity has tripled!", role:"Freelancer" },
  { name:"David L.", stars:5, text:"The daily lessons fit perfectly into my schedule. 20 minutes a day changed my career.", role:"Financial Analyst" },
  { name:"Maria G.", stars:5, text:"As a non-tech person I was worried but 1Course made AI completely approachable. Love it!", role:"Teacher" },
  { name:"Kevin P.", stars:5, text:"My boss asked how I got so good at AI so fast. I told him 1Course. He signed up too!", role:"Operations Manager" },
  { name:"Sophie R.", stars:5, text:"The AI certificate gave me the confidence to apply for senior roles. Just got promoted!", role:"Digital Marketer" },
  { name:"Omar F.", stars:5, text:"I was wasting hours on tasks AI can do in seconds. 1Course showed me exactly how. Amazing!", role:"Consultant" },
  { name:"Nina K.", stars:5, text:"Finished the 12-week plan and I feel like a completely different professional. Worth every penny.", role:"Project Manager" },
  { name:"Ryan T.", stars:5, text:"The community and support made all the difference. Never felt alone in the learning journey.", role:"Sales Manager" },
  { name:"Zara M.", stars:5, text:"I use AI for writing, research, analysis and more now. 1Course unlocked a whole new world for me.", role:"Content Strategist" },
  { name:"Ben A.", stars:5, text:"Clear lessons, real examples, instant results. This is how online education should work.", role:"UX Designer" },
  { name:"Hannah C.", stars:5, text:"I completed the challenge with my colleague and we both got certificates. Best team activity!", role:"Account Manager" },
  { name:"Isaac O.", stars:5, text:"From zero AI knowledge to confidently automating my workflows in 4 weeks. Unbelievable!", role:"E-commerce Owner" },
];

const doubled = [...reviews, ...reviews];

export default function Testimonials() {
  const isMobile = useIsMobile();
  const trackRef = useRef(null);

  useEffect(() => {
    const speed = 0.5;
    let pos = 0;
    let raf;
    const cardW = isMobile ? 280 : 340;
    const gap = 16;
    const totalW = reviews.length * (cardW + gap);

    const animate = () => {
      pos -= speed;
      if (Math.abs(pos) >= totalW) pos = 0;
      if (trackRef.current) trackRef.current.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

  const cardW = isMobile ? 280 : 340;

  return (
    <section id="reviews" style={{ padding: isMobile ? "48px 0" : "80px 0", overflow:"hidden" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding: isMobile ? "0 20px" : "0 32px" }}>
        <p style={{ textAlign:"center", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:8 }}>WHAT PROFESSIONALS LIKE YOU ARE SAYING</p>
        <h2 style={{ textAlign:"center", fontSize: isMobile ? 26 : 36, fontWeight:900, color:"#fff", margin:"0 0 8px" }}>What professionals <span style={{ color:"#5B4EFF" }}>like you are saying</span></h2>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, flexWrap:"wrap", justifyContent:"center" }}>
            {[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:20, color:"#f59e0b" }}>★</span>)}
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginLeft:4 }}>4.8 rating · Based on reviews across iOS, Android and Web</span>
          </div>
        </div>
      </div>

      <div style={{ overflow:"hidden", WebkitMaskImage:"linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
        <div ref={trackRef} style={{ display:"flex", width:"max-content" }}>
          {doubled.map((r, i) => (
            <div key={i} style={{
              flexShrink: 0,
              width: cardW,
              marginRight: 16,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: 24,
            }}>
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
