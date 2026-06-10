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
import {
  ChevronLeft, Plus, Pencil, Trash2, X, BookOpen, Trophy, GripVertical
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const TYPES = ["read","quiz"];

export default function AdminCourseDetail({ course: initial }) {
  const router = useRouter();
  const [course, setCourse] = useState(initial);
  const [unitForm, setUnitForm] = useState(null);
  const [lessonForm, setLessonForm] = useState(null);
  const [activeUnit, setActiveUnit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint:{ distance:6 } }));

  const grad = `linear-gradient(135deg,${course.gradientFrom},${course.gradientTo})`;

  // ── Unit drag ──
  const handleUnitDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = course.units.findIndex(u => u.id === active.id);
    const newIdx = course.units.findIndex(u => u.id === over.id);
    const reordered = arrayMove(course.units, oldIdx, newIdx);
    setCourse(p => ({ ...p, units: reordered }));
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from("course_units").update({ order_index: i }).eq("id", reordered[i].id);
    }
  };

  // ── Lesson drag ──
  const handleLessonDragEnd = async (unitId, { active, over }) => {
    if (!over || active.id === over.id) return;
    const unit = course.units.find(u => u.id === unitId);
    const oldIdx = unit.lessons.findIndex(l => l.id === active.id);
    const newIdx = unit.lessons.findIndex(l => l.id === over.id);
    const reordered = arrayMove(unit.lessons, oldIdx, newIdx);
    setCourse(p => ({ ...p, units: p.units.map(u => u.id===unitId ? {...u,lessons:reordered} : u) }));
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from("lessons").update({ order_index: i }).eq("id", reordered[i].id);
    }
  };

  // ── Unit CRUD ──
  const saveUnit = async () => {
    if (!unitForm.title) return;
    setLoading(true);
    const id = unitForm.id || `${course.id}-unit-${Date.now()}`;
    const orderIndex = unitForm.id ? course.units.find(u=>u.id===unitForm.id)?.order_index||0 : course.units.length;
    const { error } = await supabase.from("course_units").upsert({ id, course_id:course.id, title:unitForm.title, order_index:orderIndex }, { onConflict:"id" });
    if (error) { alert(error.message); setLoading(false); return; }
    const updatedUnit = { id, title:unitForm.title, lessons: unitForm.id ? course.units.find(u=>u.id===unitForm.id)?.lessons||[] : [] };
    if (unitForm.id) setCourse(p => ({ ...p, units:p.units.map(u=>u.id===unitForm.id?updatedUnit:u) }));
    else setCourse(p => ({ ...p, units:[...p.units, updatedUnit] }));
    setUnitForm(null);
    setLoading(false);
  };

  const deleteUnit = async (unitId) => {
    await supabase.from("lessons").delete().eq("unit_id", unitId);
    await supabase.from("course_units").delete().eq("id", unitId);
    setCourse(p => ({ ...p, units:p.units.filter(u=>u.id!==unitId) }));
    setDeleteTarget(null);
  };

  // ── Lesson CRUD ──
  const saveLesson = async () => {
    if (!lessonForm.title || !activeUnit) return;
    setLoading(true);
    const unit = course.units.find(u=>u.id===activeUnit);
    const id = lessonForm.id || `${course.id}_${activeUnit}_l${Date.now()}`;
    const orderIndex = lessonForm.id ? unit?.lessons.find(l=>l.id===lessonForm.id)?.order_index||0 : (unit?.lessons.length||0);
    const { error } = await supabase.from("lessons").upsert({ id, unit_id:activeUnit, course_id:course.id, title:lessonForm.title, type:lessonForm.type, duration:parseInt(lessonForm.duration), order_index:orderIndex }, { onConflict:"id" });
    if (error) { alert(error.message); setLoading(false); return; }
    const updated = { id, title:lessonForm.title, type:lessonForm.type, duration:parseInt(lessonForm.duration) };
    setCourse(p => ({ ...p, units:p.units.map(u => {
      if (u.id!==activeUnit) return u;
      if (lessonForm.id) return { ...u, lessons:u.lessons.map(l=>l.id===lessonForm.id?updated:l) };
      return { ...u, lessons:[...u.lessons, updated] };
    })}));
    setLessonForm(null);
    setLoading(false);
  };

  const deleteLesson = async (unitId, lessonId) => {
    await supabase.from("lessons").delete().eq("id", lessonId);
    setCourse(p => ({ ...p, units:p.units.map(u=>u.id===unitId?{...u,lessons:u.lessons.filter(l=>l.id!==lessonId)}:u) }));
    setDeleteTarget(null);
  };

  const totalLessons = course.units.flatMap(u=>u.lessons).length;

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:820 }}>

        {/* Back + hero */}
        <div>
          <Link href="/admin/courses" style={{ textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6, color:"#64748B", fontSize:13, fontWeight:600, marginBottom:16 }}>
            <ChevronLeft size={15}/> Back to courses
          </Link>
          <div style={{ background:grad, borderRadius:20, padding:"24px 28px", display:"flex", alignItems:"center", gap:18, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.08)" }}/>
            <div style={{ width:64,height:64,borderRadius:20,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0 }}>{course.emoji}</div>
            <div style={{ position:"relative",zIndex:1 }}>
              <h1 style={{ color:"#fff",fontSize:22,fontWeight:900,margin:0 }}>{course.title}</h1>
              <p style={{ color:"rgba(255,255,255,0.6)",fontSize:13,margin:"4px 0 0" }}>{course.units.length} units · {totalLessons} lessons · {course.hours}h</p>
            </div>
          </div>
        </div>

        {/* Units with drag */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleUnitDragEnd}>
          <SortableContext items={course.units.map(u=>u.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {course.units.map((unit, ui) => (
                <SortableUnit
                  key={unit.id}
                  unit={unit}
                  ui={ui}
                  grad={grad}
                  sensors={sensors}
                  deleteTarget={deleteTarget}
                  setDeleteTarget={setDeleteTarget}
                  onEditUnit={() => setUnitForm({ id:unit.id, title:unit.title })}
                  onDeleteUnit={() => deleteUnit(unit.id)}
                  onAddLesson={() => { setActiveUnit(unit.id); setLessonForm({ title:"", type:"read", duration:10 }); }}
                  onEditLesson={(lesson) => { setActiveUnit(unit.id); setLessonForm({ id:lesson.id, title:lesson.title, type:lesson.type, duration:lesson.duration }); }}
                  onDeleteLesson={(lessonId) => deleteLesson(unit.id, lessonId)}
                  onContentLesson={(lesson) => router.push(`/admin/builder/${lesson.id}?title=${encodeURIComponent(lesson.title)}&backTo=${encodeURIComponent("/admin/courses/"+course.id)}`)}
                  onLessonDragEnd={(e) => handleLessonDragEnd(unit.id, e)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button onClick={() => setUnitForm({ title:"" })} style={{ padding:"14px", borderRadius:16, border:"2px dashed #E2E8F0", background:"#fff", color:"#6366f1", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Plus size={16}/> Add Unit
        </button>
      </div>

      {/* Unit modal */}
      {unitForm && (
        <Modal title={unitForm.id?"Edit Unit":"Add Unit"} onClose={() => setUnitForm(null)}>
          <Field label="Unit Title">
            <input value={unitForm.title} onChange={e=>setUnitForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Introduction to Canva AI" style={iSt()} autoFocus/>
          </Field>
          <ModalActions onCancel={()=>setUnitForm(null)} onSave={saveUnit} loading={loading} label={unitForm.id?"Save Changes":"Add Unit"} grad={grad}/>
        </Modal>
      )}

      {/* Lesson modal */}
      {lessonForm && (
        <Modal title={lessonForm.id?"Edit Lesson":"Add Lesson"} onClose={() => setLessonForm(null)}>
          <Field label="Lesson Title">
            <input value={lessonForm.title} onChange={e=>setLessonForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Canva AI Essentials" style={iSt()} autoFocus/>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Type">
              <select value={lessonForm.type} onChange={e=>setLessonForm(p=>({...p,type:e.target.value}))} style={iSt()}>
                {TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Duration (mins)">
              <input type="number" min="1" value={lessonForm.duration} onChange={e=>setLessonForm(p=>({...p,duration:e.target.value}))} style={iSt()}/>
            </Field>
          </div>
          <ModalActions onCancel={()=>setLessonForm(null)} onSave={saveLesson} loading={loading} label={lessonForm.id?"Save Changes":"Add Lesson"} grad={grad}/>
        </Modal>
      )}
    </AdminLayout>
  );
}

// ── Sortable unit ──
function SortableUnit({ unit, ui, grad, sensors, deleteTarget, setDeleteTarget, onEditUnit, onDeleteUnit, onAddLesson, onEditLesson, onDeleteLesson, onContentLesson, onLessonDragEnd }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: unit.id });
  const style = { transform:CSS.Transform.toString(transform), transition, opacity:isDragging?0.5:1, zIndex:isDragging?100:1 };

  return (
    <div ref={setNodeRef} style={{ ...style, background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      {/* Unit header */}
      <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:10, background:"#FAFBFC", borderBottom:unit.lessons.length>0?"1px solid #F1F5F9":"none" }}>
        <button {...attributes} {...listeners} style={{ cursor:"grab", border:"none", background:"none", padding:2, display:"flex", touchAction:"none", color:"#CBD5E1" }}>
          <GripVertical size={18}/>
        </button>
        <div style={{ width:28,height:28,borderRadius:8,background:grad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800,flexShrink:0 }}>{ui+1}</div>
        <div style={{ flex:1 }}>
          <h3 style={{ fontSize:14,fontWeight:800,color:"#0f172a",margin:0 }}>{unit.title}</h3>
          <p style={{ fontSize:11,color:"#94A3B8",margin:0 }}>{unit.lessons.length} lessons · drag to reorder</p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={onEditUnit} style={btn()}><Pencil size={11}/> Edit</button>
          {deleteTarget===`unit-${unit.id}` ? (
            <><button onClick={onDeleteUnit} style={btn("#EF4444","#fff")}>Delete</button><button onClick={()=>setDeleteTarget(null)} style={btn()}>Cancel</button></>
          ) : (
            <button onClick={()=>setDeleteTarget(`unit-${unit.id}`)} style={btn("#fff","#EF4444","#FEE2E2")}><Trash2 size={11}/></button>
          )}
          <button onClick={onAddLesson} style={btn(grad,"#fff")}><Plus size={11}/> Add Lesson</button>
        </div>
      </div>

      {/* Lessons with drag */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onLessonDragEnd}>
        <SortableContext items={unit.lessons.map(l=>l.id)} strategy={verticalListSortingStrategy}>
          {unit.lessons.map((lesson, li) => (
            <SortableLesson
              key={lesson.id}
              lesson={lesson}
              li={li}
              deleteTarget={deleteTarget}
              setDeleteTarget={setDeleteTarget}
              onEdit={() => onEditLesson(lesson)}
              onDelete={() => onDeleteLesson(lesson.id)}
              onContent={() => onContentLesson(lesson)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ── Sortable lesson ──
function SortableLesson({ lesson, li, deleteTarget, setDeleteTarget, onEdit, onDelete, onContent }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const style = { transform:CSS.Transform.toString(transform), transition, opacity:isDragging?0.4:1 };

  return (
    <div ref={setNodeRef} style={{ ...style, padding:"11px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid #F8FAFC", background:isDragging?"#F5F3FF":"#fff" }}>
      <button {...attributes} {...listeners} style={{ cursor:"grab", border:"none", background:"none", padding:2, display:"flex", touchAction:"none", color:"#CBD5E1" }}>
        <GripVertical size={15}/>
      </button>
      <div style={{ width:22,height:22,borderRadius:6,background:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#64748B",flexShrink:0 }}>{li+1}</div>
      <div style={{ width:28,height:28,borderRadius:8,background:lesson.type==="quiz"?"#FFFBEB":"#EEF2FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
        {lesson.type==="quiz" ? <Trophy size={13} color="#F59E0B"/> : <BookOpen size={13} color="#6366F1"/>}
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontSize:13,fontWeight:600,color:"#0f172a",margin:0 }}>{lesson.title}</p>
        <p style={{ fontSize:11,color:"#94A3B8",margin:0 }}>{lesson.type} · {lesson.duration} min</p>
      </div>
      <div style={{ display:"flex",gap:6,flexShrink:0 }}>
        <button onClick={onContent} style={btn("#EEF2FF","#6366f1","#C7D2FE")}>✍️ Content</button>
        <button onClick={onEdit} style={btn()}><Pencil size={11}/> Edit</button>
        {deleteTarget===`lesson-${lesson.id}` ? (
          <><button onClick={onDelete} style={btn("#EF4444","#fff")}>Delete</button><button onClick={()=>setDeleteTarget(null)} style={btn()}>Cancel</button></>
        ) : (
          <button onClick={()=>setDeleteTarget(`lesson-${lesson.id}`)} style={btn("#fff","#EF4444","#FEE2E2")}><Trash2 size={11}/></button>
        )}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)" }}>
      <div style={{ background:"#fff",borderRadius:24,width:"100%",maxWidth:460,boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ padding:"24px 28px 0",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <h2 style={{ fontSize:17,fontWeight:800,color:"#0f172a",margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",padding:4 }}><X size={18} color="#94A3B8"/></button>
        </div>
        <div style={{ padding:"20px 28px 28px",display:"flex",flexDirection:"column",gap:14 }}>{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSave, loading, label, grad }) {
  return (
    <div style={{ display:"flex",gap:10,marginTop:4 }}>
      <button onClick={onCancel} style={{ flex:1,padding:"11px",borderRadius:11,border:"1.5px solid #E2E8F0",background:"#fff",fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer" }}>Cancel</button>
      <button onClick={onSave} disabled={loading} style={{ flex:2,padding:"11px",borderRadius:11,border:"none",background:grad||"linear-gradient(135deg,#6366f1,#4f46e5)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>{loading?"Saving...":label}</button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}

const iSt = () => ({ width:"100%",padding:"10px 13px",borderRadius:10,border:"1.5px solid #E2E8F0",fontSize:13,outline:"none",background:"#fff",color:"#0f172a",boxSizing:"border-box" });
const btn = (bg="#fff",color="#374151",border="1.5px solid #E2E8F0") => ({ padding:"6px 11px",borderRadius:8,border,background:bg,color,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4 });
