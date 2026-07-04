"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, X, BookOpen, Clock, Sparkles } from "lucide-react";
import MediaLibrary from "@/components/admin/builder/MediaLibrary";
import { supabase } from "@/lib/supabase";

const EMPTY = { id:"", title:"", description:"", emoji:"📚", image_url:"", gradient_from:"#6366f1", gradient_to:"#8b5cf6", hours:1, level:"Beginner", category:"Design" };
const LEVELS = ["Beginner","Intermediate","Advanced"];
const CATEGORIES = ["Design","Productivity","Video","No Code"];
const PRESET_GRADIENTS = [
  ["#ec4899","#8b5cf6"],["#6366f1","#0ea5e9"],["#f97316","#fbbf24"],
  ["#ec4899","#f43f5e"],["#10b981","#06b6d4"],["#10a37f","#0ea5e9"],
  ["#6b7280","#374151"],["#f59e0b","#ef4444"],["#8b5cf6","#4f46e5"],
];

export default function AdminCourses({ courses: initial }) {
  const [courses, setCourses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (course) => {
    setForm({ id:course.id, title:course.title, description:course.description||"", emoji:course.emoji, image_url:course.imageUrl||"", gradient_from:course.gradientFrom, gradient_to:course.gradientTo, hours:course.hours, level:course.level, category:course.category });
    setEditing(course.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.id || !form.title) { alert("ID and Title are required"); return; }
    setLoading(true);
    const row = { id:form.id, title:form.title, description:form.description, emoji:form.emoji, image_url:form.image_url||null, gradient_from:form.gradient_from, gradient_to:form.gradient_to, hours:parseInt(form.hours), level:form.level, category:form.category, is_published:true };
    const { error } = await supabase.from("courses").upsert(row, { onConflict:"id" });
    if (error) { alert(error.message); setLoading(false); return; }
    setLoading(false);
    setShowForm(false);
    const updated = { id:form.id, title:form.title, description:form.description, emoji:form.emoji, imageUrl:form.image_url, gradientFrom:form.gradient_from, gradientTo:form.gradient_to, hours:parseInt(form.hours), level:form.level, category:form.category, units:editing?courses.find(c=>c.id===editing)?.units||[]:[] };
    if (editing) { setCourses(prev => prev.map(c => c.id === editing ? updated : c)); }
    else { setCourses(prev => [...prev, updated]); }
  };

  const handleDelete = async (id) => {
    try {
      // Delete lesson content first
      const { data: lessons } = await supabase.from("lessons").select("id").eq("course_id", id);
      if (lessons?.length) {
        for (const lesson of lessons) {
          await supabase.from("lesson_content").delete().eq("lesson_id", lesson.id);
        }
      }
      // Delete related data
      await supabase.from("lessons").delete().eq("course_id", id);
      await supabase.from("course_units").delete().eq("course_id", id);
      await supabase.from("course_reviews").delete().eq("course_id", id);
      // Delete course
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) { alert("Delete failed: " + error.message); return; }
      setCourses(prev => prev.filter(c => c.id !== id));
      setDeleteId(null);
    } catch(e) {
      alert("Error: " + e.message);
    }
  };

  const previewGrad = `linear-gradient(135deg, ${form.gradient_from}, ${form.gradient_to})`;

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Courses</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{courses.length} courses in database</p>
          </div>
          <button onClick={openAdd} style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
            <Plus size={16}/> Add Course
          </button>
        </div>

        {/* Course list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {courses.map(course => (
            <div key={course.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"14px 18px", display:"flex", alignItems:"center", gap:14, transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#E0E7FF"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#F1F5F9"; e.currentTarget.style.boxShadow="none"; }}>
              <div style={{ width:46, height:46, borderRadius:13, background:course.imageUrl?`url(${course.imageUrl}) center/cover`:`linear-gradient(135deg,${course.gradientFrom},${course.gradientTo})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                {!course.imageUrl && course.emoji}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                  <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{course.title}</h3>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:999, background:"#F0F9FF", color:"#0369A1" }}>{course.category}</span>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:999, background:"#F0FDF4", color:"#15803D" }}>{course.level}</span>
                </div>
                <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>
                  {course.id} &nbsp;·&nbsp; {course.units.flatMap(u=>u.lessons).length} lessons &nbsp;·&nbsp; {course.hours}h
                </p>
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <a href={"/admin/courses/" + course.id} style={{ padding:"7px 14px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#EEF2FF", fontSize:12, fontWeight:600, color:"#6366f1", cursor:"pointer", display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}>
                  Manage
                </a>
                <button onClick={() => openEdit(course)} style={{ padding:"7px 14px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  <Pencil size={12}/> Edit
                </button>
                {deleteId === course.id ? (
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => handleDelete(course.id)} style={{ padding:"7px 12px", borderRadius:9, border:"none", background:"#EF4444", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>Delete</button>
                    <button onClick={() => setDeleteId(null)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:12, cursor:"pointer" }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(course.id)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #FEE2E2", background:"#fff", color:"#EF4444", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center" }}>
                    <Trash2 size={13}/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:28, width:"100%", maxWidth:580, maxHeight:"92vh", overflow:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>

            {/* Modal header with gradient preview */}
            <div style={{ background:previewGrad, padding:"28px 32px 24px", borderRadius:"28px 28px 0 0", position:"relative" }}>
              <div style={{ position:"absolute", top:-20, right:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }} />
              <button onClick={() => setShowForm(false)} style={{ position:"absolute", top:16, right:16, width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={16} color="#fff"/>
              </button>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:60, height:60, borderRadius:18, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30 }}>
                  {form.image_url ? <img src={form.image_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"inherit" }}/> : (form.emoji || "📚")}
                </div>
                <div>
                  <p style={{ color:"rgba(255,255,255,0.7)", fontSize:11, fontWeight:700, letterSpacing:1, margin:"0 0 4px" }}>
                    {editing ? "EDITING COURSE" : "NEW COURSE"}
                  </p>
                  <h2 style={{ color:"#fff", fontSize:20, fontWeight:900, margin:0 }}>
                    {form.title || "Course title"}
                  </h2>
                  <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:"3px 0 0" }}>
                    {form.category} · {form.level} · {form.hours}h
                  </p>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div style={{ padding:"24px 32px 32px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* ID + Emoji row */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12 }}>
                  <Field label="Course ID" hint="e.g. canva-ai">
                    <input value={form.id} onChange={e => update("id", e.target.value.toLowerCase().replace(/\s/g,"-"))} disabled={!!editing} placeholder="course-id" style={inputSt(!!editing)} />
                  </Field>
                  <Field label="Emoji">
                    <input value={form.emoji} onChange={e => update("emoji", e.target.value)} placeholder="🎨" style={{ ...inputSt(), width:70, textAlign:"center", fontSize:22 }} />
                  </Field>
                </div>

                {/* Title */}
                <Field label="Title">
                  <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Course title" style={inputSt()} />
                </Field>

                {/* Description */}
                <Field label="Description">
                  <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Short description of the course..." style={{ ...inputSt(), height:72, resize:"vertical" }} />
                </Field>

                {/* Gradient */}
                <Field label="Gradient Colors">
                  {/* Presets */}
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                    {PRESET_GRADIENTS.map(([from, to], i) => (
                      <button key={i} onClick={() => { update("gradient_from", from); update("gradient_to", to); }}
                        style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${from},${to})`, border:form.gradient_from===from?"2.5px solid #0f172a":"2px solid transparent", cursor:"pointer" }} />
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", background:"#F8FAFC", borderRadius:10, padding:"8px 12px", border:"1.5px solid #E2E8F0" }}>
                      <input type="color" value={form.gradient_from} onChange={e => update("gradient_from", e.target.value)} style={{ width:28, height:28, borderRadius:6, border:"none", cursor:"pointer", padding:0, background:"none" }} />
                      <span style={{ fontSize:11, color:"#64748B", fontWeight:600 }}>{form.gradient_from}</span>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center", background:"#F8FAFC", borderRadius:10, padding:"8px 12px", border:"1.5px solid #E2E8F0" }}>
                      <input type="color" value={form.gradient_to} onChange={e => update("gradient_to", e.target.value)} style={{ width:28, height:28, borderRadius:6, border:"none", cursor:"pointer", padding:0, background:"none" }} />
                      <span style={{ fontSize:11, color:"#64748B", fontWeight:600 }}>{form.gradient_to}</span>
                    </div>
                  </div>
                </Field>

                {/* Level + Category + Hours */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 80px", gap:12 }}>
                  <Field label="Category">
                    <select value={form.category} onChange={e => update("category", e.target.value)} style={inputSt()}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Level">
                    <select value={form.level} onChange={e => update("level", e.target.value)} style={inputSt()}>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </Field>
                  <Field label="Hours">
                    <input type="number" min="1" value={form.hours} onChange={e => update("hours", e.target.value)} style={inputSt()} />
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:10, marginTop:24 }}>
                <button onClick={() => setShowForm(false)} style={{ flex:1, padding:"13px", borderRadius:13, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:"13px", borderRadius:13, border:"none", background:previewGrad, color:"#fff", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", boxShadow:`0 4px 16px rgba(0,0,0,0.2)`, opacity:loading?0.7:1 }}>
                  {loading ? "Saving..." : (editing ? "Save Changes" : "Add Course")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const inputSt = (disabled) => ({
  width:"100%", padding:"10px 13px", borderRadius:10,
  border:"1.5px solid #E2E8F0", fontSize:13, outline:"none",
  background: disabled ? "#F8FAFC" : "#fff",
  color: disabled ? "#94A3B8" : "#0f172a",
  boxSizing:"border-box", cursor: disabled ? "not-allowed" : "auto",
});

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
        {label} {hint && <span style={{ color:"#94A3B8", fontWeight:400, fontSize:11 }}>· {hint}</span>}
      </label>
      {children}
    </div>
  );
}
