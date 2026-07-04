"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Check, Loader, Send, ArrowLeft } from "lucide-react";
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

export default function EmailTemplateEditor({ templateId }) {
  const router = useRouter();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("content");

  useEffect(() => { load(); }, [templateId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("*").eq("key","email_templates").single();
    if (data?.value) {
      const t = data.value.find(t => t.id === templateId);
      if (t) setTemplate(t);
    }
    setLoading(false);
  };

  const u = (key, val) => setTemplate(prev => ({ ...prev, [key]: val }));
  const uc = (key, val) => setTemplate(prev => ({ ...prev, content: { ...prev.content, [key]: val } }));

  const save = async () => {
    setSaving(true);
    const { data } = await supabase.from("settings").select("*").eq("key","email_templates").single();
    const templates = data?.value || [];
    const updated = templates.map(t => t.id === templateId ? template : t);
    if (!templates.find(t => t.id === templateId)) updated.push(template);
    await supabase.from("settings").upsert({ key:"email_templates", value:updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const sendTest = async () => {
    if (!testEmail) return;
    setSending(true);
    await fetch("/api/send-email", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ to:testEmail, subject:template.subject, html:generateHtml(template.content,"John Smith",testEmail,"testPass123!") }),
    });
    setSentOk(true);
    setTimeout(() => setSentOk(false), 3000);
    setSending(false);
  };

  if (loading) return <AdminLayout><div style={{ padding:60, textAlign:"center" }}><Loader size={28} color="#94A3B8" className="bspin"/></div></AdminLayout>;
  if (!template) return <AdminLayout><div style={{ padding:60, textAlign:"center", color:"#94A3B8" }}>Template not found</div></AdminLayout>;

  const c = template.content || {};

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 64px)", gap:0 }}>
        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", borderBottom:"1px solid #E2E8F0", background:"#fff", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={() => router.push("/admin/emails")} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              <ArrowLeft size={14}/> Back
            </button>
            <div>
              <input value={template.name} onChange={e=>u("name",e.target.value)} style={{ fontSize:17, fontWeight:900, color:"#0f172a", border:"none", outline:"none", background:"transparent", width:300 }}/>
              <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{TRIGGER_TYPES.find(t=>t.value===template.trigger)?.icon} {TRIGGER_TYPES.find(t=>t.value===template.trigger)?.label}</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <input value={testEmail} onChange={e=>setTestEmail(e.target.value)} placeholder="test@gmail.com" style={{ padding:"8px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, width:200, outline:"none" }}/>
            <button onClick={sendTest} disabled={sending||!testEmail} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              {sending?<Loader size={14} className="bspin"/>:sentOk?<Check size={14} color="#22c55e"/>:<Send size={14}/>}
              {sentOk?"Sent!":"Test"}
            </button>
            <button onClick={save} disabled={saving} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {saving?<><Loader size={14} className="bspin"/> Saving...</>:saved?<><Check size={14}/> Saved!</>:<><Save size={14}/> Save</>}
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"380px 1fr", overflow:"hidden" }}>
          {/* Left controls */}
          <div style={{ overflow:"auto", padding:0, borderRight:"1px solid #E2E8F0", background:"#FAFBFC" }}>
            {/* Tabs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderBottom:"1px solid #E2E8F0" }}>
              {[["content","Content"],["design","Design"],["logo","Logo"],["settings","Settings"]].map(t2 => (
                <button key={t2[0]} onClick={() => setTab(t2[0])} style={{ padding:"10px 4px", border:"none", borderBottom:`2px solid ${tab===t2[0]?"#5B4EFF":"transparent"}`, background:"#fff", fontWeight:700, fontSize:11, color:tab===t2[0]?"#5B4EFF":"#94A3B8", cursor:"pointer" }}>
                  {t2[1]}
                </button>
              ))}
            </div>

            <div style={{ padding:16, display:"flex", flexDirection:"column", gap:12 }}>
              {tab === "content" && (
                <>
                  <Field label="Subject Line"><input value={template.subject||""} onChange={e=>u("subject",e.target.value)} style={inp()}/></Field>
                  <Field label="Header Subtitle"><input value={c.headerText||""} onChange={e=>uc("headerText",e.target.value)} style={inp()}/></Field>
                  <Field label="Greeting" hint="Use {name}"><input value={c.greetingText||"Congratulations, {name}! 🎉"} onChange={e=>uc("greetingText",e.target.value)} style={inp()}/></Field>
                  <Field label="Body Text"><textarea value={c.bodyText||""} onChange={e=>uc("bodyText",e.target.value)} rows={4} style={{ ...inp(), resize:"vertical" }}/></Field>
                  <Field label="Button Text"><input value={c.buttonText||""} onChange={e=>uc("buttonText",e.target.value)} style={inp()}/></Field>
                  <Field label="Button URL"><input value={c.buttonUrl||""} onChange={e=>uc("buttonUrl",e.target.value)} placeholder="https://1course.io/login" style={inp()}/></Field>
                  <Field label="Footer Text"><input value={c.footerText||""} onChange={e=>uc("footerText",e.target.value)} style={inp()}/></Field>
                  <Field label="Show Credentials Block">
                    <Toggle value={c.showCredentials!==false} onChange={v=>uc("showCredentials",v)}/>
                  </Field>
                </>
              )}

              {tab === "design" && (
                <>
                  <Section label="Header">
                    <ColorRow label="Gradient Start" value={c.headerGradientStart||"#5B4EFF"} onChange={v=>uc("headerGradientStart",v)}/>
                    <ColorRow label="Gradient End" value={c.headerGradientEnd||"#8B5CF6"} onChange={v=>uc("headerGradientEnd",v)}/>
                    <AlignRow label="Header Align" value={c.headerAlign||"center"} onChange={v=>uc("headerAlign",v)}/>
                  </Section>
                  <Section label="Body">
                    <ColorRow label="Background" value={c.bgColor||"#0a081e"} onChange={v=>uc("bgColor",v)}/>
                    <ColorRow label="Card Background" value={c.cardBg||"#1a1830"} onChange={v=>uc("cardBg",v)}/>
                    <ColorRow label="Card Border" value={c.cardBorder||"rgba(255,255,255,0.1)"} onChange={v=>uc("cardBorder",v)}/>
                  </Section>
                  <Section label="Text">
                    <ColorRow label="Greeting Color" value={c.greetingColor||"#5B4EFF"} onChange={v=>uc("greetingColor",v)}/>
                    <ColorRow label="Body Text Color" value={c.bodyTextColor||"#aaaaaa"} onChange={v=>uc("bodyTextColor",v)}/>
                    <FontSizeRow label="Body Font Size" value={c.bodyFontSize||15} onChange={v=>uc("bodyFontSize",v)}/>
                  </Section>
                  <Section label="Button">
                    <ColorRow label="Button BG Start" value={c.buttonColorFrom||"#5B4EFF"} onChange={v=>uc("buttonColorFrom",v)}/>
                    <ColorRow label="Button BG End" value={c.buttonColorTo||"#8B5CF6"} onChange={v=>uc("buttonColorTo",v)}/>
                    <ColorRow label="Button Text" value={c.buttonTextColor||"#ffffff"} onChange={v=>uc("buttonTextColor",v)}/>
                    <FontSizeRow label="Button Font Size" value={c.buttonFontSize||16} onChange={v=>uc("buttonFontSize",v)}/>
                    <AlignRow label="Button Align" value={c.buttonAlign||"center"} onChange={v=>uc("buttonAlign",v)}/>
                  </Section>
                  <Section label="Footer">
                    <ColorRow label="Footer Text Color" value={c.footerColor||"rgba(255,255,255,0.3)"} onChange={v=>uc("footerColor",v)}/>
                    <FontSizeRow label="Footer Font Size" value={c.footerFontSize||12} onChange={v=>uc("footerFontSize",v)}/>
                    <AlignRow label="Footer Align" value={c.footerAlign||"center"} onChange={v=>uc("footerAlign",v)}/>
                  </Section>
                </>
              )}

              {tab === "logo" && (
                <>
                  <Section label="Logo Image">
                    <div style={{ marginBottom:8 }}>
                      <p style={lbl()}>Upload Logo</p>
                      <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", borderRadius:12, border:"1.5px dashed #C7D2FE", background:"#EEF2FF", color:"#5B4EFF", fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:8 }}>
                        {uploading ? "⏳ Uploading..." : "⬆ Upload Image"}
                        <input type="file" accept="image/*" style={{ display:"none" }} onChange={async e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setUploading(true);
                          const path = `email-logos/${Date.now()}-${file.name}`;
                          const { error } = await supabase.storage.from("lesson-media").upload(path, file, { upsert:true });
                          if (!error) {
                            const { data: urlData } = supabase.storage.from("lesson-media").getPublicUrl(path);
                            uc("logoUrl", urlData.publicUrl);
                          }
                          setUploading(false);
                        }}/>
                      </label>
                    </div>
                    <div style={{ marginBottom:8 }}>
                      <p style={lbl()}>Or paste URL</p>
                      <input value={c.logoUrl||""} onChange={e=>uc("logoUrl",e.target.value)} placeholder="https://..." style={inp()}/>
                    </div>
                    {c.logoUrl && (
                      <div style={{ padding:12, background:"#1a1830", borderRadius:10, textAlign:"center", marginBottom:8 }}>
                        <img src={c.logoUrl} alt="Logo preview" style={{ maxHeight:48, maxWidth:"100%", objectFit:"contain" }}/>
                      </div>
                    )}
                    {c.logoUrl && <button onClick={()=>uc("logoUrl","")} style={{ width:"100%", padding:"6px", borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", color:"#ef4444", fontSize:12, cursor:"pointer" }}>Remove Logo</button>}
                    <FontSizeRow label="Logo Height (px)" value={c.logoHeight||40} onChange={v=>uc("logoHeight",v)}/>
                    <AlignRow label="Logo Align" value={c.logoAlign||"center"} onChange={v=>uc("logoAlign",v)}/>
                  </Section>
                  <Section label="Logo Text (fallback)">
                    <div>
                      <p style={lbl()}>Text (if no image)</p>
                      <input value={c.logoText||"✦ 1Course"} onChange={e=>uc("logoText",e.target.value)} style={inp()}/>
                    </div>
                    <FontSizeRow label="Text Size" value={c.logoTextSize||28} onChange={v=>uc("logoTextSize",v)}/>
                    <ColorRow label="Text Color" value={c.logoTextColor||"#ffffff"} onChange={v=>uc("logoTextColor",v)}/>
                  </Section>
                  <Section label="Header Subtitle">
                    <div>
                      <p style={lbl()}>Subtitle Text</p>
                      <input value={c.headerSubtitle||c.headerText||""} onChange={e=>uc("headerSubtitle",e.target.value)} placeholder="Password Reset" style={inp()}/>
                    </div>
                    <FontSizeRow label="Subtitle Size" value={c.headerSubtitleSize||14} onChange={v=>uc("headerSubtitleSize",v)}/>
                    <ColorRow label="Subtitle Color" value={c.headerSubtitleColor||"rgba(255,255,255,0.8)"} onChange={v=>uc("headerSubtitleColor",v)}/>
                  </Section>
                </>
              )}

              {tab === "settings" && (
                <>
                  <Section label="Trigger">
                    <select value={template.trigger} onChange={e=>u("trigger",e.target.value)} style={inp()}>
                      {TRIGGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                    </select>
                  </Section>
                  <Section label="Status">
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <Toggle value={template.active} onChange={v=>u("active",v)}/>
                      <span style={{ fontSize:13, fontWeight:600, color:template.active?"#22c55e":"#94A3B8" }}>{template.active?"Active":"Paused"}</span>
                    </div>
                  </Section>
                  <Section label="Description">
                    <textarea value={template.description||""} onChange={e=>u("description",e.target.value)} style={{ ...inp(), minHeight:60, resize:"vertical" }}/>
                  </Section>
                </>
              )}
            </div>
          </div>

          {/* Right preview */}
          <div style={{ overflow:"auto", padding:32, background:"#E2E8F0", display:"flex", justifyContent:"center" }}>
            <div style={{ width:"100%", maxWidth:600 }}>
              <div style={{ background:"#fff", borderRadius:8, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}>
                <div style={{ background:"#F8FAFC", padding:"12px 16px", borderBottom:"1px solid #E2E8F0" }}>
                  <p style={{ fontSize:12, color:"#64748B", margin:"0 0 2px" }}>From: <strong>1Course</strong></p>
                  <p style={{ fontSize:12, color:"#0f172a", margin:0 }}>Subject: <strong>{template.subject}</strong></p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: generateHtml(c,"John Smith","john@example.com","testPass123!") }}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}

// ── Helpers ──
function Field({ label, hint, children }) {
  return (
    <div>
      <p style={{ ...lbl(), marginBottom:6 }}>{label} {hint && <span style={{ color:"#94A3B8", fontWeight:400, textTransform:"none" }}>· {hint}</span>}</p>
      {children}
    </div>
  );
}
function Section({ label, children }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1.5px solid #E2E8F0", padding:14 }}>
      <p style={{ fontSize:10, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:0.5, margin:"0 0 12px" }}>{label}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>{children}</div>
    </div>
  );
}
function ColorRow({ label, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ fontSize:12, color:"#374151", fontWeight:500 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <input type="color" value={(value||"#ffffff").startsWith("#")?(value||"#ffffff"):"#ffffff"} onChange={e=>onChange(e.target.value)} style={{ width:32, height:32, borderRadius:6, border:"1.5px solid #E2E8F0", cursor:"pointer", padding:2 }}/>
        <input value={value||""} onChange={e=>onChange(e.target.value)} style={{ ...inp(), width:130, fontSize:11 }}/>
      </div>
    </div>
  );
}
function FontSizeRow({ label, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ fontSize:12, color:"#374151", fontWeight:500 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <button onClick={()=>onChange(Math.max(8,value-1))} style={fcb()}>−</button>
        <span style={{ fontSize:12, fontWeight:700, minWidth:28, textAlign:"center" }}>{value}</span>
        <button onClick={()=>onChange(Math.min(60,value+1))} style={fcb()}>+</button>
        <span style={{ fontSize:11, color:"#94A3B8" }}>px</span>
      </div>
    </div>
  );
}
function AlignRow({ label, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ fontSize:12, color:"#374151", fontWeight:500 }}>{label}</span>
      <div style={{ display:"flex", gap:4 }}>
        {[["left","←"],["center","↔"],["right","→"]].map(([a,ic]) => (
          <button key={a} onClick={()=>onChange(a)} style={{ width:28, height:28, borderRadius:7, border:`1.5px solid ${value===a?"#5B4EFF":"#E2E8F0"}`, background:value===a?"#EEF2FF":"#fff", cursor:"pointer", fontSize:12 }}>{ic}</button>
        ))}
      </div>
    </div>
  );
}
function Toggle({ value, onChange }) {
  return (
    <button onClick={()=>onChange(!value)} style={{ width:40, height:22, borderRadius:999, border:"none", background:value?"#22c55e":"#E2E8F0", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
      <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:value?21:3, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
    </button>
  );
}

function generateHtml(c, name, email, password) {
  const greeting = (c.greetingText||"Congratulations, {name}! 🎉").replace("{name}", name);
  const logoHtml = c.logoUrl
    ? `<img src="${c.logoUrl}" alt="Logo" style="height:${c.logoHeight||40}px;object-fit:contain;display:block;margin:0 auto;" />`
    : `<h1 style="margin:0;font-size:${c.logoTextSize||28}px;font-weight:900;color:${c.logoTextColor||"#ffffff"}">${c.logoText||"✦ 1Course"}</h1>`;

  return `
    <div style="font-family:sans-serif;background:${c.bgColor||"#0a081e"};color:#fff;padding:0;margin:0">
      <div style="background:linear-gradient(135deg,${c.headerGradientStart||"#5B4EFF"},${c.headerGradientEnd||"#8B5CF6"});padding:40px 32px;text-align:${c.logoAlign||"center"}">
        ${logoHtml}
        ${c.headerSubtitle||c.headerText ? `<p style="margin:10px 0 0;font-size:${c.headerSubtitleSize||14}px;color:${c.headerSubtitleColor||"rgba(255,255,255,0.8)"}">${c.headerSubtitle||c.headerText||""}</p>` : ""}
      </div>
      <div style="padding:32px">
        <h2 style="font-size:22px;margin:0 0 12px;color:${c.greetingColor||"#5B4EFF"}">${greeting}</h2>
        <p style="color:${c.bodyTextColor||"rgba(255,255,255,0.7)"};line-height:1.7;margin:0 0 20px;font-size:${c.bodyFontSize||15}px">${c.bodyText||""}</p>
        ${c.showCredentials!==false ? `
        <div style="background:${c.cardBg||"#1a1830"};border-radius:12px;padding:24px;margin:0 0 20px;border:1px solid ${c.cardBorder||"rgba(255,255,255,0.1)"}">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Email</p>
          <p style="margin:0 0 16px;font-weight:700;color:#a78bfa">${email}</p>
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Temporary Password</p>
          <p style="margin:0;font-weight:900;font-size:20px;color:#fff;background:rgba(91,78,255,0.2);padding:12px;border-radius:8px;text-align:center;font-family:monospace">${password}</p>
        </div>` : ""}
        <div style="text-align:${c.buttonAlign||"center"}">
          <a href="${c.buttonUrl||"#"}" style="display:inline-block;padding:16px 28px;background:linear-gradient(135deg,${c.buttonColorFrom||"#5B4EFF"},${c.buttonColorTo||"#8B5CF6"});color:${c.buttonTextColor||"#fff"};text-decoration:none;border-radius:12px;font-weight:700;font-size:${c.buttonFontSize||16}px">${c.buttonText||"Visit 1Course →"}</a>
        </div>
      </div>
      <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:${c.footerAlign||"center"}">
        <p style="color:${c.footerColor||"rgba(255,255,255,0.3)"};font-size:${c.footerFontSize||12}px;margin:0">${c.footerText||""}</p>
      </div>
    </div>
  `;
}

const lbl = () => ({ fontSize:11, fontWeight:700, color:"#374151", display:"block", textTransform:"uppercase", letterSpacing:0.5 });
const inp = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
const fcb = () => ({ width:24, height:24, borderRadius:6, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", padding:0 });
