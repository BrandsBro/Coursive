"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Flame, BookOpen, Trophy, Target, TrendingUp, CheckCircle2, Download, Settings, Bell, CreditCard, LogOut, ChevronRight, Lock } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { courses } from "@/data/courses";
import { challenges } from "@/data/challenges";
import CertificateGenerator from "@/components/courses/CertificateGenerator";
import PaymentModal from "@/components/quiz/PaymentModal";
import ChangePassword from "@/components/profile/ChangePassword";

const COURSE_STYLES = {
  "canva-ai":             { g:"linear-gradient(135deg,#ec4899,#8b5cf6)", e:"🎨", a:"#8b5cf6" },
  "midjourney":           { g:"linear-gradient(135deg,#6366f1,#0ea5e9)", e:"🖼️", a:"#6366f1" },
  "communicating-with-ai":{ g:"linear-gradient(135deg,#f97316,#fbbf24)", e:"💬", a:"#f97316" },
  "kling":                { g:"linear-gradient(135deg,#ec4899,#f43f5e)", e:"🎬", a:"#ec4899" },
  "lovable":              { g:"linear-gradient(135deg,#10b981,#06b6d4)", e:"💻", a:"#10b981" },
  "chatgpt":              { g:"linear-gradient(135deg,#10a37f,#0ea5e9)", e:"🤖", a:"#10a37f" },
  "notion-ai":            { g:"linear-gradient(135deg,#6b7280,#374151)", e:"📓", a:"#6b7280" },
};

const DAYS = ["M","T","W","T","F","S","S"];
const TABS = ["Overview","Certificates","Courses","Challenges","Subscription","Security"];

export default function ProfilePage() {
  const { user } = useAuth();
  const { getCoursePercent, getCompletedLessons, hasCertificate, hasJoinedChallenge } = useProgress();
  const { streak, longestStreak, weeklyActivity } = useStreak();
  const [tab, setTab] = useState("Overview");
  const [profile, setProfile] = useState(null);
  const [sub, setSub] = useState(null);
  const [certCourse, setCertCourse] = useState(null);
  const [showRenew, setShowRenew] = useState(false);
  const [renewPlan, setRenewPlan] = useState(null);
  const [memberSince, setMemberSince] = useState("");
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) { setProfile(data); setNewName(data.full_name||""); }
    });
    supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending:false }).limit(1).single().then(({ data }) => {
      if (data) setSub(data);
    });
    if (user.created_at) setMemberSince(new Date(user.created_at).toLocaleDateString("en-US",{ month:"long", year:"numeric" }));
  }, [user]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Learner";
  const initials = displayName.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
  const email = user?.email || "";

  const totalLessons = (courses||[]).reduce((s,c) => s + (getCompletedLessons(c.id)||[]).length, 0);
  const certsEarned = (courses||[]).filter(c => hasCertificate(c.id)).length;
  const coursesStarted = courses.filter(c => getCoursePercent(c.id, c.units.flatMap(u=>u.lessons).length) > 0).length;
  const challengesJoined = (challenges||[]).filter(c => hasJoinedChallenge(c.id)).length;
  const completedCourses = (courses||[]).filter(c => getCoursePercent(c.id, c.units.flatMap(u=>u.lessons).length) === 100);
  const inProgressCourses = (courses||[]).filter(c => { const p = getCoursePercent(c.id, c.units.flatMap(u=>u.lessons).length); return p>0 && p<100; });

  const daysLeft = sub ? Math.ceil((new Date(sub.expires_at) - new Date()) / (1000*60*60*24)) : null;

  const saveName = async () => {
    setSaving(true);
    await supabase.from("profiles").update({ full_name: newName }).eq("id", user.id);
    setProfile(prev => ({ ...prev, full_name: newName }));
    setEditName(false);
    setSaving(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div style={{ maxWidth:900, margin:"0 auto", display:"flex", flexDirection:"column", gap:24 }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81,#1e3a5f)", borderRadius:24, padding:"28px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:40, width:220, height:220, borderRadius:"50%", background:"rgba(139,92,246,0.08)" }}/>
        <div style={{ position:"absolute", bottom:-40, left:100, width:150, height:150, borderRadius:"50%", background:"rgba(99,102,241,0.07)" }}/>
        <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", gap:20 }}>
          {/* Avatar */}
          <div style={{ width:80, height:80, borderRadius:24, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:900, color:"#fff", boxShadow:"0 8px 24px rgba(124,58,237,0.4)", flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4, flexWrap:"wrap" }}>
              {editName ? (
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input value={newName} onChange={e=>setNewName(e.target.value)} style={{ padding:"6px 12px", borderRadius:10, border:"1.5px solid rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:16, fontWeight:700, outline:"none" }}/>
                  <button onClick={saveName} disabled={saving} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#5B4EFF", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>{saving?"...":"Save"}</button>
                  <button onClick={() => setEditName(false)} style={{ padding:"6px 10px", borderRadius:8, border:"none", background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:12, cursor:"pointer" }}>Cancel</button>
                </div>
              ) : (
                <>
                  <h1 style={{ color:"#fff", fontSize:22, fontWeight:900, margin:0 }}>{displayName}</h1>
                  <button onClick={() => setEditName(true)} style={{ padding:"3px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontSize:11, fontWeight:600, cursor:"pointer" }}>Edit</button>
                </>
              )}
              {certsEarned > 0 && (
                <div style={{ background:"rgba(167,139,250,0.2)", border:"1px solid rgba(167,139,250,0.3)", borderRadius:999, padding:"3px 10px", display:"flex", alignItems:"center", gap:5 }}>
                  <Award size={11} color="#a78bfa"/>
                  <span style={{ color:"#a78bfa", fontSize:11, fontWeight:700 }}>{certsEarned} Cert{certsEarned>1?"s":""}</span>
                </div>
              )}
              {sub?.status === "active" && (
                <div style={{ background:"rgba(34,197,94,0.2)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:999, padding:"3px 10px" }}>
                  <span style={{ color:"#4ade80", fontSize:11, fontWeight:700 }}>✅ {sub.plan}</span>
                </div>
              )}
            </div>
            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:13, margin:"0 0 12px" }}>{email} · Member since {memberSince}</p>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(249,115,22,0.2)", borderRadius:10, padding:"4px 10px" }}>
                <Flame size={14} color="#fb923c" fill="#fb923c"/>
                <span style={{ color:"#fb923c", fontWeight:700, fontSize:13 }}>{streak} day streak</span>
              </div>
              <div style={{ display:"flex", gap:4 }}>
                {DAYS.map((d,i) => (
                  <div key={i} style={{ width:26, height:26, borderRadius:8, background:weeklyActivity[i]?"#f97316":"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {weeklyActivity[i] ? <CheckCircle2 size={14} color="#fff"/> : <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)", fontWeight:600 }}>{d}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={signOut} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"9px 16px", color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            <LogOut size={14}/> Sign out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { icon:<BookOpen size={18}/>, value:totalLessons,     label:"Lessons done",     color:"#6366f1", bg:"#EEF2FF" },
          { icon:<Trophy size={18}/>,   value:certsEarned,      label:"Certificates",     color:"#f59e0b", bg:"#FFFBEB" },
          { icon:<TrendingUp size={18}/>,value:coursesStarted,  label:"Courses started",  color:"#10b981", bg:"#ECFDF5" },
          { icon:<Target size={18}/>,   value:challengesJoined, label:"Challenges joined", color:"#ec4899", bg:"#FDF2F8" },
        ].map((s,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", padding:"18px 20px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ width:44, height:44, borderRadius:13, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:26, fontWeight:900, color:"#0f172a", lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#94A3B8", marginTop:3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", background:"#F1F5F9", borderRadius:14, padding:4, gap:2 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex:1, padding:"10px", borderRadius:10, border:"none", background:tab===t?"#fff":"transparent", fontWeight:700, fontSize:13, color:tab===t?"#0f172a":"#94A3B8", cursor:"pointer", boxShadow:tab===t?"0 2px 8px rgba(0,0,0,0.08)":"none", transition:"all 0.15s" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "Overview" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {/* Streak card */}
          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px", display:"flex", alignItems:"center", gap:8 }}>
              <Flame size={16} color="#f97316"/> Streak Stats
            </h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              {[["Current Streak",`${streak} days`,"#f97316"],["Longest Streak",`${longestStreak} days`,"#6366f1"]].map(([l,v,c]) => (
                <div key={l} style={{ background:"#F8FAFC", borderRadius:12, padding:"14px 16px" }}>
                  <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 4px" }}>{l}</p>
                  <p style={{ fontSize:20, fontWeight:900, color:c, margin:0 }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i) => (
                <div key={d} style={{ flex:1, textAlign:"center" }}>
                  <div style={{ width:"100%", aspectRatio:"1", borderRadius:10, background:weeklyActivity[i]?"linear-gradient(135deg,#f97316,#fb923c)":"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>
                    {weeklyActivity[i] && <CheckCircle2 size={14} color="#fff"/>}
                  </div>
                  <span style={{ fontSize:9, color:"#94A3B8", fontWeight:600 }}>{d[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Quick Actions</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { icon:"📚", label:"Continue Learning", href:"/courses", color:"#6366f1" },
                { icon:"🏆", label:"Daily Challenges", href:"/challenges", color:"#f59e0b" },
                { icon:"🎯", label:"Take the Quiz", href:"/quiz", color:"#22c55e" },
                { icon:"🔔", label:"Notifications", href:"/home", color:"#8b5cf6" },
              ].map((a,i) => (
                <Link key={i} href={a.href} style={{ textDecoration:"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:12, background:"#F8FAFC", border:"1.5px solid #F1F5F9", cursor:"pointer", transition:"all 0.15s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background="#EEF2FF"; e.currentTarget.style.borderColor="#C7D2FE"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="#F8FAFC"; e.currentTarget.style.borderColor="#F1F5F9"; }}>
                    <span style={{ fontSize:20 }}>{a.icon}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#0f172a", flex:1 }}>{a.label}</span>
                    <ChevronRight size={14} color="#94A3B8"/>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Certificates" && (
        <div>
          {certsEarned === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #E2E8F0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🏆</div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>No certificates yet</h3>
              <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Complete a course to earn your first certificate</p>
              <Link href="/courses" style={{ textDecoration:"none" }}>
                <button style={{ padding:"10px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>Browse Courses →</button>
              </Link>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
              {completedCourses.filter(c => hasCertificate(c.id)).map(course => {
                const s = COURSE_STYLES[course.id] || { g:"linear-gradient(135deg,#6366f1,#8b5cf6)", e:"📚", a:"#6366f1" };
                return (
                  <div key={course.id} style={{ background:"#fff", borderRadius:20, overflow:"hidden", border:"1.5px solid #DCFCE7", boxShadow:"0 4px 20px rgba(34,197,94,0.1)" }}>
                    <div style={{ background:s.g, height:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", position:"relative", overflow:"hidden" }}>
                      <div style={{ position:"absolute", top:-20, right:-20, width:90, height:90, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }}/>
                      <span style={{ fontSize:44 }}>{s.e}</span>
                      <div style={{ background:"rgba(255,255,255,0.92)", borderRadius:9, padding:"4px 10px", display:"flex", alignItems:"center", gap:4 }}>
                        <Award size={12} color="#f59e0b"/>
                        <span style={{ fontSize:10, fontWeight:700, color:"#92400e" }}>Certified</span>
                      </div>
                    </div>
                    <div style={{ padding:"14px 18px 18px" }}>
                      <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>{course.title}</h3>
                      <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 14px" }}>All lessons completed ✓</p>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        <button onClick={() => setCertCourse(course)}
                          style={{ padding:"10px", borderRadius:10, background:"#F0FDF4", border:"1.5px solid #BBF7D0", fontSize:12, fontWeight:700, color:"#15803D", cursor:"pointer" }}>
                          👁 View
                        </button>
                        <button onClick={() => setCertCourse(course)}
                          style={{ padding:"10px", borderRadius:10, background:"linear-gradient(135deg,#22C55E,#16A34A)", border:"none", fontSize:12, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                          <Download size={12}/> Download
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "Courses" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {inProgressCourses.length > 0 && (
            <div>
              <h3 style={{ fontSize:14, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:0.5, margin:"0 0 12px" }}>In Progress</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {inProgressCourses.map(c => {
                  const s = COURSE_STYLES[c.id] || { g:"linear-gradient(135deg,#6366f1,#8b5cf6)", e:"📚" };
                  const total = c.units.flatMap(u=>u.lessons).length;
                  const pct = getCoursePercent(c.id, total);
                  return (
                    <Link key={c.id} href={`/courses/${c.id}`} style={{ textDecoration:"none" }}>
                      <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ width:48, height:48, borderRadius:14, background:s.g, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{s.e}</div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 6px" }}>{c.title}</p>
                          <div style={{ height:6, background:"#F1F5F9", borderRadius:999, overflow:"hidden" }}>
                            <div style={{ height:"100%", background:"linear-gradient(to right,#5B4EFF,#8B5CF6)", width:`${pct}%`, borderRadius:999 }}/>
                          </div>
                          <p style={{ fontSize:11, color:"#94A3B8", margin:"4px 0 0" }}>{pct}% complete</p>
                        </div>
                        <ChevronRight size={16} color="#94A3B8"/>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {completedCourses.length > 0 && (
            <div>
              <h3 style={{ fontSize:14, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:0.5, margin:"0 0 12px" }}>Completed</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {completedCourses.map(c => {
                  const s = COURSE_STYLES[c.id] || { g:"linear-gradient(135deg,#6366f1,#8b5cf6)", e:"📚" };
                  return (
                    <Link key={c.id} href={`/courses/${c.id}`} style={{ textDecoration:"none" }}>
                      <div style={{ background:"#F0FDF4", borderRadius:16, border:"1.5px solid #BBF7D0", padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ width:48, height:48, borderRadius:14, background:s.g, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{s.e}</div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 2px" }}>{c.title}</p>
                          <p style={{ fontSize:12, color:"#22c55e", fontWeight:600, margin:0 }}>✓ Completed</p>
                        </div>
                        <ChevronRight size={16} color="#94A3B8"/>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {inProgressCourses.length === 0 && completedCourses.length === 0 && (
            <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #E2E8F0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📚</div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>No courses started yet</h3>
              <Link href="/courses"><button style={{ marginTop:12, padding:"10px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>Browse Courses →</button></Link>
            </div>
          )}
        </div>
      )}

      {tab === "Challenges" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {(challenges||[]).filter(c => hasJoinedChallenge(c.id)).length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #E2E8F0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🎯</div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>No challenges joined yet</h3>
              <Link href="/challenges"><button style={{ marginTop:12, padding:"10px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>View Challenges →</button></Link>
            </div>
          ) : (challenges||[]).filter(c => hasJoinedChallenge(c.id)).map((c,i) => (
            <Link key={c.id} href={`/challenges/${c.id}`} style={{ textDecoration:"none" }}>
              <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${["#667eea","#f093fb","#4facfe","#43e97b"][i%4]},${["#764ba2","#f5576c","#00f2fe","#38f9d7"][i%4]})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🎯</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 2px" }}>{c.title}</p>
                  <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{c.duration_days} day challenge</p>
                </div>
                <ChevronRight size={16} color="#94A3B8"/>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === "Subscription" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {sub ? (
            <>
              <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                  <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:0 }}>Current Plan</h3>
                  <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:999, background:sub.status==="active"?"#F0FDF4":"#FEF2F2", color:sub.status==="active"?"#16a34a":"#dc2626" }}>{sub.status}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                  {[
                    ["Plan", sub.plan],
                    ["Type", sub.type==="recurring"?"🔄 Auto-renew":"1x One-time"],
                    ["Amount Paid", `$${sub.amount_paid}`],
                    ["Started", new Date(sub.started_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})],
                    ["Expires", new Date(sub.expires_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})],
                    ["Days Left", daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} days` : "Expired") : "—"],
                  ].map(([k,v]) => (
                    <div key={k} style={{ background:"#F8FAFC", borderRadius:12, padding:"14px 16px" }}>
                      <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:0.5 }}>{k}</p>
                      <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{v}</p>
                    </div>
                  ))}
                </div>
                {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                  <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
                    <p style={{ fontSize:13, color:"#92400e", fontWeight:600, margin:0 }}>⚠️ Your subscription expires in {daysLeft} days. Renew to keep access!</p>
                  </div>
                )}
                {daysLeft !== null && daysLeft <= 0 && (
                  <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
                    <p style={{ fontSize:13, color:"#991B1B", fontWeight:600, margin:0 }}>🔒 Your subscription has expired. Renew to regain access.</p>
                  </div>
                )}
                <button onClick={() => setShowRenew(true)} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  🚀 {daysLeft > 0 ? "Extend Subscription" : "Renew Access"}
                </button>
                {/* Upgrade options */}
                {daysLeft > 0 && sub?.plan === "1-Week Plan" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
                    <p style={{ fontSize:12, color:"#94A3B8", margin:0, fontWeight:600 }}>⬆ Upgrade your plan:</p>
                    {["4-Week Plan","12-Week Plan"].map(upgradePlan => (
                      <button key={upgradePlan} onClick={() => { setRenewPlan(upgradePlan); setShowRenew(true); }}
                        style={{ width:"100%", padding:"12px", borderRadius:12, border:"1.5px solid #C7D2FE", background:"#EEF2FF", color:"#5B4EFF", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                        ⬆ Upgrade to {upgradePlan}
                      </button>
                    ))}
                  </div>
                )}
                {daysLeft > 0 && sub?.plan === "4-Week Plan" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
                    <p style={{ fontSize:12, color:"#94A3B8", margin:0, fontWeight:600 }}>⬆ Upgrade your plan:</p>
                    <button onClick={() => { setRenewPlan("12-Week Plan"); setShowRenew(true); }}
                      style={{ width:"100%", padding:"12px", borderRadius:12, border:"1.5px solid #C7D2FE", background:"#EEF2FF", color:"#5B4EFF", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                      ⬆ Upgrade to 12-Week Plan
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #E2E8F0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>💳</div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>No active subscription</h3>
              <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Get a plan to access all courses and features</p>
              <Link href="/quiz"><button style={{ padding:"12px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Get Started →</button></Link>
            </div>
          )}
        </div>
      )}

      {tab === "Security" && (
        <ChangePassword/>
      )}

      {showRenew && (
        <PaymentModal
          plan={renewPlan || sub?.plan || "4-Week Plan"}
          paymentType="one_time"
          email={email}
          name={displayName}
          isRenewal={!renewPlan}
          onClose={() => { setShowRenew(false); setRenewPlan(null); }}
          onSuccess={() => { setShowRenew(false); setRenewPlan(null); window.location.reload(); }}
        />
      )}
      {certCourse && (
        <CertificateGenerator
          course={certCourse}
          userName={displayName}
          completedDate={new Date().toISOString()}
          onClose={() => setCertCourse(null)}
        />
      )}
    </div>
  );
}
