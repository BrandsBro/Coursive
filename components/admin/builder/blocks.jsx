"use client";
import { useState, useRef, useEffect } from "react";
import { ImagePlus, Check, Music, Film, Link2, Image as ImageIcon } from "lucide-react";
import MediaLibrary from "@/components/admin/builder/MediaLibrary";

export const BLOCK_DEFS = {
  heading:      { icon:"✦",  label:"Heading",       desc:"Section title",          color:"#7c3aed", bg:"#F5F3FF", default:{ text:"", level:"h2", textStyle:{} },                                                                    preview:c=>c.text||"Empty heading" },
  text:         { icon:"📝", label:"Text",           desc:"Paragraph",              color:"#2563eb", bg:"#EFF6FF", default:{ text:"", textStyle:{} },                                                                               preview:c=>c.text?c.text.slice(0,60):"Empty text" },
  image:        { icon:"🖼️", label:"Image",          desc:"Photo or graphic",       color:"#059669", bg:"#ECFDF5", default:{ src:"", alt:"", caption:"", size:"full", align:"center", captionStyle:{} },                          preview:c=>c.src?"Image set":"No image" },
  video:        { icon:"🎬", label:"Video",          desc:"YouTube or file",        color:"#dc2626", bg:"#FEF2F2", default:{ src:"", kind:"youtube", caption:"" },                                                                 preview:c=>c.src?"Video set":"No video" },
  audio:        { icon:"🎧", label:"Audio",          desc:"Podcast or sound",       color:"#0891b2", bg:"#ECFEFF", default:{ src:"", title:"", caption:"", titleStyle:{}, captionStyle:{} },                                      preview:c=>c.src?(c.title||"Audio set"):"No audio" },
  keypoints:    { icon:"⭐", label:"Key Points",     desc:"Bullet list",            color:"#0d9488", bg:"#F0FDFA", default:{ title:"Key Takeaways", points:["","",""], titleStyle:{}, pointStyle:{} },                            preview:c=>(c.points||[]).filter(Boolean).join(", ")||"No points" },
  callout:      { icon:"💡", label:"Callout",        desc:"Highlight box",          color:"#65a30d", bg:"#F7FEE7", default:{ text:"", style:"info", textStyle:{} },                                                                preview:c=>c.text||"Empty callout" },
  divider:      { icon:"➖", label:"Divider",        desc:"Visual break",           color:"#64748b", bg:"#F8FAFC", default:{ style:"line" },                                                                                       preview:()=>"Section divider" },
  multiplechoice: { icon:"🔘", label:"Multiple Choice", desc:"Radio style quiz with explanation", color:"#7c3aed", bg:"#F5F3FF", default:{ heading:"", subheading:"", headerImage:"", question:"", options:["","",""], optionImages:["","",""], correct:[], explanation:"", successImage:"", successText:"", headingStyle:{}, subheadingStyle:{}, questionStyle:{}, optionStyle:{}, explanationStyle:{} }, preview:c=>c.question||"No question" },
  reorder: { icon:"↕️", label:"Reorder", desc:"Drag items into correct order", color:"#0d9488", bg:"#F0FDFA", default:{ question:"", items:["","","",""], itemStyle:{} }, preview:c=>c.question||"No question" },
  continueblock: { icon:"▶️", label:"Continue",       desc:"Stop point — hides content below", color:"#5B4EFF", bg:"#EEF2FF", default:{ label:"Continue" },                                                                    preview:()=>"── Continue button ──" },
  matching: { icon:"🔗", label:"Matching", desc:"Match left to right", color:"#7c3aed", bg:"#F5F3FF", default:{ heading:"", subheading:"", pairs:[{left:"",right:""},{left:"",right:""}] }, preview:c=>c.heading||"Matching exercise" },
  blankoptions: { icon:"🔤", label:"Blank + Options",desc:"Pick word from sentence",color:"#0891b2", bg:"#E0F2FE", default:{ sentence:"", markedWords:[], blanks:[], explanation:"", taskTitle:"", taskDesc:"", successText:"", successImages:[], sentenceStyle:{} },                         preview:c=>c.sentence||"No sentence" },
};

export function BlockEditor({ block, onChange }) {
  const c = block.content || {};
  const p = { content:c, onChange };
  switch (block.type) {
    case "heading":      return <HeadingE {...p}/>;
    case "text":         return <TextE {...p}/>;
    case "image":        return <ImageE {...p}/>;
    case "video":        return <VideoE {...p}/>;
    case "audio":        return <AudioE {...p}/>;
    case "keypoints":    return <KeyE {...p}/>;
    case "callout":      return <CalloutE {...p}/>;
    case "multiplechoice": return <MultipleChoiceE {...p}/>;
    case "reorder": return <ReorderE {...p}/>;
    case "continueblock": return <ContinueE {...p}/>;
    case "matching":     return <MatchingE {...p}/>;
    case "blankoptions": return <BlankOptionsE {...p}/>;
    case "divider":      return <DividerE {...p}/>;
    default: return null;
  }
}

export function BlockPreview({ block }) {
  const c = block.content || {};
  switch (block.type) {
    case "heading": {
      const ts = c.textStyle||{};
      const sz = c.level==="h1"?28:c.level==="h2"?22:18;
      return <div style={{ fontSize:ts.fontSize||sz, fontWeight:ts.bold?"900":"800", fontStyle:ts.italic?"italic":"normal", textAlign:ts.align||"left", color:"#0f172a", lineHeight:1.25 }}>{c.text||"Heading"}</div>;
    }
    case "text": {
      const ts = c.textStyle||{};
      if (c.html) return <><style>{`.preview-text ul{list-style-type:disc!important;padding-left:24px!important;margin:8px 0!important}.preview-text ol{list-style-type:decimal!important;padding-left:24px!important;margin:8px 0!important}.preview-text li{display:list-item!important}.preview-text h2{font-size:22px!important;font-weight:800!important;color:#0f172a}.preview-text h3{font-size:18px!important;font-weight:700!important;color:#0f172a}`}</style><div className="preview-text" style={{ fontSize:ts.fontSize||15, textAlign:ts.align||"left", color:"#374151", lineHeight:1.75 }} dangerouslySetInnerHTML={{ __html:c.html }}/></>;
      return <p style={{ fontSize:ts.fontSize||15, fontWeight:ts.bold?"700":"400", fontStyle:ts.italic?"italic":"normal", textAlign:ts.align||"left", color:"#374151", lineHeight:1.75, margin:0, whiteSpace:"pre-wrap" }}>{c.text||"Text content..."}</p>;
    }
    case "image":
      return c.src ? (
        <figure style={{ margin:0, textAlign:c.align||"center" }}>
          <img src={c.src} alt={c.alt||""} style={{ width:c.size==="small"?"50%":c.size==="medium"?"75%":"100%", borderRadius:14, display:"inline-block" }} onError={e=>e.target.style.display="none"}/>
          {c.caption && (()=>{ const cs=c.captionStyle||{}; return <figcaption style={{ fontSize:cs.fontSize||12, fontWeight:cs.bold?"700":"400", fontStyle:cs.italic?"italic":"normal", textAlign:cs.align||"center", color:"#94A3B8", marginTop:6 }}>{c.caption}</figcaption>; })()}
        </figure>
      ) : <Placeholder icon="🖼️" text="Image"/>;
    case "video": {
      const yt = c.kind==="youtube"&&c.src ? ytId(c.src) : null;
      if (yt) return <div style={{ borderRadius:14, overflow:"hidden", aspectRatio:"16/9" }}><iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${yt}`} style={{ border:"none" }} allowFullScreen/></div>;
      if (c.src) return <video src={c.src} controls style={{ width:"100%", borderRadius:14 }}/>;
      return <Placeholder icon="🎬" text="Video"/>;
    }
    case "audio": {
      if (!c.src) return <Placeholder icon="🎧" text="Audio"/>;
      const tts=c.titleStyle||{}; const cts=c.captionStyle||{};
      return (
        <div style={{ padding:"14px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#0891b2,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Music size={20} color="#fff"/></div>
            <div>
              <p style={{ fontSize:tts.fontSize||14, fontWeight:tts.bold?"700":"700", fontStyle:tts.italic?"italic":"normal", textAlign:tts.align||"left", color:"#0f172a", margin:0 }}>{c.title||"Audio"}</p>
              {c.caption && <p style={{ fontSize:cts.fontSize||12, fontStyle:cts.italic?"italic":"normal", color:"#64748B", margin:0 }}>{c.caption}</p>}
            </div>
          </div>
          <audio src={c.src} controls style={{ width:"100%", height:38 }}/>
        </div>
      );
    }
    case "keypoints": {
      const ts=c.titleStyle||{}; const ps=c.pointStyle||{};
      return (
        <div>
          <p style={{ fontSize:ts.fontSize||16, fontWeight:ts.bold?"900":"800", fontStyle:ts.italic?"italic":"normal", textAlign:ts.align||"left", color:"#0f172a", margin:"0 0 12px" }}>⭐ {c.title||"Key Takeaways"}</p>
          {(c.points||[]).filter(Boolean).map((pt,i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:"#6366f1", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, flexShrink:0 }}>{i+1}</div>
              <p style={{ fontSize:ps.fontSize||14, fontWeight:ps.bold?"700":"400", fontStyle:ps.italic?"italic":"normal", textAlign:ps.align||"left", color:"#374151", margin:0, lineHeight:1.6 }}>{pt}</p>
            </div>
          ))}
        </div>
      );
    }
    case "callout": {
      const map={ info:["💡","#0891b2","#EFF6FF"], warning:["⚠️","#d97706","#FFFBEB"], success:["✅","#059669","#ECFDF5"], error:["❌","#dc2626","#FEF2F2"] };
      const [emoji,color,bg]=map[c.style||"info"];
      const ts=c.textStyle||{};
      return <div style={{ padding:"14px 18px", borderRadius:12, background:bg, borderLeft:`4px solid ${color}`, display:"flex", gap:12 }}><span style={{ fontSize:18, flexShrink:0 }}>{emoji}</span><div><p style={{ fontSize:ts.fontSize||14, fontWeight:"800", color:"#374151", margin:c.text?"0 0 4px":0 }}>{c.heading}</p><p style={{ fontSize:ts.fontSize||14, fontWeight:ts.bold?"700":"400", fontStyle:ts.italic?"italic":"normal", textAlign:ts.align||"left", color:"#374151", margin:0, lineHeight:1.65 }}>{c.text||"Callout text"}</p></div></div>;
    }
    
    case "multiplechoice": {
      const qs=c.questionStyle||{}; const hs2=c.headingStyle||{}; const ss2=c.subheadingStyle||{};
      const correctArr = Array.isArray(c.correct)?c.correct:c.correct!==undefined?[c.correct]:[];
      return (
        <div>
          {c.heading && <p style={{ fontSize:hs2.fontSize||20, fontWeight:"800", color:"#0f172a", margin:"0 0 4px" }}>{c.heading}</p>}
          {c.subheading && <p style={{ fontSize:ss2.fontSize||14, color:"#64748B", margin:"0 0 8px" }}>{c.subheading}</p>}
          {c.headerImage && <img src={c.headerImage} alt="" style={{ width:"100%", borderRadius:10, marginBottom:10, objectFit:"contain" }}/>}
          <p style={{ fontSize:qs.fontSize||15, fontWeight:"700", color:"#0f172a", margin:"0 0 10px" }}>{c.question||"Question..."}</p>
          {(c.options||[]).filter(Boolean).map((o,i) => (
            <div key={i} style={{ borderRadius:10, border:`1.5px solid ${correctArr.includes(i)?"#22c55e":"#E2E8F0"}`, background:correctArr.includes(i)?"#F0FDF4":"#fff", marginBottom:6, overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px" }}>
                <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${correctArr.includes(i)?"#22c55e":"#D1D5DB"}`, background:correctArr.includes(i)?"#22c55e":"#fff", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {correctArr.includes(i) && <Check size={11} color="#fff"/>}
                </div>
                <span style={{ fontSize:13, color:"#374151" }}>{o}</span>
              </div>
              {(c.optionImages||[])[i] && <img src={(c.optionImages||[])[i]} alt="" style={{ width:"100%", display:"block", objectFit:"contain" }}/>}
            </div>
          ))}
        </div>
      );
    }
    case "reorder": {
      const is = c.itemStyle||{};
      return (
        <div>
          {c.question && <p style={{ fontSize:(c.questionStyle||{}).fontSize||15, fontWeight:(c.questionStyle||{}).bold?"700":"400", fontStyle:(c.questionStyle||{}).italic?"italic":"normal", textAlign:(c.questionStyle||{}).align||"left", color:"#0f172a", margin:"0 0 12px" }}>{c.question}</p>}
          {(c.items||[]).filter(Boolean).map((item,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", marginBottom:6 }}>
              <span style={{ fontSize:16, color:"#CBD5E1" }}>⠿</span>
              <span style={{ fontSize:14, color:"#374151" }}>{item}</span>
            </div>
          ))}
        </div>
      );
    }
    case "continueblock":
      return <div style={{ width:"100%", padding:"14px", borderRadius:14, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:15, fontWeight:700, textAlign:"center" }}>{c.label||"Continue"}</div>;
    case "matching": {
      const pairs = c.pairs || [];
      return (
        <div style={{ padding:"8px 0" }}>
          {c.heading && <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>{c.heading}</p>}
          {c.subheading && <p style={{ fontSize:12, color:"#64748B", margin:"0 0 10px" }}>{c.subheading}</p>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {pairs.map((p,i) => <div key={i} style={{ padding:"8px 12px", borderRadius:10, background:"#EEF2FF", border:"1.5px solid #C7D2FE", fontSize:13, fontWeight:600, color:"#4338CA" }}>{p.left||"Item "+(i+1)}</div>)}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[...pairs].sort(()=>0.5-Math.random()).map((p,i) => <div key={i} style={{ padding:"8px 12px", borderRadius:10, background:"#F5F3FF", border:"1.5px solid #DDD6FE", fontSize:13, fontWeight:600, color:"#6D28D9" }}>{p.right||"Match "+(i+1)}</div>)}
            </div>
          </div>
        </div>
      );
    }
    case "blankoptions": {
      const words=(c.sentence||"").split(" ").filter(Boolean);
      const marked=c.markedWords||[];
      const ss=c.sentenceStyle||{};
      return (
        <div>
          <p style={{ fontSize:ss.fontSize||15, fontWeight:ss.bold?"700":"400", textAlign:ss.align||"left", color:"#0f172a", margin:"0 0 10px", lineHeight:1.8 }}>
            {words.map((w,i) => <span key={i}>{marked.includes(i)?<span style={{ display:"inline-block", padding:"2px 12px", borderRadius:8, border:"2px dashed #93c5fd", color:"#94A3B8", fontWeight:700, margin:"0 3px" }}>______</span>:w}{" "}</span>)}
          </p>
          {(c.blanks||[]).length>0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {(c.blanks||[]).map((b,i) => [b.correct,b.w1,b.w2,b.w3].filter(Boolean).map((opt,j) => (
                <span key={i+"-"+j} style={{ padding:"6px 14px", borderRadius:10, border:"1.5px solid #BAE6FD", background:"#fff", fontSize:13 }}>{opt}</span>
              )))}
            </div>
          )}
        </div>
      );
    }
    case "divider":
      return c.style==="dots"?<div style={{ textAlign:"center", color:"#CBD5E1", fontSize:20, letterSpacing:8 }}>• • •</div>
        :c.style==="space"?<div style={{ height:32 }}/>
        :<hr style={{ border:"none", borderTop:"2px solid #E2E8F0", margin:0 }}/>;
    default: return null;
  }
}

// ── Per-field font control bar ──
function FC({ label, style={}, setStyle }) {
  const sz = style.fontSize||15;
  const al = style.align||"left";
  return (
    <div style={{ marginBottom:8 }}>
      {label && <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:0.5 }}>{label}</p>}
      <div style={{ display:"flex", gap:5, alignItems:"center", padding:"5px 8px", background:"#F8FAFC", borderRadius:8, border:"1px solid #E2E8F0", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:3 }}>
          <button onClick={() => setStyle({ ...style, fontSize:Math.max(10,sz-1) })} style={fcb()}>−</button>
          <span style={{ fontSize:12, fontWeight:700, color:"#374151", minWidth:24, textAlign:"center" }}>{sz}</span>
          <button onClick={() => setStyle({ ...style, fontSize:Math.min(72,sz+1) })} style={fcb()}>+</button>
        </div>
        <div style={{ width:1, height:16, background:"#E2E8F0" }}/>
        <button onClick={() => setStyle({ ...style, bold:!style.bold })} style={{ ...fcb(), fontWeight:900, background:style.bold?"#5B4EFF":"#fff", color:style.bold?"#fff":"#374151", border:`1.5px solid ${style.bold?"#5B4EFF":"#E2E8F0"}` }}>B</button>
        <button onClick={() => setStyle({ ...style, italic:!style.italic })} style={{ ...fcb(), fontStyle:"italic", background:style.italic?"#5B4EFF":"#fff", color:style.italic?"#fff":"#374151", border:`1.5px solid ${style.italic?"#5B4EFF":"#E2E8F0"}` }}>I</button>
        <div style={{ width:1, height:16, background:"#E2E8F0" }}/>
        {[["left","←"],["center","↔"],["right","→"]].map(([a,ic]) => (
          <button key={a} onClick={() => setStyle({ ...style, align:a })} style={{ ...fcb(), background:al===a?"#5B4EFF":"#fff", color:al===a?"#fff":"#374151", border:`1.5px solid ${al===a?"#5B4EFF":"#E2E8F0"}` }}>{ic}</button>
        ))}
      </div>
    </div>
  );
}

const styled = (s={}) => ({ fontSize:s.fontSize||15, fontWeight:s.bold?"700":"400", fontStyle:s.italic?"italic":"normal", textAlign:s.align||"left" });

// ── EDITORS ──
function HeadingE({ content, onChange }) {
  const ts = content.textStyle||{};
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <div>
        <p style={lbl()}>Level</p>
        <div style={{ display:"flex", gap:6 }}>
          {["h1","h2","h3"].map(l => <button key={l} onClick={() => onChange({ ...content, level:l })} style={pill(content.level===l,"#7c3aed")}>{l.toUpperCase()}</button>)}
        </div>
      </div>
      <FC label="Heading Text Style" style={ts} setStyle={v => onChange({ ...content, textStyle:v })}/>
      <input value={content.text||""} onChange={e => onChange({ ...content, text:e.target.value })} placeholder="Heading text..." style={{ ...inp(), ...styled(ts), fontWeight:ts.bold?"900":"800" }}/>
    </div>
  );
}

function TextE({ content, onChange }) {
  const ts = content.textStyle||{fontSize:15};
  const editorRef = useRef(null);

  const execCmd = (cmd, value=null) => {
    editorRef.current?.focus();
    try {
      const success = document.execCommand(cmd, false, value);
      console.log("execCmd", cmd, value, "success:", success);
    } catch(e) {
      console.error("execCmd error:", e);
    }
    setTimeout(() => {
      if (editorRef.current) {
        onChange({ ...content, html: editorRef.current.innerHTML, text: editorRef.current.innerText });
      }
      updateActiveFormats();
    }, 50);
  };

  // Sync content into editor on mount only
  useEffect(() => {
    if (editorRef.current && content.html !== undefined) {
      if (editorRef.current.innerHTML !== content.html) {
        editorRef.current.innerHTML = content.html || content.text || "";
      }
    } else if (editorRef.current && content.text) {
      editorRef.current.innerHTML = content.text || "";
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange({ ...content, html: editorRef.current.innerHTML, text: editorRef.current.innerText });
    }
  };

  const [activeFormats, setActiveFormats] = useState({});
  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
    });
  };
  const toolBtn = (activeKey, cmd, label, extraStyle, customAction) => (
    <button onMouseDown={e => {
      e.preventDefault();
      if (customAction) customAction();
      else execCmd(cmd);
      setTimeout(updateActiveFormats, 10);
    }}
      style={{ padding:"4px 10px", borderRadius:6, border:"1.5px solid #E2E8F0", background:activeFormats[activeKey]?"#5B4EFF":"#fff", color:activeFormats[activeKey]?"#fff":"#374151", cursor:"pointer", fontSize:13, fontWeight:700, ...extraStyle }}>
      {label}
    </button>
  );

  return (
    <div style={{ paddingTop:12 }}>
      <style>{`
        .rich-editor ul { list-style-type: disc !important; padding-left: 24px !important; margin: 8px 0 !important; }
        .rich-editor ol { list-style-type: decimal !important; padding-left: 24px !important; margin: 8px 0 !important; }
        .rich-editor li { display: list-item !important; margin: 4px 0 !important; }
        .rich-editor h2 { font-size: 22px !important; font-weight: 800 !important; margin: 8px 0 !important; }
        .rich-editor h3 { font-size: 18px !important; font-weight: 700 !important; margin: 6px 0 !important; }
      `}</style>
      <FC label="Text Style" style={ts} setStyle={v => onChange({ ...content, textStyle:v })} showBold={false} showItalic={false}/>
      {/* Toolbar */}
      <div style={{ display:"flex", gap:6, alignItems:"center", padding:"6px 10px", background:"#F8FAFC", borderRadius:"8px 8px 0 0", border:"1.5px solid #E2E8F0", borderBottom:"none", flexWrap:"wrap" }}>
        {toolBtn("bold", "bold", "B", { fontWeight:900 })}
        {toolBtn("italic", "italic", "I", { fontStyle:"italic" })}
        {toolBtn("underline", "underline", "U", { textDecoration:"underline" })}
        {toolBtn(false, "strikeThrough", "S", { textDecoration:"line-through" })}
        <div style={{ width:1, height:18, background:"#E2E8F0" }}/>
        {toolBtn(false, "justifyLeft", "⬅", {})}
        {toolBtn(false, "justifyCenter", "↔", {})}
        {toolBtn(false, "justifyRight", "➡", {})}
        <div style={{ width:1, height:18, background:"#E2E8F0" }}/>
        <button onMouseDown={e => { e.preventDefault(); execCmd("insertUnorderedList"); }}
          style={{ padding:"4px 10px", borderRadius:6, border:"1.5px solid #E2E8F0", background:activeFormats.ul?"#5B4EFF":"#fff", color:activeFormats.ul?"#fff":"#374151", cursor:"pointer", fontSize:13, fontWeight:700 }}>• List</button>
        <button onMouseDown={e => { e.preventDefault(); execCmd("insertOrderedList"); }}
          style={{ padding:"4px 10px", borderRadius:6, border:"1.5px solid #E2E8F0", background:activeFormats.ol?"#5B4EFF":"#fff", color:activeFormats.ol?"#fff":"#374151", cursor:"pointer", fontSize:13, fontWeight:700 }}>1. List</button>
        <div style={{ width:1, height:18, background:"#E2E8F0" }}/>
        <button onMouseDown={e => { e.preventDefault(); execCmd("formatBlock", "h2"); }}
          style={{ padding:"4px 10px", borderRadius:6, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", cursor:"pointer", fontSize:13, fontWeight:800 }}>H2</button>
        <button onMouseDown={e => { e.preventDefault(); execCmd("formatBlock", "h3"); }}
          style={{ padding:"4px 10px", borderRadius:6, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", cursor:"pointer", fontSize:13, fontWeight:800 }}>H3</button>
        <button onMouseDown={e => { e.preventDefault(); execCmd("formatBlock", "p"); }}
          style={{ padding:"4px 10px", borderRadius:6, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", cursor:"pointer", fontSize:11 }}>¶ Normal</button>
        <div style={{ width:1, height:18, background:"#E2E8F0" }}/>
        <select
          onMouseDown={() => {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              editorRef._savedRange = sel.getRangeAt(0).cloneRange();
            }
          }}
          onChange={e => {
            const size = e.target.value;
            if (!size) return;
            if (editorRef._savedRange) {
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(editorRef._savedRange);
            }
            editorRef.current?.focus();
            document.execCommand("fontSize", false, "7");
            const fontEls = editorRef.current.querySelectorAll("font[size=\'7\']");
            fontEls.forEach(el => { el.removeAttribute("size"); el.style.fontSize = size + "px"; });
            setTimeout(() => { onChange({ ...content, html: editorRef.current.innerHTML, text: editorRef.current.innerText }); }, 10);
            e.target.value = "";
          }}
          defaultValue=""
          style={{ padding:"4px 6px", borderRadius:6, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", cursor:"pointer", fontSize:12 }}>
          <option value="" disabled>Size</option>
          {[11,12,13,14,15,16,18,20,22,24,28,32,36].map(s => <option key={s} value={s}>{s}px</option>)}
        </select>
        <span style={{ fontSize:10, color:"#94A3B8", marginLeft:"auto" }}>Select text to format</span>
      </div>
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onPaste={e => {
          e.preventDefault();
          // Paste as rich text if available, else plain
          const html = e.clipboardData.getData("text/html");
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertHTML", false, html || text);
        }}
        style={{ ...inp(), minHeight:150, lineHeight:1.7, borderRadius:"0 0 9px 9px", outline:"none", cursor:"text", overflowY:"auto", ...styled(ts) }} className="rich-editor"
      />
      <p style={{ fontSize:11, color:"#94A3B8", margin:"4px 0 0" }}>Tip: Select text → click B, I, U to format. Paste formatted text from Word/Google Docs works too.</p>
    </div>
  );
}

function ImageE({ content, onChange }) {
  const [lib, setLib] = useState(false);
  const cs = content.captionStyle||{fontSize:12};
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <button onClick={() => setLib(true)} style={mediaBtn("#059669")}><ImagePlus size={15}/> {content.src?"Change image":"Choose / upload image"}</button>
      {content.src && <div style={{ borderRadius:10, overflow:"hidden", border:"1.5px solid #E2E8F0" }}><img src={content.src} alt="" style={{ width:"100%", maxHeight:160, objectFit:"cover", display:"block" }} onError={e=>e.target.style.display="none"}/></div>}
      <div>
        <p style={lbl()}>Size</p>
        <div style={{ display:"flex", gap:6 }}>
          {[["small","50%"],["medium","75%"],["full","100%"]].map(([v,l]) => <button key={v} onClick={() => onChange({ ...content, size:v })} style={{ ...pill((content.size||"full")===v,"#059669"), flex:1 }}>{l}</button>)}
        </div>
      </div>
      <div>
        <p style={lbl()}>Align</p>
        <div style={{ display:"flex", gap:6 }}>
          {[["left","← Left"],["center","↔ Center"],["right","→ Right"]].map(([a,l]) => <button key={a} onClick={() => onChange({ ...content, align:a })} style={{ ...pill((content.align||"center")===a,"#059669"), flex:1, fontSize:11 }}>{l}</button>)}
        </div>
      </div>
      <input value={content.alt||""} onChange={e => onChange({ ...content, alt:e.target.value })} placeholder="Alt text" style={inp()}/>
      <FC label="Caption Style" style={cs} setStyle={v => onChange({ ...content, captionStyle:v })}/>
      <input value={content.caption||""} onChange={e => onChange({ ...content, caption:e.target.value })} placeholder="Caption (optional)" style={{ ...inp(), ...styled(cs) }}/>
      {lib && <MediaLibrary accept="image" onSelect={m => { onChange({ ...content, src:m.url, alt:content.alt||m.filename }); setLib(false); }} onClose={() => setLib(false)}/>}
    </div>
  );
}

function VideoE({ content, onChange }) {
  const [lib, setLib] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <div style={{ display:"flex", gap:6 }}>
        {[["youtube","YouTube"],["vimeo","Vimeo"],["file","Upload"]].map(([v,l]) => <button key={v} onClick={() => onChange({ ...content, kind:v })} style={{ ...pill(content.kind===v,"#dc2626"), flex:1 }}>{l}</button>)}
      </div>
      {content.kind==="file"?(<><button onClick={() => setLib(true)} style={mediaBtn("#dc2626")}><Film size={15}/> {content.src?"Change video":"Upload video"}</button>{content.src && <video src={content.src} controls style={{ width:"100%", borderRadius:10 }}/>}</>):(<input value={content.src||""} onChange={e => onChange({ ...content, src:e.target.value })} placeholder={content.kind==="vimeo"?"https://vimeo.com/...":"https://youtube.com/watch?v=..."} style={inp()}/>)}
      <input value={content.caption||""} onChange={e => onChange({ ...content, caption:e.target.value })} placeholder="Caption (optional)" style={inp()}/>
      {lib && <MediaLibrary accept="video" onSelect={m => { onChange({ ...content, src:m.url, kind:"file" }); setLib(false); }} onClose={() => setLib(false)}/>}
    </div>
  );
}

function AudioE({ content, onChange }) {
  const [lib, setLib] = useState(false);
  const tts = content.titleStyle||{fontSize:14};
  const cts = content.captionStyle||{fontSize:12};
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <button onClick={() => setLib(true)} style={mediaBtn("#0891b2")}><Music size={15}/> {content.src?"Change audio":"Upload audio"}</button>
      {content.src && <audio src={content.src} controls style={{ width:"100%" }}/>}
      <FC label="Title Style" style={tts} setStyle={v => onChange({ ...content, titleStyle:v })}/>
      <input value={content.title||""} onChange={e => onChange({ ...content, title:e.target.value })} placeholder="Audio title" style={{ ...inp(), ...styled(tts) }}/>
      <FC label="Caption Style" style={cts} setStyle={v => onChange({ ...content, captionStyle:v })}/>
      <input value={content.caption||""} onChange={e => onChange({ ...content, caption:e.target.value })} placeholder="Caption (optional)" style={{ ...inp(), ...styled(cts) }}/>
      {lib && <MediaLibrary accept="audio" onSelect={m => { onChange({ ...content, src:m.url, title:content.title||m.filename }); setLib(false); }} onClose={() => setLib(false)}/>}
    </div>
  );
}

function QuizE({ content, onChange }) {
  const opts = content.options||["","","",""];
  const setOpt = (i,v) => { const a=[...opts]; a[i]=v; onChange({ ...content, options:a }); };
  const qs = content.questionStyle||{fontSize:16};
  const os = content.optionStyle||{fontSize:14};
  const es = content.explanationStyle||{fontSize:13};
  const hs = content.headingStyle||{fontSize:20};
  const ss = content.subheadingStyle||{fontSize:14};
  const optImgs = content.optionImages||opts.map(()=>"");
  const setOptImg = (i,v) => { const a=[...optImgs]; a[i]=v; onChange({ ...content, optionImages:a }); };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:12 }}>
      <div>
        <FC label="Heading Style" style={hs} setStyle={v => onChange({ ...content, headingStyle:v })}/>
        <input value={content.heading||""} onChange={e => onChange({ ...content, heading:e.target.value })} placeholder="Section heading (optional)" style={{ ...inp(), ...styled(hs), fontWeight:hs.bold?"900":"800" }}/>
      </div>
      <div>
        <FC label="Subheading Style" style={ss} setStyle={v => onChange({ ...content, subheadingStyle:v })}/>
        <input value={content.subheading||""} onChange={e => onChange({ ...content, subheading:e.target.value })} placeholder="Subheading or context (optional)" style={{ ...inp(), ...styled(ss) }}/>
      </div>
      <div>
        <p style={lbl()}>Header Image <span style={{ color:"#94A3B8", fontWeight:400 }}>· shown between heading and question</span></p>
        <input value={content.headerImage||""} onChange={e => onChange({ ...content, headerImage:e.target.value })} placeholder="https://... image URL" style={inp()}/>
        {content.headerImage && <img src={content.headerImage} alt="" style={{ width:"100%", borderRadius:10, marginTop:6, maxHeight:120, objectFit:"cover" }}/>}
      </div>
      <div>
        <FC label="Question Style" style={qs} setStyle={v => onChange({ ...content, questionStyle:v })}/>
        <textarea value={content.question||""} onChange={e => onChange({ ...content, question:e.target.value })} placeholder="Your question..." style={{ ...inp(), minHeight:70, resize:"vertical", ...styled(qs) }}/>
      </div>
      <div>
        <FC label="Options Style" style={os} setStyle={v => onChange({ ...content, optionStyle:v })}/>
        <p style={{ fontSize:10, color:"#94A3B8", margin:"0 0 6px" }}>Click ✓ to mark correct</p>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {opts.map((o,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={() => onChange({ ...content, correct:i })} style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${content.correct===i?"#22c55e":"#E2E8F0"}`, background:content.correct===i?"#22c55e":"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{content.correct===i&&<Check size={13} color="#fff"/>}</button>
              <input value={o} onChange={e => setOpt(i,e.target.value)} placeholder={`Option ${i+1}`} style={{ ...inp(), flex:1, fontSize:os.fontSize||14, borderColor:content.correct===i?"#22c55e":"#E2E8F0" }}/>
              {opts.length>2 && <button onClick={() => onChange({ ...content, options:opts.filter((_,x)=>x!==i), correct:Math.min(content.correct,opts.length-2) })} style={ctrlX()}>✕</button>}
            </div>
          ))}
          {opts.length<6 && <button onClick={() => onChange({ ...content, options:[...opts,""] })} style={addX()}>+ Add option</button>}
        </div>
      </div>
      <div>
        <FC label="Explanation Style" style={es} setStyle={v => onChange({ ...content, explanationStyle:v })}/>
        <textarea value={content.explanation||""} onChange={e => onChange({ ...content, explanation:e.target.value })} placeholder="Why is this correct?" style={{ ...inp(), minHeight:60, resize:"vertical", ...styled(es) }}/>
      </div>
    </div>
  );
}

function FillE({ content, onChange }) {
  const ps = content.promptStyle||{fontSize:16};
  const hs = content.hintStyle||{fontSize:13};
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div>
        <FC label="Prompt Style" style={ps} setStyle={v => onChange({ ...content, promptStyle:v })}/>
        <input value={content.prompt||""} onChange={e => onChange({ ...content, prompt:e.target.value })} placeholder="The capital of France is ___" style={{ ...inp(), ...styled(ps) }}/>
        <p style={{ fontSize:10, color:"#94A3B8", margin:"4px 0 0" }}>Use ___ where the blank should appear</p>
      </div>
      <div>
        <FC label="Answer Style" style={content.answerStyle||{fontSize:15}} setStyle={v => onChange({ ...content, answerStyle:v })}/>
        <input value={content.answer||""} onChange={e => onChange({ ...content, answer:e.target.value })} placeholder="Correct answer" style={{ ...inp(), ...styled(content.answerStyle||{fontSize:15}) }}/>
      </div>
      <div>
        <FC label="Hint Style" style={hs} setStyle={v => onChange({ ...content, hintStyle:v })}/>
        <input value={content.hint||""} onChange={e => onChange({ ...content, hint:e.target.value })} placeholder="Hint (optional)" style={{ ...inp(), ...styled(hs) }}/>
      </div>
    </div>
  );
}

function KeyE({ content, onChange }) {
  const pts = content.points||["",""];
  const setPt = (i,v) => { const a=[...pts]; a[i]=v; onChange({ ...content, points:a }); };
  const ts = content.titleStyle||{fontSize:16};
  const ps = content.pointStyle||{fontSize:14};
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <FC label="Title Style" style={ts} setStyle={v => onChange({ ...content, titleStyle:v })}/>
      <input value={content.title||""} onChange={e => onChange({ ...content, title:e.target.value })} placeholder="Key Takeaways" style={{ ...inp(), ...styled(ts), fontWeight:ts.bold?"900":"800" }}/>
      <FC label="Points Style" style={ps} setStyle={v => onChange({ ...content, pointStyle:v })}/>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {pts.map((p,i) => (
          <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:"#6366f1", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, flexShrink:0 }}>{i+1}</div>
            <input value={p} onChange={e => setPt(i,e.target.value)} placeholder={`Point ${i+1}`} style={{ ...inp(), flex:1, ...styled(ps) }}/>
            {pts.length>1 && <button onClick={() => onChange({ ...content, points:pts.filter((_,x)=>x!==i) })} style={ctrlX()}>✕</button>}
          </div>
        ))}
        <button onClick={() => onChange({ ...content, points:[...pts,""] })} style={addX()}>+ Add point</button>
      </div>
    </div>
  );
}

function CalloutE({ content, onChange }) {
  const styles=[["info","💡 Info","#0891b2"],["warning","⚠️ Warning","#d97706"],["success","✅ Tip","#059669"],["error","❌ Note","#dc2626"]];
  const ts = content.textStyle||{fontSize:14};
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div>
        <p style={lbl()}>Style</p>
        <div style={{ display:"flex", gap:6 }}>
          {styles.map(([v,l,col]) => <button key={v} onClick={() => onChange({ ...content, style:v })} style={{ ...pill(content.style===v,col), flex:1, fontSize:11 }}>{l}</button>)}
        </div>
      </div>
      <div>
        <p style={lbl()}>Heading <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span></p>
        <input value={content.heading||""} onChange={e => onChange({ ...content, heading:e.target.value })} placeholder="Callout heading..." style={inp()}/>
      </div>
      <FC label="Text Style" style={ts} setStyle={v => onChange({ ...content, textStyle:v })}/>
      <textarea value={content.text||""} onChange={e => onChange({ ...content, text:e.target.value })} placeholder="Callout message..." style={{ ...inp(), minHeight:80, resize:"vertical", ...styled(ts) }}/>
    </div>
  );
}


function MatchingE({ content, onChange }) {
  const pairs = content.pairs || [{left:"",right:""},{left:"",right:""}];
  const updatePair = (i, side, val) => {
    const np = [...pairs];
    np[i] = { ...np[i], [side]: val };
    onChange({ ...content, pairs: np });
  };
  const addPair = () => onChange({ ...content, pairs: [...pairs, { left:"", right:"" }] });
  const removePair = (i) => onChange({ ...content, pairs: pairs.filter((_,j) => j !== i) });
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div>
        <p style={lbl()}>Heading <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span></p>
        <input value={content.heading||""} onChange={e => onChange({ ...content, heading:e.target.value })} placeholder="e.g. Match the AI tools to their descriptions" style={inp()}/>
      </div>
      <div>
        <p style={lbl()}>Subheading <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span></p>
        <input value={content.subheading||""} onChange={e => onChange({ ...content, subheading:e.target.value })} placeholder="e.g. Tap a left item then a right item to match" style={inp()}/>
      </div>
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <p style={lbl()}>Pairs</p>
          <button onClick={addPair} style={{ padding:"4px 12px", borderRadius:8, border:"none", background:"#5B4EFF", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Add Pair</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {pairs.map((pair, i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8, alignItems:"center" }}>
              <input value={pair.left||""} onChange={e => updatePair(i,"left",e.target.value)} placeholder={"Left item "+(i+1)} style={{ ...inp(), margin:0 }}/>
              <input value={pair.right||""} onChange={e => updatePair(i,"right",e.target.value)} placeholder={"Right match "+(i+1)} style={{ ...inp(), margin:0 }}/>
              <button onClick={() => removePair(i)} style={{ width:28, height:28, borderRadius:8, border:"none", background:"#FEF2F2", color:"#dc2626", fontSize:14, cursor:"pointer", fontWeight:700, flexShrink:0 }}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlankOptionsE({ content, onChange }) {
  const [lib, setLib] = useState(false);
  const successImages = content.successImages||[];
  const sentence = content.sentence||"";
  const blankMatches = (sentence.match(/\(([^)]+)\)/g)||[]).map(m => m.replace(/^\(|\)$/g,"").trim());
  const blankCount = blankMatches.length;

  useEffect(() => {
    const autoB = blankMatches.map(m => ({ correct: m }));
    onChange({ ...content, blanks: autoB, blankCount: blankMatches.length });
  }, [sentence]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:12 }}>
      <div>
        <p style={lbl()}>Task Title</p>
        <input value={content.taskTitle||""} onChange={e => onChange({ ...content, taskTitle:e.target.value })} placeholder="e.g. Generate Your First Image" style={inp()}/>
      </div>
      <div>
        <p style={lbl()}>Task Description <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span></p>
        <input value={content.taskDesc||""} onChange={e => onChange({ ...content, taskDesc:e.target.value })} placeholder="e.g. Ask Kling to generate an image of a horse." style={inp()}/>
      </div>
      <div style={{ background:"#EEF2FF", borderRadius:10, padding:"10px 14px" }}>
        <p style={{ fontSize:12, color:"#5B4EFF", fontWeight:700, margin:"0 0 4px" }}>💡 How to add blanks</p>
        <p style={{ fontSize:12, color:"#6366f1", margin:0 }}>Wrap answers in brackets: <strong>(answer)</strong> → auto becomes a blank</p>
        <p style={{ fontSize:11, color:"#94A3B8", margin:"4px 0 0" }}>Example: The sky is (blue) and the sun is (yellow)</p>
      </div>
      <div>
        <p style={lbl()}>Sentence <span style={{ color:"#94A3B8", fontWeight:400 }}>· wrap answers in ()</span></p>
        <textarea value={sentence} onChange={e => onChange({ ...content, sentence:e.target.value })}
          placeholder="e.g. The sky is (blue) and the sun is (yellow)"
          style={{ ...inp(), minHeight:70, resize:"vertical" }}/>
      </div>
      {blankMatches.length > 0 && (
        <div>
          <p style={lbl()}>Auto-detected blanks ({blankMatches.length})</p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {blankMatches.map((match, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"#F0FDF4", borderRadius:10, border:"1.5px solid #BBF7D0" }}>
                <span style={{ width:24, height:24, borderRadius:"50%", background:"#22c55e", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>{i+1}</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#166534" }}>{match}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <p style={lbl()}>Success Text <span style={{ color:"#94A3B8", fontWeight:400 }}>· shown after correct</span></p>
        <textarea value={content.successText||""} onChange={e => onChange({ ...content, successText:e.target.value })}
          placeholder="Great job! Here is what you created..." style={{ ...inp(), minHeight:60, resize:"vertical" }}/>
      </div>
      <div>
        <p style={lbl()}>Success Images</p>
        {successImages.map((url,i) => (
          <div key={i} style={{ display:"flex", gap:6, marginBottom:6, alignItems:"center" }}>
            <img src={url} alt="" style={{ width:40,height:40,borderRadius:6,objectFit:"cover" }}/>
            <input value={url} onChange={e => { const a=[...successImages]; a[i]=e.target.value; onChange({ ...content, successImages:a }); }} style={{ ...inp(), flex:1 }}/>
            <button onClick={() => onChange({ ...content, successImages:successImages.filter((_,x)=>x!==i) })} style={ctrlX()}>✕</button>
          </div>
        ))}
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={() => setLib(true)} style={mediaBtn("#059669")}><ImageIcon size={13}/> Upload</button>
          <button onClick={() => { const u=window.prompt("Image URL:"); if(u) onChange({ ...content, successImages:[...successImages,u] }); }} style={mediaBtn("#6366f1")}><Link2 size={13}/> URL</button>
        </div>
      </div>
      {lib && <MediaLibrary accept="image" onSelect={m => { onChange({ ...content, successImages:[...successImages,m.url] }); setLib(false); }} onClose={() => setLib(false)}/>}
    </div>
  );
}

function ImageUploadField({ value, onChange, placeholder }) {
  const [uploading, setUploading] = useState(false);
  const [showLib, setShowLib] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    const { supabase } = await import("@/lib/supabase");
    const path = `blocks/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("lesson-media").upload(path, file, { upsert:true });
    if (!error) {
      const { data } = supabase.storage.from("lesson-media").getPublicUrl(path);
      onChange(data.publicUrl);
    }
    setUploading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ display:"flex", gap:6 }}>
        <input value={value||""} onChange={e => onChange(e.target.value)} placeholder={placeholder||"https://..."} style={{ ...inp(), flex:1, fontSize:12 }}/>
        <label style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 10px", borderRadius:8, border:"1.5px dashed #C7D2FE", background:"#EEF2FF", color:"#5B4EFF", fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" }}>
          {uploading ? "⏳" : "⬆"}
          <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => upload(e.target.files[0])}/>
        </label>
        <button onClick={() => setShowLib(true)} style={{ padding:"6px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:700, color:"#374151", cursor:"pointer", flexShrink:0 }}>
          🗂 Library
        </button>
        {value && <button onClick={() => onChange("")} style={{ padding:"6px 8px", borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", color:"#ef4444", fontSize:12, cursor:"pointer", flexShrink:0 }}>✕</button>}
      </div>
      {value && <img src={value} alt="" style={{ width:"100%", borderRadius:8, maxHeight:100, objectFit:"cover" }}/>}
      {showLib && <MediaLibrary accept="image" onSelect={m => { onChange(m.url); setShowLib(false); }} onClose={() => setShowLib(false)}/>}
    </div>
  );
}

function MultipleChoiceE({ content, onChange }) {
  const opts = content.options||["","",""];
  const optImgs = content.optionImages||opts.map(()=>"");
  const setOpt = (i,v) => { const a=[...opts]; a[i]=v; onChange({ ...content, options:a }); };
  const setOptImg = (i,v) => { const a=[...(content.optionImages||opts.map(()=>""))]; a[i]=v; onChange({ ...content, optionImages:a }); };
  const qs = content.questionStyle||{fontSize:16};
  const os = content.optionStyle||{fontSize:14};
  const es = content.explanationStyle||{fontSize:13};
  const hs = content.headingStyle||{fontSize:20};
  const ss = content.subheadingStyle||{fontSize:14};
  const correct = Array.isArray(content.correct) ? content.correct : content.correct!==undefined ? [content.correct] : [];
  const toggleCorrect = (i) => {
    const nc = correct.includes(i) ? correct.filter(x=>x!==i) : [...correct,i];
    onChange({ ...content, correct:nc });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:12 }}>

      {/* Heading */}
      <div>
        <FC label="Heading Style" style={hs} setStyle={v => onChange({ ...content, headingStyle:v })}/>
        <input value={content.heading||""} onChange={e => onChange({ ...content, heading:e.target.value })} placeholder="Heading (optional)" style={{ ...inp(), ...styled(hs), fontWeight:"800" }}/>
      </div>

      {/* Subheading */}
      <div>
        <FC label="Subheading Style" style={ss} setStyle={v => onChange({ ...content, subheadingStyle:v })}/>
        <input value={content.subheading||""} onChange={e => onChange({ ...content, subheading:e.target.value })} placeholder="Subheading (optional)" style={{ ...inp(), ...styled(ss) }}/>
      </div>

      {/* Header image */}
      <div>
        <p style={lbl()}>Header Image <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span></p>
        <ImageUploadField value={content.headerImage||""} onChange={v => onChange({ ...content, headerImage:v })} placeholder="Header image URL"/>
      </div>

      {/* Question */}
      <div>
        <FC label="Question Style" style={qs} setStyle={v => onChange({ ...content, questionStyle:v })}/>
        <textarea value={content.question||""} onChange={e => onChange({ ...content, question:e.target.value })}
          placeholder="Your question..." style={{ ...inp(), minHeight:70, resize:"vertical", ...styled(qs) }}/>
      </div>

      {/* Options */}
      <div>
        <FC label="Options Style" style={os} setStyle={v => onChange({ ...content, optionStyle:v })}/>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <p style={{ fontSize:10, color:"#94A3B8", margin:0 }}>Click ✓ to mark correct — can select multiple</p>
          <span style={{ fontSize:10, fontWeight:700, color:"#22c55e", background:"#F0FDF4", padding:"2px 8px", borderRadius:999 }}>{correct.length} correct</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {opts.map((o,i) => (
            <div key={i} style={{ background:"#F8FAFC", borderRadius:10, padding:10, border:`1.5px solid ${correct.includes(i)?"#22c55e":"#E2E8F0"}` }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                <button onClick={() => toggleCorrect(i)}
                  style={{ width:28, height:28, borderRadius:6, border:`2px solid ${correct.includes(i)?"#22c55e":"#E2E8F0"}`, background:correct.includes(i)?"#22c55e":"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {correct.includes(i) && <Check size={13} color="#fff"/>}
                </button>
                <input value={o} onChange={e => setOpt(i,e.target.value)} placeholder={`Option ${i+1}`}
                  style={{ ...inp(), flex:1, fontSize:os.fontSize||14 }}/>
                {opts.length>2 && <button onClick={() => onChange({ ...content, options:opts.filter((_,x)=>x!==i), optionImages:optImgs.filter((_,x)=>x!==i), correct:correct.filter(x=>x!==i).map(x=>x>i?x-1:x) })} style={ctrlX()}>✕</button>}
              </div>
              {/* Option image */}
              <ImageUploadField value={optImgs[i]||""} onChange={v => setOptImg(i,v)} placeholder="Image for this option (optional)"/>
            </div>
          ))}
          {opts.length<6 && <button onClick={() => onChange({ ...content, options:[...opts,""], optionImages:[...optImgs,""] })} style={addX()}>+ Add option</button>}
        </div>
      </div>

      {/* Explanation */}
      <div>
        <FC label="Explanation Style" style={es} setStyle={v => onChange({ ...content, explanationStyle:v })}/>
        <textarea value={content.explanation||""} onChange={e => onChange({ ...content, explanation:e.target.value })}
          placeholder="Explain why this is correct..." style={{ ...inp(), minHeight:60, resize:"vertical", ...styled(es) }}/>
      </div>

      {/* Success image */}
      <div>
        <p style={lbl()}>Success Image <span style={{ color:"#94A3B8", fontWeight:400 }}>· shown after correct answer</span></p>
        <ImageUploadField value={content.successImage||""} onChange={v => onChange({ ...content, successImage:v })} placeholder="Success image URL"/>
      </div>

      {/* Success text */}
      <div>
        <p style={lbl()}>Success Text <span style={{ color:"#94A3B8", fontWeight:400 }}>· shown after correct answer</span></p>
        <textarea value={content.successText||""} onChange={e => onChange({ ...content, successText:e.target.value })}
          placeholder="Well done! Here is why..." style={{ ...inp(), minHeight:50, resize:"vertical" }}/>
      </div>
    </div>
  );
}




function ReorderE({ content, onChange }) {
  const items = content.items||["","","",""];
  const qs = content.questionStyle||{fontSize:15};
  const is = content.itemStyle||{fontSize:15};
  const setItem = (i,v) => { const a=[...items]; a[i]=v; onChange({ ...content, items:a }); };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div>
        <p style={lbl()}>Heading <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span></p>
        <input value={content.heading||""} onChange={e => onChange({ ...content, heading:e.target.value })} placeholder="e.g. Put these steps in order" style={inp()}/>
      </div>
      <div>
        <FC label="Question Style" style={qs} setStyle={v => onChange({ ...content, questionStyle:v })}/>
        <textarea value={content.question||""} onChange={e => onChange({ ...content, question:e.target.value })}
          placeholder="Put these steps in the correct order..." style={{ ...inp(), minHeight:70, resize:"vertical", ...styled(qs) }}/>
      </div>
      <div>
        <p style={lbl()}>Items — add in CORRECT order</p>
        <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 8px" }}>User will see these shuffled and must drag to match this order</p>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {items.map((item,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ width:24, height:24, borderRadius:"50%", background:"#0d9488", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>{i+1}</span>
              <input value={item} onChange={e => setItem(i,e.target.value)} placeholder={`Item ${i+1}`} style={{ ...inp(), flex:1 }}/>
              {items.length>2 && <button onClick={() => onChange({ ...content, items:items.filter((_,x)=>x!==i) })} style={ctrlX()}>✕</button>}
            </div>
          ))}
          {items.length<6 && <button onClick={() => onChange({ ...content, items:[...items,""] })} style={addX()}>+ Add item</button>}
        </div>
      </div>
    </div>
  );
}

function ContinueE({ content, onChange }) {
  return (
    <div style={{ paddingTop:12 }}>
      <style>{`
        .rich-editor ul { list-style-type: disc !important; padding-left: 24px !important; margin: 8px 0 !important; }
        .rich-editor ol { list-style-type: decimal !important; padding-left: 24px !important; margin: 8px 0 !important; }
        .rich-editor li { display: list-item !important; margin: 4px 0 !important; }
        .rich-editor h2 { font-size: 22px !important; font-weight: 800 !important; margin: 8px 0 !important; }
        .rich-editor h3 { font-size: 18px !important; font-weight: 700 !important; margin: 6px 0 !important; }
      `}</style>
      <p style={lbl()}>Button Label</p>
      <input value={content.label||"Continue"} onChange={e => onChange({ ...content, label:e.target.value })} placeholder="Continue" style={inp()}/>
      <div style={{ marginTop:12, width:"100%", padding:"14px", borderRadius:14, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:15, fontWeight:700, textAlign:"center" }}>
        {content.label||"Continue"} →
      </div>
    </div>
  );
}

function DividerE({ content, onChange }) {
  return <div style={{ display:"flex", gap:6, paddingTop:12 }}>{[["line","Line"],["dots","Dots"],["space","Space"]].map(([v,l]) => <button key={v} onClick={() => onChange({ ...content, style:v })} style={{ ...pill(content.style===v,"#64748b"), flex:1 }}>{l}</button>)}</div>;
}

function Placeholder({ icon, text }) {
  return <div style={{ background:"#F8FAFC", borderRadius:14, padding:32, textAlign:"center", color:"#CBD5E1", border:"1.5px dashed #E2E8F0" }}><div style={{ fontSize:28, marginBottom:4 }}>{icon}</div><p style={{ fontSize:12, margin:0 }}>{text}</p></div>;
}

function ytId(url) { return url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1]||null; }

const fcb = () => ({ width:24, height:24, borderRadius:5, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", padding:0 });
const inp = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
const lbl = () => ({ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 });
const pill = (active,color) => ({ padding:"7px 12px", borderRadius:8, border:`1.5px solid ${active?color:"#E2E8F0"}`, background:active?color+"18":"#fff", color:active?color:"#64748B", fontSize:12, fontWeight:700, cursor:"pointer" });
const mediaBtn = (color) => ({ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:10, border:`1.5px dashed ${color}50`, background:color+"08", color, fontSize:13, fontWeight:700, cursor:"pointer", flex:1 });
const ctrlX = () => ({ width:28, height:28, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", color:"#EF4444", cursor:"pointer", flexShrink:0, fontSize:12 });
const addX = () => ({ padding:"8px", borderRadius:9, border:"1.5px dashed #E2E8F0", background:"#F8FAFC", color:"#94A3B8", fontSize:12, fontWeight:600, cursor:"pointer", width:"100%" });
