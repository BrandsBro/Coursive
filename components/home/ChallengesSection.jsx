"use client";
import Link from "next/link";
import { ArrowRight, Flame, Zap } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

export default function ChallengesSection({ challenges = [] }) {
  const { getChallengeDayPercent, hasJoinedChallenge } = useProgress();

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Daily Challenges</h2>
          <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Level up one day at a time</p>
        </div>
        <Link href="/challenges" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:700, color:"#f97316", background:"#FFF7ED", padding:"9px 18px", borderRadius:12 }}>
          View all <ArrowRight size={14}/>
        </Link>
      </div>

      <div className="ch-grid">
        {challenges.map((ch, i) => {
          const pct = getChallengeDayPercent(ch.id, ch.days);
          const joined = hasJoinedChallenge(ch.id);

          return (
            <Link key={ch.id} href={"/challenges/"+ch.id} style={{ textDecoration:"none" }}>
              <div style={{ background:"#fff", borderRadius:20, overflow:"hidden", border:"1.5px solid #F1F5F9", transition:"all 0.2s", cursor:"pointer", height:"100%" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>

                {/* Gradient header */}
                <div style={{ background:ch.gradientBg||"linear-gradient(135deg,#667eea,#764ba2)", height:130, padding:"16px", display:"flex", flexDirection:"column", justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }}/>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <span style={{ fontSize:36 }}>{ch.emoji}</span>
                    <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:999, padding:"4px 10px", display:"flex", alignItems:"center", gap:4 }}>
                      <Zap size={11} color="#fff" fill="#fff"/>
                      <span style={{ color:"#fff", fontSize:11, fontWeight:800 }}>{ch.days} DAYS</span>
                    </div>
                  </div>
                  <div>
                    <h3 style={{ color:"#fff", fontSize:15, fontWeight:800, margin:"0 0 2px", lineHeight:1.3 }}>{ch.title}</h3>
                    <p style={{ color:"rgba(255,255,255,0.7)", fontSize:11, margin:0 }}>{ch.subtitle}</p>
                  </div>
                </div>

                {/* Bottom */}
                <div style={{ padding:"14px 16px" }}>
                  {pct > 0 ? (
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <span style={{ fontSize:11, color:"#64748B", fontWeight:600 }}>Progress</span>
                        <span style={{ fontSize:11, fontWeight:800, color:"#f97316" }}>{pct}%</span>
                      </div>
                      <div style={{ background:"#F1F5F9", borderRadius:999, height:5, overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:999, background:"linear-gradient(to right,#f97316,#fbbf24)", width:pct+"%", transition:"width 0.6s" }}/>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, background:"#FFF7ED", border:"1.5px solid #FED7AA" }}>
                      <Flame size={14} color="#f97316" fill="#f97316"/>
                      <span style={{ fontSize:12, fontWeight:700, color:"#c2410c" }}>
                        {joined ? "Continue challenge" : "Start challenge"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>


      <style>{`
        .ch-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
        @media (max-width: 640px) { .ch-grid { grid-template-columns:1fr; gap:12px; } }
      `}</style>
    </div>
  );
}
