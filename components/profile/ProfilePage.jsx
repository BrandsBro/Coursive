"use client";
import AvatarUpload from "@/components/profile/AvatarUpload";
import CertificateGenerator from "@/components/courses/CertificateGenerator";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Award, Flame, BookOpen, Trophy, Target, TrendingUp, CheckCircle2, ArrowRight, Download, Calendar } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { courses } from "@/data/courses";
import { challenges } from "@/data/challenges";

const COURSE_STYLES = {
  "canva-ai":             { g:"linear-gradient(135deg,#ec4899,#8b5cf6)", e:"🎨", a:"#8b5cf6" },
  "midjourney":           { g:"linear-gradient(135deg,#6366f1,#0ea5e9)", e:"🖼️", a:"#6366f1" },
  "communicating-with-ai":{ g:"linear-gradient(135deg,#f97316,#fbbf24)", e:"💬", a:"#f97316" },
  "kling":                { g:"linear-gradient(135deg,#ec4899,#f43f5e)", e:"🎬", a:"#ec4899" },
  "lovable":              { g:"linear-gradient(135deg,#10b981,#06b6d4)", e:"💻", a:"#10b981" },
  "chatgpt":              { g:"linear-gradient(135deg,#10a37f,#0ea5e9)", e:"🤖", a:"#10a37f" },
  "notion-ai":            { g:"linear-gradient(135deg,#6b7280,#374151)", e:"📓", a:"#6b7280" },
};

const CH_STYLES = [
  { g:"linear-gradient(135deg,#667eea,#764ba2)", a:"#7c3aed" },
  { g:"linear-gradient(135deg,#f093fb,#f5576c)", a:"#be185d" },
  { g:"linear-gradient(135deg,#4facfe,#00f2fe)", a:"#0369a1" },
  { g:"linear-gradient(135deg,#43e97b,#38f9d7)", a:"#065f46" },
];

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function ProfilePage() {
  const { user } = useAuth();
  const { getCoursePercent, getCompletedLessons, hasCertificate, getChallengeDayPercent, hasJoinedChallenge } = useProgress();
  const { streak, longestStreak, weeklyActivity } = useStreak();
  const [certCourse, setCertCourse] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("courses");
  const [memberSince, setMemberSince] = useState("");

  // Fetch profile from Supabase
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
    // Format member since date
    if (user.created_at) {
      setMemberSince(new Date(user.created_at).toLocaleDateString("en-US", { month:"long", year:"numeric" }));
    }
  }, [user]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Learner";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);

  // Stats
  const totalLessonsDone = (courses || []).reduce((sum, c) => sum + (getCompletedLessons(c.id) || []).length, 0);
  const certsEarned = (courses || []).filter(c => hasCertificate(c.id)).length;
  const coursesStarted = courses.filter(c => getCoursePercent(c.id, c.units.flatMap(u=>u.lessons).length) > 0).length;
  const challengesJoined = (challenges || []).filter(c => hasJoinedChallenge(c.id)).length;

  const completedCourses = (courses || []).filter(c => getCoursePercent(c.id, c.units.flatMap(u=>u.lessons).length) === 100);
  const inProgressCourses = (courses || []).filter(c => { const p = getCoursePercent(c.id, c.units.flatMap(u=>u.lessons).length); return p > 0 && p < 100; });
  const notStarted = courses.filter(c => getCoursePercent(c.id, c.units.flatMap(u=>u.lessons).length) === 0);



  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Graduate";

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:24,maxWidth:900,margin:"0 auto" }}>

      {/* ── Hero ── */}
      <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81,#1e3a5f)",borderRadius:24,padding:"32px 36px",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-50,right:60,width:200,height:200,borderRadius:"50%",background:"rgba(139,92,246,0.08)" }} />
        <div style={{ position:"absolute",bottom:-30,left:120,width:130,height:130,borderRadius:"50%",background:"rgba(99,102,241,0.07)" }} />

        <div style={{ position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap" }}>
          {/* Avatar */}
          <div style={{ width:72,height:72,borderRadius:22,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:"#fff",boxShadow:"0 8px 24px rgba(124,58,237,0.4)",flexShrink:0 }}>
            {initials}
          </div>

          <div style={{ flex:1,minWidth:200 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:3,flexWrap:"wrap" }}>
              <h1 style={{ color:"#fff",fontSize:22,fontWeight:900,margin:0 }}>{displayName}</h1>
              {certsEarned > 0 && (
                <div style={{ background:"rgba(167,139,250,0.2)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:999,padding:"3px 10px",display:"flex",alignItems:"center",gap:5 }}>
                  <Award size={11} color="#a78bfa" />
                  <span style={{ color:"#a78bfa",fontSize:11,fontWeight:700 }}>{certsEarned} Cert{certsEarned>1?"s":""}</span>
                </div>
              )}
            </div>
            <p style={{ color:"rgba(255,255,255,0.4)",fontSize:13,margin:"0 0 14px" }}>
              {user?.email} {memberSince && `· Member since ${memberSince}`}
            </p>
            {/* Streak */}
            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
              <div style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(249,115,22,0.2)",borderRadius:10,padding:"4px 10px" }}>
                <Flame size={14} color="#fb923c" fill="#fb923c" />
                <span style={{ color:"#fb923c",fontWeight:700,fontSize:13 }}>{streak} day streak</span>
              </div>
              <div style={{ display:"flex",gap:4 }}>
                {DAYS.map((d, i) => (
                  <div key={d} style={{ width:24,height:24,borderRadius:7,background:weeklyActivity[i]?"#f97316":"rgba(255,255,255,0.08)",border:weeklyActivity[i]?"none":"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    {weeklyActivity[i]
                      ? <CheckCircle2 size={13} color="#fff" />
                      : <span style={{ fontSize:8,color:"rgba(255,255,255,0.3)",fontWeight:600 }}>{d[0]}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sign out */}
          <Link href="/login" onClick={async () => { await supabase.auth.signOut(); }} style={{ textDecoration:"none" }}>
            <div style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"9px 16px",color:"rgba(255,255,255,0.6)",fontSize:13,fontWeight:600,cursor:"pointer",flexShrink:0 }}>
              Sign out
            </div>
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12 }}>
        {[
          { icon:<BookOpen size={18} />, value:totalLessonsDone, label:"Lessons done",    color:"#6366f1", bg:"#EEF2FF" },
          { icon:<Trophy size={18} />,   value:certsEarned,      label:"Certificates",    color:"#f59e0b", bg:"#FFFBEB" },
          { icon:<TrendingUp size={18}/>, value:coursesStarted,  label:"Courses started", color:"#10b981", bg:"#ECFDF5" },
          { icon:<Target size={18} />,   value:challengesJoined, label:"Challenges joined",color:"#ec4899", bg:"#FDF2F8" },
        ].map((s, i) => (
          <div key={i} style={{ background:"#fff",borderRadius:18,border:"1.5px solid #F1F5F9",padding:"18px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ width:42,height:42,borderRadius:12,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:s.color }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize:24,fontWeight:900,color:"#0f172a",lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:12,color:"#94A3B8",marginTop:3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Certificates ── */}
      {certsEarned > 0 && (
        <div>
          <h2 style={{ fontSize:17,fontWeight:800,color:"#0f172a",margin:"0 0 14px",display:"flex",alignItems:"center",gap:8 }}>
            🏆 My Certificates
          </h2>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14 }}>
            {completedCourses.filter(c => hasCertificate(c.id)).map((course) => {
              const s = COURSE_STYLES[course.id] || { g:"linear-gradient(135deg,#6366f1,#8b5cf6)",e:"📚",a:"#6366f1" };
              return (
                <div key={course.id} style={{ background:"#fff",borderRadius:18,overflow:"hidden",border:"1.5px solid #DCFCE7",boxShadow:"0 4px 14px rgba(34,197,94,0.1)" }}>
                  <div style={{ background:s.g,height:90,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",position:"relative",overflow:"hidden" }}>
                    <div style={{ position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.1)" }} />
                    <span style={{ fontSize:40 }}>{s.e}</span>
                    <div style={{ background:"rgba(255,255,255,0.92)",borderRadius:9,padding:"4px 10px",display:"flex",alignItems:"center",gap:4 }}>
                      <Award size={12} color="#f59e0b" />
                      <span style={{ fontSize:10,fontWeight:700,color:"#92400e" }}>Certified</span>
                    </div>
                  </div>
                  <div style={{ padding:"12px 16px 14px" }}>
                    <h3 style={{ fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 2px" }}>{course.title}</h3>
                    <p style={{ fontSize:11,color:"#94A3B8",margin:"0 0 10px" }}>All lessons completed</p>
                    <div style={{ display:"flex",gap:8 }}>
                      <Link href={`/courses/${course.id}`} style={{ textDecoration:"none",flex:1 }}>
                        <div style={{ padding:"8px",borderRadius:9,background:"#F0FDF4",border:"1px solid #BBF7D0",textAlign:"center",fontSize:12,fontWeight:700,color:"#15803D",cursor:"pointer" }}>View</div>
                      </Link>
                      <div style={{ padding:"8px",borderRadius:9,background:"linear-gradient(135deg,#22C55E,#16A34A)",textAlign:"center",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}>
                        <Download size={11} />Download
                      </div>
                    </div>
                  </div>

      {certCourse && (
        <CertificateGenerator
          course={certCourse}
          userName={userName}
          completedDate={new Date().toISOString()}
          onClose={() => setCertCourse(null)}
        />
      )}
                </div>
  );
}