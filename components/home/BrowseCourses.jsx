"use client";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

const STYLES = {
  "canva-ai":             { g:"linear-gradient(135deg,#ec4899,#8b5cf6)", e:"🎨" },
  "midjourney":           { g:"linear-gradient(135deg,#6366f1,#0ea5e9)", e:"🖼️" },
  "communicating-with-ai":{ g:"linear-gradient(135deg,#f97316,#fbbf24)", e:"💬" },
  "kling":                { g:"linear-gradient(135deg,#ec4899,#f43f5e)", e:"🎬" },
  "lovable":              { g:"linear-gradient(135deg,#10b981,#06b6d4)", e:"💻" },
  "chatgpt":              { g:"linear-gradient(135deg,#10a37f,#0ea5e9)", e:"🤖" },
  "notion-ai":            { g:"linear-gradient(135deg,#6b7280,#374151)", e:"📓" },
};

export default function BrowseCourses({ courses = [] }) {
  const { getCoursePercent } = useProgress();

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Browse Courses</h2>
          <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Pick a course · Learn at your pace</p>
        </div>
        <Link href="/courses" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:700, color:"#6366f1", background:"#EEF2FF", padding:"9px 18px", borderRadius:12 }}>
          View all <ArrowRight size={14}/>
        </Link>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:16 }}>
        {courses.map(course => {
          const s = STYLES[course.id] || { g:"linear-gradient(135deg,#6366f1,#8b5cf6)", e:"📚" };
          const total = (course.units||[]).flatMap(u=>u.lessons||[]).length;
          const pct = getCoursePercent(course.id, total);
          const done = pct === 100;

          return (
            <Link key={course.id} href={"/courses/"+course.id} style={{ textDecoration:"none" }}>
              <div style={{ background:"#fff", borderRadius:20, overflow:"hidden", border:"1.5px solid #F1F5F9", transition:"all 0.2s", cursor:"pointer" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,0.1)"; e.currentTarget.style.borderColor="#E0E7FF"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; e.currentTarget.style.borderColor="#F1F5F9"; }}>

                {/* Gradient header */}
                <div style={{ background:s.g, height:120, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }}/>
                  <div style={{ position:"absolute", bottom:-20, left:-20, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>
                  <span style={{ fontSize:48, position:"relative", zIndex:1 }}>{s.e}</span>
                  {done && (
                    <div style={{ position:"absolute", top:10, right:10, background:"#22c55e", color:"#fff", fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:999, letterSpacing:0.5 }}>✓ DONE</div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding:"14px 16px 16px" }}>
                  <h3 style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:"0 0 4px", lineHeight:1.3 }}>{course.title}</h3>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:pct>0?10:0 }}>
                    <span style={{ fontSize:11, color:"#94A3B8", display:"flex", alignItems:"center", gap:3 }}>
                      <BookOpen size={10}/> {total} lessons
                    </span>
                    <span style={{ fontSize:11, color:"#94A3B8", display:"flex", alignItems:"center", gap:3 }}>
                      <Clock size={10}/> {course.hours}h
                    </span>
                  </div>
                  {pct > 0 && (
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:10, color:"#94A3B8" }}>Progress</span>
                        <span style={{ fontSize:10, fontWeight:700, color:"#6366f1" }}>{pct}%</span>
                      </div>
                      <div style={{ background:"#F1F5F9", borderRadius:999, height:5, overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:999, background:s.g, width:pct+"%", transition:"width 0.6s" }}/>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        .browse-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap:16px; }
        @media (max-width: 640px) {
          .browse-grid { grid-template-columns: repeat(2, 1fr); gap:12px; }
        }
      `}</style>
    </div>
  );
}
