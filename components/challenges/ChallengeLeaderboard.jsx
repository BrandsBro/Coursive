"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Flame, Crown, Loader, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const RANK_STYLES = [
  { bg:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", shadow:"0 4px 14px rgba(245,158,11,0.45)", label:"🥇" },
  { bg:"linear-gradient(135deg,#94a3b8,#64748b)", color:"#fff", shadow:"0 4px 14px rgba(148,163,184,0.45)", label:"🥈" },
  { bg:"linear-gradient(135deg,#cd7c2f,#a16207)", color:"#fff", shadow:"0 4px 14px rgba(161,98,7,0.4)",  label:"🥉" },
];

export default function ChallengeLeaderboard({ challenge }) {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);
  const [tab, setTab] = useState("all");

  useEffect(() => { load(); }, [challenge.id]);

  const load = async () => {
    setLoading(true);

    // Get all progress for this challenge
    const { data: progress } = await supabase
      .from("challenge_progress")
      .select("user_id, day_number")
      .eq("challenge_id", challenge.id);

    if (!progress || progress.length === 0) {
      setBoard([]);
      setLoading(false);
      return;
    }

    // Count days per user
    const countMap = {};
    progress.forEach(p => {
      countMap[p.user_id] = (countMap[p.user_id] || 0) + 1;
    });

    // Get unique user IDs
    const userIds = Object.keys(countMap);

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    // Build leaderboard
    const entries = userIds.map(uid => ({
      userId: uid,
      days: countMap[uid],
      pct: Math.round((countMap[uid] / challenge.days) * 100),
      profile: profiles?.find(p => p.id === uid),
    })).sort((a, b) => b.days - a.days || b.pct - a.pct);

    // Find my rank
    if (user) {
      const myIdx = entries.findIndex(e => e.userId === user.id);
      setMyRank(myIdx !== -1 ? myIdx + 1 : null);
    }

    setBoard(entries);
    setLoading(false);
  };

  const initials = (name) => name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)
    : "?";

  const filtered = tab === "top10" ? board.slice(0,10) : board;
  const myEntry = board.find(e => e.userId === user?.id);

  if (loading) return (
    <div style={{ textAlign:"center", padding:48 }}>
      <Loader size={24} color="#94A3B8" className="bspin"/>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Header stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {[
          { label:"Participants", value:board.length, icon:"👥" },
          { label:"Completions", value:board.filter(e=>e.days>=challenge.days).length, icon:"🏆" },
          { label:"Your rank", value:myRank ? `#${myRank}` : "—", icon:"📍" },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"16px", textAlign:"center" }}>
            <p style={{ fontSize:24, margin:"0 0 4px" }}>{icon}</p>
            <p style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 2px" }}>{value}</p>
            <p style={{ fontSize:11, color:"#94A3B8", margin:0, fontWeight:600 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Top 3 podium */}
      {board.length >= 3 && (
        <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", borderRadius:20, padding:"28px 24px 24px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(124,58,237,0.1)" }}/>
          <div style={{ position:"absolute", bottom:-30, left:60, width:100, height:100, borderRadius:"50%", background:"rgba(99,102,241,0.08)" }}/>

          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24, position:"relative", zIndex:1 }}>
            <Crown size={18} color="#f59e0b"/>
            <p style={{ color:"#fff", fontSize:14, fontWeight:800, margin:0 }}>Top Players</p>
          </div>

          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", gap:16, position:"relative", zIndex:1 }}>
            {/* 2nd place */}
            <PodiumEntry entry={board[1]} rank={2} total={challenge.days}/>
            {/* 1st place — taller */}
            <PodiumEntry entry={board[0]} rank={1} total={challenge.days} tall/>
            {/* 3rd place */}
            <PodiumEntry entry={board[2]} rank={3} total={challenge.days}/>
          </div>
        </div>
      )}

      {/* My position card (if not in top 3) */}
      {myEntry && myRank && myRank > 3 && (
        <div style={{ background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)", borderRadius:16, border:"1.5px solid #C7D2FE", padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#6366f1,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:800, flexShrink:0 }}>
            #{myRank}
          </div>
          <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:"#fff", flexShrink:0, overflow:"hidden" }}>
            {myEntry.profile?.avatar_url
              ? <img src={myEntry.profile.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt=""/>
              : initials(myEntry.profile?.full_name)}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#4338ca", margin:0 }}>You · {myEntry.profile?.full_name || "Your rank"}</p>
            <p style={{ fontSize:12, color:"#6366f1", margin:0 }}>{myEntry.days}/{challenge.days} days · {myEntry.pct}%</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(99,102,241,0.1)", borderRadius:8, padding:"4px 10px" }}>
            <ChevronUp size={13} color="#6366f1"/>
            <span style={{ fontSize:12, fontWeight:700, color:"#6366f1" }}>Keep going!</span>
          </div>
        </div>
      )}

      {/* Full list */}
      {board.length > 0 ? (
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
          {/* Tabs */}
          <div style={{ padding:"14px 20px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>Rankings</h3>
            <div style={{ display:"flex", gap:4, background:"#F1F5F9", borderRadius:10, padding:3 }}>
              {[["all","All"],["top10","Top 10"]].map(([val,label]) => (
                <button key={val} onClick={() => setTab(val)} style={{ padding:"5px 12px", borderRadius:8, border:"none", background:tab===val?"#fff":"transparent", color:tab===val?"#0f172a":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer", boxShadow:tab===val?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filtered.map((entry, idx) => {
            const rank = idx + 1;
            const isMe = entry.userId === user?.id;
            const rs = RANK_STYLES[rank-1];

            return (
              <div key={entry.userId} style={{ padding:"12px 20px", display:"flex", alignItems:"center", gap:14, borderBottom:idx<filtered.length-1?"1px solid #F8FAFC":"none", background:isMe?"#FAFBFF":"#fff", transition:"background 0.1s" }}>

                {/* Rank */}
                {rank <= 3 ? (
                  <div style={{ width:32, height:32, borderRadius:10, background:rs.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, boxShadow:rs.shadow }}>
                    {rs.label}
                  </div>
                ) : (
                  <div style={{ width:32, height:32, borderRadius:10, background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#64748B", flexShrink:0 }}>
                    {rank}
                  </div>
                )}

                {/* Avatar */}
                <div style={{ width:40, height:40, borderRadius:"50%", background:isMe?"linear-gradient(135deg,#7c3aed,#4f46e5)":"linear-gradient(135deg,#94a3b8,#64748b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff", flexShrink:0, overflow:"hidden", border:isMe?"2px solid #7c3aed":"2px solid transparent" }}>
                  {entry.profile?.avatar_url
                    ? <img src={entry.profile.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt=""/>
                    : initials(entry.profile?.full_name)
                  }
                </div>

                {/* Name + progress */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <p style={{ fontSize:13, fontWeight:isMe?800:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {entry.profile?.full_name || "Student"}
                    </p>
                    {isMe && <span style={{ fontSize:10, fontWeight:700, background:"#EEF2FF", color:"#6366f1", padding:"1px 6px", borderRadius:999 }}>YOU</span>}
                    {entry.days >= challenge.days && <span style={{ fontSize:10 }}>🏆</span>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                    <div style={{ flex:1, height:5, background:"#F1F5F9", borderRadius:999, overflow:"hidden", maxWidth:160 }}>
                      <div style={{ height:"100%", borderRadius:999, background:rank===1?"linear-gradient(to right,#f59e0b,#fbbf24)":rank===2?"linear-gradient(to right,#94a3b8,#cbd5e1)":rank===3?"linear-gradient(to right,#cd7c2f,#d97706)":"linear-gradient(to right,#6366f1,#818cf8)", width:`${entry.pct}%`, transition:"width 0.6s" }}/>
                    </div>
                    <span style={{ fontSize:11, color:"#94A3B8", fontWeight:600, whiteSpace:"nowrap" }}>{entry.days}/{challenge.days} days</span>
                  </div>
                </div>

                {/* Score */}
                <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                  <Flame size={13} color="#f97316"/>
                  <span style={{ fontSize:13, fontWeight:800, color:"#0f172a" }}>{entry.pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign:"center", padding:"40px 20px", background:"#fff", borderRadius:20, border:"2px dashed #E2E8F0" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🏆</div>
          <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>No participants yet</p>
          <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Be the first to join and top the leaderboard!</p>
        </div>
      )}
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function PodiumEntry({ entry, rank, total, tall }) {
  const rs = RANK_STYLES[rank-1];
  const initials = (name) => name ? name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "?";

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, flex:tall?1.2:1 }}>
      {/* Medal */}
      <div style={{ fontSize:24 }}>{rs.label}</div>

      {/* Avatar */}
      <div style={{ width:tall?60:48, height:tall?60:48, borderRadius:"50%", background:rs.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:tall?22:18, fontWeight:700, color:"#fff", border:`3px solid ${rank===1?"#f59e0b":rank===2?"#94a3b8":"#cd7c2f"}`, boxShadow:rs.shadow, overflow:"hidden" }}>
        {entry?.profile?.avatar_url
          ? <img src={entry.profile.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt=""/>
          : initials(entry?.profile?.full_name)
        }
      </div>

      {/* Name */}
      <p style={{ color:"#fff", fontSize:12, fontWeight:700, margin:0, textAlign:"center", maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {entry?.profile?.full_name?.split(" ")[0] || "Student"}
      </p>

      {/* Days */}
      <div style={{ background:rs.bg, borderRadius:999, padding:"3px 10px", boxShadow:rs.shadow }}>
        <span style={{ color:"#fff", fontSize:11, fontWeight:800 }}>{entry?.days}/{total} days</span>
      </div>

      {/* Podium block */}
      <div style={{ width:"100%", height:tall?56:36, borderRadius:"10px 10px 0 0", background:rs.bg, opacity:0.3 }}/>
    </div>
  );
}
