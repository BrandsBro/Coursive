"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

const STYLES = {
  "canva-ai":             { g:"linear-gradient(135deg,#ec4899,#8b5cf6)", e:"🎨", a:"#8b5cf6" },
  "midjourney":           { g:"linear-gradient(135deg,#6366f1,#0ea5e9)", e:"🖼️", a:"#6366f1" },
  "communicating-with-ai":{ g:"linear-gradient(135deg,#f97316,#fbbf24)", e:"💬", a:"#f97316" },
  "kling":                { g:"linear-gradient(135deg,#ec4899,#f43f5e)", e:"🎬", a:"#ec4899" },
  "lovable":              { g:"linear-gradient(135deg,#10b981,#06b6d4)", e:"💻", a:"#10b981" },
  "chatgpt":              { g:"linear-gradient(135deg,#10a37f,#0ea5e9)", e:"🤖", a:"#10a37f" },
  "notion-ai":            { g:"linear-gradient(135deg,#6b7280,#374151)", e:"📓", a:"#6b7280" },
};

export default function BrowseCourses({ courses = [] }) {
  const { getCoursePercent } = useProgress();
  const visible = courses.slice(0, 5);

  return (
    <>
      <div>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <div>
            <h2 style={{ fontSize:21, fontWeight:900, color:"#0f172a", margin:"0 0 2px" }}>Explore AI tools</h2>
            <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Pick a course · Learn at your pace</p>
          </div>
          <Link href="/courses" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:5, fontSize:13, fontWeight:600, color:"#6366f1", background:"#EEF0FF", padding:"9px 18px", borderRadius:14, flexShrink:0 }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        <div className="courses-grid">
          {visible.map((course, index) => {
            const s = STYLES[course.id] || { g:"linear-gradient(135deg,#6366f1,#8b5cf6)", e:"📚", a:"#6366f1" };
            const total = (course.units || []).flatMap(u => u.lessons || []).length;
            const pct = getCoursePercent(course.id, total);

            return (
              <Link
                key={course.id}
                href={"/courses/" + course.id}
                style={{ textDecoration:"none", display:"block" }}
                className={index >= 2 ? "hide-mobile" : ""}
              >
                <div className="course-card">
                  {/* Thumbnail */}
                  <div style={{
                    borderRadius:"12px 12px 0 0",
                    overflow:"hidden",
                    height:140,
                    background: course.imageUrl ? `url(${course.imageUrl}) center/cover` : s.g,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    fontSize:44,
                    position:"relative",
                  }}>
                    {!course.imageUrl && s.e}
                    {pct === 100 && (
                      <div style={{ position:"absolute", top:8, right:8, background:"#22C55E", color:"#fff", fontSize:8, fontWeight:700, padding:"2px 7px", borderRadius:999 }}>✓ DONE</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding:"12px 14px 14px" }}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:"0 0 3px", lineHeight:1.3 }}>{course.title}</h3>
                    <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 10px" }}>{total} lessons • {course.hours} hours</p>

                    {/* Progress bar */}
                    <div style={{ background:"#E5E7EB", borderRadius:999, height:5, overflow:"hidden" }}>
                      <div style={{
                        height:"100%",
                        borderRadius:999,
                        background: pct > 0 ? s.a : "#6366f1",
                        width: pct > 0 ? `${pct}%` : "100%",
                        opacity: pct > 0 ? 1 : 0.2,
                        transition:"width 0.6s",
                      }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        .course-card {
          background: #fff;
          border: 1.5px solid #E5E7EB;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
          height: 100%;
        }
        .course-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        @media (max-width: 768px) {
          .courses-grid {
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
