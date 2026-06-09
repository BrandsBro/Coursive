"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const EMPTY = { id:"", title:"", subtitle:"", description:"", emoji:"🚀", gradient_bg:"linear-gradient(135deg,#6366f1,#8b5cf6)", days:14, level:"Beginner" };
const LEVELS = ["Beginner","Intermediate","Advanced"];

const PRESETS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#ffecd2,#fcb69f)",
  "linear-gradient(135deg,#ff9a9e,#fecfef)",
  "linear-gradient(135deg,#a1c4fd,#c2e9fb)",
  "linear-gradient(135deg,#d4fc79,#96e6a1)",
  "linear-gradient(135deg,#60a5fa,#06b6d4)",
  "linear-gradient(135deg,#f97316,#fbbf24)",
];

export default function AdminChallenges({ challenges: initial }) {
  const [challenges, setChallenges] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (ch) => {
    setForm({ id:ch.id, title:ch.title, subtitle:ch.subtitle||"", description:ch.description||"", emoji:ch.emoji, gradient_bg:ch.gradientBg, days:ch.days, level:ch.level });
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
    const updated = { id:form.id, title:form.title, subtitle:form.subtitle, description:form.description, emoji:form.emoji, gradientBg:form.gradient_bg, days:parseInt(form.days), level:form.level, challengeDays:[], reviews:[] };
    if (editing) { setChallenges(prev => prev.map(c => c.id === editing ? updated : c)); }
    else { setChallenges(prev => [...prev, updated]); }
  };

  const handleDelete = async (id) => {
    await supabase.from("challenge_days").delete().eq("challenge_id", id);
    await supabase.from("challenge_reviews").delete().eq("challenge_id", id);
    await supabase.from("challenge_progress").delete().eq("challenge_id", id);
    await supabase.from("challenge_joins").delete().eq("challenge_id", id);
    const { error } = await supabase.from("challenges").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    setChallenges(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Challenges</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{challenges.length} challenges in database</p>
          </div>
          <button onClick={openAdd} style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#f59e0b,#f97316)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(245,158,11,0.35)" }}>
            <Plus size={16}/> Add Challenge
          </button>
        </div>

        {/* Challenge list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {challenges.map(ch => (
            <div key={ch.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"14px 18px", display:"flex", alignItems:"center", gap:14, transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#FEF3C7"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#F1F5F9"; e.currentTarget.style.boxShadow="none"; }}>

              {/* Emoji hero */}
              <div style={{ width:48, height:48, borderRadius:13, background:ch.gradientBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                {ch.emoji}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                  <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{ch.title}</h3>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:999, background:"#FFF7ED", color:"#C2410C" }}>{ch.days} days</span>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:999, background:"#F0FDF4", color:"#15803D" }}>{ch.level}</span>
                </div>
                <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{ch.id} · {ch.subtitle}</p>
              </div>

              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button onClick={() => openEdit(ch)} style={{ padding:"7px 14px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  <Pencil size={12}/> Edit
                </button>
                {deleteId === ch.id ? (
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => handleDelete(ch.id)} style={{ padding:"7px 12px", borderRadius:9, border:"none", background:"#EF4444", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>Delete</button>
                    <button onClick={() => setDeleteId(null)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:12, cursor:"pointer" }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(ch.id)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #FEE2E2", background:"#fff", color:"#EF4444", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center" }}>
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

            {/* Gradient preview header */}
            <div style={{ background:form.gradient_bg, padding:"28px 32px 24px", borderRadius:"28px 28px 0 0", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.08)" }} />
              <button onClick={() => setShowForm(false)} style={{ position:"absolute",top:16,right:16,width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <X size={16} color="#fff"/>
              </button>
              <div style={{ display:"flex", alignItems:"center", gap:14, position:"relative", zIndex:1 }}>
                <div style={{ width:64,height:64,borderRadius:20,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32 }}>
                  {form.emoji || "🚀"}
                </div>
                <div>
                  <p style={{ color:"rgba(255,255,255,0.65)",fontSize:10,fontWeight:700,letterSpacing:1,margin:"0 0 4px" }}>
                    {editing ? "EDITING CHALLENGE" : "NEW CHALLENGE"}
                  </p>
                  <h2 style={{ color:"#fff",fontSize:20,fontWeight:900,margin:0,lineHeight:1.2 }}>
                    {form.title || "Challenge title"}
                  </h2>
                  <p style={{ color:"rgba(255,255,255,0.6)",fontSize:12,margin:"4px 0 0" }}>
                    {form.days} days · {form.level}
                  </p>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div style={{ padding:"24px 32px 32px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* ID + Emoji */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12 }}>
                  <Field label="Challenge ID" hint="e.g. ai-side-gigs">
                    <input value={form.id} onChange={e => update("id", e.target.value.toLowerCase().replace(/\s/g,"-"))} disabled={!!editing} placeholder="challenge-id" style={inputSt(!!editing)} />
                  </Field>
                  <Field label="Emoji">
                    <input value={form.emoji} onChange={e => update("emoji", e.target.value)} placeholder="🚀" style={{ ...inputSt(), width:70, textAlign:"center", fontSize:22 }} />
                  </Field>
                </div>

                {/* Title */}
                <Field label="Title">
                  <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Challenge title" style={inputSt()} />
                </Field>

                {/* Subtitle */}
                <Field label="Subtitle" hint="short tagline">
                  <input value={form.subtitle} onChange={e => update("subtitle", e.target.value)} placeholder="Turn AI skills into real income" style={inputSt()} />
                </Field>

                {/* Description */}
                <Field label="Description">
                  <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Full description of the challenge..." style={{ ...inputSt(), height:80, resize:"vertical" }} />
                </Field>

                {/* Gradient presets */}
                <Field label="Gradient">
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                    {PRESETS.map((g, i) => (
                      <button key={i} onClick={() => update("gradient_bg", g)}
                        style={{ width:36, height:36, borderRadius:9, background:g, border:form.gradient_bg===g?"3px solid #0f172a":"2px solid transparent", cursor:"pointer", transition:"all 0.1s" }} />
                    ))}
                  </div>
                  {/* Custom gradient input */}
                  <div style={{ background:"#F8FAFC", borderRadius:10, padding:"10px 14px", border:"1.5px solid #E2E8F0" }}>
                    <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", margin:"0 0 6px" }}>CUSTOM CSS GRADIENT</p>
                    <input value={form.gradient_bg} onChange={e => update("gradient_bg", e.target.value)} style={{ ...inputSt(), background:"transparent", border:"none", padding:0, fontSize:12 }} />
                  </div>
                  {/* Preview bar */}
                  <div style={{ height:10, borderRadius:999, background:form.gradient_bg, marginTop:8 }} />
                </Field>

                {/* Days + Level */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Field label="Number of Days">
                    <input type="number" min="1" value={form.days} onChange={e => update("days", e.target.value)} style={inputSt()} />
                  </Field>
                  <Field label="Level">
                    <select value={form.level} onChange={e => update("level", e.target.value)} style={inputSt()}>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:10, marginTop:24 }}>
                <button onClick={() => setShowForm(false)} style={{ flex:1, padding:"13px", borderRadius:13, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:"13px", borderRadius:13, border:"none", background:form.gradient_bg, color:"#fff", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", boxShadow:"0 4px 16px rgba(0,0,0,0.2)", opacity:loading?0.7:1 }}>
                  {loading ? "Saving..." : (editing ? "Save Changes" : "Add Challenge")}
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
  background:disabled?"#F8FAFC":"#fff",
  color:disabled?"#94A3B8":"#0f172a",
  boxSizing:"border-box", cursor:disabled?"not-allowed":"auto",
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
