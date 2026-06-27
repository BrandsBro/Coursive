"use client";

import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Trash2, GripVertical, Save, Check, Loader, Eye, EyeOff, Upload, Link2, Copy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const BLOCK_TYPES = [
  { type:"question_choice", icon:"❓", label:"Choice Question",  desc:"Single choice with options",    color:"#6366f1", bg:"#EEF2FF" },
  { type:"question_icon",   icon:"🎯", label:"Icon Choice",      desc:"Options with emoji on left",      color:"#8b5cf6", bg:"#F5F3FF" },
  { type:"image_section",   icon:"🖼️", label:"Image Section",    desc:"Image with text & bullets",     color:"#059669", bg:"#ECFDF5" },
  { type:"loading",         icon:"⏳", label:"Loading Screen",   desc:"Analysis loading with reviews", color:"#0369a1", bg:"#F0F9FF" },
  { type:"summary",         icon:"📊", label:"Personal Summary", desc:"AI skills meter & insights",    color:"#d97706", bg:"#FFFBEB" },
  { type:"comparison",      icon:"⚖️", label:"Comparison",       desc:"With vs without Coursiv",       color:"#dc2626", bg:"#FEF2F2" },
  { type:"signup",          icon:"👤", label:"Name + Email",     desc:"Capture user details",          color:"#15803d", bg:"#F0FDF4" },
  { type:"sales",           icon:"💰", label:"Sales Page",       desc:"Plan selection & payment",      color:"#b45309", bg:"#FFFBEB" },
];

export default function AdminQuizBuilder() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [insertIdx, setInsertIdx] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("quiz_blocks").select("*").order("order_index");
    setBlocks((data || []).map(b => ({ ...b, content: b.content || {} })));
    setLoading(false);
  };

  const addBlock = (type) => {
    const block = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      type,
      content: getDefaultContent(type),
      order_index: insertIdx !== null ? insertIdx : blocks.length,
      path: "all",
      isNew: true,
    };
    if (insertIdx !== null) {
      const next = [...blocks];
      next.splice(insertIdx, 0, block);
      setBlocks(next);
    } else {
      setBlocks(prev => [...prev, block]);
    }
    setActiveId(block.id);
    setShowPicker(false);
    setInsertIdx(null);
  };

  const updateBlock = (id, content) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));

  const updatePath = (id, path) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, path } : b));

  const deleteBlock = async (id) => {
    if (!id.startsWith("new-")) await supabase.from("quiz_blocks").delete().eq("id", id);
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const duplicateBlock = (id) => {
    const idx = blocks.findIndex(b => b.id === id);
    const orig = blocks[idx];
    const copy = { ...orig, id:`new-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, content: JSON.parse(JSON.stringify(orig.content)), isNew: true };
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    setBlocks(next);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex(b => b.id === active.id);
    const newIdx = blocks.findIndex(b => b.id === over.id);
    setBlocks(arrayMove(blocks, oldIdx, newIdx));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const row = { type: b.type, content: b.content, order_index: i, path: b.path || "all" };
        if (b.isNew || b.id.startsWith("new-")) {
          const { data } = await supabase.from("quiz_blocks").insert(row).select().single();
          if (data) setBlocks(prev => prev.map(x => x.id === b.id ? { ...data, content: data.content || {} } : x));
        } else {
          await supabase.from("quiz_blocks").update(row).eq("id", b.id);
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await load();
    } catch(e) {
      alert("Save error: " + e.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9", display:"flex", flexDirection:"column" }}>
      {/* Top bar */}
      <div style={{ background:"#0f172a", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={() => window.history.back()} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            ← Back
          </button>
          <div>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:10, fontWeight:700, letterSpacing:1, margin:"0 0 1px" }}>QUIZ BUILDER</p>
            <h1 style={{ color:"#fff", fontSize:15, fontWeight:800, margin:0 }}>Quiz Flow</h1>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>{blocks.length} block{blocks.length!==1?"s":""}</span>
          <a href="/quiz" target="_blank" style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600, textDecoration:"none" }}>
            <Eye size={14}/> Live Quiz
          </a>
          <button onClick={() => setPreviewMode(!previewMode)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:previewMode?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.06)", color:previewMode?"#a78bfa":"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            {previewMode ? <EyeOff size={14}/> : <Eye size={14}/>}
            {previewMode ? "Editing" : "Full Preview"}
          </button>

          <button onClick={saveAll} disabled={saving} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 20px", borderRadius:10, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            {saving ? <><Loader size={14} className="bspin"/> Saving...</> : saved ? <><Check size={14}/> Saved!</> : <><Save size={14}/> Save</>}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Left - editor */}
        {!previewMode && (
          <div style={{ flex:1, overflow:"auto", padding:"24px 28px", borderRight:"1px solid #E2E8F0" }}>
            <div style={{ maxWidth:580, margin:"0 auto" }}>
              {loading ? (
                <div style={{ textAlign:"center", padding:60 }}><Loader size={28} color="#94A3B8" className="bspin"/></div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <InsertLine onClick={() => { setInsertIdx(0); setShowPicker(true); }} />
                  <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.map((block, idx) => (
                      <div key={block.id}>
                        <SortableBlock
                          block={block} idx={idx}
                          isActive={activeId === block.id}
                          onToggle={() => setActiveId(activeId === block.id ? null : block.id)}
                          onChange={c => updateBlock(block.id, c)}
                          onPathChange={p => updatePath(block.id, p)}
                          onDelete={() => deleteBlock(block.id)}
                          onDuplicate={() => duplicateBlock(block.id)}
                        />
                        <InsertLine onClick={() => { setInsertIdx(idx + 1); setShowPicker(true); }} />
                      </div>
                    ))}
                  </SortableContext>
                  {blocks.length === 0 && (
                    <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #CBD5E1", marginTop:8 }}>
                      <div style={{ fontSize:48, marginBottom:12 }}>🧩</div>
                      <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>Build your quiz flow</h3>
                      <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Add questions, image sections, loading screens, summary, comparison, signup and sales</p>
                      <button onClick={() => { setInsertIdx(0); setShowPicker(true); }} style={{ padding:"11px 26px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                        + Add First Block
                      </button>
                    </div>
                  )}
                </DndContext>
              )}
            </div>
          </div>
        )}

        {/* Right - preview */}
        <div style={{ flex: previewMode ? 1 : "0 0 42%", overflow:"auto", padding:"24px 28px", background: previewMode ? "#fff" : "#FAFBFC" }}>
          <div style={{ maxWidth: previewMode ? 640 : 420, margin:"0 auto" }}>
            {!previewMode && (
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16, padding:"8px 14px", background:"#EEF2FF", borderRadius:10 }}>
                <Eye size={13} color="#6366f1"/>
                <span style={{ fontSize:12, fontWeight:600, color:"#6366f1" }}>Live Preview</span>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {blocks.map((block, idx) => (
                <BlockPreview key={block.id} block={block} idx={idx} isActive={activeId === block.id} onClick={() => setActiveId(block.id)}/>
              ))}
              {blocks.length === 0 && (
                <p style={{ textAlign:"center", color:"#CBD5E1", padding:40, fontSize:14 }}>Your quiz preview appears here</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Block picker */}
      {showPicker && (
        <div onClick={() => setShowPicker(false)} style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:24, padding:24, width:"100%", maxWidth:620, boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>Add a block</h3>
            <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Choose what to add to your quiz flow</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {BLOCK_TYPES.map(def => (
                <button key={def.type} onClick={() => addBlock(def.type)}
                  style={{ padding:"16px 12px", borderRadius:14, border:`1.5px solid ${def.color}25`, background:def.bg, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=def.color; e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=`${def.color}25`; e.currentTarget.style.transform="translateY(0)"; }}>
                  <span style={{ fontSize:26 }}>{def.icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:def.color }}>{def.label}</span>
                  <span style={{ fontSize:10, color:"#94A3B8", textAlign:"center", lineHeight:1.3 }}>{def.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function SortableBlock({ block, idx, isActive, onToggle, onChange, onPathChange, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const def = BLOCK_TYPES.find(b => b.type === block.type) || { icon:"❓", label:"Unknown", color:"#64748B", bg:"#F8FAFC" };
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={{ ...style, background:"#fff", borderRadius:16, border:`1.5px solid ${isActive?def.color+"60":"#E2E8F0"}`, overflow:"hidden", marginBottom:2, boxShadow:isActive?`0 4px 20px ${def.color}15`:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 12px", background:isActive?def.bg:"#fff" }}>
        <button {...attributes} {...listeners} style={{ cursor:"grab", border:"none", background:"none", padding:2, display:"flex", touchAction:"none" }}>
          <GripVertical size={16} color="#CBD5E1"/>
        </button>
        <span style={{ fontSize:18 }}>{def.icon}</span>
        <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={onToggle}>
          <p style={{ fontSize:13, fontWeight:700, color:def.color, margin:0 }}>{idx+1}. {def.label}</p>
          <p style={{ fontSize:11, color:"#94A3B8", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {block.content?.question || block.content?.title || block.content?.heading || block.content?.text || "Click to edit"}
          </p>
        </div>
        <select value={block.path||"all"} onChange={e => onPathChange(e.target.value)}
          onClick={e => e.stopPropagation()}
          style={{ padding:"4px 8px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:11, fontWeight:600, color:"#64748B", background:"#fff" }}>
          <option value="all">All users</option>
          <option value="company">Company only</option>
          <option value="myself">Myself only</option>
        </select>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={onDuplicate} style={{ width:26, height:26, borderRadius:7, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748B" }}>
            <Copy size={12}/>
          </button>
          <button onClick={onDelete} style={{ width:26, height:26, borderRadius:7, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#EF4444" }}>
            <Trash2 size={12}/>
          </button>
        </div>
      </div>
      {isActive && (
        <div style={{ padding:"4px 14px 16px", borderTop:`1px solid ${def.color}20` }}>
          <BlockEditor type={block.type} content={block.content} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

function BlockPreview({ block, idx, isActive, onClick }) {
  const def = BLOCK_TYPES.find(b => b.type === block.type) || { icon:"❓", label:"Unknown", color:"#64748B", bg:"#F8FAFC" };
  const c = block.content || {};

  const renderPreview = () => {
    switch(block.type) {
      case "question_choice": {
        const opts = (c.options||[]).filter(Boolean);
        const imgs = c.optionImages || [];
        const hasImgs = imgs.some(Boolean);
        return (
          <div>
            <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>{c.question||"Question"}</h3>
            {c.subtitle && <p style={{ fontSize:12, color:"#64748B", margin:"0 0 12px" }}>{c.subtitle}</p>}
            <div style={{ display:"grid", gridTemplateColumns: hasImgs && opts.length===2 ? "1fr 1fr" : "1fr", gap:8 }}>
              {opts.map((opt,i) => (
                <div key={i} style={{ borderRadius:10, border:"1.5px solid #E2E8F0", overflow:"hidden", background:"#F8FAFC" }}>
                  {imgs[i] && <img src={imgs[i]} alt="" style={{ width:"100%", height:80, objectFit:"cover", display:"block" }}/>}
                  <div style={{ padding:"8px 10px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"#0f172a" }}>{opt}</span>
                    <span style={{ fontSize:10, color:"#94A3B8" }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "image_section":
        return (
          <div>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>{c.heading||"Image Section"}</h3>
            {c.subtext && <p style={{ fontSize:12, color:"#64748B", margin:"0 0 10px" }}>{c.subtext}</p>}
            {c.imageUrl && <img src={c.imageUrl} alt="" style={{ width:"100%", borderRadius:10, display:"block", marginBottom:8 }}/>}
            {(c.bullets||[]).filter(Boolean).map((b,i) => (
              <div key={i} style={{ display:"flex", gap:8, padding:"6px 0", borderBottom:"1px solid #F1F5F9" }}>
                <span style={{ color:"#5B4EFF", fontSize:12 }}>✓</span>
                <span style={{ fontSize:12, color:"#374151" }}>{b}</span>
              </div>
            ))}
          </div>
        );
      case "loading":
        return (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", border:"4px solid #EEF2FF", borderTopColor:"#5B4EFF", margin:"0 auto 12px" }}/>
            <p style={{ fontSize:13, color:"#64748B", margin:0 }}>{c.text||"Analyzing..."}</p>
            <p style={{ fontSize:11, color:"#94A3B8", margin:"4px 0 0" }}>Duration: {c.duration||3}s</p>
          </div>
        );
      case "summary":
        return (
          <div>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>{c.title||"Personal Summary"}</h3>
            {c.subtitle && <p style={{ fontSize:12, color:"#64748B", margin:"0 0 10px" }}>{c.subtitle}</p>}
            <div style={{ background:"#F8FAFC", borderRadius:10, padding:12, marginBottom:10 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#374151", margin:"0 0 4px" }}>{c.statLabel||"AI Skills"}</p>
              <div style={{ height:8, borderRadius:999, background:"linear-gradient(to right,#ef4444,#f59e0b,#22c55e)" }}/>
            </div>
            {(c.items||[]).filter(Boolean).map((item,i) => {
              const [label,val] = item.split("|");
              return <div key={i} style={{ display:"flex", gap:8, padding:"6px 0", borderBottom:"1px solid #F1F5F9" }}>
                <span style={{ fontSize:11, color:"#94A3B8", flex:1 }}>{label}</span>
                <span style={{ fontSize:11, fontWeight:700, color:"#0f172a" }}>{val}</span>
              </div>;
            })}
          </div>
        );
      case "comparison":
        return (
          <div>
            <h3 style={{ fontSize:13, fontWeight:800, color:"#0f172a", margin:"0 0 10px" }}>{c.title||"Comparison"}</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div style={{ borderRadius:10, border:"1.5px solid #FEE2E2", overflow:"hidden" }}>
                <div style={{ padding:"6px 10px", background:"#FEF2F2" }}><p style={{ fontSize:11, fontWeight:700, color:"#991B1B", margin:0 }}>Without Coursiv</p></div>
                <div style={{ padding:8 }}>{(c.without||[]).filter(Boolean).slice(0,3).map((item,i) => <p key={i} style={{ fontSize:10, color:"#374151", margin:"0 0 4px" }}>• {item}</p>)}</div>
              </div>
              <div style={{ borderRadius:10, border:"1.5px solid #BBF7D0", overflow:"hidden" }}>
                <div style={{ padding:"6px 10px", background:"#F0FDF4" }}><p style={{ fontSize:11, fontWeight:700, color:"#166534", margin:0 }}>With Coursiv</p></div>
                <div style={{ padding:8 }}>{(c.with||[]).filter(Boolean).slice(0,3).map((item,i) => <p key={i} style={{ fontSize:10, color:"#374151", margin:"0 0 4px" }}>✓ {item}</p>)}</div>
              </div>
            </div>
          </div>
        );
      case "signup":
        return (
          <div>
            <h3 style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>{c.heading||"Name + Email"}</h3>
            {c.subtext && <p style={{ fontSize:12, color:"#64748B", margin:"0 0 10px" }}>{c.subtext}</p>}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ padding:"10px 12px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#F8FAFC", fontSize:12, color:"#94A3B8" }}>Full Name</div>
              <div style={{ padding:"10px 12px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#F8FAFC", fontSize:12, color:"#94A3B8" }}>Email Address</div>
            </div>
          </div>
        );
      case "sales": {
        const plans = (c.plans||[]).filter(Boolean).map(p => { const parts = p.split("|"); return { name:parts[0], price:parts[1] }; });
        return (
          <div>
            <h3 style={{ fontSize:13, fontWeight:800, color:"#0f172a", margin:"0 0 10px" }}>{c.heading||"Sales Page"}</h3>
            {plans.map((plan,i) => (
              <div key={i} style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${i===1?"#5B4EFF":"#E2E8F0"}`, background:i===1?"#EEF2FF":"#F8FAFC", marginBottom:6, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{plan.name}</span>
                <span style={{ fontSize:13, fontWeight:900, color:"#5B4EFF" }}>${plan.price}</span>
              </div>
            ))}
            <div style={{ padding:"10px", borderRadius:10, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", textAlign:"center", marginTop:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#fff" }}>GET MY PLAN →</span>
            </div>
          </div>
        );
      }
      case "question_icon": {
        const opts = (c.options||[]);
        return (
          <div>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>{c.question||"Icon Choice Question"}</h3>
            {c.subtitle && <p style={{ fontSize:12, color:"#64748B", margin:"0 0 10px" }}>{c.subtitle}</p>}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {opts.slice(0,3).map((opt,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"#F8FAFC", borderRadius:12, border:"1.5px solid #E2E8F0" }}>
                  <span style={{ fontSize:24, width:40, textAlign:"center" }}>{opt.emoji||"•"}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{opt.label||`Option ${i+1}`}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      default: return <p style={{ fontSize:12, color:"#94A3B8" }}>No preview available</p>;
    }
  };

  return (
    <div onClick={onClick} style={{ background:"#fff", borderRadius:16, border:`1.5px solid ${isActive?"#6366f1":"#F1F5F9"}`, padding:16, cursor:"pointer", transition:"all 0.15s", boxShadow:isActive?"0 4px 16px rgba(99,102,241,0.15)":"none" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:14 }}>{def.icon}</span>
        <span style={{ fontSize:11, fontWeight:700, color:def.color }}>{idx+1}. {def.label}</span>
        <span style={{ marginLeft:"auto", fontSize:10, color:"#94A3B8", background:"#F8FAFC", padding:"2px 8px", borderRadius:999 }}>{block.path==="all"?"All":block.path==="company"?"Company":"Myself"}</span>
      </div>
      {renderPreview()}
    </div>
  );
}

function InsertLine({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display:"flex", alignItems:"center", gap:8, height:24, opacity:hover?1:0.35, transition:"opacity 0.15s", cursor:"pointer" }}
      onClick={onClick}>
      <div style={{ flex:1, height:1, background:hover?"#a78bfa":"#E2E8F0" }}/>
      <div style={{ width:24, height:24, borderRadius:"50%", border:`1.5px solid ${hover?"#7c3aed":"#CBD5E1"}`, background:hover?"#7c3aed":"#fff", color:hover?"#fff":"#94A3B8", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Plus size={13}/>
      </div>
      <div style={{ flex:1, height:1, background:hover?"#a78bfa":"#E2E8F0" }}/>
    </div>
  );
}

function BlockEditor({ type, content, onChange }) {
  const u = (k, v) => onChange({ ...content, [k]: v });
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [imgMode, setImgMode] = useState("url");

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const path = `quiz/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g,"_")}`;
      const { error } = await supabase.storage.from("lesson-media").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("lesson-media").getPublicUrl(path);
      u("imageUrl", data.publicUrl);
    } catch(e) { alert("Upload failed: " + e.message); }
    setUploading(false);
  };

  const handleOptionImageUpload = async (file, idx) => {
    if (!file) return;
    setUploading(true);
    try {
      const path = `quiz/opt-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g,"_")}`;
      const { error } = await supabase.storage.from("lesson-media").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("lesson-media").getPublicUrl(path);
      const imgs = [...(content.optionImages||[])];
      imgs[idx] = data.publicUrl;
      u("optionImages", imgs);
    } catch(e) { alert("Upload failed: " + e.message); }
    setUploading(false);
  };

  if (type === "question_choice") {
    const options = content.options || ["", ""];
    const optionImages = content.optionImages || [];
    const setOpt = (i, v) => { const a = [...options]; a[i] = v; u("options", a); };
    const setOptImg = (i, v) => { const a = [...optionImages]; a[i] = v; u("optionImages", a); };
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Field label="Question"><input value={content.question||""} onChange={e=>u("question",e.target.value)} placeholder="How would you describe yourself?" style={inp()}/></Field>
        <Field label="Subtitle" hint="optional"><input value={content.subtitle||""} onChange={e=>u("subtitle",e.target.value)} placeholder="We will personalize your path" style={inp()}/></Field>
        <Field label="This splits the path?">
          <select value={content.isSplit||"no"} onChange={e=>u("isSplit",e.target.value)} style={inp()}>
            <option value="no">No — show to all users</option>
            <option value="yes">Yes — 1st option = company, 2nd = myself</option>
          </select>
        </Field>
        <Field label="Options">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {options.map((opt, i) => (
              <div key={i} style={{ background:"#F8FAFC", borderRadius:12, padding:12, border:"1.5px solid #E2E8F0" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#6366f1", flexShrink:0 }}>{i+1}</div>
                  <input value={opt} onChange={e=>setOpt(i,e.target.value)} placeholder={`Option ${i+1}`} style={{ ...inp(), flex:1 }}/>
                  {options.length > 2 && (
                    <button onClick={() => { const a=[...options]; a.splice(i,1); u("options",a); }} style={{ width:28, height:28, borderRadius:7, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#EF4444", flexShrink:0 }}>
                      <Trash2 size={12}/>
                    </button>
                  )}
                </div>
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", margin:"0 0 6px", textTransform:"uppercase" }}>Option image · optional</p>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => { const inp2 = document.createElement("input"); inp2.type="file"; inp2.accept="image/*"; inp2.onchange=e=>handleOptionImageUpload(e.target.files[0],i); inp2.click(); }}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:11, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                      <Upload size={12}/> Upload
                    </button>
                    <input value={optionImages[i]||""} onChange={e=>setOptImg(i,e.target.value)} placeholder="or paste image URL..." style={{ ...inp(), flex:1, fontSize:11 }}/>
                  </div>
                  {optionImages[i] && <div style={{ marginTop:6, borderRadius:8, overflow:"hidden", height:60 }}><img src={optionImages[i]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/></div>}
                </div>
              </div>
            ))}
            <button onClick={() => u("options",[...options,""])} style={{ padding:"8px", borderRadius:9, border:"1.5px dashed #E2E8F0", background:"#F8FAFC", color:"#94A3B8", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              + Add option
            </button>
          </div>
        </Field>
      </div>
    );
  }

  if (type === "image_section") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Field label="Heading"><input value={content.heading||""} onChange={e=>u("heading",e.target.value)} placeholder="AI is Easier Than You Think" style={inp()}/></Field>
        <Field label="Subtext" hint="optional"><textarea value={content.subtext||""} onChange={e=>u("subtext",e.target.value)} style={{ ...inp(), minHeight:70, resize:"vertical" }}/></Field>
        <Field label="Image">
          <div style={{ display:"flex", gap:6, marginBottom:8 }}>
            <button onClick={() => setImgMode("upload")} style={{ flex:1, padding:"7px", borderRadius:8, border:`1.5px solid ${imgMode==="upload"?"#6366f1":"#E2E8F0"}`, background:imgMode==="upload"?"#EEF2FF":"#fff", fontSize:12, fontWeight:600, color:imgMode==="upload"?"#6366f1":"#64748B", cursor:"pointer" }}>📤 Upload</button>
            <button onClick={() => setImgMode("url")} style={{ flex:1, padding:"7px", borderRadius:8, border:`1.5px solid ${imgMode==="url"?"#6366f1":"#E2E8F0"}`, background:imgMode==="url"?"#EEF2FF":"#fff", fontSize:12, fontWeight:600, color:imgMode==="url"?"#6366f1":"#64748B", cursor:"pointer" }}>🔗 URL</button>
          </div>
          {imgMode==="upload" ? (
            <>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleImageUpload(e.target.files[0])}/>
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width:"100%", padding:"12px", borderRadius:10, border:"2px dashed #6366f1", background:"#EEF2FF", color:"#6366f1", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {uploading ? "Uploading..." : content.imageUrl ? "Change image" : "Click to upload"}
              </button>
            </>
          ) : (
            <input value={content.imageUrl||""} onChange={e=>u("imageUrl",e.target.value)} placeholder="https://..." style={inp()}/>
          )}
          {content.imageUrl && <div style={{ marginTop:8, borderRadius:12, overflow:"hidden", height:100 }}><img src={content.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/></div>}
        </Field>
        <Field label="Bullet points" hint="one per line">
          <textarea value={(content.bullets||[]).join("\n")} onChange={e=>u("bullets",e.target.value.split("\n"))} placeholder={"No prior AI knowledge required\nWork at your own pace"} style={{ ...inp(), minHeight:80, resize:"vertical" }}/>
        </Field>
        <Field label="Layout">
          <select value={content.layout||"image-right"} onChange={e=>u("layout",e.target.value)} style={inp()}>
            <option value="image-right">Text left, Image right</option>
            <option value="image-left">Image left, Text right</option>
            <option value="image-top">Image top, Text below</option>
            <option value="fullwidth">Full width</option>
          </select>
        </Field>
      </div>
    );
  }

  if (type === "loading") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <Field label="Loading text"><input value={content.text||""} onChange={e=>u("text",e.target.value)} placeholder="Analyzing answers..." style={inp()}/></Field>
        <Field label="Duration (seconds)"><input type="number" value={content.duration||3} onChange={e=>u("duration",parseInt(e.target.value))} style={inp()}/></Field>
        <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>Reviews show automatically from built-in list.</p>
      </div>
    );
  }

  if (type === "summary") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <Field label="Title"><input value={content.title||""} onChange={e=>u("title",e.target.value)} placeholder="Your Personal Summary" style={inp()}/></Field>
        <Field label="Subtitle"><input value={content.subtitle||""} onChange={e=>u("subtitle",e.target.value)} placeholder="The quiz indicates..." style={inp()}/></Field>
        <Field label="Skill label"><input value={content.statLabel||""} onChange={e=>u("statLabel",e.target.value)} placeholder="A.I. Skills" style={inp()}/></Field>
        <Field label="Insight items (label|value, one per line)">
          <textarea value={(content.items||[]).join("\n")} onChange={e=>u("items",e.target.value.split("\n"))} placeholder={"Your focus|Future-proofing your role\nYour pace|20 min a day"} style={{ ...inp(), minHeight:100, resize:"vertical" }}/>
        </Field>
      </div>
    );
  }

  if (type === "comparison") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <Field label="Title"><input value={content.title||""} onChange={e=>u("title",e.target.value)} placeholder="Your Personalized A.I. Certificate Program" style={inp()}/></Field>
        <Field label="Without Coursiv (one per line)">
          <textarea value={(content.without||[]).join("\n")} onChange={e=>u("without",e.target.value.split("\n"))} placeholder={"No time to get started\nNo recognized credential"} style={{ ...inp(), minHeight:80, resize:"vertical" }}/>
        </Field>
        <Field label="With Coursiv (one per line)">
          <textarea value={(content.with||[]).join("\n")} onChange={e=>u("with",e.target.value.split("\n"))} placeholder={"Clear, step-by-step path\nShareable AI credential"} style={{ ...inp(), minHeight:80, resize:"vertical" }}/>
        </Field>
      </div>
    );
  }

  if (type === "signup") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <Field label="Heading"><input value={content.heading||""} onChange={e=>u("heading",e.target.value)} placeholder="Your A.I. Program is Ready!" style={inp()}/></Field>
        <Field label="Subtext"><input value={content.subtext||""} onChange={e=>u("subtext",e.target.value)} placeholder="Enter your details to continue" style={inp()}/></Field>
      </div>
    );
  }

  if (type === "sales") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <Field label="Heading"><input value={content.heading||""} onChange={e=>u("heading",e.target.value)} placeholder="Your Personalized A.I. Certificate Program is Ready!" style={inp()}/></Field>
        <Field label="Plans (name|price, one per line)">
          <textarea value={(content.plans||[]).join("\n")} onChange={e=>u("plans",e.target.value.split("\n"))} placeholder={"1-Week Plan|6.93\n4-Week Plan|19.99\n12-Week Plan|39.99"} style={{ ...inp(), minHeight:80, resize:"vertical" }}/>
        </Field>
      </div>
    );
  }

  if (type === "question_icon") {
    const options = content.options || [{label:"",emoji:""},{label:"",emoji:""}];
    const setOpt = (i, k, v) => { const a=[...options]; a[i]={...a[i],[k]:v}; u("options",a); };
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Field label="Question"><input value={content.question||""} onChange={e=>u("question",e.target.value)} placeholder="What do you want AI to help you with?" style={inp()}/></Field>
        <Field label="Subtitle" hint="optional"><input value={content.subtitle||""} onChange={e=>u("subtitle",e.target.value)} placeholder="Choose your main use case" style={inp()}/></Field>
        <Field label="Options">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {options.map((opt, i) => (
              <div key={i} style={{ background:"#F8FAFC", borderRadius:12, padding:12, border:"1.5px solid #E2E8F0" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:"#F5F3FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#8b5cf6", flexShrink:0 }}>{i+1}</div>
                  <input value={opt.emoji||""} onChange={e=>setOpt(i,"emoji",e.target.value)} placeholder="✍️" style={{ ...inp(), width:60, textAlign:"center", fontSize:20 }}/>
                  <input value={opt.label||""} onChange={e=>setOpt(i,"label",e.target.value)} placeholder="Option text" style={{ ...inp(), flex:1 }}/>
                  {options.length > 2 && (
                    <button onClick={() => { const a=[...options]; a.splice(i,1); u("options",a); }} style={{ width:28, height:28, borderRadius:7, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#EF4444", flexShrink:0 }}>
                      <Trash2 size={12}/>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button onClick={() => u("options",[...options,{label:"",emoji:""}])} style={{ padding:"8px", borderRadius:9, border:"1.5px dashed #E2E8F0", background:"#F8FAFC", color:"#94A3B8", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              + Add option
            </button>
          </div>
        </Field>
      </div>
    );
  }

  return null;
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>
        {label} {hint && <span style={{ color:"#94A3B8", fontWeight:400, textTransform:"none" }}>· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function getDefaultContent(type) {
  switch(type) {
    case "question_choice": return { question:"", subtitle:"", options:["Option 1","Option 2"], optionImages:[], isSplit:"no" };
    case "question_icon":   return { question:"", subtitle:"", options:[{label:"Option 1", emoji:"✍️"},{label:"Option 2", emoji:"📊"}] };
    case "image_section":   return { heading:"", subtext:"", imageUrl:"", bullets:[], layout:"image-right" };
    case "loading":         return { text:"Analyzing answers to personalize your A.I. Certificate Program...", duration:3 };
    case "summary":         return { title:"Your Personal Summary", subtitle:"The quiz indicates that what held you back is time, not capability", statLabel:"A.I. Skills", items:["Your focus|Future-proofing your role","Your readiness|Ready to learn online","Your pace|20 min a day","Learning experience|Self-taught so far"] };
    case "comparison":      return { title:"Your Personalized A.I. Certificate Program", without:["No time to get started","No recognized credential","A.I. feels hard to use","Invisible to employers"], with:["Clear, step-by-step path","Shareable A.I. credential","Reliable results from A.I.","Stand out from other workers"] };
    case "signup":          return { heading:"Your A.I. Program is Ready!", subtext:"Enter your details to continue" };
    case "sales":           return { heading:"Your Personalized A.I. Certificate Program is Ready!", plans:["1-Week Plan|6.93","4-Week Plan|19.99","12-Week Plan|39.99"] };
    default: return {};
  }
}

const inp = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
