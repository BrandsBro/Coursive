"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Clock, Trophy, ArrowRight, CheckCircle2, Play } from "lucide-react";

import { useProgress } from "@/hooks/useProgress";

const CATS = ["All", "Design", "Productivity", "Video", "No Code"];

const S = {
  "canva-ai":             { g:"linear-gradient(135deg,#ec4899,#8b5cf6)", e:"🎨", a:"#8b5cf6", al:"rgba(139,92,246,0.12)" },
  "midjourney":           { g:"linear-gradient(135deg,#6366f1,#0ea5e9)", e:"🖼️", a:"#6366f1", al:"rgba(99,102,241,0.12)" },
  "communicating-with-ai":{ g:"linear-gradient(135deg,#f97316,#fbbf24)", e:"💬", a:"#f97316", al:"rgba(249,115,22,0.12)" },
  "kling":                { g:"linear-gradient(135deg,#ec4899,#f43f5e)", e:"🎬", a:"#ec4899", al:"rgba(236,72,153,0.12)" },
  "lovable":              { g:"linear-gradient(135deg,#10b981,#06b6d4)", e:"💻", a:"#10b981", al:"rgba(16,185,129,0.12)" },
  "chatgpt":              { g:"linear-gradient(135deg,#10a37f,#0ea5e9)", e:"🤖", a:"#10a37f", al:"rgba(16,163,127,0.12)" },
  "notion-ai":            { g:"linear-gradient(135deg,#6b7280,#374151)", e:"📓", a:"#6b7280", al:"rgba(107,114,128,0.12)" },
};

export default function CoursesList({ courses = [] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const { getCoursePercent } = useProgress();

  const filtered = courses.filter(c => {
    const mQ = !q || c.title.toLowerCase().includes(q.toLowerCase()) || c.description.toLowerCase().includes(q.toLowerCase());
    const mC = cat === "All" || c.category === cat;
    return mQ && mC;
  });

  const inProgress = courses.filter(c => {
    const total = c.units.flatMap(u => u.lessons).length;
    const pct = getCoursePercent(c.id, total);
    return pct > 0 && pct < 100;
  }).length;

  const completed = courses.filter(c => {
    const total = c.units.flatMap(u => u.lessons).length;
    return getCoursePercent(c.id, total) === 100;
  }).length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

      {/* ── Hero ── */}
      <div style={{
        background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#0f2744 100%)",
        borderRadius:24,padding:"36px 40px",position:"relative",overflow:"hidden",
      }}>
        <div style={{ position:"absolute",top:-60,right:80,width:220,height:220,borderRadius:"50%",background:"rgba(99,102,241,0.08)" }} />
        <div style={{ position:"absolute",bottom:-40,left:100,width:140,height:140,borderRadius:"50%",background:"rgba(139,92,246,0.07)" }} />
        <div style={{ position:"absolute",top:20,right:220,width:5,height:5,borderRadius:"50%",background:"#818cf8",opacity:0.8 }} />
        <div style={{ position:"absolute",top:40,right:180,width:3,height:3,borderRadius:"50%",background:"#a78bfa",opacity:0.5 }} />

        <div style={{ position:"relative",zIndex:1 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(99,102,241,0.2)",borderRadius:8,padding:"4px 12px",marginBottom:14 }}>
            <BookOpen size={12} color="#a5b4fc" />
            <span style={{ color:"#a5b4fc",fontSize:11,fontWeight:700,letterSpacing:0.8 }}>AI COURSES</span>
          </div>
          <h1 style={{ color:"#fff",fontSize:30,fontWeight:900,margin:"0 0 8px",lineHeight:1.2 }}>
            Learn the tools<br />
            <span style={{ color:"#818cf8" }}>shaping the future.</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.45)",fontSize:14,margin:"0 0 24px",maxWidth:420 }}>
            Practical, bite-sized courses on the AI tools that matter. Learn at your own pace.
          </p>

          {/* Stats row */}
          <div style={{ display:"flex",gap:28 }}>
            {[
              [courses.length, "Total courses"],
              [inProgress, "In progress"],
              [completed, "Completed"],
            ].map(([v, l]) => (
              <div key={l}>
                <div style={{ color:"#fff",fontSize:24,fontWeight:900,lineHeight:1 }}>{v}</div>
                <div style={{ color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div style={{ display:"flex",flexWrap:"wrap",gap:10,alignItems:"center" }}>
        {/* Search */}
        <div style={{ position:"relative",flex:1,minWidth:200 }}>
          <Search size={15} color="#94A3B8" style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search courses..."
            style={{
              width:"100%",boxSizing:"border-box",
              paddingLeft:40,paddingRight:16,paddingTop:11,paddingBottom:11,
              borderRadius:14,border:"1.5px solid #E2E8F0",
              fontSize:13,outline:"none",background:"#fff",color:"#0f172a",
              boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
            }}
            onFocus={e => { e.target.style.borderColor="#5B4EFF"; e.target.style.boxShadow="0 0 0 3px rgba(91,78,255,0.1)"; }}
            onBlur={e => { e.target.style.borderColor="#E2E8F0"; e.target.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"; }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding:"9px 18px",borderRadius:999,fontSize:13,fontWeight:600,cursor:"pointer",
              border: cat===c ? "none" : "1.5px solid #E2E8F0",
              background: cat===c ? "#5B4EFF" : "#fff",
              color: cat===c ? "#fff" : "#64748B",
              boxShadow: cat===c ? "0 4px 12px rgba(91,78,255,0.3)" : "none",
              transition:"all 0.15s",
            }}>
              {c}
            </button>
          ))}
        </div>

        <span style={{ color:"#94A3B8",fontSize:13,marginLeft:"auto",flexShrink:0 }}>
          {filtered.length} course{filtered.length!==1?"s":""}
        </span>
      </div>

      {/* ── In-progress section ── */}
      {cat === "All" && !q && inProgress > 0 && (
        <div>
          <h2 style={{ fontSize:17,fontWeight:800,color:"#0f172a",margin:"0 0 14px" }}>Continue learning</h2>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14 }}>
            {courses.filter(c => {
              const total = c.units.flatMap(u => u.lessons).length;
              const pct = getCoursePercent(c.id, total);
              return pct > 0 && pct < 100;
            }).map(course => <CourseCard key={course.id} course={course} getCoursePercent={getCoursePercent} isHighlighted />)}
          </div>
        </div>
      )}

      {/* ── All courses grid ── */}
      <div>
        {cat === "All" && !q && inProgress > 0 && (
          <h2 style={{ fontSize:17,fontWeight:800,color:"#0f172a",margin:"0 0 14px" }}>All courses</h2>
        )}

        {filtered.length > 0 ? (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16 }}>
            {filtered.map(course => (
              <CourseCard key={course.id} course={course} getCoursePercent={getCoursePercent} />
            ))}
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"64px 20px",textAlign:"center" }}>
            <div style={{ fontSize:52,marginBottom:16 }}>🔍</div>
            <h3 style={{ fontSize:18,fontWeight:800,color:"#0f172a",margin:"0 0 6px" }}>No courses found</h3>
            <p style={{ fontSize:14,color:"#94A3B8",margin:0 }}>Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, getCoursePercent, isHighlighted }) {
  const s = S[course.id] || { g:"linear-gradient(135deg,#6366f1,#8b5cf6)", e:"📚", a:"#6366f1", al:"rgba(99,102,241,0.1)" };
  const total = course.units.flatMap(u => u.lessons).length;
  const pct = getCoursePercent(course.id, total);
  const isDone = pct === 100;
  const isStarted = pct > 0;

  return (
    <Link href={`/courses/${course.id}`} style={{ textDecoration:"none" }}>
      <div
        style={{
          background:"#fff",borderRadius:22,overflow:"hidden",cursor:"pointer",
          border: isHighlighted ? `1.5px solid ${s.a}40` : "1.5px solid #F1F5F9",
          boxShadow: isHighlighted ? `0 4px 20px ${s.a}18` : "0 2px 8px rgba(0,0,0,0.05)",
          transition:"all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.boxShadow=`0 16px 40px ${s.a}25`; e.currentTarget.style.borderColor=`${s.a}40`; }}
        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=isHighlighted?`0 4px 20px ${s.a}18`:"0 2px 8px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor=isHighlighted?`${s.a}40`:"#F1F5F9"; }}
      >
        {/* Hero */}
        <div style={{ background:s.g,height:155,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 22px",position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:-30,right:-30,width:130,height:130,borderRadius:"50%",background:"rgba(255,255,255,0.09)" }} />
          <div style={{ position:"absolute",bottom:-20,left:40,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.06)" }} />
          
          <span style={{ fontSize:52,position:"relative",zIndex:1,filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>{s.e}</span>

          <div style={{ position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6 }}>
            <span style={{ background:"rgba(255,255,255,0.22)",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:999,letterSpacing:0.5 }}>
              {course.level}
            </span>
            {isDone && (
              <div style={{ background:"rgba(34,197,94,0.9)",borderRadius:999,padding:"3px 10px",display:"flex",alignItems:"center",gap:4 }}>
                <CheckCircle2 size={10} color="#fff" />
                <span style={{ color:"#fff",fontSize:10,fontWeight:700 }}>Complete</span>
              </div>
            )}
            {isStarted && !isDone && (
              <div style={{ background:"rgba(255,255,255,0.18)",borderRadius:999,padding:"3px 10px" }}>
                <span style={{ color:"#fff",fontSize:10,fontWeight:700 }}>{pct}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:"18px 20px 20px" }}>
          <h3 style={{ fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 4px",lineHeight:1.3 }}>{course.title}</h3>
          <p style={{ fontSize:13,color:"#64748B",margin:"0 0 14px",lineHeight:1.55,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>
            {course.description}
          </p>

          {/* Meta pills */}
          <div style={{ display:"flex",gap:6,marginBottom:14,flexWrap:"wrap" }}>
            {[
              { icon:<BookOpen size={10} color={s.a} />, text:`${total} lessons` },
              { icon:<Clock size={10} color={s.a} />, text:`${course.hours}h` },
              { icon:<Trophy size={10} color={s.a} />, text:course.category },
            ].map((m, i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:4,background:s.al,borderRadius:8,padding:"4px 9px" }}>
                {m.icon}
                <span style={{ fontSize:11,fontWeight:600,color:s.a }}>{m.text}</span>
              </div>
            ))}
          </div>

          {/* Progress or CTA */}
          {isStarted ? (
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                <span style={{ fontSize:11,color:"#94A3B8" }}>
                  {isDone ? "Completed!" : "In progress"}
                </span>
                <span style={{ fontSize:11,fontWeight:700,color:s.a }}>{pct}%</span>
              </div>
              <div style={{ background:"#F1F5F9",borderRadius:999,height:5,overflow:"hidden" }}>
                <div style={{ height:5,borderRadius:999,background:s.g,width:`${pct}%`,transition:"width 0.6s" }} />
              </div>
            </div>
          ) : (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:s.al,borderRadius:13,padding:"11px 14px" }}>
              <span style={{ fontSize:13,fontWeight:700,color:s.a }}>Start course</span>
              <div style={{ width:26,height:26,borderRadius:"50%",background:s.g,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Play size={12} color="#fff" fill="#fff" />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
