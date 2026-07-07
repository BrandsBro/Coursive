"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronLeft, Save, Check, Plus, Trash2, GripVertical, Eye, EyeOff,
  Loader, Copy
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MediaLibrary from "@/components/admin/builder/MediaLibrary";
import { BLOCK_DEFS, BlockEditor, BlockPreview } from "@/components/admin/builder/blocks";

export default function LessonBuilder({ lessonId, lessonTitle, backTo }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const leftPanelRef = useRef(null);
  const [insertIdx, setInsertIdx] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => { load(); }, [lessonId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lesson_content")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index");
    setBlocks((data || []).map(b => ({ ...b, content: b.content || {} })));
    setLoading(false);
  };

  useEffect(() => {
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollTop = leftPanelRef.current.scrollHeight;
    }
  }, [blocks.length]);

  const addBlock = (type) => {
    const block = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      lesson_id: lessonId,
      type,
      content: { ...BLOCK_DEFS[type].default },
      order_index: insertIdx !== null ? insertIdx : blocks.length,
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

  const deleteBlock = async (id) => {
    if (!id.startsWith("new-")) await supabase.from("lesson_content").delete().eq("id", id);
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const duplicateBlock = (id) => {
    const idx = blocks.findIndex(b => b.id === id);
    const orig = blocks[idx];
    const copy = {
      ...orig,
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      content: JSON.parse(JSON.stringify(orig.content)),
      isNew: true,
    };
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    setBlocks(next);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
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
        const row = {
          lesson_id: lessonId,
          type: b.type,
          content: b.content,
          order_index: i,
        };

        if (b.isNew || b.id.startsWith("new-")) {
          // New block — insert
          const { data, error } = await supabase
            .from("lesson_content")
            .insert(row)
            .select()
            .single();
          if (error) {
            console.error("Insert error:", error);
            // If conflict, try upsert
            if (error.code === "23505") {
              await supabase.from("lesson_content").upsert({ ...row }, { onConflict: "lesson_id,order_index" });
            }
          } else if (data) {
            setBlocks(prev => prev.map(x => x.id === b.id ? { ...data, content: data.content || {} } : x));
          }
        } else {
          // Existing block — update
          const { error } = await supabase
            .from("lesson_content")
            .update(row)
            .eq("id", b.id);
          if (error) console.error("Update error:", error);
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      // Reload to get fresh data from DB
      await load();
    } catch (e) {
      alert("Save error: " + e.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ height:"100vh", background:"#F1F5F9", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Top bar */}
      <div style={{ background:"#0f172a", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={() => router.push(backTo)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            <ChevronLeft size={15}/> Back
          </button>
          <div>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:10, fontWeight:700, letterSpacing:1, margin:"0 0 1px" }}>LESSON BUILDER</p>
            <h1 style={{ color:"#fff", fontSize:15, fontWeight:800, margin:0 }}>{lessonTitle}</h1>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>{blocks.length} block{blocks.length!==1?"s":""}</span>
          <button onClick={() => setPreviewMode(!previewMode)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:previewMode?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.06)", color:previewMode?"#a78bfa":"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            {previewMode ? <EyeOff size={14}/> : <Eye size={14}/>}
            {previewMode ? "Editing" : "Full Preview"}
          </button>
          <button onClick={saveAll} disabled={saving} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 20px", borderRadius:10, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:saved?"0 4px 14px rgba(34,197,94,0.4)":"0 4px 14px rgba(124,58,237,0.4)" }}>
            {saving ? <><Loader size={14} className="bspin"/> Saving...</> : saved ? <><Check size={14}/> Saved!</> : <><Save size={14}/> Save</>}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {!previewMode && (
          <div ref={leftPanelRef} style={{ flex:1, overflow:"auto", padding:"24px 28px 120px", borderRight:"1px solid #E2E8F0" }}>
            <div style={{ maxWidth:560, margin:"0 auto" }}>
              {loading ? (
                <div style={{ textAlign:"center", padding:60, color:"#94A3B8" }}>
                  <Loader size={28} className="bspin" style={{ margin:"0 auto 12px" }}/>
                  <p>Loading content...</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <InsertLine onClick={() => { setInsertIdx(0); setShowPicker(true); }} />
                  <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.map((block, idx) => (
                      <div key={block.id}>
                        <SortableBlock
                          block={block}
                          isActive={activeId === block.id}
                          onToggle={() => setActiveId(activeId === block.id ? null : block.id)}
                          onChange={c => updateBlock(block.id, c)}
                          onDelete={() => deleteBlock(block.id)}
                          onDuplicate={() => duplicateBlock(block.id)}
                        />
                        <InsertLine onClick={() => { setInsertIdx(idx + 1); setShowPicker(true); }} />
                      </div>
                    ))}
                  </SortableContext>

                  {blocks.length === 0 && (
                    <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #CBD5E1", marginTop:8 }}>
                      <div style={{ fontSize:48, marginBottom:12 }}>🎨</div>
                      <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>Build your lesson</h3>
                      <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Add text, images, video, audio, quizzes and more</p>
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

        {/* Preview */}
        <div style={{ flex:previewMode ? 1 : "0 0 42%", overflow:"auto", padding:"24px 28px", background:previewMode?"#fff":"#FAFBFC" }}>
          <div style={{ maxWidth:previewMode?640:420, margin:"0 auto" }}>
            {!previewMode && (
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16, padding:"8px 14px", background:"#EEF2FF", borderRadius:10 }}>
                <Eye size={13} color="#6366f1"/>
                <span style={{ fontSize:12, fontWeight:600, color:"#6366f1" }}>Live Preview</span>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
              {blocks.map(block => <BlockPreview key={block.id} block={block} />)}
              {blocks.length === 0 && (
                <p style={{ textAlign:"center", color:"#CBD5E1", padding:40, fontSize:14 }}>Your lesson preview appears here</p>
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
            <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Choose content to add to your lesson</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {Object.entries(BLOCK_DEFS).map(([type, def]) => (
                <button key={type} onClick={() => addBlock(type)} style={{ padding:"16px 12px", borderRadius:14, border:`1.5px solid ${def.color}25`, background:def.bg, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=def.color; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 6px 16px ${def.color}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=`${def.color}25`; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                  <span style={{ fontSize:26 }}>{def.icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:def.color }}>{def.label}</span>
                  <span style={{ fontSize:10, color:"#94A3B8", textAlign:"center", lineHeight:1.3 }}>{def.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`.bspin { animation: bspin 0.8s linear infinite; } @keyframes bspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SortableBlock({ block, isActive, onToggle, onChange, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const def = BLOCK_DEFS[block.type] || { icon:"❓", label:"Unknown", color:"#64748B", bg:"#F8FAFC", preview:()=>"Unknown block type" };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div ref={setNodeRef} style={{ ...style, background:"#fff", borderRadius:16, border:`1.5px solid ${isActive?def.color+"40":"#E2E8F0"}`, overflow:"hidden", boxShadow:isActive?`0 4px 20px ${def.color}15`:"0 1px 3px rgba(0,0,0,0.04)", marginBottom:2 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 12px", background:"#fff" }}>
        <button {...attributes} {...listeners} style={{ cursor:"grab", border:"none", background:"none", padding:2, display:"flex", touchAction:"none" }}>
          <GripVertical size={16} color="#CBD5E1"/>
        </button>
        <span style={{ fontSize:18 }} onClick={onToggle}>{def.icon}</span>
        <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={onToggle}>
          <p style={{ fontSize:13, fontWeight:700, color:def.color, margin:0 }}>{def.label}</p>
          <p style={{ fontSize:11, color:"#94A3B8", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{def.preview(block.content)}</p>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={onDuplicate} title="Duplicate" style={ctrl()}><Copy size={12}/></button>
          <button onClick={onDelete} title="Delete" style={{ ...ctrl(), color:"#EF4444", borderColor:"#FEE2E2" }}><Trash2 size={12}/></button>
        </div>
      </div>
      {isActive && (
        <div style={{ padding:"4px 14px 16px", borderTop:`1px solid ${def.color}20` }}>
          <BlockEditor block={block} onChange={onChange} />
        </div>
      )}
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

const ctrl = () => ({ width:26, height:26, borderRadius:7, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748B" });
