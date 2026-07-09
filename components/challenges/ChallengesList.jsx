"use client";

import Link from "next/link";
import { useState } from "react";

import { useProgress } from "@/hooks/useProgress";
import { Clock, BarChart2, Flame, ArrowRight, CheckCircle2 } from "lucide-react";

const FILTERS = ["All", "14 days", "28 days"];

const CARD_STYLES = [
  { grad:"linear-gradient(135deg,#667eea,#764ba2)", light:"#f5f3ff", tag:"#7c3aed", tagBg:"#ede9fe" },
  { grad:"linear-gradient(135deg,#f093fb,#f5576c)", light:"#fdf2f8", tag:"#be185d", tagBg:"#fce7f3" },
  { grad:"linear-gradient(135deg,#4facfe,#00f2fe)", light:"#f0f9ff", tag:"#0369a1", tagBg:"#e0f2fe" },
  { grad:"linear-gradient(135deg,#43e97b,#38f9d7)", light:"#ecfdf5", tag:"#065f46", tagBg:"#d1fae5" },
];

export default function ChallengesList({ challenges = [] }) {
  const { getChallengeDayPercent, hasJoinedChallenge } = useProgress();
  const [filter, setFilter] = useState("All");

  const filtered = challenges.filter(c => {
    if (filter === "All") return true;
    if (filter === "14 days") return c.days === 14;
    if (filter === "28 days") return c.days === 28;
    return true;
  });

  const totalEnrolled = challenges.filter(c => hasJoinedChallenge(c.id)).length;

  return (
    <div>
      {/* Hero header */}
      <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)", borderRadius:24, padding:"48px 40px", marginBottom:32, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
        <div style={{ position:"absolute", bottom:-40, left:120, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
        <div style={{ position:"absolute", top:20, right:180, width:80, height:80, borderRadius:"50%", background:"rgba(167,139,250,0.12)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(167,139,250,0.2)", borderRadius:10, padding:"5px 12px", marginBottom:16 }}>
            <Flame size={13} color="#c4b5fd" />
            <span style={{ color:"#c4b5fd", fontSize:11, fontWeight:700, letterSpacing:1 }}>DAILY CHALLENGES</span>
          </div>
          <h1 style={{ color:"#fff", fontSize:34, fontWeight:800, margin:"0 0 8px", lineHeight:1.2 }}>
            Push your limits.<br />
            <span style={{ color:"#a78bfa" }}>Level up every day.</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:15, margin:"0 0 28px", maxWidth:440 }}>
            Short daily lessons that build real AI skills. Pick a challenge and commit to the streak.
          </p>
          <div style={{ display:"flex", gap:28 }}>
            {[["Challenges", challenges.length], ["Enrolled", totalEnrolled], ["Max days", 28]].map(([label, val]) => (
              <div key={label}>
                <div style={{ color:"#fff", fontSize:26, fontWeight:800, lineHeight:1 }}>{val}</div>
                <div style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginTop:3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:"8px 18px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer",
            border: filter===f ? "none" : "1.5px solid #E5E7EB",
            background: filter===f ? "#5B4EFF" : "#fff",
            color: filter===f ? "#fff" : "#6B7280",
            transition:"all 0.15s",
          }}>
            {f}
          </button>
        ))}
        <span style={{ marginLeft:"auto", color:"#9CA3AF", fontSize:13 }}>
          {filtered.length} challenge{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <style>{`
        .challenges-list-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        @media (max-width: 1024px) { .challenges-list-grid { grid-template-columns:repeat(2,1fr); gap:14px; } }
        @media (max-width: 640px)  { .challenges-list-grid { grid-template-columns:repeat(2,1fr); gap:12px; } }
        .ch-card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid #F0F0F0; box-shadow:0 2px 8px rgba(0,0,0,0.05); transition:all 0.2s ease; cursor:pointer; height:100%; display:flex; flex-direction:column; }
        .ch-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.12); }
        .ch-thumb { height:160px; position:relative; overflow:hidden; flex-shrink:0; }
        @media (max-width: 640px) { .ch-thumb { height:120px; } }
      `}</style>

      <div className="challenges-list-grid">
        {filtered.map((challenge, i) => {
          const s        = CARD_STYLES[i % CARD_STYLES.length];
          const percent  = getChallengeDayPercent(challenge.id, challenge.days);
          const joined   = hasJoinedChallenge(challenge.id);
          const daysDone = Math.round((percent / 100) * challenge.days);

          return (
            <Link key={challenge.id} href={`/challenges/${challenge.id}${joined ? "?joined=true" : ""}`}
              style={{ textDecoration:"none", display:"block", height:"100%" }}>
              <div className="ch-card">

                {/* Thumbnail */}
                <div
                  className="ch-thumb"
                  style={{
                    background: challenge.imageUrl
                      ? `url(${challenge.imageUrl}) center/cover`
                      : s.grad,
                  }}
                >
                  <div style={{ position:"absolute", top:-40, right:-40, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,0.09)" }} />
                  <div style={{ position:"absolute", bottom:-24, left:40, width:96, height:96, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />

                  {!challenge.imageUrl && (
                    <span style={{ position:"absolute", top:14, left:16, fontSize:36, lineHeight:1, filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.2))", zIndex:1 }}>
                      {challenge.emoji}
                    </span>
                  )}

                  {joined && (
                    <div style={{ position:"absolute", top:10, right:10, zIndex:1, background:"rgba(255,255,255,0.92)", borderRadius:10, padding:"4px 10px", display:"flex", alignItems:"center", gap:5 }}>
                      <CheckCircle2 size={12} color="#22C55E" />
                      <span style={{ fontSize:11, fontWeight:700, color:"#15803D" }}>Enrolled</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding:"14px 16px 16px", flex:1, display:"flex", flexDirection:"column" }}>

                  <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 14px", lineHeight:1.3 }}>
                    {challenge.title}
                  </h3>

                  {joined && percent > 0 ? (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:12, color:"#9CA3AF" }}>
                          {percent < 100 ? `${daysDone}/${challenge.days} days done` : "All done! 🎉"}
                        </span>
                        <span style={{ fontSize:12, fontWeight:700, color:s.tag }}>{percent}%</span>
                      </div>
                      <div style={{ background:"#F3F4F6", borderRadius:999, height:5 }}>
                        <div style={{ height:5, borderRadius:999, background:s.grad, width:`${percent}%`, transition:"width 0.6s ease" }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5, background:s.light, padding:"4px 10px", borderRadius:8 }}>
                       
                        <span style={{ fontSize:11, fontWeight:600, color:s.tag }}>{challenge.days} days</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, background:s.light, padding:"4px 10px", borderRadius:8 }}>
                  
                        <span style={{ fontSize:11, fontWeight:600, color:s.tag }}>{challenge.level}</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:s.light, borderRadius:12, padding:"11px 14px", marginTop:"auto" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:s.tag }}>
                      {!joined ? "Start challenge"
                        : percent === 0 ? "Continue"
                        : percent < 100 ? "Continue challenge"
                        : "View progress"}
                    </span>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:s.grad, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <ArrowRight size={13} color="#fff" />
                    </div>
                  </div>

                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}