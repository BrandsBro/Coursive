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
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"360px 1fr", overflow:"hidden" }}>
          {/* Left */}
          <div style={{ overflow:"auto", padding:20, borderRight:"1px solid #E2E8F0", background:"#FAFBFC" }}>
            {/* Tabs */}
            <div style={{ display:"flex", background:"#F1F5F9", borderRadius:10, padding:3, marginBottom:20 }}>
              {["content","design","settings"].map(t2 => (
                <button key={t2} onClick={() => setTab(t2)} style={{ flex:1, padding:"7px", borderRadius:8, border:"none", background:tab===t2?"#fff":"transparent", fontWeight:700, fontSize:12, color:tab===t2?"#0f172a":"#94A3B8", cursor:"pointer", textTransform:"capitalize" }}>
                  {t2}
                </button>
              ))}
            </div>

            {tab === "content" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <TextBlock label="Subject Line" value={template.subject} onChange={v=>u("subject",v)}/>
                <TextBlock label="Logo Text" value={c.logoText||"✦ 1Course"} onChange={v=>uc("logoText",v)} align={c.logoAlign||"center"} onAlign={v=>uc("logoAlign",v)}/>
                <TextBlock label="Header Subtitle" value={c.headerText} onChange={v=>uc("headerText",v)} align={c.headerAlign||"center"} onAlign={v=>uc("headerAlign",v)}/>
                <TextBlock label="Greeting" value={c.greetingText||"Congratulations, {name}! 🎉"} onChange={v=>uc("greetingText",v)} hint="Use {name} for customer name" align={c.greetingAlign||"left"} onAlign={v=>uc("greetingAlign",v)}/>
                <TextBlock label="Body Text" value={c.bodyText} onChange={v=>uc("bodyText",v)} multiline align={c.bodyAlign||"left"} onAlign={v=>uc("bodyAlign",v)}/>
                <TextBlock label="Button Text" value={c.buttonText} onChange={v=>uc("buttonText",v)} align={c.buttonAlign||"center"} onAlign={v=>uc("buttonAlign",v)}/>
                <TextBlock label="Footer Text" value={c.footerText} onChange={v=>uc("footerText",v)} align={c.footerAlign||"center"} onAlign={v=>uc("footerAlign",v)}/>
              </div>
            )}

            {tab === "design" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <Section label="Header">
                  <ColorRow label="Gradient Start" value={c.headerGradientStart||"#5B4EFF"} onChange={v=>uc("headerGradientStart",v)}/>
                  <ColorRow label="Gradient End" value={c.headerGradientEnd||"#8B5CF6"} onChange={v=>uc("headerGradientEnd",v)}/>
                </Section>
                <Section label="Body">
                  <ColorRow label="Background" value={c.bgColor||"#0a081e"} onChange={v=>uc("bgColor",v)}/>
                  <ColorRow label="Card Background" value={c.cardBg||"#1a1830"} onChange={v=>uc("cardBg",v)}/>
                  <ColorRow label="Greeting Color" value={c.greetingColor||"#5B4EFF"} onChange={v=>uc("greetingColor",v)}/>
                  <ColorRow label="Body Text Color" value={c.bodyTextColor||"#aaaaaa"} onChange={v=>uc("bodyTextColor",v)}/>
                </Section>
                <Section label="Button">
                  <ColorRow label="Button Color" value={c.buttonColor||"#5B4EFF"} onChange={v=>uc("buttonColor",v)}/>
                  <ColorRow label="Button Text Color" value={c.buttonTextColor||"#ffffff"} onChange={v=>uc("buttonTextColor",v)}/>
                </Section>
              </div>
            )}

            {tab === "settings" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <Section label="Trigger">
                  <select value={template.trigger} onChange={e=>u("trigger",e.target.value)} style={inp()}>
                    {TRIGGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                  </select>
                </Section>
                <Section label="Status">
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <button onClick={() => u("active",!template.active)}
                      style={{ width:44, height:24, borderRadius:999, border:"none", background:template.active?"#22c55e":"#E2E8F0", cursor:"pointer", position:"relative" }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:template.active?22:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                    </button>
                    <span style={{ fontSize:13, fontWeight:600, color:template.active?"#22c55e":"#94A3B8" }}>{template.active?"Active":"Paused"}</span>
                  </div>
                </Section>
                <Section label="Description">
                  <textarea value={template.description||""} onChange={e=>u("description",e.target.value)} style={{ ...inp(), minHeight:60, resize:"vertical" }}/>
                </Section>
              </div>
            )}
          </div>

          {/* Right - preview */}
          <div style={{ overflow:"auto", padding:32, background:"#E2E8F0", display:"flex", justifyContent:"center" }}>
            <div style={{ width:"100%", maxWidth:600 }}>
              <div style={{ background:"#fff", borderRadius:8, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}>
                <div style={{ background:"#F8FAFC", padding:"12px 16px", borderBottom:"1px solid #E2E8F0" }}>
                  <p style={{ fontSize:12, color:"#64748B", margin:"0 0 2px" }}>From: <strong>1Course</strong> &lt;noreply@kingbrandsbro.pro&gt;</p>
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

function TextBlock({ label, value, onChange, align, onAlign, multiline, hint }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1.5px solid #E2E8F0", padding:12 }}>
      <p style={{ fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:0.5, margin:"0 0 8px" }}>{label} {hint && <span style={{ color:"#94A3B8", fontWeight:400, textTransform:"none" }}>· {hint}</span>}</p>
      {multiline ? <textarea value={value||""} onChange={e=>onChange(e.target.value)} style={{ ...inp(), minHeight:70, resize:"vertical" }}/> : <input value={value||""} onChange={e=>onChange(e.target.value)} style={inp()}/>}
      {onAlign && (
        <div style={{ display:"flex", gap:6, marginTop:8 }}>
          {[["left","⬅ Left"],["center","⬆ Center"],["right","➡ Right"]].map(([a,l]) => (
            <button key={a} onClick={() => onAlign(a)} style={{ flex:1, padding:"5px", borderRadius:7, border:`1.5px solid ${align===a?"#5B4EFF":"#E2E8F0"}`, background:align===a?"#EEF2FF":"#F8FAFC", fontSize:11, fontWeight:700, color:align===a?"#5B4EFF":"#94A3B8", cursor:"pointer" }}>{l}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1.5px solid #E2E8F0", padding:14 }}>
      <p style={{ fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:0.5, margin:"0 0 12px" }}>{label}</p>
      {children}
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
      <span style={{ fontSize:13, color:"#374151", fontWeight:500 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type="color" value={value.startsWith("#")?value:"#ffffff"} onChange={e=>onChange(e.target.value)} style={{ width:34, height:34, borderRadius:8, border:"1.5px solid #E2E8F0", cursor:"pointer", padding:2 }}/>
        <input value={value} onChange={e=>onChange(e.target.value)} style={{ ...inp(), width:120, fontSize:12 }}/>
      </div>
    </div>
  );
}

function generateHtml(c, name, email, password) {
  const greeting = (c.greetingText||"Congratulations, {name}! 🎉").replace("{name}", name);
  return `
    <div style="font-family:sans-serif;background:${c.bgColor||"#0a081e"};color:#fff;padding:0;margin:0">
      <div style="background:linear-gradient(135deg,${c.headerGradientStart||"#5B4EFF"},${c.headerGradientEnd||"#8B5CF6"});padding:40px 32px;text-align:${c.logoAlign||"center"}">
        <h1 style="margin:0;font-size:28px;font-weight:900;color:#fff">${c.logoText||"✦ 1Course"}</h1>
        <p style="margin:8px 0 0;opacity:0.85;color:#fff;text-align:${c.headerAlign||"center"}">${c.headerText||""}</p>
      </div>
      <div style="padding:32px">
        <h2 style="font-size:22px;margin:0 0 12px;color:${c.greetingColor||"#5B4EFF"};text-align:${c.greetingAlign||"left"}">${greeting}</h2>
        <p style="color:${c.bodyTextColor||"rgba(255,255,255,0.7)"};line-height:1.7;margin:0 0 20px;text-align:${c.bodyAlign||"left"}">${c.bodyText||""}</p>
        <div style="background:${c.cardBg||"#1a1830"};border-radius:12px;padding:24px;margin:0 0 20px;border:1px solid rgba(255,255,255,0.1)">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Email</p>
          <p style="margin:0 0 16px;font-weight:700;color:#a78bfa">${email}</p>
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Temporary Password</p>
          <p style="margin:0;font-weight:900;font-size:20px;color:#fff;background:rgba(91,78,255,0.2);padding:12px;border-radius:8px;text-align:center;font-family:monospace">${password}</p>
        </div>
        <div style="text-align:${c.buttonAlign||"center"}">
          <a href="#" style="display:inline-block;padding:16px 28px;background:${c.buttonColor||"#5B4EFF"};color:${c.buttonTextColor||"#fff"};text-decoration:none;border-radius:12px;font-weight:700;font-size:16px">${c.buttonText||"Visit 1Course →"}</a>
        </div>
      </div>
      <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:${c.footerAlign||"center"}">
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">${c.footerText||""}</p>
      </div>
    </div>
  `;
}

const inp = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
