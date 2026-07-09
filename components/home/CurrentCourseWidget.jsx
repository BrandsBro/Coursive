"use client";
import Link from "next/link";
import { Play } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

export default function CurrentCourseWidget({ courses = [] }) {
  if (!courses || courses.length === 0) return (
    <div style={{ background:"#fff", borderRadius:20, border:"1px solid #E5E7EB", padding:"40px 24px", textAlign:"center" }}>
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

  const imageUrl = activeCourse.imageUrl || activeCourse.image_url || activeCourse.image || null;
  const gradFrom = activeCourse.gradientFrom || activeCourse.gradient_from || "#6366f1";
  const gradTo   = activeCourse.gradientTo   || activeCourse.gradient_to   || "#8b5cf6";
  const grad     = `linear-gradient(135deg,${gradFrom},${gradTo})`;
  const accent   = gradFrom;
  const emoji    = activeCourse.emoji || "📚";

  const allLessons = activeCourse.units.flatMap(u => u.lessons);
  const total = allLessons.length;
  const pct   = getCoursePercent(activeCourse.id, total);
  const done  = getCompletedLessons(activeCourse.id).length;

  const Thumbnail = ({ size = 88, radius = 14 }) => (
    <div style={{
      width:size, height:size, borderRadius:radius, flexShrink:0,
      overflow:"hidden", background:grad,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize: size * 0.42,
    }}>
      {imageUrl
        ? <img src={imageUrl} alt={activeCourse.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
        : emoji}
    </div>
  );

  const ProgressBar = () => (
    <div style={{ background:"#E5E7EB", borderRadius:999, height:8, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct}%`, background:accent, borderRadius:999, transition:"width 0.8s ease" }}/>
    </div>
  );

  return (
    <>
      {/* DESKTOP */}
      <div className="ccw-desktop" style={{ background:"#fff", borderRadius:20, border:"1px solid #E5E7EB", padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", gap:18, alignItems:"flex-start", marginBottom:20 }}>
          <Thumbnail size={88} radius={14}/>
          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ fontSize:"clamp(18px,3.5vw,22px)", fontWeight:800, color:"#111827", margin:"0 0 6px", lineHeight:1.2 }}>
              {activeCourse.title}
            </h3>
            <p className="course-desc" style={{ fontSize:13, color:"#6B7280", margin:0, lineHeight:1.5, display:"none" }}>
              {activeCourse.description}
            </p>
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <ProgressBar/>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
            <span style={{ fontSize:12, color:"#6B7280" }}>{done}/{total} lessons completed</span>
            <span style={{ fontSize:13, fontWeight:700, color:accent }}>{pct}%</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <Link href="/courses" style={{ textDecoration:"none", flex:1 }}>
            <div style={{ padding:"11px 16px", borderRadius:12, background:`${accent}18`, textAlign:"center", fontSize:13, fontWeight:700, color:accent, cursor:"pointer" }}>
              Other courses
            </div>
          </Link>
          <Link href={`/courses/${activeCourse.id}`} style={{ textDecoration:"none", flex:2 }}>
            <div style={{ padding:"11px 16px", borderRadius:12, background:accent, textAlign:"center", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Play size={13} fill="#fff" color="#fff"/>
              {pct > 0 ? "Continue learning" : "Start course"}
            </div>
          </Link>
        </div>
      </div>

      {/* MOBILE */}
      <div className="ccw-mobile">
        <h2 style={{ fontSize:18, fontWeight:800, color:"#111827", margin:"0 0 14px" }}>Pick up where you left off</h2>
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E5E7EB", padding:"16px", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
          <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:16 }}>
            <Thumbnail size={60} radius={10}/>
            <div style={{ flex:1, minWidth:0 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#111827", margin:0, lineHeight:1.3 }}>{activeCourse.title}</h3>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <ProgressBar/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:7 }}>
              <span style={{ fontSize:12, color:"#6B7280" }}>{done}/{total} lessons completed</span>
              <span style={{ fontSize:13, fontWeight:700, color:accent }}>{pct}%</span>
            </div>
          </div>
          <Link href={`/courses/${activeCourse.id}`} style={{ textDecoration:"none", display:"block" }}>
            <div style={{ padding:"13px", borderRadius:12, background:accent, textAlign:"center", fontSize:14, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Play size={14} fill="#fff" color="#fff"/>
              {pct > 0 ? "Continue learning" : "Start course"}
            </div>
          </Link>
        </div>
      </div>

      <style>{`
        .ccw-mobile { display: none; }
        @media (max-width: 768px) {
          .ccw-desktop { display: none !important; }
          .ccw-mobile  { display: block !important; }
        }
      `}</style>
    </>
  );
}
