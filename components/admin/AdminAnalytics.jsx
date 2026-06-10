"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { TrendingUp, BookOpen, Trophy, Users, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [
      { data: progress },
      { data: courses },
      { data: certs },
      { data: reviews },
      { data: joins },
    ] = await Promise.all([
      supabase.from("lesson_progress").select("course_id, lesson_id, completed_at"),
      supabase.from("courses").select("id, title, emoji, gradient_from, gradient_to"),
      supabase.from("certificates").select("course_id, earned_at"),
      supabase.from("course_reviews").select("course_id, rating"),
      supabase.from("challenge_joins").select("challenge_id, joined_at"),
    ]);

    // Lessons per course
    const lessonMap = {};
    (progress||[]).forEach(p => { lessonMap[p.course_id]=(lessonMap[p.course_id]||0)+1; });

    // Certs per course
    const certMap = {};
    (certs||[]).forEach(c => { certMap[c.course_id]=(certMap[c.course_id]||0)+1; });

    // Avg rating per course
    const ratingMap = {};
    (reviews||[]).forEach(r => {
      if (!ratingMap[r.course_id]) ratingMap[r.course_id]={sum:0,count:0};
      ratingMap[r.course_id].sum+=r.rating;
      ratingMap[r.course_id].count++;
    });

    // Daily signups last 7 days
    const daily = {};
    const now = new Date();
    for (let i=6;i>=0;i--) {
      const d = new Date(now); d.setDate(d.getDate()-i);
      daily[d.toISOString().split("T")[0]] = 0;
    }
    (progress||[]).forEach(p => {
      const day = p.completed_at?.split("T")[0];
      if (day && daily[day]!==undefined) daily[day]++;
    });

    const courseStats = (courses||[]).map(c => ({
      ...c,
      lessons: lessonMap[c.id]||0,
      certs: certMap[c.id]||0,
      rating: ratingMap[c.id] ? (ratingMap[c.id].sum/ratingMap[c.id].count).toFixed(1) : "—",
      reviews: ratingMap[c.id]?.count||0,
    })).sort((a,b)=>b.lessons-a.lessons);

    setData({ courseStats, daily, totalLessons:(progress||[]).length, totalCerts:(certs||[]).length, totalReviews:(reviews||[]).length, totalJoins:(joins||[]).length });
    setLoading(false);
  };

  const maxDaily = data ? Math.max(...Object.values(data.daily), 1) : 1;

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Analytics</h1>
          <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>Platform performance overview</p>
        </div>

        {loading ? (
          <div style={{ padding:60, textAlign:"center" }}><Loader size={28} color="#94A3B8" className="bspin"/></div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
              {[
                { label:"Lessons Done",       value:data.totalLessons,  color:"#6366f1", bg:"#EEF2FF",  icon:<BookOpen size={18}/> },
                { label:"Certificates Issued", value:data.totalCerts,    color:"#d97706", bg:"#FFFBEB",  icon:<Trophy size={18}/> },
                { label:"Reviews Written",     value:data.totalReviews,  color:"#db2777", bg:"#FDF2F8",  icon:<TrendingUp size={18}/> },
                { label:"Challenge Joins",     value:data.totalJoins,    color:"#0891b2", bg:"#ECFEFF",  icon:<Users size={18}/> },
              ].map(({ label, value, color, bg, icon }) => (
                <div key={label} style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", padding:"20px 22px" }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", color, marginBottom:12 }}>{icon}</div>
                  <p style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 2px" }}>{value?.toLocaleString()}</p>
                  <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Activity chart */}
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 20px" }}>Lesson Activity — Last 7 Days</h3>
              <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:140 }}>
                {Object.entries(data.daily).map(([day, count]) => {
                  const h = Math.max(8, (count/maxDaily)*120);
                  const label = new Date(day).toLocaleDateString("en",{weekday:"short"});
                  return (
                    <div key={day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:11, color:"#64748B", fontWeight:700 }}>{count}</span>
                      <div style={{ width:"100%", height:h, borderRadius:"8px 8px 4px 4px", background:"linear-gradient(to top,#6366f1,#818cf8)", transition:"height 0.5s ease" }}/>
                      <span style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course table */}
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
              <div style={{ padding:"18px 20px", borderBottom:"1px solid #F1F5F9" }}>
                <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>Course Performance</h3>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:16, padding:"10px 20px", background:"#F8FAFC", borderBottom:"1px solid #F1F5F9" }}>
                {["Course","Lessons Done","Certificates","Rating","Reviews"].map(h => (
                  <p key={h} style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:0, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</p>
                ))}
              </div>
              {data.courseStats.map((c,i) => (
                <div key={c.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:16, padding:"14px 20px", alignItems:"center", borderBottom:i<data.courseStats.length-1?"1px solid #F8FAFC":"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${c.gradient_from},${c.gradient_to})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{c.emoji}</div>
                    <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</p>
                  </div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#6366f1", margin:0 }}>{c.lessons}</p>
                  <p style={{ fontSize:13, fontWeight:700, color:"#d97706", margin:0 }}>{c.certs}</p>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f59e0b", margin:0 }}>{"⭐ "+c.rating}</p>
                  <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>{c.reviews}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
