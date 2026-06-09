"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, BookOpen, Clock, Eye, EyeOff, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

const EMPTY_COURSE = { id:"", title:"", description:"", emoji:"📚", gradient_from:"#6366f1", gradient_to:"#8b5cf6", hours:1, level:"Beginner", category:"Design" };
const LEVELS = ["Beginner","Intermediate","Advanced"];
const CATEGORIES = ["Design","Productivity","Video","No Code"];

export default function AdminCourses({ courses: initial }) {
  const router = useRouter();
  const [courses, setCourses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_COURSE);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(EMPTY_COURSE); setEditing(null); setShowForm(true); };
  const openEdit = (course) => {
    setForm({ id:course.id, title:course.title, description:course.description, emoji:course.emoji, gradient_from:course.gradientFrom, gradient_to:course.gradientTo, hours:course.hours, level:course.level, category:course.category });
    setEditing(course.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.id || !form.title) { alert("ID and Title are required"); return; }
    setLoading(true);

    const row = { id:form.id, title:form.title, description:form.description, emoji:form.emoji, gradient_from:form.gradient_from, gradient_to:form.gradient_to, hours:parseInt(form.hours), level:form.level, category:form.category, is_published:true };

    const { error } = await supabase.from("courses").upsert(row, { onConflict:"id" });
    if (error) { alert(error.message); setLoading(false); return; }

    setLoading(false);
    setShowForm(false);
    router.refresh();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    setCourses(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
  };

  const togglePublish = async (course) => {
    await supabase.from("courses").update({ is_published: !course.is_published }).eq("id", course.id);
    router.refresh();
  };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Courses</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{courses.length} courses in database</p>
          </div>
          <button onClick={openAdd} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 12px rgba(99,102,241,0.3)" }}>
            <Plus size={16} /> Add Course
          </button>
        </div>

        {/* Course list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {courses.map(course => (
            <div key={course.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
              {/* Emoji */}
              <div style={{ width:48, height:48, borderRadius:13, background:`linear-gradient(135deg,${course.gradientFrom},${course.gradientTo})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                {course.emoji}
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                  <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{course.title}</h3>
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:999, background:"#F0F9FF", color:"#0369A1" }}>{course.category}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:999, background:"#F0FDF4", color:"#15803D" }}>{course.level}</span>
                </div>
                <p style={{ fontSize:12, color:"#94A3B8", margin:0, display:"flex", gap:12 }}>
                  <span>ID: {course.id}</span>
                  <span><BookOpen size={10} style={{ verticalAlign:"middle" }} /> {course.units.flatMap(u=>u.lessons).length} lessons</span>
                  <span><Clock size={10} style={{ verticalAlign:"middle" }} /> {course.hours}h</span>
                </p>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button onClick={() => openEdit(course)} style={{ padding:"7px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  <Pencil size={12} /> Edit
                </button>
                {deleteId === course.id ? (
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => handleDelete(course.id)} style={{ padding:"7px 10px", borderRadius:9, border:"none", background:"#EF4444", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>Confirm</button>
                    <button onClick={() => setDeleteId(null)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:12, cursor:"pointer" }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(course.id)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #FEE2E2", background:"#FFF", color:"#EF4444", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:560, maxHeight:"90vh", overflow:"auto", padding:32 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:0 }}>{editing ? "Edit Course" : "Add New Course"}</h2>
                <button onClick={() => setShowForm(false)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                  <X size={20} color="#94A3B8" />
                </button>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <FormField label="Course ID" hint="e.g. canva-ai (no spaces)">
                  <input value={form.id} onChange={e => update("id", e.target.value.toLowerCase().replace(/\s/g,"-"))} disabled={!!editing} placeholder="canva-ai" style={inputStyle} />
                </FormField>
                <FormField label="Title">
                  <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Canva AI" style={inputStyle} />
                </FormField>
                <FormField label="Description">
                  <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Short description..." style={{ ...inputStyle, height:70, resize:"vertical" }} />
                </FormField>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <FormField label="Emoji">
                    <input value={form.emoji} onChange={e => update("emoji", e.target.value)} placeholder="🎨" style={inputStyle} />
                  </FormField>
                  <FormField label="Hours">
                    <input type="number" value={form.hours} onChange={e => update("hours", e.target.value)} style={inputStyle} />
                  </FormField>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <FormField label="Gradient From">
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <input type="color" value={form.gradient_from} onChange={e => update("gradient_from", e.target.value)} style={{ width:36, height:36, borderRadius:8, border:"1.5px solid #E2E8F0", cursor:"pointer" }} />
                      <input value={form.gradient_from} onChange={e => update("gradient_from", e.target.value)} style={{ ...inputStyle, flex:1 }} />
                    </div>
                  </FormField>
                  <FormField label="Gradient To">
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <input type="color" value={form.gradient_to} onChange={e => update("gradient_to", e.target.value)} style={{ width:36, height:36, borderRadius:8, border:"1.5px solid #E2E8F0", cursor:"pointer" }} />
                      <input value={form.gradient_to} onChange={e => update("gradient_to", e.target.value)} style={{ ...inputStyle, flex:1 }} />
                    </div>
                  </FormField>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <FormField label="Level">
                    <select value={form.level} onChange={e => update("level", e.target.value)} style={inputStyle}>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Category">
                    <select value={form.category} onChange={e => update("category", e.target.value)} style={inputStyle}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </FormField>
                </div>

                {/* Preview */}
                <div style={{ background:"#F8FAFC", borderRadius:14, padding:14, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:48, height:48, borderRadius:13, background:`linear-gradient(135deg,${form.gradient_from},${form.gradient_to})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
                    {form.emoji}
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{form.title || "Course title"}</p>
                    <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{form.category} · {form.level} · {form.hours}h</p>
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                <button onClick={() => setShowForm(false)} style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:"12px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  {loading ? "Saving..." : (editing ? "Save Changes" : "Add Course")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const inputStyle = { width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", background:"#fff", color:"#0f172a", boxSizing:"border-box" };

function FormField({ label, hint, children }) {
  return (
    <div>
      <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
        {label} {hint && <span style={{ color:"#94A3B8", fontWeight:400 }}>({hint})</span>}
      </label>
      {children}
    </div>
  );
}
