"use client";

import { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { ChevronLeft, Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const EMPTY_DAY = { topic:"", emoji:"🚀", course_id:"", lesson_id:"" };
const EMOJIS = ["🚀","⭐","💼","🛠️","🤖","💬","🎨","🔍","⚡","🎬","💻","📊","📱","🌟","🔄","🎯","📚","💡","🔥","🏆"];

export default function AdminChallengeDetail({ challenge: initial, courses }) {
  const [challenge, setChallenge] = useState(initial);
  const [dayForm, setDayForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const saveDay = async () => {
    if (!dayForm.topic) return;
    setLoading(true);

    const row = {
      challenge_id: challenge.id,
      day_number: dayForm.day_number || (challenge.challengeDays.length + 1),
      topic: dayForm.topic,
      emoji: dayForm.emoji,
      course_id: dayForm.course_id || null,
      lesson_id: dayForm.lesson_id || null,
    };

    const { error } = await supabase.from("challenge_days")
      .upsert(row, { onConflict:"challenge_id,day_number" });

    if (error) { alert(error.message); setLoading(false); return; }

    const updatedDay = { day:row.day_number, topic:row.topic, emoji:row.emoji, courseId:row.course_id, lessonId:row.lesson_id };
    if (dayForm.day_number) {
      setChallenge(p => ({ ...p, challengeDays:p.challengeDays.map(d => d.day===dayForm.day_number ? updatedDay : d) }));
    } else {
      setChallenge(p => ({ ...p, challengeDays:[...p.challengeDays, updatedDay] }));
    }
    setDayForm(null);
    setLoading(false);
  };

  const deleteDay = async (dayNumber) => {
    await supabase.from("challenge_days").delete().eq("challenge_id", challenge.id).eq("day_number", dayNumber);
    setChallenge(p => ({ ...p, challengeDays:p.challengeDays.filter(d => d.day !== dayNumber) }));
    setDeleteTarget(null);
  };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:800 }}>

        <div>
          <Link href="/admin/challenges" style={{ textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,color:"#64748B",fontSize:13,fontWeight:600,marginBottom:16 }}>
            <ChevronLeft size={15}/> Back to challenges
          </Link>

          {/* Hero */}
          <div style={{ background:challenge.gradientBg,borderRadius:20,padding:"24px 28px",display:"flex",alignItems:"center",gap:18,position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.08)" }} />
            <div style={{ width:64,height:64,borderRadius:20,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0 }}>
              {challenge.emoji}
            </div>
            <div style={{ position:"relative",zIndex:1 }}>
              <h1 style={{ color:"#fff",fontSize:22,fontWeight:900,margin:0 }}>{challenge.title}</h1>
              <p style={{ color:"rgba(255,255,255,0.6)",fontSize:13,margin:"4px 0 0" }}>
                {challenge.challengeDays.length} / {challenge.days} days configured
              </p>
            </div>
            <div style={{ marginLeft:"auto",position:"relative",zIndex:1 }}>
              <button onClick={() => setDayForm(EMPTY_DAY)} style={{ padding:"10px 18px",borderRadius:12,border:"none",background:"rgba(255,255,255,0.2)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                <Plus size={15}/> Add Day
              </button>
            </div>
          </div>
        </div>

        {/* Days list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {challenge.challengeDays.map(day => (
            <div key={day.day} style={{ background:"#fff",borderRadius:14,border:"1.5px solid #F1F5F9",padding:"12px 18px",display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#F1F5F9,#E2E8F0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#64748B",flexShrink:0 }}>
                D{day.day}
              </div>
              <span style={{ fontSize:20,flexShrink:0 }}>{day.emoji}</span>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontSize:13,fontWeight:600,color:"#0f172a",margin:0 }}>{day.topic}</p>
                <p style={{ fontSize:11,color:"#94A3B8",margin:0 }}>
                  {day.courseId ? `${day.courseId} / ${day.lessonId}` : "No lesson mapped"}
                </p>
              </div>
              <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                <button onClick={() => setDayForm({ day_number:day.day, topic:day.topic, emoji:day.emoji, course_id:day.courseId||"", lesson_id:day.lessonId||"" })} style={btnSm()}>
                  <Pencil size={11}/> Edit
                </button>
                {deleteTarget===day.day ? (
                  <>
                    <button onClick={() => deleteDay(day.day)} style={btnSm("#EF4444","#fff")}>Delete</button>
                    <button onClick={() => setDeleteTarget(null)} style={btnSm()}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => setDeleteTarget(day.day)} style={btnSm("#FFF","#EF4444","#FEE2E2")}>
                    <Trash2 size={11}/>
                  </button>
                )}
              </div>
            </div>
          ))}

          {challenge.challengeDays.length === 0 && (
            <div style={{ textAlign:"center",padding:"40px 20px",color:"#94A3B8" }}>
              <p style={{ fontSize:32,marginBottom:8 }}>📅</p>
              <p style={{ fontSize:14,fontWeight:600,margin:"0 0 4px" }}>No days configured yet</p>
              <p style={{ fontSize:13,margin:0 }}>Click "Add Day" to start building the challenge</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Day Modal ── */}
      {dayForm && (
        <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff",borderRadius:24,width:"100%",maxWidth:500,boxShadow:"0 32px 80px rgba(0,0,0,0.3)",overflow:"auto",maxHeight:"90vh" }}>
            <div style={{ padding:"24px 28px 0",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <h2 style={{ fontSize:17,fontWeight:800,color:"#0f172a",margin:0 }}>
                {dayForm.day_number ? `Edit Day ${dayForm.day_number}` : `Add Day ${challenge.challengeDays.length + 1}`}
              </h2>
              <button onClick={() => setDayForm(null)} style={{ background:"none",border:"none",cursor:"pointer",padding:4 }}><X size={18} color="#94A3B8"/></button>
            </div>

            <div style={{ padding:"20px 28px 28px",display:"flex",flexDirection:"column",gap:14 }}>

              {/* Topic */}
              <Field label="Day Topic">
                <input value={dayForm.topic} onChange={e => setDayForm(p=>({...p,topic:e.target.value}))} placeholder="e.g. How to Start Side Hustling" style={inputSt()} autoFocus />
              </Field>

              {/* Emoji picker */}
              <Field label="Emoji">
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:8 }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setDayForm(p=>({...p,emoji:e}))}
                      style={{ width:36,height:36,borderRadius:8,border:dayForm.emoji===e?"2.5px solid #6366f1":"1.5px solid #E2E8F0",background:dayForm.emoji===e?"#EEF2FF":"#fff",fontSize:18,cursor:"pointer" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Course mapping */}
              <Field label="Map to Course" hint="optional">
                <select value={dayForm.course_id} onChange={e => setDayForm(p=>({...p,course_id:e.target.value,lesson_id:""}))} style={inputSt()}>
                  <option value="">— No course —</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>)}
                </select>
              </Field>

              {/* Lesson mapping */}
              {dayForm.course_id && (
                <Field label="Map to Lesson" hint="optional">
                  <select value={dayForm.lesson_id} onChange={e => setDayForm(p=>({...p,lesson_id:e.target.value}))} style={inputSt()}>
                    <option value="">— Select lesson —</option>
                    {courses.find(c=>c.id===dayForm.course_id)?.units.flatMap(u=>u.lessons).map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </Field>
              )}

              <div style={{ display:"flex",gap:10,marginTop:4 }}>
                <button onClick={() => setDayForm(null)} style={{ flex:1,padding:"11px",borderRadius:11,border:"1.5px solid #E2E8F0",background:"#fff",fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer" }}>Cancel</button>
                <button onClick={saveDay} disabled={loading} style={{ flex:2,padding:"11px",borderRadius:11,border:"none",background:challenge.gradientBg,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>
                  {loading ? "Saving..." : (dayForm.day_number ? "Save Changes" : "Add Day")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6 }}>
        {label} {hint && <span style={{ color:"#94A3B8",fontWeight:400,fontSize:11 }}>· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputSt = () => ({ width:"100%",padding:"10px 13px",borderRadius:10,border:"1.5px solid #E2E8F0",fontSize:13,outline:"none",background:"#fff",color:"#0f172a",boxSizing:"border-box" });
const btnSm = (bg="#fff",color="#374151",border="1.5px solid #E2E8F0") => ({ padding:"6px 11px",borderRadius:8,border,background:bg,color,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4 });
