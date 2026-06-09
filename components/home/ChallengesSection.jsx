"use client";
import Link from "next/link";
import { ArrowRight, Flame, CheckCircle2 } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

const S = [
  { g:"linear-gradient(135deg,#667eea,#764ba2)", a:"#7c3aed", l:"#f5f3ff", t:"#6d28d9" },
  { g:"linear-gradient(135deg,#f093fb,#f5576c)", a:"#be185d", l:"#fdf2f8", t:"#9d174d" },
  { g:"linear-gradient(135deg,#4facfe,#00f2fe)", a:"#0369a1", l:"#f0f9ff", t:"#075985" },
  { g:"linear-gradient(135deg,#43e97b,#38f9d7)", a:"#065f46", l:"#ecfdf5", t:"#064e3b" },
];

export default function ChallengesSection({ challenges = [] }) {
  const { getChallengeDayPercent, hasJoinedChallenge } = useProgress();

  return (
    <div style={{ marginBottom:4 }}>
      <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:18 }}>
        <div>
          <h2 style={{ fontSize:21,fontWeight:900,color:"#0f172a",margin:"0 0 2px" }}>Daily Challenges</h2>
          <p style={{ fontSize:13,color:"#94A3B8",margin:0 }}>Level up one day at a time</p>
        </div>
        <Link href="/challenges" style={{ textDecoration:"none",display:"flex",alignItems:"center",gap:5,fontSize:13,fontWeight:700,color:"#5B4EFF",background:"#EEF0FF",padding:"9px 16px",borderRadius:14 }}>
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14 }}>
        {challenges.map((ch, i) => {
          const s = S[i % S.length];
          const pct = getChallengeDayPercent(ch.id, ch.days);
          const joined = hasJoinedChallenge(ch.id);
          const daysDone = Math.round((pct/100)*ch.days);

          return (
            <Link key={ch.id} href={`/challenges/${ch.id}${joined?"?joined=true":""}`} style={{ textDecoration:"none" }}>
              <div
                style={{ background:"#fff",borderRadius:20,overflow:"hidden",border:"1.5px solid #F0F0F0",cursor:"pointer",transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 12px 30px ${s.a}25`; e.currentTarget.style.borderColor=`${s.a}35`; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor="#F0F0F0"; }}
              >
                {/* Hero */}
                <div style={{ background:s.g,height:86,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",position:"relative",overflow:"hidden" }}>
                  <div style={{ position:"absolute",top:-20,right:-15,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.1)" }} />
                  <span style={{ fontSize:36,position:"relative",zIndex:1 }}>{ch.emoji}</span>
                  <div style={{ position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4 }}>
                    <span style={{ background:"rgba(255,255,255,0.22)",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:999,letterSpacing:0.5 }}>
                      {ch.days} DAYS
                    </span>
                    {joined && (
                      <span style={{ background:"rgba(255,255,255,0.9)",color:s.t,fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:999 }}>
                        ENROLLED
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding:"12px 14px 14px" }}>
                  <h3 style={{ fontSize:13,fontWeight:800,color:"#0f172a",margin:"0 0 3px",lineHeight:1.3 }}>{ch.title}</h3>
                  <p style={{ fontSize:11,color:"#94A3B8",margin:"0 0 10px",lineHeight:1.4 }}>{ch.subtitle}</p>

                  {pct > 0 ? (
                    <>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                        <span style={{ fontSize:11,color:"#94A3B8" }}>{daysDone}/{ch.days} days</span>
                        <span style={{ fontSize:11,fontWeight:700,color:s.a }}>{pct}%</span>
                      </div>
                      <div style={{ background:"#F1F5F9",borderRadius:999,height:5 }}>
                        <div style={{ height:5,borderRadius:999,background:s.g,width:`${pct}%`,transition:"width 0.6s" }} />
                      </div>
                    </>
                  ) : (
                    <div style={{ display:"flex",alignItems:"center",gap:6,background:s.l,borderRadius:10,padding:"7px 11px",border:`1px solid ${s.a}20` }}>
                      <Flame size={12} color={s.a} />
                      <span style={{ fontSize:11,fontWeight:700,color:s.t }}>Start challenge</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
