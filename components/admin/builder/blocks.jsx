"use client";

import { useState } from "react";
import { ImagePlus, Check, Music, Film } from "lucide-react";
import MediaLibrary from "@/components/admin/builder/MediaLibrary";

// ─────────────────────────────────────────────
// BLOCK DEFINITIONS
// ─────────────────────────────────────────────
export const BLOCK_DEFS = {
  heading:   { icon:"✦",  label:"Heading",   desc:"Section title",    color:"#7c3aed", bg:"#F5F3FF", default:{ text:"", level:"h2" },                          preview:c=>c.text||"Empty heading" },
  text:      { icon:"📝", label:"Text",      desc:"Paragraph",        color:"#2563eb", bg:"#EFF6FF", default:{ text:"" },                                     preview:c=>c.text?c.text.slice(0,60):"Empty text" },
  image:     { icon:"🖼️", label:"Image",     desc:"Photo or graphic", color:"#059669", bg:"#ECFDF5", default:{ src:"", alt:"", caption:"" },                  preview:c=>c.src?"Image set":"No image" },
  video:     { icon:"🎬", label:"Video",     desc:"YouTube or file",  color:"#dc2626", bg:"#FEF2F2", default:{ src:"", kind:"youtube", caption:"" },           preview:c=>c.src?"Video set":"No video" },
  audio:     { icon:"🎧", label:"Audio",     desc:"Podcast or sound", color:"#0891b2", bg:"#ECFEFF", default:{ src:"", title:"", caption:"" },                 preview:c=>c.src?(c.title||"Audio set"):"No audio" },
  quiz:      { icon:"🎯", label:"Quiz",      desc:"Multiple choice",  color:"#d97706", bg:"#FFFBEB", default:{ question:"", options:["","","",""], correct:0, explanation:"" }, preview:c=>c.question||"No question" },
  fillblank: { icon:"✏️", label:"Fill Blank",desc:"Type the answer",  color:"#db2777", bg:"#FDF2F8", default:{ prompt:"", answer:"", hint:"" },                preview:c=>c.prompt||"No prompt" },
  keypoints: { icon:"⭐", label:"Key Points",desc:"Bullet list",      color:"#0d9488", bg:"#F0FDFA", default:{ title:"Key Takeaways", points:["","",""] },     preview:c=>(c.points||[]).filter(Boolean).join(", ")||"No points" },
  callout:   { icon:"💡", label:"Callout",   desc:"Highlight box",    color:"#65a30d", bg:"#F7FEE7", default:{ text:"", style:"info" },                        preview:c=>c.text||"Empty callout" },
  divider:   { icon:"➖", label:"Divider",   desc:"Visual break",     color:"#64748b", bg:"#F8FAFC", default:{ style:"line" },                                 preview:()=>"Section divider" },
};

// ─────────────────────────────────────────────
// EDITOR ROUTER
// ─────────────────────────────────────────────
export function BlockEditor({ block, onChange }) {
  const c = block.content || {};
  const props = { content:c, onChange };
  switch (block.type) {
    case "heading":   return <HeadingE {...props}/>;
    case "text":      return <TextE {...props}/>;
    case "image":     return <ImageE {...props}/>;
    case "video":     return <VideoE {...props}/>;
    case "audio":     return <AudioE {...props}/>;
    case "quiz":      return <QuizE {...props}/>;
    case "fillblank": return <FillE {...props}/>;
    case "keypoints": return <KeyE {...props}/>;
    case "callout":   return <CalloutE {...props}/>;
    case "divider":   return <DividerE {...props}/>;
    default: return null;
  }
}

// ─────────────────────────────────────────────
// PREVIEW ROUTER
// ─────────────────────────────────────────────
export function BlockPreview({ block }) {
  const c = block.content || {};
  switch (block.type) {
    case "heading":
      return <div style={{ fontSize:c.level==="h1"?28:c.level==="h2"?22:18, fontWeight:900, color:"#0f172a", lineHeight:1.25 }}>{c.text||"Heading"}</div>;
    case "text":
      return <p style={{ fontSize:15, lineHeight:1.75, color:"#374151", margin:0, whiteSpace:"pre-wrap" }}>{c.text||"Text content..."}</p>;
    case "image":
      return c.src ? (
        <figure style={{ margin:0 }}>
          <img src={c.src} alt={c.alt||""} style={{ width:"100%", borderRadius:16, display:"block" }}
            onError={e => { e.target.style.display="none"; }}
          />
          {c.caption && <figcaption style={{ fontSize:12, color:"#94A3B8", textAlign:"center", marginTop:8, fontStyle:"italic" }}>{c.caption}</figcaption>}
        </figure>
      ) : <Placeholder icon="🖼️" text="Image"/>;
    case "video": {
      const yt = c.kind==="youtube" && c.src ? ytId(c.src) : null;
      if (yt) return <div style={{ borderRadius:16, overflow:"hidden", aspectRatio:"16/9" }}><iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${yt}`} style={{ border:"none" }} allowFullScreen/></div>;
      if (c.kind==="vimeo" && c.src) { const vid=c.src.match(/vimeo\.com\/(\d+)/)?.[1]; return vid ? <div style={{ borderRadius:16, overflow:"hidden", aspectRatio:"16/9" }}><iframe width="100%" height="100%" src={`https://player.vimeo.com/video/${vid}`} style={{ border:"none" }} allowFullScreen/></div> : <Placeholder icon="🎬" text="Video"/>; }
      if (c.src) return <video src={c.src} controls style={{ width:"100%", borderRadius:16 }}/>;
      return <Placeholder icon="🎬" text="Video"/>;
    }
    case "audio":
      return c.src ? (
        <div style={{ background:"linear-gradient(135deg,#ecfeff,#cffafe)", borderRadius:16, padding:"16px 18px", border:"1.5px solid #a5f3fc" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:c.src?10:0 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#0891b2,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Music size={20} color="#fff"/>
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:14, fontWeight:700, color:"#0e7490", margin:0 }}>{c.title||"Audio track"}</p>
              {c.caption && <p style={{ fontSize:12, color:"#0891b2", margin:0 }}>{c.caption}</p>}
            </div>
          </div>
          <audio src={c.src} controls style={{ width:"100%", height:38 }}/>
        </div>
      ) : <Placeholder icon="🎧" text="Audio"/>;
    case "quiz":
      return (
        <div style={{ background:"#FFFBEB", borderRadius:16, padding:20, border:"1.5px solid #FDE68A" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#92400E", margin:"0 0 10px" }}>🎯 QUIZ</p>
          <p style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 12px" }}>{c.question||"Question..."}</p>
          {(c.options||[]).filter(Boolean).map((o,i) => (
            <div key={i} style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${i===c.correct?"#86efac":"#E2E8F0"}`, background:i===c.correct?"#F0FDF4":"#fff", marginBottom:6, fontSize:13, color:"#374151", display:"flex", alignItems:"center", gap:8 }}>
              {i===c.correct && <Check size={14} color="#22c55e"/>}
              <span style={{ fontWeight:600 }}>{String.fromCharCode(65+i)}.</span> {o}
            </div>
          ))}
        </div>
      );
    case "fillblank":
      return (
        <div style={{ background:"#FDF2F8", borderRadius:16, padding:20, border:"1.5px solid #FBCFE8" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#9d174d", margin:"0 0 10px" }}>✏️ FILL IN THE BLANK</p>
          <p style={{ fontSize:15, color:"#0f172a", lineHeight:1.6 }}>{(c.prompt||"Prompt with ___").split("___").map((part,i,arr) => <span key={i}>{part}{i<arr.length-1 && <span style={{ display:"inline-block", minWidth:60, borderBottom:"2px solid #db2777", margin:"0 4px" }}/>}</span>)}</p>
          {c.hint && <p style={{ fontSize:12, color:"#be185d", margin:"10px 0 0" }}>💡 {c.hint}</p>}
        </div>
      );
    case "keypoints":
      return (
        <div style={{ background:"#F0FDFA", borderRadius:16, padding:20, border:"1.5px solid #99f6e4" }}>
          <p style={{ fontSize:14, fontWeight:800, color:"#0f766e", margin:"0 0 12px" }}>⭐ {c.title||"Key Takeaways"}</p>
          {(c.points||[]).filter(Boolean).map((p,i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"#0d9488", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{i+1}</div>
              <p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.5 }}>{p}</p>
            </div>
          ))}
        </div>
      );
    case "callout": {
      const map = { info:["💡","#0891b2","#ECFEFF","#a5f3fc"], warning:["⚠️","#d97706","#FFFBEB","#fde68a"], success:["✅","#059669","#ECFDF5","#a7f3d0"], error:["❌","#dc2626","#FEF2F2","#fecaca"] };
      const [emoji,color,bg,border] = map[c.style||"info"];
      return <div style={{ padding:"14px 18px", borderRadius:14, background:bg, border:`1.5px solid ${border}` }}><p style={{ fontSize:14, color, margin:0, lineHeight:1.6 }}>{emoji} {c.text||"Callout text"}</p></div>;
    }
    case "divider":
      return c.style==="dots"
        ? <div style={{ textAlign:"center", color:"#CBD5E1", fontSize:20, letterSpacing:8 }}>• • •</div>
        : c.style==="space"
        ? <div style={{ height:32 }}/>
        : <hr style={{ border:"none", borderTop:"2px solid #E2E8F0", margin:0 }}/>;
    default: return null;
  }
}

function Placeholder({ icon, text }) {
  return <div style={{ background:"#F8FAFC", borderRadius:16, padding:36, textAlign:"center", color:"#CBD5E1", border:"1.5px dashed #E2E8F0" }}><div style={{ fontSize:32, marginBottom:6 }}>{icon}</div><p style={{ fontSize:13, margin:0 }}>{text} preview</p></div>;
}

function ytId(url) {
  return url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1] || null;
}

// ─────────────────────────────────────────────
// EDITORS
// ─────────────────────────────────────────────
function HeadingE({ content, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <div style={{ display:"flex", gap:6 }}>
        {["h1","h2","h3"].map(l => (
          <button key={l} onClick={() => onChange({ ...content, level:l })} style={pill(content.level===l, "#7c3aed")}>{l.toUpperCase()}</button>
        ))}
      </div>
      <input value={content.text||""} onChange={e => onChange({ ...content, text:e.target.value })} placeholder="Heading text..." style={{ ...inp(), fontWeight:800, fontSize:16 }}/>
    </div>
  );
}

function TextE({ content, onChange }) {
  return (
    <div style={{ paddingTop:12 }}>
      <textarea value={content.text||""} onChange={e => onChange({ ...content, text:e.target.value })} placeholder="Write your content... Line breaks are preserved." style={{ ...inp(), minHeight:150, resize:"vertical", lineHeight:1.7 }}/>
      <p style={{ fontSize:11, color:"#94A3B8", margin:"6px 0 0" }}>{(content.text||"").length} chars</p>
    </div>
  );
}

function ImageE({ content, onChange }) {
  const [lib, setLib] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <button onClick={() => setLib(true)} style={mediaBtn("#059669")}>
        <ImagePlus size={16}/> {content.src ? "Change image" : "Choose / upload image"}
      </button>
      {content.src && (
        <div style={{ borderRadius:12, overflow:"hidden", border:"1.5px solid #E2E8F0", background:"#F8FAFC" }}>
          <img
            src={content.src}
            alt={content.alt||""}
            style={{ width:"100%", maxHeight:180, objectFit:"cover", display:"block" }}
            onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
          />
          <div style={{ display:"none", padding:20, alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6, color:"#94A3B8" }}>
            <span style={{ fontSize:24 }}>🖼️</span>
            <span style={{ fontSize:12 }}>Cannot load image preview</span>
            <span style={{ fontSize:10, wordBreak:"break-all", maxWidth:"100%" }}>{content.src}</span>
          </div>
        </div>
      )}
      <input value={content.alt||""} onChange={e => onChange({ ...content, alt:e.target.value })} placeholder="Alt text (accessibility)" style={inp()}/>
      <input value={content.caption||""} onChange={e => onChange({ ...content, caption:e.target.value })} placeholder="Caption (optional)" style={inp()}/>
      {lib && <MediaLibrary accept="image" onSelect={m => { console.log("Selected media:", m); onChange({ ...content, src:m.url, alt:content.alt||m.filename }); }} onClose={() => setLib(false)}/>}
    </div>
  );
}

function VideoE({ content, onChange }) {
  const [lib, setLib] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <div style={{ display:"flex", gap:6 }}>
        {[["youtube","YouTube"],["vimeo","Vimeo"],["file","Upload"]].map(([v,l]) => (
          <button key={v} onClick={() => onChange({ ...content, kind:v })} style={{ ...pill(content.kind===v,"#dc2626"), flex:1 }}>{l}</button>
        ))}
      </div>
      {content.kind === "file" ? (
        <>
          <button onClick={() => setLib(true)} style={mediaBtn("#dc2626")}>
            <Film size={16}/> {content.src ? "Change video" : "Choose / upload video"}
          </button>
          {content.src && <video src={content.src} controls style={{ width:"100%", borderRadius:12 }}/>}
        </>
      ) : (
        <input value={content.src||""} onChange={e => onChange({ ...content, src:e.target.value })} placeholder={content.kind==="vimeo"?"https://vimeo.com/...":"https://youtube.com/watch?v=..."} style={inp()}/>
      )}
      <input value={content.caption||""} onChange={e => onChange({ ...content, caption:e.target.value })} placeholder="Caption (optional)" style={inp()}/>
      {lib && <MediaLibrary accept="video" onSelect={m => onChange({ ...content, src:m.url, kind:"file" })} onClose={() => setLib(false)}/>}
    </div>
  );
}

function AudioE({ content, onChange }) {
  const [lib, setLib] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <button onClick={() => setLib(true)} style={mediaBtn("#0891b2")}>
        <Music size={16}/> {content.src ? "Change audio" : "Choose / upload audio"}
      </button>
      {content.src && <audio src={content.src} controls style={{ width:"100%" }}/>}
      <input value={content.title||""} onChange={e => onChange({ ...content, title:e.target.value })} placeholder="Audio title (e.g. Lesson narration)" style={inp()}/>
      <input value={content.caption||""} onChange={e => onChange({ ...content, caption:e.target.value })} placeholder="Caption / description (optional)" style={inp()}/>
      {lib && <MediaLibrary accept="audio" onSelect={m => onChange({ ...content, src:m.url, title:content.title||m.filename })} onClose={() => setLib(false)}/>}
    </div>
  );
}

function QuizE({ content, onChange }) {
  const opts = content.options || ["","","",""];
  const setOpt = (i,v) => { const a=[...opts]; a[i]=v; onChange({ ...content, options:a }); };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div><label style={lbl()}>Question</label><textarea value={content.question||""} onChange={e => onChange({ ...content, question:e.target.value })} placeholder="Your question..." style={{ ...inp(), minHeight:70, resize:"vertical" }}/></div>
      <div>
        <label style={lbl()}>Options <span style={{ color:"#94A3B8", fontWeight:400 }}>· click ✓ for correct</span></label>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {opts.map((o,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={() => onChange({ ...content, correct:i })} style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${content.correct===i?"#22c55e":"#E2E8F0"}`, background:content.correct===i?"#22c55e":"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{content.correct===i && <Check size={13} color="#fff"/>}</button>
              <input value={o} onChange={e => setOpt(i,e.target.value)} placeholder={`Option ${i+1}`} style={{ ...inp(), flex:1, borderColor:content.correct===i?"#22c55e":"#E2E8F0" }}/>
              {opts.length>2 && <button onClick={() => onChange({ ...content, options:opts.filter((_,x)=>x!==i), correct:Math.min(content.correct,opts.length-2) })} style={ctrlX()}>✕</button>}
            </div>
          ))}
          {opts.length<6 && <button onClick={() => onChange({ ...content, options:[...opts,""] })} style={addX()}>+ Add option</button>}
        </div>
      </div>
      <div><label style={lbl()}>Explanation <span style={{ color:"#94A3B8", fontWeight:400 }}>· shown after</span></label><textarea value={content.explanation||""} onChange={e => onChange({ ...content, explanation:e.target.value })} placeholder="Why is this correct?" style={{ ...inp(), minHeight:60, resize:"vertical" }}/></div>
    </div>
  );
}

function FillE({ content, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div><label style={lbl()}>Prompt <span style={{ color:"#94A3B8", fontWeight:400 }}>· use ___ for blank</span></label><input value={content.prompt||""} onChange={e => onChange({ ...content, prompt:e.target.value })} placeholder="The capital of France is ___" style={inp()}/></div>
      <div><label style={lbl()}>Answer</label><input value={content.answer||""} onChange={e => onChange({ ...content, answer:e.target.value })} placeholder="Paris" style={inp()}/></div>
      <div><label style={lbl()}>Hint <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span></label><input value={content.hint||""} onChange={e => onChange({ ...content, hint:e.target.value })} placeholder="A European city..." style={inp()}/></div>
    </div>
  );
}

function KeyE({ content, onChange }) {
  const pts = content.points || ["",""];
  const setPt = (i,v) => { const a=[...pts]; a[i]=v; onChange({ ...content, points:a }); };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div><label style={lbl()}>Title</label><input value={content.title||""} onChange={e => onChange({ ...content, title:e.target.value })} placeholder="Key Takeaways" style={inp()}/></div>
      <div>
        <label style={lbl()}>Points</label>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {pts.map((p,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:"#0d9488", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{i+1}</div>
              <input value={p} onChange={e => setPt(i,e.target.value)} placeholder={`Point ${i+1}`} style={{ ...inp(), flex:1 }}/>
              {pts.length>1 && <button onClick={() => onChange({ ...content, points:pts.filter((_,x)=>x!==i) })} style={ctrlX()}>✕</button>}
            </div>
          ))}
          <button onClick={() => onChange({ ...content, points:[...pts,""] })} style={addX()}>+ Add point</button>
        </div>
      </div>
    </div>
  );
}

function CalloutE({ content, onChange }) {
  const styles = [["info","💡 Info","#0891b2"],["warning","⚠️ Warning","#d97706"],["success","✅ Tip","#059669"],["error","❌ Note","#dc2626"]];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div style={{ display:"flex", gap:6 }}>
        {styles.map(([v,l,col]) => <button key={v} onClick={() => onChange({ ...content, style:v })} style={{ ...pill(content.style===v,col), flex:1, fontSize:11 }}>{l}</button>)}
      </div>
      <textarea value={content.text||""} onChange={e => onChange({ ...content, text:e.target.value })} placeholder="Callout message..." style={{ ...inp(), minHeight:80, resize:"vertical" }}/>
    </div>
  );
}

function DividerE({ content, onChange }) {
  const styles = [["line","Line"],["dots","Dots"],["space","Space"]];
  return (
    <div style={{ display:"flex", gap:6, paddingTop:12 }}>
      {styles.map(([v,l]) => <button key={v} onClick={() => onChange({ ...content, style:v })} style={{ ...pill(content.style===v,"#64748b"), flex:1 }}>{l}</button>)}
    </div>
  );
}

// ── shared styles ──
const inp = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
const lbl = () => ({ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 });
const pill = (active,color) => ({ padding:"7px 14px", borderRadius:8, border:`1.5px solid ${active?color:"#E2E8F0"}`, background:active?color+"15":"#fff", color:active?color:"#64748B", fontSize:12, fontWeight:700, cursor:"pointer" });
const mediaBtn = (color) => ({ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", borderRadius:11, border:`1.5px dashed ${color}50`, background:color+"08", color, fontSize:13, fontWeight:700, cursor:"pointer", width:"100%" });
const ctrlX = () => ({ width:28, height:28, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", color:"#EF4444", cursor:"pointer", flexShrink:0, fontSize:12 });
const addX = () => ({ padding:"8px", borderRadius:9, border:"1.5px dashed #E2E8F0", background:"#F8FAFC", color:"#94A3B8", fontSize:12, fontWeight:600, cursor:"pointer" });
