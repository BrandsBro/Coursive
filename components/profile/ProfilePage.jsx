"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Award, Flame, BookOpen, Trophy, Target, TrendingUp,
  CheckCircle2, Lock, Calendar, ArrowRight, Download, Star, RotateCcw
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
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

function StatCard({ icon, value, label, color, bg }) {
  return (
    <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:"20px 22px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ width:46, height:46, borderRadius:14, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize:26, fontWeight:900, color:"#0f172a", lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:12, color:"#94A3B8", marginTop:3, fontWeight:500 }}>{label}</div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { getCoursePercent, getCompletedLessons, hasCertificate, getChallengeCompletedDays, hasJoinedChallenge, getChallengeDayPercent } = useProgress();
  const [activeTab, setActiveTab] = useState("courses");

  // Compute stats
  const totalLessonsDone = courses.reduce((sum, c) => sum + getCompletedLessons(c.id).length, 0);
  const certsEarned = courses.filter(c => hasCertificate(c.id)).length;
  const coursesStarted = courses.filter(c => getCoursePercent(c.id, c.units.flatMap(u=>u.lessons).length) > 0).length;
  const challengesJoined = challenges.filter(c => hasJoinedChallenge(c.id)).length;

  const completedCourses = courses.filter(c => {
    const total = c.units.flatMap(u => u.lessons).length;
    return getCoursePercent(c.id, total) === 100;
  });
  const inProgressCourses = courses.filter(c => {
    const total = c.units.flatMap(u => u.lessons).length;
    const pct = getCoursePercent(c.id, total);
    return pct > 0 && pct < 100;
  });
  const notStarted = courses.filter(c => {
    const total = c.units.flatMap(u => u.lessons).length;
    return getCoursePercent(c.id, total) === 0;
  });

  const completedDays = [true, false, false, false, false, false, false];
  const streak = completedDays.filter(Boolean).length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:900, margin:"0 auto" }}>

      {/* ── Profile Hero ── */}
      <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81,#1e3a5f)", borderRadius:24, padding:"32px 36px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-50,right:60,width:200,height:200,borderRadius:"50%",background:"rgba(139,92,246,0.08)" }} />
        <div style={{ position:"absolute",bottom:-30,left:120,width:130,height:130,borderRadius:"50%",background:"rgba(99,102,241,0.07)" }} />

        <div style={{ position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:24 }}>
          {/* Avatar */}
          <div style={{ width:80,height:80,borderRadius:24,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,boxShadow:"0 8px 24px rgba(124,58,237,0.4)",flexShrink:0 }}>
            🧑‍💻
          </div>

          <div style={{ flex:1 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
              <h1 style={{ color:"#fff",fontSize:24,fontWeight:900,margin:0 }}>AI Learner</h1>
              {certsEarned > 0 && (
                <div style={{ background:"rgba(167,139,250,0.2)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:999,padding:"3px 10px",display:"flex",alignItems:"center",gap:5 }}>
                  <Award size={12} color="#a78bfa" />
                  <span style={{ color:"#a78bfa",fontSize:11,fontWeight:700 }}>{certsEarned} Certificate{certsEarned>1?"s":""}</span>
                </div>
              )}
            </div>
            <p style={{ color:"rgba(255,255,255,0.45)",fontSize:14,margin:"0 0 16px" }}>learner@coursiv.io · Member since 2024</p>

            {/* Weekly streak mini */}
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <Flame size={16} color="#f97316" fill="#f97316" />
              <span style={{ color:"#fff",fontWeight:700,fontSize:14 }}>{streak} day streak</span>
              <div style={{ display:"flex",gap:4,marginLeft:8 }}>
                {DAYS.map((d,i) => (
                  <div key={d} style={{ width:22,height:22,borderRadius:6,background:completedDays[i]?"#f97316":"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    {completedDays[i]
                      ? <CheckCircle2 size={12} color="#fff" />
                      : <span style={{ fontSize:8,color:"rgba(255,255,255,0.3)",fontWeight:600 }}>{d[0]}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit + Settings */}
          <div style={{ display:"flex",gap:8 }}>
            <Link href="/login" style={{ textDecoration:"none" }}>
              <div style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"10px 16px",color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:600,cursor:"pointer" }}>
                Sign out
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:14 }}>
        <StatCard icon={<BookOpen size={20} />} value={totalLessonsDone} label="Lessons completed" color="#6366f1" bg="#EEF2FF" />
        <StatCard icon={<Trophy size={20} />} value={certsEarned} label="Certificates earned" color="#f59e0b" bg="#FFFBEB" />
        <StatCard icon={<TrendingUp size={20} />} value={coursesStarted} label="Courses started" color="#10b981" bg="#ECFDF5" />
        <StatCard icon={<Target size={20} />} value={challengesJoined} label="Challenges joined" color="#ec4899" bg="#FDF2F8" />
      </div>

      {/* ── Certificates ── */}
      {certsEarned > 0 && (
        <div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
            <h2 style={{ fontSize:18,fontWeight:800,color:"#0f172a",margin:0 }}>🏆 My Certificates</h2>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14 }}>
            {completedCourses.filter(c => hasCertificate(c.id)).map((course) => {
              const s = COURSE_STYLES[course.id] || { g:"linear-gradient(135deg,#6366f1,#8b5cf6)", e:"📚", a:"#6366f1" };
              return (
                <div key={course.id} style={{ background:"#fff",borderRadius:20,overflow:"hidden",border:"1.5px solid #F0FDF4",boxShadow:"0 4px 16px rgba(34,197,94,0.1)" }}>
                  <div style={{ background:s.g,height:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",position:"relative",overflow:"hidden" }}>
                    <div style={{ position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.1)" }} />
                    <span style={{ fontSize:44 }}>{s.e}</span>
                    <div style={{ background:"rgba(255,255,255,0.9)",borderRadius:10,padding:"6px 10px",display:"flex",alignItems:"center",gap:5 }}>
                      <Award size={14} color="#f59e0b" />
                      <span style={{ fontSize:11,fontWeight:700,color:"#92400e" }}>Certificate</span>
                    </div>
                  </div>
                  <div style={{ padding:"14px 18px 16px" }}>
                    <h3 style={{ fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 3px" }}>{course.title}</h3>
                    <p style={{ fontSize:12,color:"#94A3B8",margin:"0 0 12px" }}>Completed · All lessons done</p>
                    <div style={{ display:"flex", gap:8 }}>
                      <Link href={`/courses/${course.id}`} style={{ textDecoration:"none",flex:1 }}>
                        <div style={{ padding:"8px",borderRadius:10,background:"#F0FDF4",border:"1px solid #BBF7D0",textAlign:"center",fontSize:12,fontWeight:700,color:"#15803D",cursor:"pointer" }}>
                          View
                        </div>
                      </Link>
                      <div style={{ padding:"8px",borderRadius:10,background:"linear-gradient(135deg,#22C55E,#16A34A)",textAlign:"center",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}>
                        <Download size={12} />
                        Download
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div>
        <div style={{ display:"flex",gap:4,background:"#F1F5F9",borderRadius:14,padding:4,marginBottom:20,width:"fit-content" }}>
          {[["courses","📚 Courses"],["challenges","🔥 Challenges"]].map(([t,l]) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding:"9px 20px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",border:"none",
              background:activeTab===t?"#fff":"transparent",
              color:activeTab===t?"#0f172a":"#64748B",
              boxShadow:activeTab===t?"0 2px 8px rgba(0,0,0,0.08)":"none",
              transition:"all 0.15s",
            }}>
              {l}
            </button>
          ))}
        </div>

        {/* Courses tab */}
        {activeTab === "courses" && (
          <div style={{ display:"flex",flexDirection:"column",gap:20 }}>

            {/* In progress */}
            {inProgressCourses.length > 0 && (
              <div>
                <h3 style={{ fontSize:15,fontWeight:700,color:"#0f172a",margin:"0 0 12px",display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:"#f59e0b" }} />
                  In progress ({inProgressCourses.length})
                </h3>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {inProgressCourses.map(course => <CourseRow key={course.id} course={course} getCoursePercent={getCoursePercent} />)}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedCourses.length > 0 && (
              <div>
                <h3 style={{ fontSize:15,fontWeight:700,color:"#0f172a",margin:"0 0 12px",display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:"#22C55E" }} />
                  Completed ({completedCourses.length})
                </h3>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {completedCourses.map(course => <CourseRow key={course.id} course={course} getCoursePercent={getCoursePercent} />)}
                </div>
              </div>
            )}

            {/* Not started */}
            {notStarted.length > 0 && (
              <div>
                <h3 style={{ fontSize:15,fontWeight:700,color:"#94A3B8",margin:"0 0 12px",display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:"#E2E8F0" }} />
                  Not started ({notStarted.length})
                </h3>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {notStarted.map(course => <CourseRow key={course.id} course={course} getCoursePercent={getCoursePercent} />)}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Challenges tab */}
        {activeTab === "challenges" && (
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {challenges.map((ch, i) => {
              const s = CH_STYLES[i % CH_STYLES.length];
              const joined = hasJoinedChallenge(ch.id);
              const pct = getChallengeDayPercent(ch.id, ch.days);
              const daysDone = Math.round((pct/100)*ch.days);

              return (
                <Link key={ch.id} href={`/challenges/${ch.id}${joined?"?joined=true":""}`} style={{ textDecoration:"none" }}>
                  <div style={{ background:"#fff",borderRadius:18,border:"1.5px solid #F1F5F9",padding:"14px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=`${s.a}30`; e.currentTarget.style.boxShadow=`0 4px 16px ${s.a}15`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="#F1F5F9"; e.currentTarget.style.boxShadow="none"; }}
                  >
                    <div style={{ width:48,height:48,borderRadius:14,background:s.g,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>
                      {ch.emoji}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:2 }}>
                        <h4 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ch.title}</h4>
                        {joined && <span style={{ background:`${s.a}18`,color:s.a,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:999,flexShrink:0 }}>Enrolled</span>}
                      </div>
                      <p style={{ fontSize:12,color:"#94A3B8",margin:"0 0 8px" }}>
                        {joined ? `${daysDone} / ${ch.days} days completed` : `${ch.days} days · ${ch.level}`}
                      </p>
                      {joined && (
                        <div style={{ background:"#F1F5F9",borderRadius:999,height:4,overflow:"hidden" }}>
                          <div style={{ height:4,borderRadius:999,background:s.g,width:`${pct}%`,transition:"width 0.6s" }} />
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
                      {joined && <span style={{ fontSize:13,fontWeight:700,color:s.a }}>{pct}%</span>}
                      <ArrowRight size={16} color="#CBD5E1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

function CourseRow({ course, getCoursePercent }) {
  const s = COURSE_STYLES[course.id] || { g:"linear-gradient(135deg,#6366f1,#8b5cf6)", e:"📚", a:"#6366f1" };
  const total = course.units.flatMap(u => u.lessons).length;
  const pct = getCoursePercent(course.id, total);
  const done = pct === 100;

  return (
    <Link href={`/courses/${course.id}`} style={{ textDecoration:"none" }}>
      <div style={{ background:"#fff",borderRadius:18,border:"1.5px solid #F1F5F9",padding:"14px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor=`${s.a}30`; e.currentTarget.style.boxShadow=`0 4px 16px ${s.a}12`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor="#F1F5F9"; e.currentTarget.style.boxShadow="none"; }}
      >
        <div style={{ width:48,height:48,borderRadius:14,background:s.g,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>
          {s.e}
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
            <h4 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:0 }}>{course.title}</h4>
            {done && (
              <div style={{ display:"flex",alignItems:"center",gap:3,background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:999,padding:"2px 8px" }}>
                <CheckCircle2 size={10} color="#22C55E" />
                <span style={{ fontSize:10,fontWeight:700,color:"#15803D" }}>Complete</span>
              </div>
            )}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ flex:1,background:"#F1F5F9",borderRadius:999,height:5,overflow:"hidden" }}>
              <div style={{ height:5,borderRadius:999,background:s.g,width:`${pct}%`,transition:"width 0.6s" }} />
            </div>
            <span style={{ fontSize:12,fontWeight:700,color:s.a,flexShrink:0,minWidth:28 }}>{pct}%</span>
          </div>
        </div>
        <ArrowRight size={16} color="#CBD5E1" style={{ flexShrink:0 }} />
      </div>
    </Link>
  );
}
