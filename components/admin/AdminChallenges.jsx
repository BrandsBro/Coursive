"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const EMPTY = { id:"", title:"", subtitle:"", description:"", emoji:"🚀", gradient_bg:"linear-gradient(135deg,#6366f1,#8b5cf6)", days:14, level:"Beginner" };
const LEVELS = ["Beginner","Intermediate","Advanced"];

export default function AdminChallenges({ challenges: initial }) {
  const router = useRouter();
  const [challenges, setChallenges] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (ch) => {
    setForm({ id:ch.id, title:ch.title, subtitle:ch.subtitle, description:ch.description, emoji:ch.emoji, gradient_bg:ch.gradientBg, days:ch.days, level:ch.level });
    setEditing(ch.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.id || !form.title) { alert("ID and Title required"); return; }
    setLoading(true);
    const { error } = await supabase.from("challenges").upsert({
      id:form.id, title:form.title, subtitle:form.subtitle, description:form.description,
      emoji:form.emoji, gradient_bg:form.gradient_bg, days:parseInt(form.days),
      level:form.level, is_published:true,
    }, { onConflict:"id" });
    if (error) { alert(error.message); setLoading(false); return; }
    setLoading(false);
    setShowForm(false);
    router.refresh();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("challenges").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    setChallenges(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Challenges</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{challenges.length} challenges in database</p>
          </div>
          <button onClick={openAdd} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#f59e0b,#f97316)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            <Plus size={16} /> Add Challenge
          </button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {challenges.map(ch => (
            <div key={ch.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:13, background:ch.gradientBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                {ch.emoji}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 2px" }}>{ch.title}</h3>
                <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>ID: {ch.id} · {ch.days} days · {ch.level}</p>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => openEdit(ch)} style={{ padding:"7px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  <Pencil size={12} /> Edit
                </button>
                {deleteId === ch.id ? (
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => handleDelete(ch.id)} style={{ padding:"7px 10px", borderRadius:9, border:"none", background:"#EF4444", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>Confirm</button>
                    <button onClick={() => setDeleteId(null)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:12, cursor:"pointer" }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(ch.id)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #FEE2E2", background:"#FFF", color:"#EF4444", fontSize:12, cursor:"pointer" }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:520, maxHeight:"90vh", overflow:"auto", padding:32 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:0 }}>{editing ? "Edit Challenge" : "Add Challenge"}</h2>
                <button onClick={() => setShowForm(false)} style={{ background:"none", border:"none", cursor:"pointer" }}>
                  <X size={20} color="#94A3B8" />
                </button>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <FormField label="Challenge ID" hint="e.g. ai-side-gigs">
                  <input value={form.id} onChange={e => update("id", e.target.value.toLowerCase().replace(/\s/g,"-"))} disabled={!!editing} placeholder="ai-side-gigs" style={inputStyle} />
                </FormField>
                <FormField label="Title">
                  <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="14-Day AI Side Gigs Challenge" style={inputStyle} />
                </FormField>
                <FormField label="Subtitle">
                  <input value={form.subtitle} onChange={e => update("subtitle", e.target.value)} placeholder="Short tagline" style={inputStyle} />
                </FormField>
                <FormField label="Description">
                  <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Full description..." style={{ ...inputStyle, height:80, resize:"vertical" }} />
                </FormField>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                  <FormField label="Emoji">
                    <input value={form.emoji} onChange={e => update("emoji", e.target.value)} style={inputStyle} />
                  </FormField>
                  <FormField label="Days">
                    <input type="number" value={form.days} onChange={e => update("days", e.target.value)} style={inputStyle} />
                  </FormField>
                  <FormField label="Level">
                    <select value={form.level} onChange={e => update("level", e.target.value)} style={inputStyle}>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </FormField>
                </div>
                <FormField label="Gradient CSS" hint="full CSS gradient">
                  <input value={form.gradient_bg} onChange={e => update("gradient_bg", e.target.value)} placeholder="linear-gradient(135deg,#6366f1,#8b5cf6)" style={inputStyle} />
                  <div style={{ height:32, borderRadius:8, background:form.gradient_bg, marginTop:6 }} />
                </FormField>
              </div>

              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                <button onClick={() => setShowForm(false)} style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
                <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:"12px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#f59e0b,#f97316)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  {loading ? "Saving..." : (editing ? "Save Changes" : "Add Challenge")}
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
