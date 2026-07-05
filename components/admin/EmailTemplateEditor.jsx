"use client";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Check, Copy, Loader, Plus, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TRIGGER_TYPES = [
  { value: "after_payment", label: "After Payment", icon: "💳" },
  { value: "expiry_warning_3", label: "3 Days Before Expiry", icon: "⚠️" },
  { value: "expiry_warning_1", label: "1 Day Before Expiry", icon: "🚨" },
  { value: "after_expiry", label: "After Expiry", icon: "🔒" },
  { value: "auto_renewal", label: "Auto-Renewal", icon: "🔄" },
  { value: "cancellation", label: "On Cancellation", icon: "❌" },
  { value: "welcome_reminder", label: "Welcome Reminder", icon: "👋" },
  { value: "manual", label: "Manual", icon: "✉️" },
];

const BLOCK_TYPES = [
  { type: "header", label: "Header", icon: "🎨" },
  { type: "logo", label: "Logo", icon: "🖼" },
  { type: "heading", label: "Heading", icon: "H" },
  { type: "text", label: "Text", icon: "T" },
  { type: "button", label: "Button", icon: "◉" },
  { type: "image", label: "Image", icon: "📷" },
  { type: "divider", label: "Divider", icon: "—" },
  { type: "spacer", label: "Spacer", icon: "□" },
  { type: "credentials", label: "Credentials", icon: "🔐" },
  { type: "footer", label: "Footer", icon: "▤" },
];

const DEFAULT_BLOCKS = [
  { id: "b1", type: "header", bg1: "#5B4EFF", bg2: "#8B5CF6", padding: 48 },
  { id: "b2", type: "logo", logoUrl: "", logoHeight: 44, align: "center" },
  { id: "b3", type: "spacer", height: 12 },
  { id: "b4", type: "heading", text: "Welcome, {name}! 🎉", color: "#5B4EFF", size: 26, align: "left", bold: true },
  { id: "b5", type: "text", text: "You have successfully joined 1Course. Start your AI learning journey today!", color: "rgba(255,255,255,0.7)", size: 15, align: "left", lineHeight: 1.8 },
  { id: "b6", type: "credentials", labelColor: "rgba(255,255,255,0.5)", emailColor: "#a78bfa", pwBg: "rgba(91,78,255,0.2)", pwColor: "#fff", cardBg: "#1a1830", cardBorder: "rgba(255,255,255,0.1)" },
  { id: "b7", type: "spacer", height: 8 },
  { id: "b8", type: "button", text: "Start Learning →", url: "https://1course.io", bgFrom: "#5B4EFF", bgTo: "#8B5CF6", color: "#fff", size: 16, radius: 14, paddingV: 16, paddingH: 36, align: "center" },
  { id: "b9", type: "divider", color: "rgba(255,255,255,0.08)", margin: 24 },
  { id: "b10", type: "footer", text: "© 2026 1Course. All rights reserved.", color: "rgba(255,255,255,0.3)", bg: "transparent", size: 12, align: "center", padding: 24 },
];

function getBlockDefaults(type) {
  const map = {
    header: { bg1: "#5B4EFF", bg2: "#8B5CF6", padding: 48 },
    logo: { logoUrl: "", logoHeight: 44, align: "center" },
    heading: { text: "New Heading", color: "#ffffff", size: 22, align: "left", bold: true },
    text: { text: "Write your text here...", color: "rgba(255,255,255,0.7)", size: 15, align: "left", lineHeight: 1.8 },
    button: { text: "Click here →", url: "https://1course.io", bgFrom: "#5B4EFF", bgTo: "#8B5CF6", color: "#fff", size: 16, radius: 14, paddingV: 16, paddingH: 32, align: "center" },
    image: { url: "", radius: 12, align: "center" },
    divider: { color: "rgba(255,255,255,0.08)", margin: 24 },
    spacer: { height: 24 },
    credentials: { labelColor: "rgba(255,255,255,0.5)", emailColor: "#a78bfa", pwBg: "rgba(91,78,255,0.2)", pwColor: "#fff", cardBg: "#1a1830", cardBorder: "rgba(255,255,255,0.1)" },
    footer: { text: "© 2026 1Course. All rights reserved.", color: "rgba(255,255,255,0.3)", bg: "transparent", size: 12, align: "center", padding: 24 },
  };
  return map[type] || {};
}

function generateHtml(blocks, name, email, password, template) {
  const replace = (text) => (text || "").replace(/\{name\}/g, name).replace(/\{email\}/g, email);
  const cardBg = template?.cardBg || "#0a081e";
  const emailBg = template?.emailBg || "#050411";
  const blockHtml = (blocks || []).map((b) => {
    switch (b.type) {
      case "header": return `<div style="background:linear-gradient(135deg,${b.bg1||"#5B4EFF"},${b.bg2||"#8B5CF6"});padding:${b.padding||48}px 40px;text-align:center"></div>`;
      case "logo": if (!b.logoUrl) return `<div style="padding:20px 40px;text-align:${b.align||"center"}"><p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">[Logo placeholder]</p></div>`; return `<div style="padding:20px 40px;text-align:${b.align||"center"}"><img src="${b.logoUrl}" alt="Logo" style="height:${b.logoHeight||44}px;object-fit:contain;display:inline-block"/></div>`;
      case "heading": return `<div style="padding:4px 40px"><p style="font-size:${b.size||22}px;margin:0 0 8px;color:${b.color||"#fff"};text-align:${b.align||"left"};font-weight:${b.bold?"900":"700"};font-style:${b.italic?"italic":"normal"};line-height:1.3">${replace(b.text)}</p></div>`;
      case "text": return `<div style="padding:4px 40px"><div style="color:${b.color||"rgba(255,255,255,0.7)"};font-size:${b.size||15}px;line-height:${b.lineHeight||1.8};text-align:${b.align||"left"};margin:0 0 8px">${b.html ? replace(b.html) : (b.text||"").replace(/\n/g,"<br/>")}</div></div>`;
      case "button": return `<div style="padding:12px 40px;text-align:${b.align||"center"}"><a href="${b.url||"#"}" style="display:inline-block;padding:${b.paddingV||16}px ${b.paddingH||32}px;background:linear-gradient(135deg,${b.bgFrom||"#5B4EFF"},${b.bgTo||"#8B5CF6"});color:${b.color||"#fff"};text-decoration:none;border-radius:${b.radius||14}px;font-weight:700;font-size:${b.size||16}px">${b.text||"Click here"}</a></div>`;
      case "image": if (!b.url) return ""; return `<div style="padding:8px 40px;text-align:${b.align||"center"}"><img src="${b.url}" alt="" style="width:100%;border-radius:${b.radius||12}px;display:block"/></div>`;
      case "divider": return `<div style="margin:${b.margin||24}px 40px;border-top:1px solid ${b.color||"rgba(255,255,255,0.08)"}"></div>`;
      case "spacer": return `<div style="height:${b.height||24}px"></div>`;
      case "credentials": return `<div style="background:${b.cardBg||"#1a1830"};border-radius:14px;padding:24px 28px;margin:8px 40px 16px;border:1px solid ${b.cardBorder||"rgba(255,255,255,0.1)"}"><p style="margin:0 0 4px;color:${b.labelColor||"rgba(255,255,255,0.5)"};font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Email</p><p style="margin:0 0 20px;font-weight:700;color:${b.emailColor||"#a78bfa"};font-size:15px">${email}</p><p style="margin:0 0 4px;color:${b.labelColor||"rgba(255,255,255,0.5)"};font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Temporary Password</p><p style="margin:0;font-weight:900;font-size:22px;color:${b.pwColor||"#fff"};background:${b.pwBg||"rgba(91,78,255,0.2)"};padding:14px;border-radius:10px;text-align:center;font-family:monospace;letter-spacing:2px">${password}</p></div>`;
      case "footer": return `<div style="padding:${b.padding||24}px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:${b.align||"center"};background:${b.bg||"transparent"}"><p style="color:${b.color||"rgba(255,255,255,0.3)"};font-size:${b.size||12}px;margin:0;line-height:1.6">${replace(b.text)}</p></div>`;
      default: return "";
    }
  }).join("");
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:${emailBg};padding:32px 0"><div style="max-width:600px;margin:0 auto;background:${cardBg};border-radius:${template?.cardRadius||20}px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4);border:${template?.cardBorderWidth||0}px solid ${template?.cardBorder||"transparent"}">${blockHtml}</div></div>`;
}

export default function EmailTemplateEditor({ templateId }) {
  const router = useRouter();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [dragging, setDragging] = useState(null);

  useEffect(() => { load(); }, [templateId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("*").eq("key", "email_templates").single();
    if (data?.value) {
      const t = data.value.find((t) => t.id === templateId);
      if (t) { if (!t.blocks) t.blocks = DEFAULT_BLOCKS; setTemplate(t); }
    }
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    const { data } = await supabase.from("settings").select("*").eq("key", "email_templates").single();
    const templates = data?.value || [];
    const updated = templates.map((t) => (t.id === templateId ? template : t));
    if (!updated.find((t) => t.id === templateId)) updated.push(template);
    await supabase.from("settings").upsert({ key: "email_templates", value: updated });
    setSaved(true); setTimeout(() => setSaved(false), 2500); setSaving(false);
  };

  const u = (key, val) => setTemplate((prev) => ({ ...prev, [key]: val }));
  const blocks = template?.blocks || DEFAULT_BLOCKS;
  const updateBlock = (id, key, val) => setTemplate((prev) => ({ ...prev, blocks: prev.blocks.map((b) => (b.id === id ? { ...b, [key]: val } : b)) }));
  const addBlock = (type) => { const nb = { id: "b" + Date.now(), type, ...getBlockDefaults(type) }; setTemplate((prev) => ({ ...prev, blocks: [...(prev.blocks || []), nb] })); setSelectedId(nb.id); setShowAdd(false); };
  const removeBlock = (id) => { setTemplate((prev) => ({ ...prev, blocks: prev.blocks.filter((b) => b.id !== id) })); setSelectedId(null); };
  const duplicateBlock = (id) => { const b = blocks.find((b) => b.id === id); if (!b) return; const nb = { ...b, id: "b" + Date.now() }; const idx = blocks.findIndex((b) => b.id === id); const newBlocks = [...blocks]; newBlocks.splice(idx + 1, 0, nb); setTemplate((prev) => ({ ...prev, blocks: newBlocks })); };
  const moveBlock = (id, dir) => { const arr = [...blocks]; const idx = arr.findIndex((b) => b.id === id); if (dir === "up" && idx > 0) [arr[idx-1],arr[idx]]=[arr[idx],arr[idx-1]]; if (dir === "down" && idx < arr.length-1) [arr[idx+1],arr[idx]]=[arr[idx],arr[idx+1]]; setTemplate((prev) => ({ ...prev, blocks: arr })); };
  const sendTest = async () => { if (!testEmail) return; setSending(true); const html = generateHtml(blocks, "John Smith", testEmail, "testPass123!", template); await fetch("/api/send-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: testEmail, subject: template.subject || "Test Email", html }) }); setSentOk(true); setTimeout(() => setSentOk(false), 3000); setSending(false); };
  const uploadImg = async (file, blockId) => { if (!file) return; setUploading(true); const path = `email/${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("lesson-media").upload(path, file, { upsert: true }); if (!error) { const { data } = supabase.storage.from("lesson-media").getPublicUrl(path); updateBlock(blockId, "logoUrl", data.publicUrl); } setUploading(false); };

  if (loading) return <div style={{ padding: 80, textAlign: "center" }}><Loader size={32} color="#94A3B8" /></div>;
  if (!template) return <div style={{ padding: 80, textAlign: "center", color: "#94A3B8" }}>Template not found</div>;

  const selBlock = blocks.find((b) => b.id === selectedId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderBottom: "1px solid #E2E8F0", background: "#fff", flexShrink: 0 }}>
        <button onClick={() => router.push("/admin/emails")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={13} /> Back
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input value={template.name || ""} onChange={(e) => u("name", e.target.value)} style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", border: "none", outline: "none", background: "transparent", width: "100%" }} />
        </div>
        <input value={template.subject || ""} onChange={(e) => u("subject", e.target.value)} placeholder="Subject line..." style={{ padding: "7px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, width: 240, outline: "none", flexShrink: 0 }} />
        <select value={template.trigger || "manual"} onChange={(e) => u("trigger", e.target.value)} style={{ padding: "7px 10px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 12, outline: "none", flexShrink: 0 }}>
          {TRIGGER_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.icon} {t.label}</option>))}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="test@email.com" style={{ padding: "7px 10px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 12, width: 150, outline: "none" }} />
          <button onClick={sendTest} disabled={!testEmail || sending} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {sending ? <Loader size={12} /> : sentOk ? <Check size={12} color="#22c55e" /> : <Send size={12} />} {sentOk ? "Sent!" : "Test"}
          </button>
          <button onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 16px", borderRadius: 9, border: "none", background: saved ? "#22c55e" : "linear-gradient(135deg,#5B4EFF,#8B5CF6)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {saving ? <><Loader size={12} /> Saving...</> : saved ? <><Check size={12} /> Saved!</> : <><Save size={12} /> Save</>}
          </button>
        </div>
      </div>

      {/* 3-column body */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "260px 1fr 320px", overflow: "hidden" }}>
        {/* Left — block list */}
        <div style={{ overflow: "auto", borderRight: "1px solid #E2E8F0", background: "#F8FAFC", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 10px", borderBottom: "1px solid #E2E8F0" }}>
            <button onClick={() => setShowAdd(!showAdd)} style={{ width: "100%", padding: "8px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#5B4EFF,#8B5CF6)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Plus size={13} /> Add Block
            </button>
            {showAdd && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                {BLOCK_TYPES.map((bt) => (
                  <button key={bt.type} onClick={() => addBlock(bt.type)} style={{ padding: "7px 10px", borderRadius: 7, border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{bt.icon}</span> {bt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            {blocks.map((b) => {
              const bt = BLOCK_TYPES.find((x) => x.type === b.type);
              return (
                <div key={b.id} draggable
                  onDragStart={() => setDragging(b.id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(b.id); }}
                  onDrop={() => { if (!dragging || dragging === b.id) return; const arr = [...blocks]; const fi = arr.findIndex((x) => x.id === dragging); const ti = arr.findIndex((x) => x.id === b.id); const [item] = arr.splice(fi, 1); arr.splice(ti, 0, item); setTemplate((prev) => ({ ...prev, blocks: arr })); setDragging(null); setDragOver(null); }}
                  onDragEnd={() => { setDragging(null); setDragOver(null); }}
                  onClick={() => setSelectedId(selectedId === b.id ? null : b.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${selectedId === b.id ? "#5B4EFF" : dragOver === b.id ? "#C7D2FE" : "transparent"}`, background: selectedId === b.id ? "#EEF2FF" : dragOver === b.id ? "#F5F3FF" : "#fff", cursor: "pointer", transition: "all 0.1s" }}>
                  <span style={{ fontSize: 13, opacity: 0.5, cursor: "grab" }}>⠿</span>
                  <span style={{ fontSize: 13 }}>{bt?.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#374151", flex: 1, textTransform: "capitalize" }}>{b.type}</span>
                  <div style={{ display: "flex", gap: 1 }}>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(b.id, "up"); }} style={ib()}>↑</button>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(b.id, "down"); }} style={ib()}>↓</button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateBlock(b.id); }} style={ib()}><Copy size={9} /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeBlock(b.id); }} style={{ ...ib(), color: "#ef4444" }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Global settings */}
          <div style={{ padding: "12px 10px", borderTop: "1px solid #E2E8F0" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", margin: "0 0 8px", textTransform: "uppercase" }}>Global</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <CF label="Email BG" value={template.emailBg || "#050411"} onChange={(v) => u("emailBg", v)} />
              <CF label="Card BG" value={template.cardBg || "#0a081e"} onChange={(v) => u("cardBg", v)} />
              <CF label="Card Border Color" value={template.cardBorder || "transparent"} onChange={(v) => u("cardBorder", v)} />
              <SF label="Border Width" value={template.cardBorderWidth || 0} onChange={(v) => u("cardBorderWidth", v)} />
              <SF label="Border Radius" value={template.cardRadius || 20} onChange={(v) => u("cardRadius", v)} />
            </div>
          </div>
        </div>

        {/* Center — preview */}
        <div style={{ overflow: "auto", background: "#CBD5E1", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px", minHeight: 0 }}>
          <p style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>EMAIL PREVIEW</p>
          <div style={{ width: "100%", maxWidth: 640, background: "#fff", borderRadius: 12, overflow: "visible", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ background: "#F1F5F9", padding: "10px 16px", borderBottom: "1px solid #E2E8F0" }}>
              <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>To: <strong>john@example.com</strong> · Subject: <strong>{template.subject || "(no subject)"}</strong></p>
            </div>
            <div dangerouslySetInnerHTML={{ __html: generateHtml(blocks, "John Smith", "john@example.com", "testPass123!", template) }} />
          </div>
        </div>

        {/* Right — block controls */}
        <div style={{ overflow: "auto", borderLeft: "1px solid #E2E8F0", background: "#fff" }}>
          {selBlock ? (
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ fontSize: 18 }}>{BLOCK_TYPES.find((x) => x.type === selBlock.type)?.icon}</span>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0, textTransform: "capitalize" }}>{selBlock.type} Block</p>
              </div>
              <BlockControls block={selBlock} onChange={(k, v) => updateBlock(selBlock.id, k, v)} uploadImg={uploadImg} uploading={uploading} />
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>👈</p>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Select a block to edit it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BlockControls({ block: b, onChange, uploadImg, uploading }) {
  switch (b.type) {
    case "header": return (<div style={col()}><CF label="Gradient Start" value={b.bg1||"#5B4EFF"} onChange={(v)=>onChange("bg1",v)}/><CF label="Gradient End" value={b.bg2||"#8B5CF6"} onChange={(v)=>onChange("bg2",v)}/><SF label="Padding (px)" value={b.padding||48} onChange={(v)=>onChange("padding",v)}/></div>);
    case "logo": return (<div style={col()}><div><p style={lbl()}>Logo URL</p><input value={b.logoUrl||""} onChange={(e)=>onChange("logoUrl",e.target.value)} placeholder="https://..." style={inp()}/></div><label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px",borderRadius:9,border:"1.5px dashed #C7D2FE",background:"#EEF2FF",color:"#5B4EFF",fontSize:12,fontWeight:700,cursor:"pointer"}}>{uploading?"⏳ Uploading...":"⬆ Upload Logo"}<input type="file" accept="image/*" style={{display:"none"}} onChange={(e)=>uploadImg(e.target.files[0],b.id)}/></label>{b.logoUrl&&<img src={b.logoUrl} alt="" style={{maxHeight:40,objectFit:"contain",borderRadius:6}}/>}<SF label="Height (px)" value={b.logoHeight||44} onChange={(v)=>onChange("logoHeight",v)}/><AF label="Align" value={b.align||"center"} onChange={(v)=>onChange("align",v)}/></div>);
    case "heading": return (<div style={col()}><div><p style={lbl()}>Text <span style={{color:"#94A3B8",fontWeight:400}}>· {"{name}"} = user name</span></p><textarea value={b.text||""} onChange={(e)=>onChange("text",e.target.value)} rows={3} style={{...inp(),resize:"vertical"}}/></div><CF label="Color" value={b.color||"#fff"} onChange={(v)=>onChange("color",v)}/><SF label="Font Size" value={b.size||22} onChange={(v)=>onChange("size",v)}/><AF label="Align" value={b.align||"left"} onChange={(v)=>onChange("align",v)}/><div style={{display:"flex",gap:6}}><button onClick={()=>onChange("bold",!b.bold)} style={{flex:1,padding:"6px",borderRadius:7,border:`1.5px solid ${b.bold?"#5B4EFF":"#E2E8F0"}`,background:b.bold?"#EEF2FF":"#fff",fontWeight:900,fontSize:14,cursor:"pointer"}}>B</button><button onClick={()=>onChange("italic",!b.italic)} style={{flex:1,padding:"6px",borderRadius:7,border:`1.5px solid ${b.italic?"#5B4EFF":"#E2E8F0"}`,background:b.italic?"#EEF2FF":"#fff",fontStyle:"italic",fontWeight:700,fontSize:14,cursor:"pointer"}}>I</button></div></div>);
    case "text": return (<div style={col()}><div><p style={lbl()}>Text <span style={{color:"#94A3B8",fontWeight:400}}>· paste formatted text, bold, line breaks all work</span></p><div contentEditable suppressContentEditableWarning onInput={(e)=>onChange("html",e.currentTarget.innerHTML)} onPaste={(e)=>{e.preventDefault();const html=e.clipboardData.getData("text/html");const text=e.clipboardData.getData("text/plain");if(html)document.execCommand("insertHTML",false,html);else document.execCommand("insertHTML",false,text.replace(/\n/g,"<br/>"));}} dangerouslySetInnerHTML={{__html:b.html||b.text?.replace(/\n/g,"<br/>")||""}} style={{...inp(),minHeight:140,resize:"vertical",cursor:"text",lineHeight:1.7,whiteSpace:"pre-wrap"}}/><div style={{display:"flex",gap:4,marginTop:6}}>{[["bold","B"],["italic","I"],["underline","U"]].map(([cmd,label])=>(<button key={cmd} onMouseDown={(e)=>{e.preventDefault();document.execCommand(cmd,false,null);}} style={{padding:"3px 10px",borderRadius:6,border:"1.5px solid #E2E8F0",background:"#fff",fontSize:13,cursor:"pointer",fontWeight:cmd==="bold"?900:400,fontStyle:cmd==="italic"?"italic":"normal",textDecoration:cmd==="underline"?"underline":"none"}}>{label}</button>))}</div></div><CF label="Color" value={b.color||"rgba(255,255,255,0.7)"} onChange={(v)=>onChange("color",v)}/><SF label="Font Size" value={b.size||15} onChange={(v)=>onChange("size",v)}/><AF label="Align" value={b.align||"left"} onChange={(v)=>onChange("align",v)}/><div><p style={lbl()}>Line Height: {b.lineHeight||1.8}</p><input type="range" min={1} max={2.5} step={0.1} value={b.lineHeight||1.8} onChange={(e)=>onChange("lineHeight",parseFloat(e.target.value))} style={{width:"100%"}}/></div></div>);
    case "button": return (<div style={col()}><div><p style={lbl()}>Button Text</p><input value={b.text||""} onChange={(e)=>onChange("text",e.target.value)} style={inp()}/></div><div><p style={lbl()}>URL</p><input value={b.url||""} onChange={(e)=>onChange("url",e.target.value)} style={inp()}/></div><CF label="BG Start" value={b.bgFrom||"#5B4EFF"} onChange={(v)=>onChange("bgFrom",v)}/><CF label="BG End" value={b.bgTo||"#8B5CF6"} onChange={(v)=>onChange("bgTo",v)}/><CF label="Text Color" value={b.color||"#fff"} onChange={(v)=>onChange("color",v)}/><SF label="Font Size" value={b.size||16} onChange={(v)=>onChange("size",v)}/><SF label="Border Radius" value={b.radius||14} onChange={(v)=>onChange("radius",v)}/><SF label="Padding Vertical" value={b.paddingV||16} onChange={(v)=>onChange("paddingV",v)}/><SF label="Padding Horizontal" value={b.paddingH||32} onChange={(v)=>onChange("paddingH",v)}/><AF label="Align" value={b.align||"center"} onChange={(v)=>onChange("align",v)}/></div>);
    case "image": return (<div style={col()}><div><p style={lbl()}>Image URL</p><input value={b.url||""} onChange={(e)=>onChange("url",e.target.value)} style={inp()}/></div><label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px",borderRadius:9,border:"1.5px dashed #C7D2FE",background:"#EEF2FF",color:"#5B4EFF",fontSize:12,fontWeight:700,cursor:"pointer"}}>⬆ Upload Image<input type="file" accept="image/*" style={{display:"none"}} onChange={async(e)=>{const file=e.target.files[0];if(!file)return;const path=`email/${Date.now()}-${file.name}`;const{error}=await supabase.storage.from("lesson-media").upload(path,file,{upsert:true});if(!error){const{data}=supabase.storage.from("lesson-media").getPublicUrl(path);onChange("url",data.publicUrl);}}}/></label>{b.url&&<img src={b.url} alt="" style={{width:"100%",borderRadius:6,maxHeight:80,objectFit:"cover"}}/>}<SF label="Border Radius" value={b.radius||12} onChange={(v)=>onChange("radius",v)}/><AF label="Align" value={b.align||"center"} onChange={(v)=>onChange("align",v)}/></div>);
    case "divider": return (<div style={col()}><CF label="Color" value={b.color||"rgba(255,255,255,0.08)"} onChange={(v)=>onChange("color",v)}/><SF label="Margin (px)" value={b.margin||24} onChange={(v)=>onChange("margin",v)}/></div>);
    case "spacer": return (<div style={col()}><SF label="Height (px)" value={b.height||24} onChange={(v)=>onChange("height",v)}/></div>);
    case "credentials": return (<div style={col()}><CF label="Label Color" value={b.labelColor||"rgba(255,255,255,0.5)"} onChange={(v)=>onChange("labelColor",v)}/><CF label="Email Color" value={b.emailColor||"#a78bfa"} onChange={(v)=>onChange("emailColor",v)}/><CF label="Password Text" value={b.pwColor||"#fff"} onChange={(v)=>onChange("pwColor",v)}/><CF label="Password BG" value={b.pwBg||"rgba(91,78,255,0.2)"} onChange={(v)=>onChange("pwBg",v)}/><CF label="Card BG" value={b.cardBg||"#1a1830"} onChange={(v)=>onChange("cardBg",v)}/><CF label="Card Border" value={b.cardBorder||"rgba(255,255,255,0.1)"} onChange={(v)=>onChange("cardBorder",v)}/></div>);
    case "footer": return (<div style={col()}><div><p style={lbl()}>Text</p><textarea value={b.text||""} onChange={(e)=>onChange("text",e.target.value)} rows={3} style={{...inp(),resize:"vertical"}}/></div><CF label="Text Color" value={b.color||"rgba(255,255,255,0.3)"} onChange={(v)=>onChange("color",v)}/><CF label="Background" value={b.bg||"transparent"} onChange={(v)=>onChange("bg",v)}/><SF label="Font Size" value={b.size||12} onChange={(v)=>onChange("size",v)}/><SF label="Padding" value={b.padding||24} onChange={(v)=>onChange("padding",v)}/><AF label="Align" value={b.align||"center"} onChange={(v)=>onChange("align",v)}/></div>);
    default: return null;
  }
}

function CF({ label, value, onChange }) {
  const safeColor = (value || "#000000").startsWith("#") ? value : "#000000";
  return (
    <div>
      <p style={lbl()}>{label}</p>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="color" value={safeColor} onChange={(e) => onChange(e.target.value)} style={{ width: 34, height: 34, borderRadius: 8, border: "1.5px solid #E2E8F0", cursor: "pointer", padding: 2, flexShrink: 0 }} />
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="#000000 or rgba(...)" style={{ ...inp(), fontSize: 11 }} />
        <div style={{ width: 20, height: 20, borderRadius: 4, background: value || "transparent", border: "1.5px solid #E2E8F0", flexShrink: 0 }} />
      </div>
    </div>
  );
}

function SF({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={() => onChange(Math.max(0, value - 1))} style={ib()}>−</button>
        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 28, textAlign: "center" }}>{value}</span>
        <button onClick={() => onChange(value + 1)} style={ib()}>+</button>
      </div>
    </div>
  );
}

function AF({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{label}</span>
      <div style={{ display: "flex", gap: 3 }}>
        {[["left","←"],["center","↔"],["right","→"]].map(([a, ic]) => (
          <button key={a} onClick={() => onChange(a)} style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px solid ${value === a ? "#5B4EFF" : "#E2E8F0"}`, background: value === a ? "#EEF2FF" : "#fff", cursor: "pointer", fontSize: 13 }}>{ic}</button>
        ))}
      </div>
    </div>
  );
}

const col = () => ({ display: "flex", flexDirection: "column", gap: 14 });
const lbl = () => ({ fontSize: 10, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 });
const inp = () => ({ width: "100%", padding: "8px 11px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" });
const ib = () => ({ width: 22, height: 22, borderRadius: 5, border: "1.5px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 });