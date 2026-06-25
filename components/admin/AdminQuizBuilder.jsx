"use client";

import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Trash2, GripVertical, Save, Check, Loader, Eye, Upload, Link2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const BLOCK_TYPES = [
  { type:"question_choice", icon:"❓", label:"Choice Question", desc:"Single choice with options", color:"#6366f1", bg:"#EEF2FF" },
  { type:"image_section",   icon:"🖼️", label:"Image Section",   desc:"Image with text & bullets", color:"#059669", bg:"#ECFDF5" },
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
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{blocks.length} blocks · end sequence is automatic</p>
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

        {/* Fixed end sequence info */}
        <div style={{ background:"#F0F9FF", borderRadius:16, border:"1.5px solid #BAE6FD", padding:"14px 18px" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#0369a1", margin:"0 0 6px" }}>⚡ Auto End Sequence (always runs after your blocks)</p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["⏳ Analysis Loading","📊 Personal Summary","⚖️ With vs Without","👤 Name + Email","💰 Sales Page"].map((s,i) => (
              <span key={i} style={{ fontSize:12, fontWeight:600, color:"#0369a1", background:"#E0F2FE", borderRadius:999, padding:"3px 10px" }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Builder */}
        {loading ? (
          <div style={{ padding:60, textAlign:"center" }}><Loader size={28} color="#94A3B8" className="bspin"/></div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:24 }}>

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
                  <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>Build your quiz</h3>
                  <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Add questions and image sections</p>
                  <button onClick={() => { setInsertIdx(0); setShowPicker(true); }} style={{ padding:"11px 26px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                    + Add First Block
                  </button>
                </div>
              )}
            </div>

            {/* Right - flow map */}
            <div style={{ position:"sticky", top:24, height:"fit-content" }}>
              <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:20, marginBottom:12 }}>
                <h3 style={{ fontSize:13, fontWeight:800, color:"#0f172a", margin:"0 0 12px" }}>Your Blocks</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {blocks.map((b, i) => {
                    const def = BLOCK_TYPES.find(x => x.type === b.type);
                    return (
                      <div key={b.id} onClick={() => setActiveId(b.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:10, background:activeId===b.id?"#EEF2FF":"#F8FAFC", cursor:"pointer", border:`1px solid ${activeId===b.id?"#C7D2FE":"#F1F5F9"}` }}>
                        <span style={{ fontSize:14 }}>{def?.icon}</span>
                        <p style={{ fontSize:12, fontWeight:700, color:"#0f172a", margin:0, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {i+1}. {b.content?.question || b.content?.heading || def?.label}
                        </p>
                      </div>
                    );
                  })}
                  {blocks.length === 0 && <p style={{ fontSize:12, color:"#94A3B8", textAlign:"center", padding:12 }}>No blocks yet</p>}
                </div>
              </div>
              <div style={{ background:"#F0F9FF", borderRadius:16, border:"1.5px solid #BAE6FD", padding:16 }}>
                <h3 style={{ fontSize:12, fontWeight:800, color:"#0369a1", margin:"0 0 10px" }}>Auto End Sequence</h3>
                {["⏳ Loading","📊 Summary","⚖️ Comparison","👤 Signup","💰 Sales"].map((s,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:i<4?"1px solid #E0F2FE":"none" }}>
                    <span style={{ fontSize:12, color:"#0369a1", fontWeight:600 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block picker */}
      {showPicker && (
        <div onClick={() => setShowPicker(false)} style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:24, padding:24, width:"100%", maxWidth:480, boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>Add a block</h3>
            <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Questions and image sections only — end sequence is automatic</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {BLOCK_TYPES.map(def => (
                <button key={def.type} onClick={() => addBlock(def.type)}
                  style={{ padding:"20px 16px", borderRadius:14, border:`1.5px solid ${def.color}25`, background:def.bg, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8, transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=def.color; e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=`${def.color}25`; e.currentTarget.style.transform="translateY(0)"; }}>
                  <span style={{ fontSize:32 }}>{def.icon}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:def.color }}>{def.label}</span>
                  <span style={{ fontSize:12, color:"#94A3B8", textAlign:"center" }}>{def.desc}</span>
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
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:isActive?def.bg:"#fff" }}>
        <button {...attributes} {...listeners} style={{ cursor:"grab", border:"none", background:"none", padding:2, display:"flex", touchAction:"none" }}>
          <GripVertical size={16} color="#CBD5E1"/>
        </button>
        <span style={{ fontSize:18 }}>{def.icon}</span>
        <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={onToggle}>
          <p style={{ fontSize:13, fontWeight:700, color:def.color, margin:0 }}>{idx+1}. {def.label}</p>
          <p style={{ fontSize:11, color:"#94A3B8", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {block.content?.question || block.content?.heading || "Click to edit"}
          </p>
        </div>
        <select value={block.path||"all"} onChange={e => onPathChange(e.target.value)}
          onClick={e => e.stopPropagation()}
          style={{ padding:"4px 8px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:11, fontWeight:600, color:"#64748B", background:"#fff" }}>
          <option value="all">All users</option>
          <option value="company">Company only</option>
          <option value="myself">Myself only</option>
        </select>
        <button onClick={onDelete} style={{ width:28, height:28, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#EF4444" }}>
          <Trash2 size={13}/>
        </button>
      </div>
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

    const setOpt = (i, v) => {
      const a = [...options]; a[i] = v; u("options", a);
    };
    const setOptImg = (i, v) => {
      const a = [...optionImages]; a[i] = v; u("optionImages", a);
    };

    return (
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Field label="Question">
          <input value={content.question||""} onChange={e=>u("question",e.target.value)} placeholder="How would you describe yourself?" style={inp()}/>
        </Field>
        <Field label="Subtitle" hint="optional">
          <input value={content.subtitle||""} onChange={e=>u("subtitle",e.target.value)} placeholder="We will personalize your path based on your answers" style={inp()}/>
        </Field>
        <Field label="This splits the path?">
          <select value={content.isSplit||"no"} onChange={e=>u("isSplit",e.target.value)} style={inp()}>
            <option value="no">No — show to all users</option>
            <option value="yes">Yes — 1st option = company path, 2nd = myself path</option>
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
                {/* Option image */}
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", margin:"0 0 6px", textTransform:"uppercase" }}>Option image · optional</p>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => { const inp = document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.onchange=e=>handleOptionImageUpload(e.target.files[0],i); inp.click(); }}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:11, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                      <Upload size={12}/> Upload
                    </button>
                    <input value={optionImages[i]||""} onChange={e=>setOptImg(i,e.target.value)} placeholder="or paste image URL..." style={{ ...inp(), flex:1, fontSize:11 }}/>
                  </div>
                  {optionImages[i] && (
                    <div style={{ marginTop:6, borderRadius:8, overflow:"hidden", height:80 }}>
                      <img src={optionImages[i]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    </div>
                  )}
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
        <Field label="Heading">
          <input value={content.heading||""} onChange={e=>u("heading",e.target.value)} placeholder="AI is Easier Than You Think" style={inp()}/>
        </Field>
        <Field label="Subtext" hint="optional">
          <textarea value={content.subtext||""} onChange={e=>u("subtext",e.target.value)} style={{ ...inp(), minHeight:70, resize:"vertical" }} placeholder="Our certificate program is designed to make a difference..."/>
        </Field>
        <Field label="Image">
          <div style={{ display:"flex", gap:6, marginBottom:8 }}>
            <button onClick={() => setImgMode("upload")} style={{ flex:1, padding:"7px", borderRadius:8, border:`1.5px solid ${imgMode==="upload"?"#6366f1":"#E2E8F0"}`, background:imgMode==="upload"?"#EEF2FF":"#fff", fontSize:12, fontWeight:600, color:imgMode==="upload"?"#6366f1":"#64748B", cursor:"pointer" }}>
              <Upload size={12} style={{ marginRight:4 }}/>Upload
            </button>
            <button onClick={() => setImgMode("url")} style={{ flex:1, padding:"7px", borderRadius:8, border:`1.5px solid ${imgMode==="url"?"#6366f1":"#E2E8F0"}`, background:imgMode==="url"?"#EEF2FF":"#fff", fontSize:12, fontWeight:600, color:imgMode==="url"?"#6366f1":"#64748B", cursor:"pointer" }}>
              <Link2 size={12} style={{ marginRight:4 }}/>URL
            </button>
          </div>
          {imgMode==="upload" ? (
            <div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleImageUpload(e.target.files[0])}/>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ width:"100%", padding:"12px", borderRadius:10, border:"2px dashed #6366f1", background:"#EEF2FF", color:"#6366f1", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {uploading ? "Uploading..." : content.imageUrl ? "Change image" : "Click to upload image"}
              </button>
            </div>
          ) : (
            <input value={content.imageUrl||""} onChange={e=>u("imageUrl",e.target.value)} placeholder="https://..." style={inp()}/>
          )}
          {content.imageUrl && (
            <div style={{ marginTop:8, borderRadius:12, overflow:"hidden", height:120 }}>
              <img src={content.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            </div>
          )}
        </Field>
        <Field label="Bullet points" hint="one per line">
          <textarea value={(content.bullets||[]).join("\n")} onChange={e=>u("bullets",e.target.value.split("\n"))}
            placeholder={"No prior AI knowledge required\nWork at your own pace\nNo university degree needed"}
            style={{ ...inp(), minHeight:90, resize:"vertical" }}/>
        </Field>
        <Field label="Layout">
          <select value={content.layout||"image-right"} onChange={e=>u("layout",e.target.value)} style={inp()}>
            <option value="image-right">Text left, Image right</option>
            <option value="image-left">Image left, Text right</option>
            <option value="image-top">Image top, Text below</option>
            <option value="fullwidth">Full width image with text overlay</option>
          </select>
        </Field>
      </div>
    );
  }

  return null;
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
    case "question_choice": return { question:"", subtitle:"", options:["Option 1","Option 2"], optionImages:[], isSplit:"no" };
    case "image_section":   return { heading:"", subtext:"", imageUrl:"", bullets:[], layout:"image-right" };
    default: return {};
  }
}

const inp = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
