
"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Check, Loader, Send, ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const TRIGGER_TYPES = [
  { value:"after_payment",     label:"After Payment",          icon:"💳" },
  { value:"expiry_warning_3",  label:"3 Days Before Expiry",   icon:"⚠️" },
  { value:"expiry_warning_1",  label:"1 Day Before Expiry",    icon:"🚨" },
  { value:"after_expiry",      label:"After Expiry",           icon:"🔒" },
  { value:"auto_renewal",      label:"Auto-Renewal Success",   icon:"🔄" },
  { value:"cancellation",      label:"On Cancellation",        icon:"❌" },
  { value:"welcome_reminder",  label:"3 Day Welcome Reminder", icon:"👋" },
  { value:"manual",            label:"Manual / One-time",      icon:"✉️" },
];

const BLOCK_TYPES = [
  { type:"header",      label:"Header",       icon:"🎨" },
  { type:"logo",        label:"Logo",         icon:"🖼️" },
  { type:"text",        label:"Text",         icon:"📝" },
  { type:"heading",     label:"Heading",      icon:"📌" },
  { type:"button",      label:"Button",       icon:"🔘" },
  { type:"image",       label:"Image",        icon:"🖼️" },
  { type:"divider",     label:"Divider",      icon:"➖" },
  { type:"spacer",      label:"Spacer",       icon:"⬜" },
  { type:"credentials", label:"Credentials",  icon:"🔐" },
  { type:"footer",      label:"Footer",       icon:"📄" },
];

const DEFAULT_BLOCKS = [
  { id:"b1", type:"header",      bg1:"#5B4EFF", bg2:"#8B5CF6", padding:40 },
  { id:"b2", type:"logo",        logoUrl:"", logoHeight:40, align:"center" },
  { id:"b3", type:"heading",     text:"Welcome, {name}! 🎉", color:"#5B4EFF", size:22, align:"left", bold:true },
  { id:"b4", type:"text",        text:"You have successfully joined 1Course. Start your AI learning journey today!", color:"rgba(255,255,255,0.7)", size:15, align:"left", lineHeight:1.7 },
  { id:"b5", type:"credentials", labelColor:"rgba(255,255,255,0.5)", emailColor:"#a78bfa", pwBg:"rgba(91,78,255,0.2)", pwColor:"#fff", cardBg:"#1a1830", cardBorder:"rgba(255,255,255,0.1)" },
  { id:"b6", type:"button",      text:"Start Learning →", url:"https://1course.io", bgFrom:"#5B4EFF", bgTo:"#8B5CF6", color:"#fff", size:16, radius:12, paddingV:16, paddingH:28, align:"center" },
  { id:"b7", type:"divider",     color:"rgba(255,255,255,0.08)", margin:20 },
  { id:"b8", type:"footer",      text:"© 2026 1Course. All rights reserved.", color:"rgba(255,255,255,0.3)", size:12, align:"center" },
];

export default function EmailTemplateEditor({ templateId }) {
  const router = useRouter();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, [templateId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("*").eq("key","email_templates").single();
    if (data?.value) {
      const t = data.value.find(t => t.id === templateId);
      if (t) {
        if (!t.blocks) t.blocks = DEFAULT_BLOCKS;
        setTemplate(t);
      }
    }
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    const { data } = await supabase.from("settings").select("*").eq("key","email_templates").single();
    const templates = data?.value || [];
    const updated = templates.map(t => t.id === templateId ? template : t);
    if (!updated.find(t => t.id === templateId)) updated.push(template);
    await supabase.from("settings").upsert({ key:"email_templates", value:updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const u = (key, val) => setTemplate(prev => ({ ...prev, [key]: val }));

  const updateBlock = (id, key, val) => {
    setTemplate(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? { ...b, [key]: val } : b)
    }));
  };

  const addBlock = (type) => {
    const newBlock = { id:"b"+Date.now(), type, ...getBlockDefaults(type) };
    setTemplate(prev => ({ ...prev, blocks: [...(prev.blocks||[]), newBlock] }));
    setSelectedBlock(newBlock.id);
    setShowAddBlock(false);
  };

  const removeBlock = (id) => {
    setTemplate(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
    setSelectedBlock(null);
  };

  const moveBlock = (id, dir) => {
    const blocks = [...(template.blocks||[])];
    const idx = blocks.findIndex(b => b.id === id);
    if (dir === "up" && idx > 0) [blocks[idx-1], blocks[idx]] = [blocks[idx], blocks[idx-1]];
    if (dir === "down" && idx < blocks.length-1) [blocks[idx+1], blocks[idx]] = [blocks[idx], blocks[idx+1]];
    setTemplate(prev => ({ ...prev, blocks }));
  };

  const sendTest = async () => {
    if (!testEmail) return;
    setSending(true);
    const html = generateHtml(template?.blocks||[], "John Smith", testEmail, "testPass123!");
    await fetch("/api/send-email", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ to:testEmail, subject:template.subject, html }),
    });
    setSentOk(true);
    setTimeout(() => setSentOk(false), 3000);
    setSending(false);
  };

  const uploadLogo = async (file, blockId) => {
    if (!file) return;
    setUploading(true);
    const path = `email-logos/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("lesson-media").upload(path, file, { upsert:true });
    if (!error) {
      const { data } = supabase.storage.from("lesson-media").getPublicUrl(path);
      updateBlock(blockId, "logoUrl", data.publicUrl);
    }
    setUploading(false);
  };

  if (loading) return <AdminLayout><div style={{ padding:60, textAlign:"center" }}><Loader size={28} color="#94A3B8"/></div></AdminLayout>;
  if (!template) return <AdminLayout><div style={{ padding:60, textAlign:"center", color:"#94A3B8" }}>Template not found</div></AdminLayout>;

  const blocks = template.blocks || DEFAULT_BLOCKS;
  const selBlock = blocks.find(b => b.id === selectedBlock);

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 64px)" }}>
        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderBottom:"1px solid #E2E8F0", background:"#fff", flexShrink:0, gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => router.push("/admin/emails")} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              <ArrowLeft size={13}/> Back
            </button>
            <div>
              <input value={template.name||""} onChange={e=>u("name",e.target.value)} style={{ fontSize:16, fontWeight:800, color:"#0f172a", border:"none", outline:"none", background:"transparent" }}/>
              <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{TRIGGER_TYPES.find(t=>t.value===template.trigger)?.icon} {TRIGGER_TYPES.find(t=>t.value===template.trigger)?.label}</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input value={template.subject||""} onChange={e=>u("subject",e.target.value)} placeholder="Email subject..." style={{ padding:"7px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:12, width:220, outline:"none" }}/>
            <input value={testEmail} onChange={e=>setTestEmail(e.target.value)} placeholder="test@email.com" style={{ padding:"7px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:12, width:160, outline:"none" }}/>
            <button onClick={sendTest} disabled={sending||!testEmail} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              {sending?<Loader size={13}/>:sentOk?<Check size={13} color="#22c55e"/>:<Send size={13}/>}
              {sentOk?"Sent!":"Test"}
            </button>
            <button onClick={save} disabled={saving} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 16px", borderRadius:9, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              {saving?<><Loader size={13}/> Saving...</>:saved?<><Check size={13}/> Saved!</>:<><Save size={13}/> Save</>}
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"300px 1fr", overflow:"hidden" }}>
          {/* Left panel */}
          <div style={{ overflow:"auto", borderRight:"1px solid #E2E8F0", background:"#FAFBFC", display:"flex", flexDirection:"column" }}>
            {/* Block list */}
            <div style={{ padding:12, borderBottom:"1px solid #E2E8F0" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#374151", margin:0, textTransform:"uppercase" }}>Blocks</p>
                <button onClick={() => setShowAddBlock(!showAddBlock)} style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:7, border:"none", background:"#5B4EFF", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                  <Plus size={11}/> Add
                </button>
              </div>
              {showAddBlock && (
                <div style={{ background:"#fff", borderRadius:10, border:"1.5px solid #E2E8F0", padding:8, marginBottom:8 }}>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {BLOCK_TYPES.map(bt => (
                      <button key={bt.type} onClick={() => addBlock(bt.type)}
                        style={{ padding:"5px 10px", borderRadius:7, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                        {bt.icon} {bt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {blocks.map((b, i) => (
                  <div key={b.id} onClick={() => setSelectedBlock(selectedBlock===b.id?null:b.id)}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:9, border:`1.5px solid ${selectedBlock===b.id?"#5B4EFF":"#E2E8F0"}`, background:selectedBlock===b.id?"#EEF2FF":"#fff", cursor:"pointer" }}>
                    <span style={{ fontSize:14 }}>{BLOCK_TYPES.find(bt=>bt.type===b.type)?.icon}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:"#374151", flex:1, textTransform:"capitalize" }}>{b.type}</span>
                    <div style={{ display:"flex", gap:2 }}>
                      <button onClick={e=>{e.stopPropagation();moveBlock(b.id,"up");}} style={iconBtn()}><ChevronUp size={11}/></button>
                      <button onClick={e=>{e.stopPropagation();moveBlock(b.id,"down");}} style={iconBtn()}><ChevronDown size={11}/></button>
                      <button onClick={e=>{e.stopPropagation();removeBlock(b.id);}} style={{ ...iconBtn(), color:"#ef4444" }}><Trash2 size={11}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Block controls */}
            {selBlock && (
              <div style={{ padding:12, overflow:"auto", flex:1 }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#374151", margin:"0 0 10px", textTransform:"uppercase" }}>
                  {BLOCK_TYPES.find(bt=>bt.type===selBlock.type)?.icon} {selBlock.type} Settings
                </p>
                <BlockControls block={selBlock} onChange={(k,v) => updateBlock(selBlock.id, k, v)} uploadLogo={uploadLogo} uploading={uploading}/>
              </div>
            )}

            {/* Email settings */}
            <div style={{ padding:12, borderTop:"1px solid #E2E8F0" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#374151", margin:"0 0 8px", textTransform:"uppercase" }}>Email Settings</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <div>
                  <p style={lbl()}>Email Background</p>
                  <div style={{ display:"flex", gap:6 }}>
                    <input type="color" value={template.emailBg||"#050411"} onChange={e=>u("emailBg",e.target.value)} style={{ width:32, height:32, borderRadius:6, border:"1.5px solid #E2E8F0", cursor:"pointer" }}/>
                    <input value={template.emailBg||"#050411"} onChange={e=>u("emailBg",e.target.value)} style={inp()}/>
                  </div>
                </div>
                <div>
                  <p style={lbl()}>Card Background</p>
                  <div style={{ display:"flex", gap:6 }}>
                    <input type="color" value={template.cardBg||"#0a081e"} onChange={e=>u("cardBg",e.target.value)} style={{ width:32, height:32, borderRadius:6, border:"1.5px solid #E2E8F0", cursor:"pointer" }}/>
                    <input value={template.cardBg||"#0a081e"} onChange={e=>u("cardBg",e.target.value)} style={inp()}/>
                  </div>
                </div>
                <div>
                  <p style={lbl()}>Trigger</p>
                  <select value={template.trigger||"manual"} onChange={e=>u("trigger",e.target.value)} style={inp()}>
                    {TRIGGER_TYPES.map(t=><option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                  </select>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <button onClick={() => u("active", !template.active)}
                    style={{ width:36, height:20, borderRadius:999, border:"none", background:template.active?"#22c55e":"#E2E8F0", cursor:"pointer", position:"relative" }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:template.active?19:3, transition:"left 0.2s" }}/>
                  </button>
                  <span style={{ fontSize:12, color:template.active?"#22c55e":"#94A3B8", fontWeight:600 }}>{template.active?"Active":"Paused"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ overflow:"auto", background:"#E2E8F0", padding:24, display:"flex", justifyContent:"center" }}>
            <div style={{ width:"100%", maxWidth:600 }}>
              <p style={{ fontSize:11, color:"#64748B", textAlign:"center", marginBottom:10, fontWeight:600 }}>PREVIEW</p>
              <div style={{ background:"#fff", borderRadius:8, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.1)" }}>
                <div style={{ background:"#F8FAFC", padding:"10px 14px", borderBottom:"1px solid #E2E8F0" }}>
                  <p style={{ fontSize:11, color:"#64748B", margin:0 }}>Subject: <strong>{template.subject}</strong></p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: generateHtml(blocks, "John Smith", "john@example.com", "testPass123!", template) }}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function BlockControls({ block, onChange, uploadLogo, uploading }) {
  const b = block;
  switch (b.type) {
    case "header":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <ColorField label="Gradient Start" value={b.bg1||"#5B4EFF"} onChange={v=>onChange("bg1",v)}/>
          <ColorField label="Gradient End" value={b.bg2||"#8B5CF6"} onChange={v=>onChange("bg2",v)}/>
          <SizeField label="Padding (px)" value={b.padding||40} onChange={v=>onChange("padding",v)}/>
          <AlignField label="Align" value={b.align||"center"} onChange={v=>onChange("align",v)}/>
        </div>
      );
    case "logo":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div>
            <p style={lbl()}>Logo URL</p>
            <input value={b.logoUrl||""} onChange={e=>onChange("logoUrl",e.target.value)} placeholder="https://..." style={inp()}/>
          </div>
          <div>
            <p style={lbl()}>Upload Logo</p>
            <label style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px", borderRadius:8, border:"1.5px dashed #C7D2FE", background:"#EEF2FF", color:"#5B4EFF", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              {uploading?"⏳ Uploading...":"⬆ Upload Image"}
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>uploadLogo(e.target.files[0], b.id)}/>
            </label>
          </div>
          {b.logoUrl && <img src={b.logoUrl} alt="" style={{ maxHeight:48, objectFit:"contain", borderRadius:6 }}/>}
          <SizeField label="Height (px)" value={b.logoHeight||40} onChange={v=>onChange("logoHeight",v)}/>
          <AlignField label="Align" value={b.align||"center"} onChange={v=>onChange("align",v)}/>
        </div>
      );
    case "heading":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><p style={lbl()}>Text <span style={{ color:"#94A3B8", fontWeight:400 }}>· use {"{name}"}</span></p><textarea value={b.text||""} onChange={e=>onChange("text",e.target.value)} style={{ ...inp(), minHeight:60, resize:"vertical" }}/></div>
          <ColorField label="Color" value={b.color||"#5B4EFF"} onChange={v=>onChange("color",v)}/>
          <SizeField label="Font Size" value={b.size||22} onChange={v=>onChange("size",v)}/>
          <AlignField label="Align" value={b.align||"left"} onChange={v=>onChange("align",v)}/>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={() => onChange("bold", !b.bold)} style={{ padding:"5px 12px", borderRadius:7, border:`1.5px solid ${b.bold?"#5B4EFF":"#E2E8F0"}`, background:b.bold?"#EEF2FF":"#fff", fontWeight:900, fontSize:13, cursor:"pointer" }}>B</button>
            <button onClick={() => onChange("italic", !b.italic)} style={{ padding:"5px 12px", borderRadius:7, border:`1.5px solid ${b.italic?"#5B4EFF":"#E2E8F0"}`, background:b.italic?"#EEF2FF":"#fff", fontStyle:"italic", fontWeight:700, fontSize:13, cursor:"pointer" }}>I</button>
          </div>
        </div>
      );
    case "text":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><p style={lbl()}>Text <span style={{ color:"#94A3B8", fontWeight:400 }}>· use {"{name}"}</span></p><textarea value={b.text||""} onChange={e=>onChange("text",e.target.value)} rows={5} style={{ ...inp(), resize:"vertical" }}/></div>
          <ColorField label="Color" value={b.color||"rgba(255,255,255,0.7)"} onChange={v=>onChange("color",v)}/>
          <SizeField label="Font Size" value={b.size||15} onChange={v=>onChange("size",v)}/>
          <AlignField label="Align" value={b.align||"left"} onChange={v=>onChange("align",v)}/>
          <div>
            <p style={lbl()}>Line Height</p>
            <input type="range" min={1} max={2.5} step={0.1} value={b.lineHeight||1.7} onChange={e=>onChange("lineHeight",parseFloat(e.target.value))} style={{ width:"100%" }}/>
            <span style={{ fontSize:11, color:"#94A3B8" }}>{b.lineHeight||1.7}</span>
          </div>
        </div>
      );
    case "button":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><p style={lbl()}>Button Text</p><input value={b.text||""} onChange={e=>onChange("text",e.target.value)} style={inp()}/></div>
          <div><p style={lbl()}>URL</p><input value={b.url||""} onChange={e=>onChange("url",e.target.value)} style={inp()}/></div>
          <ColorField label="BG Gradient Start" value={b.bgFrom||"#5B4EFF"} onChange={v=>onChange("bgFrom",v)}/>
          <ColorField label="BG Gradient End" value={b.bgTo||"#8B5CF6"} onChange={v=>onChange("bgTo",v)}/>
          <ColorField label="Text Color" value={b.color||"#fff"} onChange={v=>onChange("color",v)}/>
          <SizeField label="Font Size" value={b.size||16} onChange={v=>onChange("size",v)}/>
          <SizeField label="Border Radius" value={b.radius||12} onChange={v=>onChange("radius",v)}/>
          <SizeField label="Padding V" value={b.paddingV||16} onChange={v=>onChange("paddingV",v)}/>
          <SizeField label="Padding H" value={b.paddingH||28} onChange={v=>onChange("paddingH",v)}/>
          <AlignField label="Align" value={b.align||"center"} onChange={v=>onChange("align",v)}/>
        </div>
      );
    case "image":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><p style={lbl()}>Image URL</p><input value={b.url||""} onChange={e=>onChange("url",e.target.value)} style={inp()}/></div>
          {b.url && <img src={b.url} alt="" style={{ width:"100%", borderRadius:6, maxHeight:80, objectFit:"cover" }}/>}
          <SizeField label="Border Radius" value={b.radius||12} onChange={v=>onChange("radius",v)}/>
          <AlignField label="Align" value={b.align||"center"} onChange={v=>onChange("align",v)}/>
        </div>
      );
    case "divider":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <ColorField label="Color" value={b.color||"rgba(255,255,255,0.08)"} onChange={v=>onChange("color",v)}/>
          <SizeField label="Margin (px)" value={b.margin||20} onChange={v=>onChange("margin",v)}/>
        </div>
      );
    case "spacer":
      return (
        <div><SizeField label="Height (px)" value={b.height||24} onChange={v=>onChange("height",v)}/></div>
      );
    case "credentials":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <ColorField label="Label Color" value={b.labelColor||"rgba(255,255,255,0.5)"} onChange={v=>onChange("labelColor",v)}/>
          <ColorField label="Email Color" value={b.emailColor||"#a78bfa"} onChange={v=>onChange("emailColor",v)}/>
          <ColorField label="Password BG" value={b.pwBg||"rgba(91,78,255,0.2)"} onChange={v=>onChange("pwBg",v)}/>
          <ColorField label="Password Text" value={b.pwColor||"#fff"} onChange={v=>onChange("pwColor",v)}/>
          <ColorField label="Card BG" value={b.cardBg||"#1a1830"} onChange={v=>onChange("cardBg",v)}/>
          <ColorField label="Card Border" value={b.cardBorder||"rgba(255,255,255,0.1)"} onChange={v=>onChange("cardBorder",v)}/>
        </div>
      );
    case "footer":
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><p style={lbl()}>Text</p><textarea value={b.text||""} onChange={e=>onChange("text",e.target.value)} style={{ ...inp(), minHeight:50, resize:"vertical" }}/></div>
          <ColorField label="Text Color" value={b.color||"rgba(255,255,255,0.3)"} onChange={v=>onChange("color",v)}/>
          <ColorField label="BG Color" value={b.bg||"transparent"} onChange={v=>onChange("bg",v)}/>
          <SizeField label="Font Size" value={b.size||12} onChange={v=>onChange("size",v)}/>
          <AlignField label="Align" value={b.align||"center"} onChange={v=>onChange("align",v)}/>
          <SizeField label="Padding (px)" value={b.padding||20} onChange={v=>onChange("padding",v)}/>
        </div>
      );
    default: return null;
  }
}

function getBlockDefaults(type) {
  switch(type) {
    case "header":      return { bg1:"#5B4EFF", bg2:"#8B5CF6", padding:40, align:"center" };
    case "logo":        return { logoUrl:"", logoHeight:40, align:"center" };
    case "heading":     return { text:"Your heading here", color:"#5B4EFF", size:22, align:"left", bold:true };
    case "text":        return { text:"Your text here...", color:"rgba(255,255,255,0.7)", size:15, align:"left", lineHeight:1.7 };
    case "button":      return { text:"Click here →", url:"https://1course.io", bgFrom:"#5B4EFF", bgTo:"#8B5CF6", color:"#fff", size:16, radius:12, paddingV:14, paddingH:28, align:"center" };
    case "image":       return { url:"", radius:12, align:"center" };
    case "divider":     return { color:"rgba(255,255,255,0.08)", margin:20 };
    case "spacer":      return { height:24 };
    case "credentials": return { labelColor:"rgba(255,255,255,0.5)", emailColor:"#a78bfa", pwBg:"rgba(91,78,255,0.2)", pwColor:"#fff", cardBg:"#1a1830", cardBorder:"rgba(255,255,255,0.1)" };
    case "footer":      return { text:"© 2026 1Course. All rights reserved.", color:"rgba(255,255,255,0.3)", bg:"transparent", size:12, align:"center", padding:20 };
    default: return {};
  }
}

function generateHtml(blocks, name, email, password, template) {
  const replace = (text) => (text||"").replace(/\{name\}/g, name).replace(/\{email\}/g, email);
  const cardBg = template?.cardBg || "#0a081e";
  const emailBg = template?.emailBg || "#050411";

  const blockHtml = blocks.map(b => {
    switch(b.type) {
      case "header":
        return `<div style="background:linear-gradient(135deg,${b.bg1||"#5B4EFF"},${b.bg2||"#8B5CF6"});padding:${b.padding||40}px 32px;text-align:${b.align||"center"}"></div>`;
      case "logo":
        if (!b.logoUrl) return "";
        return `<div style="text-align:${b.align||"center"};padding:16px 32px"><img src="${b.logoUrl}" alt="Logo" style="height:${b.logoHeight||40}px;object-fit:contain;display:inline-block"/></div>`;
      case "heading":
        return `<${b.size>=24?"h2":"h3"} style="font-size:${b.size||22}px;margin:0 0 12px;color:${b.color||"#5B4EFF"};text-align:${b.align||"left"};font-weight:${b.bold?"900":"700"};font-style:${b.italic?"italic":"normal"};padding:0 32px">${replace(b.text)}</${b.size>=24?"h2":"h3"}>`;
      case "text":
        return `<p style="color:${b.color||"rgba(255,255,255,0.7)"};font-size:${b.size||15}px;line-height:${b.lineHeight||1.7};text-align:${b.align||"left"};margin:0 0 16px;padding:0 32px">${replace(b.text)}</p>`;
      case "button":
        return `<div style="text-align:${b.align||"center"};padding:8px 32px 16px"><a href="${b.url||"#"}" style="display:inline-block;padding:${b.paddingV||16}px ${b.paddingH||28}px;background:linear-gradient(135deg,${b.bgFrom||"#5B4EFF"},${b.bgTo||"#8B5CF6"});color:${b.color||"#fff"};text-decoration:none;border-radius:${b.radius||12}px;font-weight:700;font-size:${b.size||16}px">${b.text||"Click here"}</a></div>`;
      case "image":
        if (!b.url) return "";
        return `<div style="padding:8px 32px;text-align:${b.align||"center"}"><img src="${b.url}" alt="" style="width:100%;border-radius:${b.radius||12}px;display:block"/></div>`;
      case "divider":
        return `<div style="margin:${b.margin||20}px 32px;border-top:1px solid ${b.color||"rgba(255,255,255,0.08)"}"></div>`;
      case "spacer":
        return `<div style="height:${b.height||24}px"></div>`;
      case "credentials":
        return `<div style="background:${b.cardBg||"#1a1830"};border-radius:12px;padding:24px;margin:0 32px 20px;border:1px solid ${b.cardBorder||"rgba(255,255,255,0.1)"}"><p style="margin:0 0 4px;color:${b.labelColor||"rgba(255,255,255,0.5)"};font-size:11px;text-transform:uppercase">Email</p><p style="margin:0 0 16px;font-weight:700;color:${b.emailColor||"#a78bfa"}">${email}</p><p style="margin:0 0 4px;color:${b.labelColor||"rgba(255,255,255,0.5)"};font-size:11px;text-transform:uppercase">Temporary Password</p><p style="margin:0;font-weight:900;font-size:20px;color:${b.pwColor||"#fff"};background:${b.pwBg||"rgba(91,78,255,0.2)"};padding:12px;border-radius:8px;text-align:center;font-family:monospace">${password}</p></div>`;
      case "footer":
        return `<div style="padding:${b.padding||20}px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:${b.align||"center"};background:${b.bg||"transparent"}"><p style="color:${b.color||"rgba(255,255,255,0.3)"};font-size:${b.size||12}px;margin:0">${replace(b.text)}</p></div>`;
      default: return "";
    }
  }).join("");

  return `<div style="font-family:sans-serif;background:${emailBg};padding:20px 0"><div style="max-width:600px;margin:0 auto;background:${cardBg};border-radius:16px;overflow:hidden">${blockHtml}</div></div>`;
}

// ── Helpers ──
function ColorField({ label, value, onChange }) {
  return (
    <div>
      <p style={lbl()}>{label}</p>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <input type="color" value={(value||"#000000").startsWith("#")?(value||"#000000"):"#000000"} onChange={e=>onChange(e.target.value)} style={{ width:32, height:32, borderRadius:6, border:"1.5px solid #E2E8F0", cursor:"pointer", padding:2, flexShrink:0 }}/>
        <input value={value||""} onChange={e=>onChange(e.target.value)} style={{ ...inp(), fontSize:11 }}/>
      </div>
    </div>
  );
}
function SizeField({ label, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ fontSize:12, color:"#374151" }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <button onClick={()=>onChange(Math.max(0,value-1))} style={iconBtn()}>−</button>
        <span style={{ fontSize:12, fontWeight:700, minWidth:28, textAlign:"center" }}>{value}</span>
        <button onClick={()=>onChange(value+1)} style={iconBtn()}>+</button>
      </div>
    </div>
  );
}
function AlignField({ label, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ fontSize:12, color:"#374151" }}>{label}</span>
      <div style={{ display:"flex", gap:3 }}>
        {[["left","←"],["center","↔"],["right","→"]].map(([a,ic]) => (
          <button key={a} onClick={()=>onChange(a)} style={{ width:26, height:26, borderRadius:6, border:`1.5px solid ${value===a?"#5B4EFF":"#E2E8F0"}`, background:value===a?"#EEF2FF":"#fff", cursor:"pointer", fontSize:12 }}>{ic}</button>
        ))}
      </div>
    </div>
  );
}
const lbl = () => ({ fontSize:10, fontWeight:700, color:"#374151", display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 });
const inp = () => ({ width:"100%", padding:"7px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:12, outline:"none", boxSizing:"border-box" });
const iconBtn = () => ({ width:24, height:24, borderRadius:6, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", padding:0 });
