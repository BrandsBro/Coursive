"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AdminLayout from "@/components/admin/AdminLayout";
import { ChevronLeft, Plus, Pencil, Trash2, X, GripVertical, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

const EMOJIS = ["🚀","⭐","💼","🛠️","🤖","💬","🎨","🔍","⚡","🎬","💻","📊","📱","🌟","🔄","🎯","📚","💡","🔥","🏆"];

export default function AdminChallengeDetail({ challenge: initial, courses }) {
  const router = useRouter();
  const [challenge, setChallenge] = useState(initial);
  const [dayForm, setDayForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint:{ distance:6 } }));

  // ── Drag reorder ──
  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const days = challenge.challengeDays;
    const oldIdx = days.findIndex(d => String(d.day) === String(active.id));
    const newIdx = days.findIndex(d => String(d.day) === String(over.id));
    const reordered = arrayMove(days, oldIdx, newIdx);
    // Reassign day numbers
    const renumbered = reordered.map((d, i) => ({ ...d, day: i+1 }));
    setChallenge(p => ({ ...p, challengeDays: renumbered }));
    // Persist
    for (const d of renumbered) {
      await supabase.from("challenge_days")
        .update({ day_number: d.day })
        .eq("challenge_id", challenge.id)
        .eq("day_number", d.day);
    }
  };

  const saveDay = async () => {
    if (!dayForm.topic) return;
    setLoading(true);
    const dayNum = dayForm.day_number || (challenge.challengeDays.length + 1);
    const row = { challenge_id:challenge.id, day_number:dayNum, topic:dayForm.topic, emoji:dayForm.emoji, course_id:dayForm.course_id||null, lesson_id:dayForm.lesson_id||null };
    const res = await fetch("/api/admin/save-challenge-day", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(row) });
    const data = await res.json();
    if (data.error) { alert(data.error); setLoading(false); return; }
    const updated = { day:dayNum, topic:dayForm.topic, emoji:dayForm.emoji, courseId:row.course_id, lessonId:row.lesson_id };
    if (dayForm.day_number) setChallenge(p=>({...p,challengeDays:p.challengeDays.map(d=>d.day===dayForm.day_number?updated:d)}));
    else setChallenge(p=>({...p,challengeDays:[...p.challengeDays, updated]}));
    setDayForm(null);
    setLoading(false);
  };

  const deleteDay = async (dayNum) => {
    await supabase.from("challenge_days").delete().eq("challenge_id",challenge.id).eq("day_number",dayNum);
    setChallenge(p=>({...p,challengeDays:p.challengeDays.filter(d=>d.day!==dayNum)}));
    setDeleteTarget(null);
  };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:820 }}>

        <div>
          <Link href="/admin/challenges" style={{ textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,color:"#64748B",fontSize:13,fontWeight:600,marginBottom:16 }}>
            <ChevronLeft size={15}/> Back to challenges
          </Link>
          <div style={{ background:challenge.gradientBg,borderRadius:20,padding:"24px 28px",display:"flex",alignItems:"center",gap:18,position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.08)" }}/>
            <div style={{ width:64,height:64,borderRadius:20,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0 }}>{challenge.emoji}</div>
            <div style={{ position:"relative",zIndex:1,flex:1 }}>
              <h1 style={{ color:"#fff",fontSize:22,fontWeight:900,margin:0 }}>{challenge.title}</h1>
              <p style={{ color:"rgba(255,255,255,0.6)",fontSize:13,margin:"4px 0 0" }}>{challenge.challengeDays.length}/{challenge.days} days configured · drag rows to reorder</p>
            </div>
            <button onClick={() => setDayForm({ topic:"", emoji:"🚀", course_id:"", lesson_id:"" })} style={{ padding:"10px 18px",borderRadius:12,border:"none",background:"rgba(255,255,255,0.2)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
              <Plus size={15}/> Add Day
            </button>
          </div>
        </div>

        {/* Note about content sharing */}
        <div style={{ background:"#EFF6FF",borderRadius:14,padding:"12px 16px",border:"1.5px solid #BFDBFE",display:"flex",gap:10,alignItems:"flex-start" }}>
          <LinkIcon size={16} color="#2563eb" style={{ flexShrink:0,marginTop:1 }}/>
          <p style={{ fontSize:13,color:"#1e40af",margin:0,lineHeight:1.5 }}>
            <strong>Independent content:</strong> Each challenge day has its own content — separate from courses. Use <strong>✍️ Content</strong> to build what students see for that day. The course mapping is optional metadata only.
          </p>
        </div>

        {/* Days list with drag */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={challenge.challengeDays.map(d=>String(d.day))} strategy={verticalListSortingStrategy}>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {challenge.challengeDays.map((day, idx) => (
                <SortableDay
                  key={day.day}
                  day={day}
                  idx={idx}
                  challenge={challenge}
                  courses={courses}
                  deleteTarget={deleteTarget}
                  setDeleteTarget={setDeleteTarget}
                  onEdit={() => setDayForm({ day_number:day.day, topic:day.topic, emoji:day.emoji, course_id:day.courseId||"", lesson_id:day.lessonId||"" })}
                  onDelete={() => deleteDay(day.day)}
                  onContent={() => router.push(`/admin/builder/challenge_${challenge.id}_day_${day.day}?title=${encodeURIComponent("Day "+day.day+" - "+day.topic)}&backTo=${encodeURIComponent("/admin/challenges/"+challenge.id)}`)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {challenge.challengeDays.length===0 && (
          <div style={{ textAlign:"center",padding:"40px 20px",background:"#fff",borderRadius:16,border:"2px dashed #E2E8F0" }}>
            <p style={{ fontSize:32,marginBottom:8 }}>📅</p>
            <p style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 4px" }}>No days yet</p>
            <p style={{ fontSize:13,color:"#94A3B8",margin:0 }}>Click "Add Day" to start building</p>
          </div>
        )}
      </div>

      {/* Day modal */}
      {dayForm && (
        <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff",borderRadius:24,width:"100%",maxWidth:500,boxShadow:"0 32px 80px rgba(0,0,0,0.3)",overflow:"auto",maxHeight:"90vh" }}>
            <div style={{ padding:"24px 28px 0",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <h2 style={{ fontSize:17,fontWeight:800,color:"#0f172a",margin:0 }}>{dayForm.day_number?`Edit Day ${dayForm.day_number}`:`Add Day ${challenge.challengeDays.length+1}`}</h2>
              <button onClick={()=>setDayForm(null)} style={{ background:"none",border:"none",cursor:"pointer" }}><X size={18} color="#94A3B8"/></button>
            </div>
            <div style={{ padding:"20px 28px 28px",display:"flex",flexDirection:"column",gap:14 }}>
              <div>
                <label style={lbl()}>Topic</label>
                <input value={dayForm.topic} onChange={e=>setDayForm(p=>({...p,topic:e.target.value}))} placeholder="Day topic..." style={iSt()} autoFocus/>
              </div>
              <div>
                <label style={lbl()}>Emoji</label>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {EMOJIS.map(e=>(
                    <button key={e} onClick={()=>setDayForm(p=>({...p,emoji:e}))} style={{ width:36,height:36,borderRadius:8,border:dayForm.emoji===e?"2.5px solid #6366f1":"1.5px solid #E2E8F0",background:dayForm.emoji===e?"#EEF2FF":"#fff",fontSize:18,cursor:"pointer" }}>{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl()}>Map to Course <span style={{ color:"#94A3B8",fontWeight:400 }}>· optional</span></label>
                <select value={dayForm.course_id} onChange={e=>setDayForm(p=>({...p,course_id:e.target.value,lesson_id:""}))} style={iSt()}>
                  <option value="">— No course —</option>
                  {courses.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.title}</option>)}
                </select>
              </div>
              {dayForm.course_id && (
                <div>
                  <label style={lbl()}>Map to Lesson <span style={{ color:"#94A3B8",fontWeight:400 }}>· optional</span></label>
                  <select value={dayForm.lesson_id} onChange={e=>setDayForm(p=>({...p,lesson_id:e.target.value}))} style={iSt()}>
                    <option value="">— Select lesson —</option>
                    {courses.find(c=>c.id===dayForm.course_id)?.units.flatMap(u=>u.lessons).map(l=>(
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display:"flex",gap:10,marginTop:4 }}>
                <button onClick={()=>setDayForm(null)} style={{ flex:1,padding:"11px",borderRadius:11,border:"1.5px solid #E2E8F0",background:"#fff",fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer" }}>Cancel</button>
                <button onClick={saveDay} disabled={loading} style={{ flex:2,padding:"11px",borderRadius:11,border:"none",background:challenge.gradientBg,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>
                  {loading?"Saving...":(dayForm.day_number?"Save Changes":"Add Day")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function SortableDay({ day, idx, challenge, courses, deleteTarget, setDeleteTarget, onEdit, onDelete, onContent }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(day.day) });
  const style = { transform:CSS.Transform.toString(transform), transition, opacity:isDragging?0.4:1 };
  const mappedCourse = courses.find(c=>c.id===day.courseId);

  return (
    <div ref={setNodeRef} style={{ ...style,background:isDragging?"#F5F3FF":"#fff",borderRadius:14,border:"1.5px solid #F1F5F9",padding:"12px 16px",display:"flex",alignItems:"center",gap:12 }}>
      <button {...attributes} {...listeners} style={{ cursor:"grab",border:"none",background:"none",padding:2,display:"flex",touchAction:"none",color:"#CBD5E1" }}>
        <GripVertical size={16}/>
      </button>
      <div style={{ width:32,height:32,borderRadius:9,background:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#64748B",flexShrink:0 }}>D{idx+1}</div>
      <span style={{ fontSize:20,flexShrink:0 }}>{day.emoji}</span>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontSize:13,fontWeight:700,color:"#0f172a",margin:0 }}>{day.topic}</p>
        <p style={{ fontSize:11,color:"#94A3B8",margin:0 }}>
          {mappedCourse ? `📚 ${mappedCourse.title}` : "No lesson mapped"}
        </p>
      </div>
      <div style={{ display:"flex",gap:6,flexShrink:0 }}>
        <button onClick={onContent} style={btn("#EEF2FF","#6366f1","#C7D2FE")}>✍️ Content</button>
        <button onClick={onEdit} style={btn()}><Pencil size={11}/> Edit</button>
        {deleteTarget===day.day ? (
          <><button onClick={onDelete} style={btn("#EF4444","#fff")}>Delete</button><button onClick={()=>setDeleteTarget(null)} style={btn()}>Cancel</button></>
        ) : (
          <button onClick={()=>setDeleteTarget(day.day)} style={btn("#fff","#EF4444","#FEE2E2")}><Trash2 size={11}/></button>
        )}
      </div>
    </div>
  );
}

const iSt = () => ({ width:"100%",padding:"10px 13px",borderRadius:10,border:"1.5px solid #E2E8F0",fontSize:13,outline:"none",background:"#fff",color:"#0f172a",boxSizing:"border-box" });
const lbl = () => ({ fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6 });
const btn = (bg="#fff",color="#374151",border="1.5px solid #E2E8F0") => ({ padding:"6px 11px",borderRadius:8,border,background:bg,color,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4 });
