import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Users, BookOpen, Trophy, TrendingUp, Flame, Star, FileText, HardDrive } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

import AdminDashboard from "@/components/admin/AdminDashboard";
export default function Page() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [
      { count: userCount },
      { count: lessonCount },
      { count: certCount },
      { count: reviewCount },
      { data: users },
      { data: progress },
      { data: courses },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count:"exact", head:true }),
      supabase.from("lesson_progress").select("*", { count:"exact", head:true }),
      supabase.from("certificates").select("*", { count:"exact", head:true }),
      supabase.from("course_reviews").select("*", { count:"exact", head:true }),
      supabase.from("profiles").select("id,full_name,email,created_at,is_admin").order("created_at", { ascending:false }).limit(5),
      supabase.from("lesson_progress").select("course_id"),
      supabase.from("courses").select("id,title,emoji,gradient_from,gradient_to"),
    ]);

    setStats({ userCount, lessonCount, certCount, reviewCount });
    setRecentUsers(users || []);

    // Top courses by completions
    const countMap = {};
    (progress || []).forEach(p => { countMap[p.course_id] = (countMap[p.course_id]||0)+1; });
    const sorted = Object.entries(countMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
    setTopCourses(sorted.map(([id, count]) => ({
      ...(courses||[]).find(c=>c.id===id),
      completions: count,
    })).filter(Boolean));

    setLoading(false);
  };

  const STAT_CARDS = [
    { label:"Total Users",       value:stats?.userCount,   icon:<Users size={20}/>,     color:"#6366f1", bg:"#EEF2FF" },
    { label:"Lessons Completed", value:stats?.lessonCount, icon:<BookOpen size={20}/>,  color:"#0891b2", bg:"#ECFEFF" },
    { label:"Certificates",      value:stats?.certCount,   icon:<Trophy size={20}/>,    color:"#d97706", bg:"#FFFBEB" },
    { label:"Reviews",           value:stats?.reviewCount, icon:<Star size={20}/>,      color:"#db2777", bg:"#FDF2F8" },
  ];

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Dashboard</h1>
          <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>Platform overview</p>
        </div>

        {/* Stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {STAT_CARDS.map(({ label, value, icon, color, bg }) => (
            <div key={label} style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", padding:"20px 22px" }}>
              <div style={{ width:44, height:44, borderRadius:13, background:bg, display:"flex", alignItems:"center", justifyContent:"center", color, marginBottom:14 }}>{icon}</div>
              <p style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 2px" }}>{loading?"—":value?.toLocaleString()}</p>
              <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>{label}</p>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          {/* Recent users */}
          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
            <div style={{ padding:"18px 20px", borderBottom:"1px solid #F1F5F9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>Recent Users</h3>
              <Link href="/admin/users" style={{ fontSize:12, fontWeight:700, color:"#6366f1", textDecoration:"none" }}>View all →</Link>
            </div>
            {recentUsers.map((u,i) => (
              <div key={u.id} style={{ padding:"12px 20px", display:"flex", alignItems:"center", gap:12, borderBottom:i<recentUsers.length-1?"1px solid #F8FAFC":"none" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, flexShrink:0 }}>
                  {(u.full_name||u.email||"?")[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.full_name||"No name"}</p>
                  <p style={{ fontSize:11, color:"#94A3B8", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
                </div>
                {u.is_admin && <span style={{ fontSize:10, fontWeight:700, background:"#EEF2FF", color:"#6366f1", padding:"2px 8px", borderRadius:999 }}>Admin</span>}
              </div>
            ))}
          </div>

          {/* Top courses */}
          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
            <div style={{ padding:"18px 20px", borderBottom:"1px solid #F1F5F9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>Top Courses</h3>
              <Link href="/admin/analytics" style={{ fontSize:12, fontWeight:700, color:"#6366f1", textDecoration:"none" }}>Analytics →</Link>
            </div>
            {topCourses.map((c,i) => (
              <div key={c.id} style={{ padding:"12px 20px", display:"flex", alignItems:"center", gap:12, borderBottom:i<topCourses.length-1?"1px solid #F8FAFC":"none" }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${c.gradient_from},${c.gradient_to})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{c.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                    <div style={{ flex:1, height:4, background:"#F1F5F9", borderRadius:999, maxWidth:120 }}>
                      <div style={{ height:"100%", borderRadius:999, background:`linear-gradient(135deg,${c.gradient_from},${c.gradient_to})`, width:`${Math.min(100,(c.completions/Math.max(...topCourses.map(x=>x.completions)))*100)}%` }}/>
                    </div>
                    <span style={{ fontSize:11, color:"#94A3B8" }}>{c.completions} completions</span>
                  </div>
                </div>
              </div>
            ))}
            {topCourses.length===0 && <p style={{ padding:20, color:"#94A3B8", fontSize:13, textAlign:"center" }}>No data yet</p>}
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { href:"/admin/users",    icon:<Users size={18}/>,     label:"Manage Users",   color:"#6366f1" },
            { href:"/admin/analytics",icon:<TrendingUp size={18}/>, label:"Analytics",     color:"#0891b2" },
            { href:"/admin/media",    icon:<HardDrive size={18}/>,  label:"Media Library",  color:"#059669" },
            { href:"/admin/settings", icon:<FileText size={18}/>,   label:"Settings",      color:"#d97706" },
          ].map(({ href, icon, label, color }) => (
            <Link key={href} href={href} style={{ textDecoration:"none" }}>
              <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"18px 16px", display:"flex", alignItems:"center", gap:12, transition:"all 0.15s", cursor:"pointer" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=color;e.currentTarget.style.boxShadow=`0 4px 14px ${color}20`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#F1F5F9";e.currentTarget.style.boxShadow="none";}}>
                <div style={{ width:38, height:38, borderRadius:11, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>{icon}</div>
                <span style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
