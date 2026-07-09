"use client";
import Link from "next/link";
import { ArrowRight, Flame, Zap } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

export default function ChallengesSection({ challenges = [] }) {
  const { getChallengeDayPercent, hasJoinedChallenge } = useProgress();
  const visible = challenges.slice(0, 4);

  return (
    <>
      <div>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <div>
            <h2 style={{ fontSize:21, fontWeight:900, color:"#0f172a", margin:"0 0 2px" }}>Daily Challenges</h2>
            <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Level up one day at a time</p>
          </div>
          <Link href="/challenges" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:5, fontSize:13, fontWeight:600, color:"#f97316", background:"#FFF7ED", padding:"9px 18px", borderRadius:14, flexShrink:0 }}>
            View All <ArrowRight size={14}/>
          </Link>
        </div>

        {/* Grid */}
        <div className="ch-grid">
          {visible.map((ch, index) => {
            const pct = getChallengeDayPercent(ch.id, ch.days);
            const joined = hasJoinedChallenge(ch.id);

            return (
              <Link
                key={ch.id}
                href={"/challenges/" + ch.id}
                style={{ textDecoration:"none", display:"block" }}
                className={index >= 2 ? "hide-mobile" : ""}
              >
                <div className="ch-card">
                  {/* Thumbnail */}
                  <div style={{
                    borderRadius:"12px 12px 0 0",
                    overflow:"hidden",
                    height:130,
                    background: ch.imageUrl ? `url(${ch.imageUrl}) center/cover` : (ch.gradientBg || "linear-gradient(135deg,#667eea,#764ba2)"),
                    display:"flex",
                    alignItems:"flex-start",
                    justifyContent:"space-between",
                    padding:"14px",
                    position:"relative",
                  }}>
                    <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }}/>
                    {!ch.imageUrl && <span style={{ fontSize:32, position:"relative", zIndex:1 }}>{ch.emoji}</span>}
                    <div style={{ marginLeft:"auto", background:"rgba(255,255,255,0.2)", borderRadius:999, padding:"4px 10px", display:"flex", alignItems:"center", gap:4, position:"relative", zIndex:1 }}>
                      <Zap size={10} color="#fff" fill="#fff"/>
                      <span style={{ color:"#fff", fontSize:10, fontWeight:800 }}>{ch.days} DAYS</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding:"12px 14px 14px" }}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:"0 0 2px", lineHeight:1.3 }}>{ch.title}</h3>
                    <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 10px" }}>{ch.subtitle}</p>

                    {pct > 0 ? (
                      <>
                        <div style={{ background:"#F1F5F9", borderRadius:999, height:5, overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:999, background:"linear-gradient(to right,#f97316,#fbbf24)", width:`${pct}%`, transition:"width 0.6s" }}/>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                          <span style={{ fontSize:11, color:"#64748B", fontWeight:600 }}>Progress</span>
                          <span style={{ fontSize:11, fontWeight:800, color:"#f97316" }}>{pct}%</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:5, background:"#FFF7ED", border:"1.5px solid #FED7AA", borderRadius:10, padding:"8px 12px" }}>
                        <Flame size={13} color="#f97316" fill="#f97316"/>
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
      </div>

      <style>{`
        .ch-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .ch-card {
          background: #fff;
          border: 1.5px solid #E5E7EB;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
          height: 100%;
        }
        .ch-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        @media (max-width: 768px) {
          .ch-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px;
          }
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
