"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

const CATS = ["All", "Design", "Productivity", "Video", "No Code"];

const S = {
  "canva-ai":             { g:"linear-gradient(135deg,#ec4899,#8b5cf6)", e:"🎨", a:"#8b5cf6" },
  "midjourney":           { g:"linear-gradient(135deg,#6366f1,#0ea5e9)", e:"🖼️", a:"#6366f1" },
  "communicating-with-ai":{ g:"linear-gradient(135deg,#f97316,#fbbf24)", e:"💬", a:"#f97316" },
  "kling":                { g:"linear-gradient(135deg,#ec4899,#f43f5e)", e:"🎬", a:"#ec4899" },
  "lovable":              { g:"linear-gradient(135deg,#10b981,#06b6d4)", e:"💻", a:"#10b981" },
  "chatgpt":              { g:"linear-gradient(135deg,#10a37f,#0ea5e9)", e:"🤖", a:"#10a37f" },
  "notion-ai":            { g:"linear-gradient(135deg,#6b7280,#374151)", e:"📓", a:"#6b7280" },
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
    const total = (c.units || []).flatMap(u => u.lessons || []).length;
    const pct = getCoursePercent(c.id, total);
    return pct > 0 && pct < 100;
  }).length;

  const completed = courses.filter(c => {
    const total = c.units.flatMap(u => u.lessons).length;
    return getCoursePercent(c.id, total) === 100;
  }).length;

  return (
    <>
      <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

        {/* Hero */}
        <div style={{
          background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#0f2744 100%)",
          borderRadius:24, padding:"36px 40px", position:"relative", 
        }}>
          <div style={{ position:"absolute", top:-60, right:80, width:220, height:220, borderRadius:"50%", background:"rgba(99,102,241,0.08)" }} />
          <div style={{ position:"absolute", bottom:-40, left:100, width:140, height:140, borderRadius:"50%", background:"rgba(139,92,246,0.07)" }} />
          <div style={{ position:"absolute", top:20, right:220, width:5, height:5, borderRadius:"50%", background:"#818cf8", opacity:0.8 }} />
          <div style={{ position:"absolute", top:40, right:180, width:3, height:3, borderRadius:"50%", background:"#a78bfa", opacity:0.5 }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(99,102,241,0.2)", borderRadius:8, padding:"4px 12px", marginBottom:14 }}>
              <BookOpen size={12} color="#a5b4fc" />
              <span style={{ color:"#a5b4fc", fontSize:11, fontWeight:700, letterSpacing:0.8 }}>AI COURSES</span>
            </div>
            <h1 style={{ color:"#fff", fontSize:30, fontWeight:900, margin:"0 0 8px", lineHeight:1.2 }}>
              Learn the tools<br />
              <span style={{ color:"#818cf8" }}>shaping the future.</span>
            </h1>
            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14, margin:"0 0 24px", maxWidth:420 }}>
              Practical, bite-sized courses on the AI tools that matter. Learn at your own pace.
            </p>
            <div style={{ display:"flex", gap:28 }}>
              {[[courses.length,"Total courses"],[inProgress,"In progress"],[completed,"Completed"]].map(([v,l]) => (
                <div key={l}>
                  <div style={{ color:"#fff", fontSize:24, fontWeight:900, lineHeight:1 }}>{v}</div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginTop:3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <Search size={15} color="#94A3B8" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search courses..."
              style={{
                width:"100%", boxSizing:"border-box",
                paddingLeft:40, paddingRight:16, paddingTop:11, paddingBottom:11,
                borderRadius:14, border:"1.5px solid #E2E8F0",
                fontSize:13, outline:"none", background:"#fff", color:"#0f172a",
                boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
              }}
              onFocus={e => { e.target.style.borderColor="#5B4EFF"; e.target.style.boxShadow="0 0 0 3px rgba(91,78,255,0.1)"; }}
              onBlur={e =>  { e.target.style.borderColor="#E2E8F0"; e.target.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"; }}
            />
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding:"9px 18px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer",
                border: cat===c ? "none" : "1.5px solid #E2E8F0",
                background: cat===c ? "#5B4EFF" : "#fff",
                color: cat===c ? "#fff" : "#64748B",
                boxShadow: cat===c ? "0 4px 12px rgba(91,78,255,0.3)" : "none",
                transition:"all 0.15s",
              }}>{c}</button>
            ))}
          </div>
          <span style={{ color:"#94A3B8", fontSize:13, marginLeft:"auto", flexShrink:0 }}>
            {filtered.length} course{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* In-progress section */}
        {cat === "All" && !q && inProgress > 0 && (
          <div>
            <h2 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 14px" }}>Continue learning</h2>
            <div className="cl-grid">
              {courses.filter(c => {
                const total = c.units.flatMap(u => u.lessons).length;
                const pct = getCoursePercent(c.id, total);
                return pct > 0 && pct < 100;
              }).map(course => <MiniCard key={course.id} course={course} getCoursePercent={getCoursePercent} />)}
            </div>
          </div>
        )}

        {/* All courses grid */}
        <div>
          {cat === "All" && !q && inProgress > 0 && (
            <h2 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 14px" }}>All courses</h2>
          )}
          {filtered.length > 0 ? (
            <div className="cl-grid">
              {filtered.map(course => <MiniCard key={course.id} course={course} getCoursePercent={getCoursePercent} />)}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 20px", textAlign:"center" }}>
              <div style={{ fontSize:52, marginBottom:16 }}>🔍</div>
              <h3 style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>No courses found</h3>
              <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>Try a different search or category</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cl-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        .cl-card {
          cursor: pointer;
          transition: transform 0.18s;
          background: #fff;
  
          border-radius: 14px;
          border: 1.5px solid #E5E7EB;
          overflow: hidden;
        }
        .cl-card:hover {
          transform: translateY(-3px);
        }
        @media (max-width: 1280px) { .cl-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 1024px) { .cl-grid { grid-template-columns: repeat(3, 1fr); gap:12px; } }
        @media (max-width: 640px)  { .cl-grid { grid-template-columns: repeat(2, 1fr); gap:10px; } }
      `}</style>
    </>
  );
}

function MiniCard({ course, getCoursePercent }) {
  const s = S[course.id] || { g:"linear-gradient(135deg,#6366f1,#8b5cf6)", e:"📚", a:"#6366f1" };
  const total = course.units.flatMap(u => u.lessons).length;
  const pct   = getCoursePercent(course.id, total);

  return (
    <Link href={`/courses/${course.id}`} style={{ textDecoration:"none", display:"block" }}>
      <div className="cl-card">

        {/* Thumbnail */}
        <div style={{
        
          height:130,
          background: course.imageUrl ? `url(${course.imageUrl}) center/cover` : s.g,
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          fontSize:44,
   
          position:"relative",
        }}>
          {!course.imageUrl && s.e}
          {pct === 100 && (
            <div style={{ position:"absolute", top:8, right:8, background:"#22C55E", color:"#fff", fontSize:8, fontWeight:700, padding:"2px 7px", borderRadius:999 }}>
              ✓ DONE
            </div>
          )}
        </div>
<div style={{ padding: "12px 14px 14px" }}>
        {/* Info */}
        <h3 style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:"0 0 3px", lineHeight:1.3 }}>
          {course.title}
        </h3>
        <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 10px" }}>
          {total} lessons • {course.hours} hours
        </p>

        {/* Progress bar */}
        <div style={{ background:"#E5E7EB", borderRadius:999, height:5, overflow:"hidden" }}>
          <div style={{
            height:"100%",
            borderRadius:999,
            background: pct > 0 ? s.a : "#6366f1",
            width: pct > 0 ? `${pct}%` : "100%",
            opacity: pct > 0 ? 1 : 0.25,
            transition:"width 0.6s",
          }} />
        </div>
</div>
      </div>
    </Link>
  );
}