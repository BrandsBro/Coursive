"use client";
import Link from "next/link";
import { Play, BookOpen, CheckCircle2, Layers } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

const STYLES = {
  "canva-ai":             { grad:"linear-gradient(135deg,#ec4899 0%,#8b5cf6 100%)", emoji:"🎨", accent:"#8b5cf6" },
  "midjourney":           { grad:"linear-gradient(135deg,#6366f1 0%,#06b6d4 100%)", emoji:"🖼️", accent:"#6366f1" },
  "communicating-with-ai":{ grad:"linear-gradient(135deg,#f97316 0%,#facc15 100%)", emoji:"💬", accent:"#f97316" },
  "kling":                { grad:"linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)", emoji:"🎬", accent:"#ec4899" },
  "lovable":              { grad:"linear-gradient(135deg,#10b981 0%,#06b6d4 100%)", emoji:"💻", accent:"#10b981" },
  "chatgpt":              { grad:"linear-gradient(135deg,#10a37f 0%,#0ea5e9 100%)", emoji:"🤖", accent:"#10a37f" },
  "notion-ai":            { grad:"linear-gradient(135deg,#374151 0%,#111827 100%)", emoji:"📓", accent:"#6b7280" },
};

export default function CurrentCourseWidget({ courses = [] }) {
  if (!courses || courses.length === 0) return (
    <div style={{ background:"#fff", borderRadius:24, border:"1px solid #EFEFEF", padding:"40px 24px", textAlign:"center" }}>
      <div style={{ fontSize:32, marginBottom:8 }}>📚</div>
      <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>No courses yet</p>
    </div>
  );
  const { getCoursePercent, getCompletedLessons } = useProgress();

  const activeCourse = courses.find(c => {
    const total = c.units.flatMap(u => u.lessons).length;
    const pct = getCoursePercent(c.id, total);
    return pct > 0 && pct < 100;
  }) || courses[0];

  const allLessons = activeCourse.units.flatMap(u => u.lessons);
  const total = allLessons.length;
  const pct = getCoursePercent(activeCourse.id, total);
  const done = getCompletedLessons(activeCourse.id).length;
  const next = allLessons.find(l => !getCompletedLessons(activeCourse.id).includes(l.id));
  const s = STYLES[activeCourse.id] || { grad:"linear-gradient(135deg,#6366f1,#8b5cf6)", emoji:"📚", accent:"#6366f1" };

  return (
    <div style={{ background:"#fff",borderRadius:24,border:"1px solid #EFEFEF",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.06)" }}>
      {/* Gradient hero */}
      <div style={{ background:s.grad,padding:"22px 24px 0",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-40,right:-30,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.08)" }} />
        <div style={{ position:"absolute",top:10,right:60,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.05)" }} />

        <div style={{ position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
          <div>
            <div style={{ display:"inline-flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.18)",borderRadius:8,padding:"3px 10px",marginBottom:8 }}>
              <BookOpen size={10} color="#fff" />
              <span style={{ color:"#fff",fontSize:10,fontWeight:700,letterSpacing:0.5 }}>CURRENT COURSE</span>
            </div>
            <h3 style={{ color:"#fff",fontSize:"clamp(18px,4vw,24px)",fontWeight:900,margin:"0 0 4px",lineHeight:1.15 }}>{activeCourse.title}</h3>
            <p style={{ color:"rgba(255,255,255,0.65)",fontSize:13,margin:0 }}>{activeCourse.description}</p>
          </div>
          <div style={{ fontSize:48,lineHeight:1,marginTop:-4,flexShrink:0 }}>{s.emoji}</div>
        </div>

        {/* Stats row */}
        <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:0 }}>
          {[
            { icon:<Layers size={13} color="rgba(255,255,255,0.7)" />, label:`${total} lessons` },
            { icon:<CheckCircle2 size={13} color="rgba(255,255,255,0.7)" />, label:`${done} done` },
            { icon:<Play size={13} color="rgba(255,255,255,0.7)" fill="rgba(255,255,255,0.7)" />, label:`${activeCourse.hours}h total` },
          ].map((item, i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.12)",borderRadius:8,padding:"5px 10px" }}>
              {item.icon}
              <span style={{ color:"rgba(255,255,255,0.85)",fontSize:11,fontWeight:600 }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Progress bar flush */}
        <div style={{ marginTop:16,height:5,background:"rgba(255,255,255,0.15)" }}>
          <div style={{ height:"100%",background:"rgba(255,255,255,0.9)",width:`${pct}%`,transition:"width 0.8s ease" }} />
        </div>
      </div>

      {/* Bottom */}
      <div style={{ padding:"16px 20px" }}>
        {next && (
          <div style={{ display:"flex",alignItems:"center",gap:10,background:"#F9FAFB",borderRadius:12,padding:"10px 14px",marginBottom:12 }}>
            <div style={{ width:7,height:7,borderRadius:"50%",background:s.accent,flexShrink:0 }} />
            <span style={{ fontSize:12,color:"#6B7280" }}>Next: </span>
            <span style={{ fontSize:12,fontWeight:600,color:"#111827",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{next.title}</span>
            <span style={{ fontSize:11,color:"#9CA3AF",fontWeight:600,flexShrink:0 }}>{pct}%</span>
          </div>
        )}
        <div style={{ display:"flex",gap:10 }}>
          <Link href="/courses" style={{ textDecoration:"none",flex:1 }}>
            <div style={{ padding:"12px",borderRadius:14,border:"1.5px solid #E5E7EB",textAlign:"center",fontSize:13,fontWeight:600,color:"#4B5563",cursor:"pointer" }}>
              All courses
            </div>
          </Link>
          <Link href={`/courses/${activeCourse.id}`} style={{ textDecoration:"none",flex:2 }}>
            <div style={{ padding:"12px",borderRadius:14,background:s.grad,textAlign:"center",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:`0 4px 14px ${s.accent}55` }}>
              <Play size={13} fill="#fff" color="#fff" />
              {pct > 0 ? "Continue learning" : "Start course"}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
