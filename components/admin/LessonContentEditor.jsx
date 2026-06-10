"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Save, Plus, Trash2, ChevronUp, ChevronDown,
  Type, Image as ImageIcon, Video, HelpCircle, Zap,
  Star, List, AlertCircle, Eye, EyeOff, Upload,
  Check, GripVertical, Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Block type definitions ──
const BLOCK_TYPES = [
  { type:"heading",     icon:"✦",  label:"Heading",        desc:"Section title",         color:"#7c3aed", bg:"#F5F3FF" },
  { type:"text",        icon:"📝", label:"Text",           desc:"Paragraph content",     color:"#2563eb", bg:"#EFF6FF" },
  { type:"image",       icon:"🖼️", label:"Image",          desc:"Upload or paste URL",   color:"#059669", bg:"#ECFDF5" },
  { type:"video",       icon:"🎬", label:"Video",          desc:"YouTube, Vimeo or file", color:"#dc2626", bg:"#FEF2F2" },
  { type:"quiz",        icon:"🎯", label:"Quiz",           desc:"Multiple choice",       color:"#d97706", bg:"#FFFBEB" },
  { type:"fillblank",   icon:"✏️", label:"Fill in Blank",  desc:"Interactive exercise",  color:"#db2777", bg:"#FDF2F8" },
  { type:"keypoints",   icon:"⭐", label:"Key Points",     desc:"Bullet list of tips",   color:"#0891b2", bg:"#ECFEFF" },
  { type:"callout",     icon:"💡", label:"Callout",        desc:"Highlight box",         color:"#65a30d", bg:"#F7FEE7" },
];

const DEFAULTS = {
  heading:   { text:"", level:"h2" },
  text:      { text:"" },
  image:     { src:"", alt:"", caption:"" },
  video:     { src:"", type:"youtube", caption:"" },
  quiz:      { question:"", options:["","","",""], correct:0, explanation:"" },
  fillblank: { prompt:"", answer:"", hint:"" },
  keypoints: { title:"Key Takeaways", points:["","",""] },
  callout:   { text:"", style:"info" },
};

export default function LessonContentEditor({ lessonId, lessonTitle, onClose }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [insertAt, setInsertAt] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => { loadContent(); }, [lessonId]);

  const loadContent = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lesson_content")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index");
    setBlocks((data || []).map(b => ({ ...b, content: b.content || {} })));
    setLoading(false);
  };

  const addBlock = (type) => {
    const block = {
      id: `new-${Date.now()}`,
      lesson_id: lessonId,
      type,
      content: { ...DEFAULTS[type] },
      order_index: insertAt !== null ? insertAt : blocks.length,
      isNew: true,
    };
    if (insertAt !== null) {
      const newBlocks = [...blocks];
      newBlocks.splice(insertAt, 0, block);
      setBlocks(newBlocks.map((b, i) => ({ ...b, order_index: i })));
    } else {
      setBlocks(prev => [...prev, block]);
    }
    setExpandedId(block.id);
    setShowPicker(false);
    setInsertAt(null);
  };

  const updateContent = (id, content) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = async (id) => {
    if (!id.startsWith("new-")) {
      await supabase.from("lesson_content").delete().eq("id", id);
    }
    setBlocks(prev => prev.filter(b => b.id !== id).map((b, i) => ({ ...b, order_index: i })));
    if (expandedId === id) setExpandedId(null);
  };

  const moveBlock = (id, dir) => {
    const idx = blocks.findIndex(b => b.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === blocks.length - 1)) return;
    const arr = [...blocks];
    [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
    setBlocks(arr.map((b, i) => ({ ...b, order_index: i })));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const row = { lesson_id: lessonId, type: b.type, content: b.content, order_index: i };
        if (b.isNew || b.id.startsWith("new-")) {
          const { data } = await supabase.from("lesson_content").insert(row).select().single();
          if (data) setBlocks(prev => prev.map(x => x.id === b.id ? { ...data } : x));
        } else {
          await supabase.from("lesson_content").update(row).eq("id", b.id);
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert("Error: " + e.message); }
    setSaving(false);
  };

  const meta = (type) => BLOCK_TYPES.find(t => t.type === type) || BLOCK_TYPES[0];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex" }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ flex:1, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)" }} />

      {/* Editor panel */}
      <div style={{ width:"100%", maxWidth:720, background:"#fff", display:"flex", flexDirection:"column", height:"100vh", boxShadow:"-20px 0 60px rgba(0,0,0,0.2)", overflow:"hidden" }}>

        {/* ── Top bar ── */}
        <div style={{ padding:"16px 24px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", gap:12, background:"linear-gradient(135deg,#0f172a,#1e1b4b)", flexShrink:0 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:10, fontWeight:700, letterSpacing:1, margin:"0 0 2px" }}>LESSON BUILDER</p>
            <h2 style={{ color:"#fff", fontSize:15, fontWeight:800, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lessonTitle}</h2>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>{blocks.length} blocks</span>
            <button onClick={() => setPreview(!preview)} style={{ padding:"7px 12px", borderRadius:9, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.08)", color:preview?"#a78bfa":"rgba(255,255,255,0.7)", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
              {preview ? <EyeOff size={13}/> : <Eye size={13}/>}
              {preview ? "Edit" : "Preview"}
            </button>
            <button onClick={saveAll} disabled={saving} style={{ padding:"8px 16px", borderRadius:9, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:saved?"0 4px 12px rgba(34,197,94,0.4)":"0 4px 12px rgba(124,58,237,0.4)" }}>
              {saving ? <><Spinner/> Saving...</> : saved ? <><Check size={13}/> Saved!</> : <><Save size={13}/> Save</>}
            </button>
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:9, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.08)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <X size={15} color="rgba(255,255,255,0.7)"/>
            </button>
          </div>
        </div>

        {/* ── Content area ── */}
        <div style={{ flex:1, overflow:"auto", padding:"20px 24px", background:"#F8FAFC" }}>

          {loading ? (
            <div style={{ textAlign:"center", padding:60 }}>
              <div style={{ fontSize:32, marginBottom:12 }}>⚙️</div>
              <p style={{ color:"#94A3B8", fontSize:14 }}>Loading lesson content...</p>
            </div>
          ) : preview ? (
            <PreviewMode blocks={blocks} />
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {/* First add button */}
              <AddBlockButton onClick={() => { setInsertAt(0); setShowPicker(true); }} />

              {blocks.map((block, idx) => (
                <div key={block.id}>
                  <BlockCard
                    block={block}
                    meta={meta(block.type)}
                    expanded={expandedId === block.id}
                    onToggle={() => setExpandedId(expandedId === block.id ? null : block.id)}
                    onChange={c => updateContent(block.id, c)}
                    onDelete={() => deleteBlock(block.id)}
                    onMove={dir => moveBlock(block.id, dir)}
                    isFirst={idx === 0}
                    isLast={idx === blocks.length - 1}
                  />
                  <AddBlockButton onClick={() => { setInsertAt(idx + 1); setShowPicker(true); }} />
                </div>
              ))}

              {blocks.length === 0 && (
                <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #E2E8F0" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>✨</div>
                  <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>Start building your lesson</h3>
                  <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Click the + button to add your first content block</p>
                  <button onClick={() => { setInsertAt(0); setShowPicker(true); }} style={{ padding:"10px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                    + Add First Block
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Block picker modal ── */}
      {showPicker && (
        <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={() => setShowPicker(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:24, padding:24, width:"100%", maxWidth:560, boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:0 }}>Add Content Block</h3>
                <p style={{ fontSize:13, color:"#94A3B8", margin:"3px 0 0" }}>Choose what to add to your lesson</p>
              </div>
              <button onClick={() => setShowPicker(false)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={18} color="#94A3B8"/></button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {BLOCK_TYPES.map(({ type, icon, label, desc, color, bg }) => (
                <button key={type} onClick={() => addBlock(type)} style={{ padding:"14px 10px", borderRadius:14, border:`1.5px solid ${color}25`, background:bg, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.border=`1.5px solid ${color}`; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 6px 16px ${color}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.border=`1.5px solid ${color}25`; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                  <span style={{ fontSize:24 }}>{icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color }}>{label}</span>
                  <span style={{ fontSize:10, color:"#94A3B8", textAlign:"center", lineHeight:1.3 }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add block button ──
function AddBlockButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"4px 0", opacity:hovered?1:0.4, transition:"opacity 0.2s" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ flex:1, height:1, background:"#E2E8F0" }} />
      <button onClick={onClick} style={{ width:28, height:28, borderRadius:"50%", border:"1.5px solid #CBD5E1", background:hovered?"#6366f1":"#fff", color:hovered?"#fff":"#94A3B8", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", flexShrink:0 }}>
        <Plus size={14}/>
      </button>
      <div style={{ flex:1, height:1, background:"#E2E8F0" }} />
    </div>
  );
}

// ── Block card ──
function BlockCard({ block, meta, expanded, onToggle, onChange, onDelete, onMove, isFirst, isLast }) {
  return (
    <div style={{ background:"#fff", borderRadius:16, border:`1.5px solid ${expanded ? meta.color+"60" : "#E2E8F0"}`, overflow:"hidden", transition:"all 0.2s", boxShadow:expanded?`0 4px 20px ${meta.color}15`:"none" }}>
      {/* Block header — always visible */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", cursor:"pointer", background:expanded?meta.bg:"#fff" }} onClick={onToggle}>
        <span style={{ fontSize:20, flexShrink:0 }}>{meta.icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:13, fontWeight:700, color:meta.color, margin:0 }}>{meta.label}</p>
          <p style={{ fontSize:11, color:"#94A3B8", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {getBlockPreviewText(block)}
          </p>
        </div>
        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
          <button onClick={e => { e.stopPropagation(); onMove(-1); }} disabled={isFirst} style={ctrlBtn(isFirst)}><ChevronUp size={12}/></button>
          <button onClick={e => { e.stopPropagation(); onMove(1); }} disabled={isLast} style={ctrlBtn(isLast)}><ChevronDown size={12}/></button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ ...ctrlBtn(false), color:"#EF4444", borderColor:"#FEE2E2" }}><Trash2 size={12}/></button>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ padding:"0 14px 14px", borderTop:`1px solid ${meta.color}20` }}>
          <BlockForm block={block} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

function getBlockPreviewText(block) {
  const c = block.content || {};
  switch (block.type) {
    case "heading":   return c.text || "Empty heading";
    case "text":      return c.text ? c.text.slice(0,80)+"..." : "Empty text block";
    case "image":     return c.src ? "Image: "+c.src.slice(0,50) : "No image set";
    case "video":     return c.src ? "Video: "+c.src.slice(0,50) : "No video set";
    case "quiz":      return c.question || "No question set";
    case "fillblank": return c.prompt || "No prompt set";
    case "keypoints": return c.points?.filter(Boolean).join(", ") || "No points added";
    case "callout":   return c.text || "Empty callout";
    default: return "Click to edit";
  }
}

// ── Block form ──
function BlockForm({ block, onChange }) {
  const c = block.content || {};
  switch (block.type) {
    case "heading":   return <HeadingForm content={c} onChange={onChange} />;
    case "text":      return <TextForm content={c} onChange={onChange} />;
    case "image":     return <ImageForm content={c} onChange={onChange} lessonId={block.lesson_id} />;
    case "video":     return <VideoForm content={c} onChange={onChange} lessonId={block.lesson_id} />;
    case "quiz":      return <QuizForm content={c} onChange={onChange} />;
    case "fillblank": return <FillBlankForm content={c} onChange={onChange} />;
    case "keypoints": return <KeyPointsForm content={c} onChange={onChange} />;
    case "callout":   return <CalloutForm content={c} onChange={onChange} />;
    default: return null;
  }
}

function HeadingForm({ content, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <div style={{ display:"flex", gap:8 }}>
        {["h1","h2","h3"].map(l => (
          <button key={l} onClick={() => onChange({ ...content, level:l })} style={{ padding:"6px 14px", borderRadius:8, border:`1.5px solid ${content.level===l?"#7c3aed":"#E2E8F0"}`, background:content.level===l?"#F5F3FF":"#fff", color:content.level===l?"#7c3aed":"#64748B", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <input value={content.text||""} onChange={e => onChange({ ...content, text:e.target.value })} placeholder="Section heading..." style={{ ...iSt(), fontSize:content.level==="h1"?20:content.level==="h2"?17:15, fontWeight:800 }} />
    </div>
  );
}

function TextForm({ content, onChange }) {
  return (
    <div style={{ paddingTop:12 }}>
      <textarea value={content.text||""} onChange={e => onChange({ ...content, text:e.target.value })} placeholder="Write your lesson content here...

You can write multiple paragraphs, explain concepts, share examples, and guide students through the topic." style={{ ...iSt(), minHeight:160, resize:"vertical", lineHeight:1.7 }} />
      <p style={{ fontSize:11, color:"#94A3B8", margin:"6px 0 0" }}>{(content.text||"").length} characters</p>
    </div>
  );
}

function ImageForm({ content, onChange, lessonId }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const path = `${lessonId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from("lesson-media").upload(path, file);
    if (error) { alert(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("lesson-media").getPublicUrl(path);
    onChange({ ...content, src: urlData.publicUrl });
    setUploading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      {/* Upload area */}
      <div onClick={() => fileRef.current?.click()} style={{ border:"2px dashed #E2E8F0", borderRadius:12, padding:"20px", textAlign:"center", cursor:"pointer", background:"#F8FAFC", transition:"all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor="#059669"; e.currentTarget.style.background="#ECFDF5"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.background="#F8FAFC"; }}>
        <Upload size={20} color="#94A3B8" style={{ margin:"0 auto 8px" }} />
        <p style={{ fontSize:13, fontWeight:600, color:"#64748B", margin:0 }}>{uploading ? "Uploading..." : "Click to upload image"}</p>
        <p style={{ fontSize:11, color:"#94A3B8", margin:"3px 0 0" }}>PNG, JPG, GIF, WebP</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display:"none" }} />
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ flex:1, height:1, background:"#E2E8F0" }} />
        <span style={{ fontSize:11, color:"#94A3B8" }}>or paste URL</span>
        <div style={{ flex:1, height:1, background:"#E2E8F0" }} />
      </div>

      <input value={content.src||""} onChange={e => onChange({ ...content, src:e.target.value })} placeholder="https://example.com/image.jpg" style={iSt()} />
      <input value={content.alt||""} onChange={e => onChange({ ...content, alt:e.target.value })} placeholder="Alt text (for accessibility)" style={iSt()} />
      <input value={content.caption||""} onChange={e => onChange({ ...content, caption:e.target.value })} placeholder="Caption (optional)" style={iSt()} />

      {content.src && (
        <div style={{ borderRadius:12, overflow:"hidden", border:"1.5px solid #E2E8F0", background:"#F8FAFC" }}>
          <img src={content.src} alt={content.alt} style={{ width:"100%", maxHeight:220, objectFit:"cover", display:"block" }} onError={e => { e.target.style.display="none"; }} />
          {content.caption && <p style={{ padding:"8px 12px", fontSize:12, color:"#64748B", margin:0, fontStyle:"italic" }}>{content.caption}</p>}
        </div>
      )}
    </div>
  );
}

function VideoForm({ content, onChange, lessonId }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const path = `${lessonId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("lesson-media").upload(path, file);
    if (error) { alert(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("lesson-media").getPublicUrl(path);
    onChange({ ...content, src: urlData.publicUrl, type:"file" });
    setUploading(false);
  };

  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const ytId = content.src ? getYouTubeId(content.src) : null;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      {/* Video type selector */}
      <div style={{ display:"flex", gap:6 }}>
        {[["youtube","▶ YouTube"],["vimeo","🎬 Vimeo"],["file","📁 Upload"]].map(([val, label]) => (
          <button key={val} onClick={() => onChange({ ...content, type:val })} style={{ flex:1, padding:"8px", borderRadius:9, border:`1.5px solid ${content.type===val?"#dc2626":"#E2E8F0"}`, background:content.type===val?"#FEF2F2":"#fff", color:content.type===val?"#dc2626":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {content.type === "file" ? (
        <div onClick={() => fileRef.current?.click()} style={{ border:"2px dashed #E2E8F0", borderRadius:12, padding:"20px", textAlign:"center", cursor:"pointer", background:"#F8FAFC" }}>
          <Upload size={20} color="#94A3B8" style={{ margin:"0 auto 8px" }} />
          <p style={{ fontSize:13, fontWeight:600, color:"#64748B", margin:0 }}>{uploading ? "Uploading..." : "Click to upload video"}</p>
          <p style={{ fontSize:11, color:"#94A3B8", margin:"3px 0 0" }}>MP4, WebM, MOV</p>
          <input ref={fileRef} type="file" accept="video/*" onChange={handleUpload} style={{ display:"none" }} />
        </div>
      ) : (
        <input value={content.src||""} onChange={e => onChange({ ...content, src:e.target.value })} placeholder={content.type==="youtube" ? "https://youtube.com/watch?v=..." : "https://vimeo.com/..."} style={iSt()} />
      )}

      <input value={content.caption||""} onChange={e => onChange({ ...content, caption:e.target.value })} placeholder="Video caption (optional)" style={iSt()} />

      {/* YouTube preview */}
      {ytId && (
        <div style={{ borderRadius:12, overflow:"hidden", border:"1.5px solid #E2E8F0", background:"#000", aspectRatio:"16/9" }}>
          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} style={{ border:"none", display:"block" }} allowFullScreen />
        </div>
      )}

      {/* File video preview */}
      {content.type==="file" && content.src && (
        <video src={content.src} controls style={{ width:"100%", borderRadius:12, border:"1.5px solid #E2E8F0" }} />
      )}
    </div>
  );
}

function QuizForm({ content, onChange }) {
  const options = content.options || ["","","",""];
  const updateOpt = (i, val) => {
    const opts = [...options]; opts[i] = val;
    onChange({ ...content, options:opts });
  };
  const addOption = () => onChange({ ...content, options:[...options,""] });
  const removeOption = (i) => {
    const opts = options.filter((_,idx) => idx !== i);
    onChange({ ...content, options:opts, correct:Math.min(content.correct||0, opts.length-1) });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div>
        <label style={lbSt()}>Question</label>
        <textarea value={content.question||""} onChange={e => onChange({ ...content, question:e.target.value })} placeholder="What is the main purpose of Canva AI?" style={{ ...iSt(), minHeight:80, resize:"vertical" }} />
      </div>

      <div>
        <label style={lbSt()}>Answer Options <span style={{ color:"#94A3B8", fontWeight:400 }}>· click ✓ to mark correct</span></label>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {options.map((opt, i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={() => onChange({ ...content, correct:i })} style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${content.correct===i?"#22c55e":"#E2E8F0"}`, background:content.correct===i?"#22c55e":"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                {content.correct===i && <Check size={13} color="#fff"/>}
              </button>
              <input value={opt} onChange={e => updateOpt(i, e.target.value)} placeholder={`Option ${i+1}`} style={{ ...iSt(), flex:1, borderColor:content.correct===i?"#22c55e":"#E2E8F0" }} />
              {options.length > 2 && (
                <button onClick={() => removeOption(i)} style={{ width:28, height:28, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#FFF", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <X size={12} color="#EF4444"/>
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button onClick={addOption} style={{ padding:"8px", borderRadius:9, border:"1.5px dashed #E2E8F0", background:"#F8FAFC", color:"#94A3B8", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              + Add option
            </button>
          )}
        </div>
      </div>

      <div>
        <label style={lbSt()}>Explanation <span style={{ color:"#94A3B8", fontWeight:400 }}>· shown after answering</span></label>
        <textarea value={content.explanation||""} onChange={e => onChange({ ...content, explanation:e.target.value })} placeholder="Explain why this is the correct answer..." style={{ ...iSt(), minHeight:70, resize:"vertical" }} />
      </div>
    </div>
  );
}

function FillBlankForm({ content, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div>
        <label style={lbSt()}>Prompt <span style={{ color:"#94A3B8", fontWeight:400 }}>· use ___ for the blank</span></label>
        <input value={content.prompt||""} onChange={e => onChange({ ...content, prompt:e.target.value })} placeholder="The main feature of Canva AI is ___" style={iSt()} />
        {content.prompt && (
          <p style={{ fontSize:12, color:"#64748B", marginTop:6, padding:"8px 12px", background:"#F8FAFC", borderRadius:8 }}>
            {content.prompt.replace("___", <span style={{ background:"#E2E8F0", padding:"0 8px", borderRadius:4 }}>{"    "}</span>)}
          </p>
        )}
      </div>
      <div>
        <label style={lbSt()}>Correct Answer</label>
        <input value={content.answer||""} onChange={e => onChange({ ...content, answer:e.target.value })} placeholder="Magic Write" style={iSt()} />
      </div>
      <div>
        <label style={lbSt()}>Hint <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span></label>
        <input value={content.hint||""} onChange={e => onChange({ ...content, hint:e.target.value })} placeholder="Think about writing features..." style={iSt()} />
      </div>
    </div>
  );
}

function KeyPointsForm({ content, onChange }) {
  const points = content.points || ["","",""];
  const updatePoint = (i, val) => {
    const pts = [...points]; pts[i] = val;
    onChange({ ...content, points:pts });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div>
        <label style={lbSt()}>Section Title</label>
        <input value={content.title||"Key Takeaways"} onChange={e => onChange({ ...content, title:e.target.value })} style={iSt()} />
      </div>
      <div>
        <label style={lbSt()}>Points</label>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {points.map((pt, i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"#0891b2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ color:"#fff", fontSize:10, fontWeight:700 }}>{i+1}</span>
              </div>
              <input value={pt} onChange={e => updatePoint(i, e.target.value)} placeholder={`Point ${i+1}...`} style={{ ...iSt(), flex:1 }} />
              {points.length > 1 && (
                <button onClick={() => onChange({ ...content, points:points.filter((_,idx)=>idx!==i) })} style={{ width:28, height:28, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#FFF", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <X size={12} color="#EF4444"/>
                </button>
              )}
            </div>
          ))}
          <button onClick={() => onChange({ ...content, points:[...points,""] })} style={{ padding:"8px", borderRadius:9, border:"1.5px dashed #E2E8F0", background:"#F8FAFC", color:"#94A3B8", fontSize:12, fontWeight:600, cursor:"pointer" }}>
            + Add point
          </button>
        </div>
      </div>
    </div>
  );
}

function CalloutForm({ content, onChange }) {
  const STYLES = [
    { val:"info",    emoji:"💡", label:"Info",    color:"#0891b2", bg:"#ECFEFF" },
    { val:"warning", emoji:"⚠️", label:"Warning", color:"#d97706", bg:"#FFFBEB" },
    { val:"success", emoji:"✅", label:"Tip",     color:"#059669", bg:"#ECFDF5" },
    { val:"error",   emoji:"❌", label:"Note",    color:"#dc2626", bg:"#FEF2F2" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div style={{ display:"flex", gap:6 }}>
        {STYLES.map(s => (
          <button key={s.val} onClick={() => onChange({ ...content, style:s.val })} style={{ flex:1, padding:"8px 6px", borderRadius:9, border:`1.5px solid ${content.style===s.val?s.color:"#E2E8F0"}`, background:content.style===s.val?s.bg:"#fff", cursor:"pointer", fontSize:11, fontWeight:600, color:content.style===s.val?s.color:"#64748B" }}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>
      <textarea value={content.text||""} onChange={e => onChange({ ...content, text:e.target.value })} placeholder="Write your callout message here..." style={{ ...iSt(), minHeight:90, resize:"vertical" }} />
      {content.text && (
        <div style={{ padding:"12px 14px", borderRadius:10, background:STYLES.find(s=>s.val===content.style)?.bg||"#ECFEFF", border:`1.5px solid ${STYLES.find(s=>s.val===content.style)?.color||"#0891b2"}30` }}>
          <p style={{ fontSize:13, color:STYLES.find(s=>s.val===content.style)?.color||"#0891b2", margin:0 }}>
            {STYLES.find(s=>s.val===content.style)?.emoji} {content.text}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Preview mode ──
function PreviewMode({ blocks }) {
  return (
    <div style={{ maxWidth:640, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:"#EEF2FF", borderRadius:12, padding:"10px 16px", display:"flex", alignItems:"center", gap:6 }}>
        <Eye size={14} color="#6366f1"/>
        <span style={{ fontSize:12, fontWeight:600, color:"#6366f1" }}>Preview Mode — this is how students will see the lesson</span>
      </div>
      {blocks.map(block => (
        <PreviewBlock key={block.id} block={block} />
      ))}
      {blocks.length === 0 && (
        <p style={{ textAlign:"center", color:"#94A3B8", padding:40 }}>No blocks to preview yet</p>
      )}
    </div>
  );
}

function PreviewBlock({ block }) {
  const c = block.content || {};
  switch (block.type) {
    case "heading":
      const Tag = c.level || "h2";
      return <div style={{ fontSize:c.level==="h1"?28:c.level==="h2"?22:18, fontWeight:900, color:"#0f172a" }}>{c.text||"Untitled"}</div>;
    case "text":
      return <p style={{ fontSize:15, lineHeight:1.7, color:"#374151", margin:0 }}>{c.text}</p>;
    case "image":
      return c.src ? (
        <div style={{ borderRadius:16, overflow:"hidden" }}>
          <img src={c.src} alt={c.alt} style={{ width:"100%", display:"block" }}/>
          {c.caption && <p style={{ fontSize:12, color:"#64748B", textAlign:"center", padding:"8px", margin:0, fontStyle:"italic" }}>{c.caption}</p>}
        </div>
      ) : <div style={{ background:"#F8FAFC", borderRadius:16, padding:40, textAlign:"center", color:"#94A3B8" }}>No image set</div>;
    case "video":
      const ytId = c.src ? c.src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1] : null;
      return ytId ? (
        <div style={{ borderRadius:16, overflow:"hidden", aspectRatio:"16/9" }}>
          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} style={{ border:"none", display:"block" }} allowFullScreen/>
        </div>
      ) : c.src ? (
        <video src={c.src} controls style={{ width:"100%", borderRadius:16 }}/>
      ) : null;
    case "quiz":
      return (
        <div style={{ background:"#FFFBEB", borderRadius:16, padding:20, border:"1.5px solid #FDE68A" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#92400E", margin:"0 0 12px" }}>🎯 Quiz Question</p>
          <p style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 12px" }}>{c.question}</p>
          {(c.options||[]).map((opt,i) => (
            <div key={i} style={{ padding:"10px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", marginBottom:6, fontSize:13, color:"#374151" }}>
              {String.fromCharCode(65+i)}. {opt}
            </div>
          ))}
        </div>
      );
    case "fillblank":
      return (
        <div style={{ background:"#FDF2F8", borderRadius:16, padding:20, border:"1.5px solid #FBCFE8" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#9d174d", margin:"0 0 10px" }}>✏️ Fill in the blank</p>
          <p style={{ fontSize:15, color:"#0f172a" }}>{c.prompt?.replace("___","______")}</p>
          {c.hint && <p style={{ fontSize:12, color:"#94A3B8", margin:"8px 0 0" }}>💡 Hint: {c.hint}</p>}
        </div>
      );
    case "keypoints":
      return (
        <div style={{ background:"#ECFEFF", borderRadius:16, padding:20, border:"1.5px solid #A5F3FC" }}>
          <p style={{ fontSize:14, fontWeight:800, color:"#0e7490", margin:"0 0 12px" }}>⭐ {c.title||"Key Takeaways"}</p>
          {(c.points||[]).filter(Boolean).map((pt,i) => (
            <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"#0891b2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ color:"#fff", fontSize:10, fontWeight:700 }}>{i+1}</span>
              </div>
              <p style={{ fontSize:13, color:"#374151", margin:0, lineHeight:1.5 }}>{pt}</p>
            </div>
          ))}
        </div>
      );
    case "callout":
      const cs = { info:["💡","#0891b2","#ECFEFF"], warning:["⚠️","#d97706","#FFFBEB"], success:["✅","#059669","#ECFDF5"], error:["❌","#dc2626","#FEF2F2"] };
      const [emoji, color, bg] = cs[c.style||"info"];
      return (
        <div style={{ padding:"14px 18px", borderRadius:14, background:bg, border:`1.5px solid ${color}30` }}>
          <p style={{ fontSize:13, color, margin:0, lineHeight:1.6 }}>{emoji} {c.text}</p>
        </div>
      );
    default: return null;
  }
}

const iSt = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
const lbSt = () => ({ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 });
const ctrlBtn = (disabled) => ({ width:26, height:26, borderRadius:7, border:"1.5px solid #E2E8F0", background:"#fff", cursor:disabled?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:disabled?0.4:1 });

function Spinner() {
  return <div style={{ width:13, height:13, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin 0.7s linear infinite" }}/>;
}
