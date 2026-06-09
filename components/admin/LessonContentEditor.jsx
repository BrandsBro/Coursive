"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, GripVertical, Type, Image, HelpCircle, Zap, Save, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

const BLOCK_TYPES = [
  { type:"text",        icon:<Type size={16}/>,       label:"Text Block",    color:"#6366f1", bg:"#EEF2FF"  },
  { type:"image",       icon:<Image size={16}/>,      label:"Image",         color:"#10b981", bg:"#ECFDF5"  },
  { type:"quiz",        icon:<HelpCircle size={16}/>, label:"Quiz Question", color:"#f59e0b", bg:"#FFFBEB"  },
  { type:"interactive", icon:<Zap size={16}/>,        label:"Fill in Blank", color:"#ec4899", bg:"#FDF2F8"  },
];

const DEFAULT_CONTENT = {
  text:        { text:"" },
  image:       { src:"", alt:"", caption:"" },
  quiz:        { question:"", options:["","","",""], correct:0 },
  interactive: { prompt:"", answer:"", hint:"" },
};

export default function LessonContentEditor({ lessonId, lessonTitle, onClose }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadContent();
  }, [lessonId]);

  const loadContent = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lesson_content")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index");

    setBlocks(data || []);
    setLoading(false);
  };

  const addBlock = (type) => {
    const newBlock = {
      id: `temp-${Date.now()}`,
      lesson_id: lessonId,
      type,
      content: DEFAULT_CONTENT[type],
      order_index: blocks.length,
      isNew: true,
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (id, newContent) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  const deleteBlock = async (id) => {
    if (!id.startsWith("temp-")) {
      await supabase.from("lesson_content").delete().eq("id", id);
    }
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const moveBlock = (id, dir) => {
    const idx = blocks.findIndex(b => b.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[idx + dir]] = [newBlocks[idx + dir], newBlocks[idx]];
    setBlocks(newBlocks);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const row = {
          lesson_id: lessonId,
          type: block.type,
          content: block.content,
          order_index: i,
        };

        if (block.isNew || block.id.startsWith("temp-")) {
          const { data } = await supabase.from("lesson_content").insert(row).select().single();
          if (data) {
            setBlocks(prev => prev.map(b => b.id === block.id ? { ...data } : b));
          }
        } else {
          await supabase.from("lesson_content").update({ ...row }).eq("id", block.id);
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Save failed: " + e.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.7)", zIndex:200, display:"flex", alignItems:"stretch", justifyContent:"flex-end", backdropFilter:"blur(4px)" }}>
      <div style={{ width:"100%", maxWidth:680, background:"#F8FAFC", display:"flex", flexDirection:"column", height:"100vh", boxShadow:"-8px 0 40px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ background:"#fff", padding:"16px 24px", borderBottom:"1px solid #E2E8F0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 2px", letterSpacing:1 }}>LESSON CONTENT</p>
            <h2 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:0 }}>{lessonTitle}</h2>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={saveAll} disabled={saving} style={{ padding:"9px 18px", borderRadius:10, border:"none", background:saved?"#22C55E":"linear-gradient(135deg,#6366f1,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <Save size={14}/>
              {saving ? "Saving..." : saved ? "Saved!" : "Save All"}
            </button>
            <button onClick={onClose} style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer" }}>
              <X size={16} color="#64748B"/>
            </button>
          </div>
        </div>

        {/* Add block buttons */}
        <div style={{ padding:"12px 24px", background:"#fff", borderBottom:"1px solid #E2E8F0", display:"flex", gap:8, flexWrap:"wrap", flexShrink:0 }}>
          {BLOCK_TYPES.map(({ type, icon, label, color, bg }) => (
            <button key={type} onClick={() => addBlock(type)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:9, border:`1.5px solid ${color}30`, background:bg, color, fontSize:12, fontWeight:700, cursor:"pointer" }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Blocks */}
        <div style={{ flex:1, overflow:"auto", padding:"16px 24px", display:"flex", flexDirection:"column", gap:12 }}>
          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#94A3B8" }}>Loading content...</div>
          ) : blocks.length === 0 ? (
            <div style={{ textAlign:"center", padding:40 }}>
              <p style={{ fontSize:32, marginBottom:8 }}>✍️</p>
              <p style={{ fontSize:14, fontWeight:600, color:"#64748B", margin:"0 0 4px" }}>No content yet</p>
              <p style={{ fontSize:13, color:"#94A3B8" }}>Add blocks above to build this lesson</p>
            </div>
          ) : (
            blocks.map((block, idx) => (
              <BlockEditor
                key={block.id}
                block={block}
                index={idx}
                total={blocks.length}
                onChange={newContent => updateBlock(block.id, newContent)}
                onDelete={() => deleteBlock(block.id)}
                onMove={dir => moveBlock(block.id, dir)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BlockEditor({ block, index, total, onChange, onDelete, onMove }) {
  const meta = BLOCK_TYPES.find(t => t.type === block.type);

  return (
    <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #E2E8F0", overflow:"hidden" }}>
      {/* Block header */}
      <div style={{ padding:"10px 14px", background:meta?.bg, display:"flex", alignItems:"center", gap:8, borderBottom:"1px solid #E2E8F0" }}>
        <span style={{ color:meta?.color }}>{meta?.icon}</span>
        <span style={{ fontSize:12, fontWeight:700, color:meta?.color, flex:1 }}>{meta?.label}</span>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={() => onMove(-1)} disabled={index===0} style={{ padding:"3px 7px", borderRadius:6, border:"1.5px solid #E2E8F0", background:"#fff", cursor:index===0?"not-allowed":"pointer", opacity:index===0?0.4:1 }}>
            <ChevronUp size={12}/>
          </button>
          <button onClick={() => onMove(1)} disabled={index===total-1} style={{ padding:"3px 7px", borderRadius:6, border:"1.5px solid #E2E8F0", background:"#fff", cursor:index===total-1?"not-allowed":"pointer", opacity:index===total-1?0.4:1 }}>
            <ChevronDown size={12}/>
          </button>
          <button onClick={onDelete} style={{ padding:"3px 7px", borderRadius:6, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer" }}>
            <Trash2 size={12} color="#EF4444"/>
          </button>
        </div>
      </div>

      {/* Block content */}
      <div style={{ padding:16 }}>
        {block.type === "text" && <TextBlock content={block.content} onChange={onChange} />}
        {block.type === "image" && <ImageBlock content={block.content} onChange={onChange} />}
        {block.type === "quiz" && <QuizBlock content={block.content} onChange={onChange} />}
        {block.type === "interactive" && <InteractiveBlock content={block.content} onChange={onChange} />}
      </div>
    </div>
  );
}

function TextBlock({ content, onChange }) {
  return (
    <textarea
      value={content.text || ""}
      onChange={e => onChange({ ...content, text: e.target.value })}
      placeholder="Write your lesson text here..."
      style={{ width:"100%", minHeight:120, padding:"10px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, resize:"vertical", outline:"none", boxSizing:"border-box", fontFamily:"inherit", lineHeight:1.6 }}
    />
  );
}

function ImageBlock({ content, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <input value={content.src || ""} onChange={e => onChange({ ...content, src: e.target.value })} placeholder="Image URL (https://...)" style={iSt()} />
      <input value={content.alt || ""} onChange={e => onChange({ ...content, alt: e.target.value })} placeholder="Alt text" style={iSt()} />
      <input value={content.caption || ""} onChange={e => onChange({ ...content, caption: e.target.value })} placeholder="Caption (optional)" style={iSt()} />
      {content.src && (
        <div style={{ borderRadius:10, overflow:"hidden", border:"1.5px solid #E2E8F0" }}>
          <img src={content.src} alt={content.alt} style={{ width:"100%", maxHeight:200, objectFit:"cover" }} onError={e => e.target.style.display="none"} />
        </div>
      )}
    </div>
  );
}

function QuizBlock({ content, onChange }) {
  const updateOption = (i, val) => {
    const opts = [...(content.options || ["","","",""])];
    opts[i] = val;
    onChange({ ...content, options: opts });
  };

  const options = content.options || ["","","",""];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <input value={content.question || ""} onChange={e => onChange({ ...content, question: e.target.value })} placeholder="Quiz question..." style={iSt()} />
      <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"4px 0 0" }}>OPTIONS (click radio to mark correct answer)</p>
      {options.map((opt, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={() => onChange({ ...content, correct: i })} style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${content.correct===i?"#6366f1":"#E2E8F0"}`, background:content.correct===i?"#6366f1":"#fff", cursor:"pointer", flexShrink:0 }}>
            {content.correct===i && <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff", margin:"auto" }} />}
          </button>
          <input value={opt} onChange={e => updateOption(i, e.target.value)} placeholder={`Option ${i+1}${i===0?" (mark correct above)":""}`} style={{ ...iSt(), flex:1, borderColor:content.correct===i?"#6366f1":"#E2E8F0" }} />
        </div>
      ))}
    </div>
  );
}

function InteractiveBlock({ content, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px" }}>PROMPT (use ___ for the blank)</p>
        <input value={content.prompt || ""} onChange={e => onChange({ ...content, prompt: e.target.value })} placeholder="The capital of France is ___" style={iSt()} />
      </div>
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px" }}>CORRECT ANSWER</p>
        <input value={content.answer || ""} onChange={e => onChange({ ...content, answer: e.target.value })} placeholder="Paris" style={iSt()} />
      </div>
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px" }}>HINT (optional)</p>
        <input value={content.hint || ""} onChange={e => onChange({ ...content, hint: e.target.value })} placeholder="Think about Europe..." style={iSt()} />
      </div>
    </div>
  );
}

const iSt = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" });
