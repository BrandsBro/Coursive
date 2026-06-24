"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Trash2, GripVertical, Save, Check, Loader, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const BLOCK_TYPES = [
  { type:"question_choice",  icon:"❓", label:"Choice Question",   desc:"Single or multi choice",  color:"#6366f1", bg:"#EEF2FF" },
  { type:"question_text",    icon:"✍️", label:"Text Question",     desc:"Open text answer",         color:"#0891b2", bg:"#ECFEFF" },
  { type:"image_section",    icon:"🖼️", label:"Image Section",     desc:"Image with text",          color:"#059669", bg:"#ECFDF5" },
  { type:"insight",          icon:"📊", label:"Insight Screen",    desc:"Stats/report screen",      color:"#d97706", bg:"#FFFBEB" },
  { type:"comparison",       icon:"⚖️", label:"Comparison",        desc:"With/without comparison",  color:"#dc2626", bg:"#FEF2F2" },
  { type:"review",           icon:"⭐", label:"Review Screen",     desc:"Trustpilot style review",  color:"#7c3aed", bg:"#F5F3FF" },
  { type:"loading",          icon:"⏳", label:"Loading Screen",    desc:"Analysis loading screen",  color:"#0369a1", bg:"#F0F9FF" },
  { type:"signup",           icon:"👤", label:"Name + Email",      desc:"Capture user details",     color:"#15803d", bg:"#F0FDF4" },
  { type:"sales",            icon:"💰", label:"Sales Page",        desc:"Plan selection screen",    color:"#b45309", bg:"#FFFBEB" },
];

export default function AdminQuizBuilder() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [insertIdx, setInsertIdx] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("quiz_blocks")
      .select("*")
      .order("order_index");
    setBlocks((data || []).map(b => ({ ...b, content: b.content || {} })));
    setLoading(false);
  };

  const addBlock = (type) => {
    const def = BLOCK_TYPES.find(b => b.type === type);
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
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Quiz Flow Builder</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{blocks.length} blocks · drag to reorder</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <a href="/quiz" target="_blank" style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600, textDecoration:"none" }}>
              <Eye size={15}/> Preview
            </a>
            <button onClick={saveAll} disabled={saving} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:12, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {saving ? <><Loader size={14} className="bspin"/> Saving...</> : saved ? <><Check size={14}/> Saved!</> : <><Save size={14}/> Save</>}
            </button>
          </div>
        </div>

        {/* Builder */}
        {loading ? (
          <div style={{ padding:60, textAlign:"center" }}><Loader size={28} color="#94A3B8" className="bspin"/></div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:24 }}>

            {/* Left - blocks */}
            <div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <InsertLine onClick={() => { setInsertIdx(0); setShowPicker(true); }} />
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  {blocks.map((block, idx) => (
                    <div key={block.id}>
                      <SortableBlock
                        block={block}
                        idx={idx}
                        isActive={activeId === block.id}
                        onToggle={() => setActiveId(activeId === block.id ? null : block.id)}
                        onChange={c => updateBlock(block.id, c)}
                        onPathChange={p => updatePath(block.id, p)}
                        onDelete={() => deleteBlock(block.id)}
                      />
                      <InsertLine onClick={() => { setInsertIdx(idx + 1); setShowPicker(true); }} />
                    </div>
                  ))}
                </SortableContext>
              </DndContext>

              {blocks.length === 0 && (
                <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #CBD5E1" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🧩</div>
                  <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>Build your quiz flow</h3>
                  <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Add questions, images, insights and more</p>
                  <button onClick={() => { setInsertIdx(0); setShowPicker(true); }} style={{ padding:"11px 26px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                    + Add First Block
                  </button>
                </div>
              )}
            </div>

            {/* Right - flow map */}
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:20, height:"fit-content", position:"sticky", top:24 }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Flow Map</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {blocks.map((b, i) => {
                  const def = BLOCK_TYPES.find(x => x.type === b.type);
                  return (
                    <div key={b.id} onClick={() => setActiveId(b.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:10, background:activeId===b.id?"#EEF2FF":"#F8FAFC", cursor:"pointer", border:`1px solid ${activeId===b.id?"#C7D2FE":"#F1F5F9"}` }}>
                      <span style={{ fontSize:14 }}>{def?.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:12, fontWeight:700, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {i+1}. {def?.label}
                        </p>
                        <p style={{ fontSize:10, color:"#94A3B8", margin:0 }}>
                          {b.path !== "all" ? `Path: ${b.path}` : "All users"}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {blocks.length === 0 && <p style={{ fontSize:13, color:"#94A3B8", textAlign:"center", padding:20 }}>No blocks yet</p>}
              </div>
            </div>
          </div>
        )}
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
    </AdminLayout>
  );
}

function SortableBlock({ block, idx, isActive, onToggle, onChange, onPathChange, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const def = BLOCK_TYPES.find(b => b.type === block.type) || { icon:"❓", label:"Unknown", color:"#64748B", bg:"#F8FAFC" };
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={{ ...style, background:"#fff", borderRadius:16, border:`1.5px solid ${isActive?def.color+"60":"#E2E8F0"}`, overflow:"hidden", marginBottom:2, boxShadow:isActive?`0 4px 20px ${def.color}15`:"0 1px 3px rgba(0,0,0,0.04)" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 12px", background:isActive?def.bg:"#fff" }}>
        <button {...attributes} {...listeners} style={{ cursor:"grab", border:"none", background:"none", padding:2, display:"flex", touchAction:"none" }}>
          <GripVertical size={16} color="#CBD5E1"/>
        </button>
        <span style={{ fontSize:18 }}>{def.icon}</span>
        <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={onToggle}>
          <p style={{ fontSize:13, fontWeight:700, color:def.color, margin:0 }}>{idx+1}. {def.label}</p>
          <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>
            {block.content?.question || block.content?.title || block.content?.heading || def.label}
          </p>
        </div>
        {/* Path selector */}
        <select value={block.path || "all"} onChange={e => onPathChange(e.target.value)}
          style={{ padding:"4px 8px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:11, fontWeight:600, color:"#64748B", cursor:"pointer", background:"#fff" }}
          onClick={e => e.stopPropagation()}>
          <option value="all">All users</option>
          <option value="company">Company only</option>
          <option value="myself">Myself only</option>
        </select>
        <button onClick={onDelete} style={{ width:26, height:26, borderRadius:7, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#EF4444" }}>
          <Trash2 size={12}/>
        </button>
      </div>

      {/* Editor */}
      {isActive && (
        <div style={{ padding:"12px 16px 16px", borderTop:`1px solid ${def.color}20` }}>
          <BlockEditor type={block.type} content={block.content} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

function BlockEditor({ type, content, onChange }) {
  const u = (k, v) => onChange({ ...content, [k]: v });

  switch(type) {
    case "question_choice":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Field label="Question"><input value={content.question||""} onChange={e=>u("question",e.target.value)} placeholder="How would you describe yourself?" style={inp()}/></Field>
          <Field label="Options (one per line)">
            <textarea value={(content.options||[]).join("\n")} onChange={e=>u("options",e.target.value.split("\n"))} placeholder={"I work for a company\nI work for myself"} style={{ ...inp(), minHeight:100, resize:"vertical" }}/>
          </Field>
          <Field label="Allow multiple?">
            <select value={content.multi||"no"} onChange={e=>u("multi",e.target.value)} style={inp()}>
              <option value="no">Single choice</option>
              <option value="yes">Multiple choice</option>
            </select>
          </Field>
          <Field label="Show images for options?" hint="optional">
            <input value={content.optionImages||""} onChange={e=>u("optionImages",e.target.value)} placeholder="Comma separated image URLs" style={inp()}/>
          </Field>
          <Field label="This is the path splitter?">
            <select value={content.isSplit||"no"} onChange={e=>u("isSplit",e.target.value)} style={inp()}>
              <option value="no">No</option>
              <option value="yes">Yes — first option = company, second = myself</option>
            </select>
          </Field>
        </div>
      );
    case "question_text":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Field label="Question"><input value={content.question||""} onChange={e=>u("question",e.target.value)} placeholder="What is your name?" style={inp()}/></Field>
          <Field label="Placeholder"><input value={content.placeholder||""} onChange={e=>u("placeholder",e.target.value)} placeholder="Type your answer..." style={inp()}/></Field>
        </div>
      );
    case "image_section":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Field label="Heading"><input value={content.heading||""} onChange={e=>u("heading",e.target.value)} placeholder="AI is Easier Than You Think" style={inp()}/></Field>
          <Field label="Subtext"><textarea value={content.subtext||""} onChange={e=>u("subtext",e.target.value)} style={{ ...inp(), minHeight:70, resize:"vertical" }}/></Field>
          <Field label="Image URL"><input value={content.imageUrl||""} onChange={e=>u("imageUrl",e.target.value)} placeholder="https://..." style={inp()}/></Field>
          <Field label="Bullet points (one per line)"><textarea value={(content.bullets||[]).join("\n")} onChange={e=>u("bullets",e.target.value.split("\n"))} style={{ ...inp(), minHeight:80, resize:"vertical" }}/></Field>
        </div>
      );
    case "insight":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Field label="Title"><input value={content.title||""} onChange={e=>u("title",e.target.value)} placeholder="Your Personal Summary" style={inp()}/></Field>
          <Field label="Subtitle"><input value={content.subtitle||""} onChange={e=>u("subtitle",e.target.value)} placeholder="The quiz indicates that..." style={inp()}/></Field>
          <Field label="Stat label (e.g. AI Skills)"><input value={content.statLabel||""} onChange={e=>u("statLabel",e.target.value)} placeholder="AI Skills" style={inp()}/></Field>
          <Field label="Insight items (label|value, one per line)">
            <textarea value={(content.items||[]).join("\n")} onChange={e=>u("items",e.target.value.split("\n"))} placeholder={"Your focus|Future-proofing your role\nYour pace|20 min a day"} style={{ ...inp(), minHeight:100, resize:"vertical" }}/>
          </Field>
        </div>
      );
    case "comparison":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Field label="Title"><input value={content.title||""} onChange={e=>u("title",e.target.value)} placeholder="Your Personalized AI Certificate Program" style={inp()}/></Field>
          <Field label="Without Coursiv (one per line)"><textarea value={(content.without||[]).join("\n")} onChange={e=>u("without",e.target.value.split("\n"))} style={{ ...inp(), minHeight:80, resize:"vertical" }} placeholder={"No time to get started\nNo recognized credential"}/></Field>
          <Field label="With Coursiv (one per line)"><textarea value={(content.with||[]).join("\n")} onChange={e=>u("with",e.target.value.split("\n"))} style={{ ...inp(), minHeight:80, resize:"vertical" }} placeholder={"Clear, step-by-step path\nShareable AI credential"}/></Field>
          <Field label="Target date label"><input value={content.dateLabel||""} onChange={e=>u("dateLabel",e.target.value)} placeholder="by July 22, 2026" style={inp()}/></Field>
        </div>
      );
    case "review":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Field label="Stat (e.g. 2,000,000+ people)"><input value={content.stat||""} onChange={e=>u("stat",e.target.value)} placeholder="2,000,000+ people" style={inp()}/></Field>
          <Field label="Stat subtext"><input value={content.statSub||""} onChange={e=>u("statSub",e.target.value)} placeholder="have chosen Coursiv" style={inp()}/></Field>
          <Field label="Review title"><input value={content.reviewTitle||""} onChange={e=>u("reviewTitle",e.target.value)} placeholder="Amazing to upgrade skills" style={inp()}/></Field>
          <Field label="Review text"><textarea value={content.reviewText||""} onChange={e=>u("reviewText",e.target.value)} style={{ ...inp(), minHeight:70, resize:"vertical" }}/></Field>
          <Field label="Reviewer name"><input value={content.reviewer||""} onChange={e=>u("reviewer",e.target.value)} placeholder="Jeremy" style={inp()}/></Field>
        </div>
      );
    case "loading":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Field label="Loading text"><input value={content.text||""} onChange={e=>u("text",e.target.value)} placeholder="Analyzing answers to personalize your AI Certificate Program..." style={inp()}/></Field>
          <Field label="Duration (seconds)"><input type="number" value={content.duration||3} onChange={e=>u("duration",parseInt(e.target.value))} style={inp()}/></Field>
        </div>
      );
    case "signup":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Field label="Heading"><input value={content.heading||""} onChange={e=>u("heading",e.target.value)} placeholder="Your Personalized AI Certificate Program is Ready!" style={inp()}/></Field>
          <Field label="Subtext"><input value={content.subtext||""} onChange={e=>u("subtext",e.target.value)} placeholder="Enter your details to get started" style={inp()}/></Field>
        </div>
      );
    case "sales":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Field label="Heading"><input value={content.heading||""} onChange={e=>u("heading",e.target.value)} placeholder="Choose the best plan for you" style={inp()}/></Field>
          <Field label="Discount %"><input type="number" value={content.discount||50} onChange={e=>u("discount",parseInt(e.target.value))} style={inp()}/></Field>
          <Field label="Plans (name|price|originalPrice, one per line)">
            <textarea value={(content.plans||[]).join("\n")} onChange={e=>u("plans",e.target.value.split("\n"))} placeholder={"1-Week Plan|6.93|13.86\n4-Week Plan|19.99|39.99\n12-Week Plan|39.99|79.99"} style={{ ...inp(), minHeight:80, resize:"vertical" }}/>
          </Field>
        </div>
      );
    default: return <p style={{ fontSize:13, color:"#94A3B8" }}>No editor for this block type yet.</p>;
  }
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
    case "question_choice": return { question:"", options:["Option 1","Option 2"], multi:"no", isSplit:"no" };
    case "question_text":   return { question:"", placeholder:"Type your answer..." };
    case "image_section":   return { heading:"", subtext:"", imageUrl:"", bullets:[] };
    case "insight":         return { title:"Your Personal Summary", subtitle:"", statLabel:"AI Skills", items:[] };
    case "comparison":      return { title:"", without:[], with:[], dateLabel:"" };
    case "review":          return { stat:"2,000,000+", statSub:"have chosen Coursiv", reviewTitle:"", reviewText:"", reviewer:"" };
    case "loading":         return { text:"Analyzing your answers...", duration:3 };
    case "signup":          return { heading:"Your Personalized AI Certificate Program is Ready!", subtext:"" };
    case "sales":           return { heading:"Choose the best plan for you", discount:50, plans:["1-Week Plan|6.93|13.86","4-Week Plan|19.99|39.99","12-Week Plan|39.99|79.99"] };
    default: return {};
  }
}

const inp = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
