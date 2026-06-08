"use client";
import { Flame, Check, Zap } from "lucide-react";

const DAYS = [
  { short:"M", full:"Mon" },
  { short:"T", full:"Tue" },
  { short:"W", full:"Wed" },
  { short:"T", full:"Thu" },
  { short:"F", full:"Fri" },
  { short:"S", full:"Sat" },
  { short:"S", full:"Sun" },
];

export default function WeeklyStreaks() {
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const completed = [true, false, false, false, false, false, false];
  const streak = completed.filter(Boolean).length;
  const todayDone = completed[todayIdx];

  return (
    <div style={{ background:"#fff",borderRadius:24,border:"1px solid #EFEFEF",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.06)",height:"100%",display:"flex",flexDirection:"column" }}>
      {/* Flame header */}
      <div style={{ background:"linear-gradient(135deg,#f97316 0%,#ef4444 100%)",padding:"20px 22px",position:"relative",overflow:"hidden",flexShrink:0 }}>
        <div style={{ position:"absolute",top:-30,right:-20,width:110,height:110,borderRadius:"50%",background:"rgba(255,255,255,0.08)" }} />
        <div style={{ position:"absolute",bottom:-20,left:40,width:70,height:70,borderRadius:"50%",background:"rgba(255,255,255,0.06)" }} />

        <div style={{ position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <p style={{ color:"rgba(255,255,255,0.65)",fontSize:10,fontWeight:700,letterSpacing:1,margin:"0 0 6px" }}>WEEKLY STREAK</p>
            <div style={{ display:"flex",alignItems:"baseline",gap:6 }}>
              <Flame size={30} color="#fff" fill="#fff" />
              <span style={{ color:"#fff",fontSize:40,fontWeight:900,lineHeight:1 }}>{streak}</span>
              <span style={{ color:"rgba(255,255,255,0.6)",fontSize:14,paddingBottom:4 }}>days</span>
            </div>
          </div>
          <div style={{ background:"rgba(255,255,255,0.18)",borderRadius:14,padding:"10px 12px",textAlign:"center" }}>
            <div style={{ fontSize:20 }}>🏆</div>
            <div style={{ color:"rgba(255,255,255,0.85)",fontSize:9,fontWeight:700,marginTop:3 }}>TOP 5%</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"16px 20px",flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
        <p style={{ fontSize:11,fontWeight:700,color:"#9CA3AF",letterSpacing:0.8,margin:"0 0 12px",textTransform:"uppercase" }}>This week</p>

        {/* Day circles */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:14 }}>
          {DAYS.map((d, i) => {
            const done = completed[i];
            const isToday = i === todayIdx;
            return (
              <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
                <div style={{
                  width:34,height:34,borderRadius:"50%",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background: done
                    ? "linear-gradient(135deg,#f97316,#ef4444)"
                    : isToday ? "#FFF7ED"
                    : "#F9FAFB",
                  border: isToday && !done ? "2px solid #fdba74" : done ? "none" : "1.5px solid #F3F4F6",
                  boxShadow: done ? "0 3px 10px rgba(249,115,22,0.4)" : "none",
                }}>
                  {done
                    ? <Check size={14} color="#fff" strokeWidth={3} />
                    : <span style={{ fontSize:10,fontWeight:700,color:isToday?"#f97316":"#D1D5DB" }}>{d.short}</span>
                  }
                </div>
                <span style={{ fontSize:9,color:done?"#f97316":isToday?"#fdba74":"#D1D5DB",fontWeight:700 }}>
                  {d.full.slice(0,2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Status */}
        <div style={{
          background: todayDone ? "#F0FDF4" : "#FFF7ED",
          borderRadius:12,padding:"10px 14px",
          border: `1.5px solid ${todayDone ? "#BBF7D0" : "#FED7AA"}`,
          display:"flex",alignItems:"center",gap:8,
        }}>
          {todayDone
            ? <Check size={14} color="#16A34A" strokeWidth={3} />
            : <Zap size={14} color="#EA580C" />
          }
          <p style={{ fontSize:12,fontWeight:600,color:todayDone?"#15803D":"#C2410C",margin:0 }}>
            {todayDone ? "Today complete! Keep it up 🎉" : "Complete today's lesson"}
          </p>
        </div>
      </div>
    </div>
  );
}
