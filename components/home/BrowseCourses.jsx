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

  return (
    <>
      <div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 900, color: "#0f172a", margin: "0 0 2px" }}>Browse Courses</h2>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Pick a course · Learn at your pace</p>
          </div>
          <Link href="/courses" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "#5B4EFF", background: "#EEF0FF", padding: "9px 16px", borderRadius: 14 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="courses-grid">
          {courses.map((course) => {
            const s = STYLES[course.id] || { g: "linear-gradient(135deg,#6366f1,#8b5cf6)", e: "📚", a: "#6366f1" };
            const total = (course.units || []).flatMap(u => u.lessons || []).length;
            const pct = getCoursePercent(course.id, total);

            return (
              <Link key={course.id} href={"/courses/" + course.id} style={{ textDecoration: "none" }}>
                <div
                  style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1.5px solid #F0F0F0", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px " + s.a + "30"; e.currentTarget.style.borderColor = s.a + "40"; } }
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#F0F0F0"; } }
                >
                  <div style={{ background: s.g, height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                    <span style={{ position: "relative", zIndex: 1 }}>{s.e}</span>
                    {pct === 100 && (
                      <div style={{ position: "absolute", top: 8, right: 8, background: "#22C55E", color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>✓ DONE</div>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px 14px" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: "0 0 2px", lineHeight: 1.3 }}>{course.title}</h3>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 8px" }}>{total} lessons · {course.hours}h</p>
                    {pct > 0 && (
                      <div style={{ background: "#F1F5F9", borderRadius: 999, height: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 999, background: s.g, width: pct + "%", transition: "width 0.6s" }} />
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
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 14px;
        }
        @media (max-width: 640px) {
          .courses-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
}