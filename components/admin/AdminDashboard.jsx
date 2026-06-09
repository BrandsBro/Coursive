"use client";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { BookOpen, Trophy, TrendingUp, Users, ArrowRight, Plus } from "lucide-react";

export default function AdminDashboard({ courses, challenges }) {
  const totalLessons = courses.reduce((sum, c) => sum + c.units.flatMap(u => u.lessons).length, 0);
  const totalDays = challenges.reduce((sum, c) => sum + c.days, 0);

  const stats = [
    { icon:<BookOpen size={20}/>, value:courses.length,    label:"Total Courses",    color:"#6366f1", bg:"#EEF2FF", href:"/admin/courses"    },
    { icon:<Trophy size={20}/>,   value:challenges.length,  label:"Challenges",       color:"#f59e0b", bg:"#FFFBEB", href:"/admin/challenges" },
    { icon:<TrendingUp size={20}/>,value:totalLessons,      label:"Total Lessons",    color:"#10b981", bg:"#ECFDF5", href:"/admin/courses"    },
    { icon:<Users size={20}/>,    value:totalDays,          label:"Challenge Days",   color:"#ec4899", bg:"#FDF2F8", href:"/admin/challenges" },
  ];

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:"#0f172a", margin:0 }}>Dashboard</h1>
          <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>Manage your Coursiv content</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {stats.map((s, i) => (
            <Link key={i} href={s.href} style={{ textDecoration:"none" }}>
              <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"20px", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=s.color+"40"; e.currentTarget.style.boxShadow=`0 4px 16px ${s.color}15`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#F1F5F9"; e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ width:40,height:40,borderRadius:12,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,color:s.color }}>{s.icon}</div>
                <div style={{ fontSize:28,fontWeight:900,color:"#0f172a",lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:12,color:"#94A3B8",marginTop:4 }}>{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:"24px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:0 }}>Courses</h2>
              <Link href="/admin/courses" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13, fontWeight:600, color:"#6366f1" }}>Manage <ArrowRight size={13}/></Link>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {courses.slice(0,5).map(c => (
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:10, background:"#F8FAFC" }}>
                  <span style={{ fontSize:18 }}>{c.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</p>
                    <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{c.units.flatMap(u=>u.lessons).length} lessons</p>
                  </div>
                </div>
              ))}
              <Link href="/admin/courses" style={{ textDecoration:"none" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:10, border:"1.5px dashed #E2E8F0", color:"#6366f1", fontSize:13, fontWeight:600, cursor:"pointer", marginTop:4 }}>
                  <Plus size={14}/> Add course
                </div>
              </Link>
            </div>
          </div>

          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:"24px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:0 }}>Challenges</h2>
              <Link href="/admin/challenges" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13, fontWeight:600, color:"#f59e0b" }}>Manage <ArrowRight size={13}/></Link>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {challenges.map(ch => (
                <div key={ch.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:10, background:"#F8FAFC" }}>
                  <span style={{ fontSize:18 }}>{ch.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ch.title}</p>
                    <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{ch.days} days</p>
                  </div>
                </div>
              ))}
              <Link href="/admin/challenges" style={{ textDecoration:"none" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:10, border:"1.5px dashed #E2E8F0", color:"#f59e0b", fontSize:13, fontWeight:600, cursor:"pointer", marginTop:4 }}>
                  <Plus size={14}/> Add challenge
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
