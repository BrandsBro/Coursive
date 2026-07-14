"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Trash2, Copy, Edit2, Send, Check, Loader, Play, Pause, ArrowRight, Mail, Zap, Clock, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const TRIGGER_TYPES = [
  { value:"after_payment",     label:"After Payment",          icon:"💳", desc:"Sent immediately after successful payment", color:"#22c55e" },
  { value:"expiry_warning_3",  label:"3 Days Before Expiry",   icon:"⚠️", desc:"Sent 3 days before subscription expires", color:"#f59e0b" },
  { value:"expiry_warning_1",  label:"1 Day Before Expiry",    icon:"🚨", desc:"Sent 1 day before subscription expires", color:"#ef4444" },
  { value:"after_expiry",      label:"After Expiry",           icon:"🔒", desc:"Sent when subscription expires", color:"#6366f1" },
  { value:"auto_renewal",      label:"Auto-Renewal Success",   icon:"🔄", desc:"Sent when recurring payment succeeds", color:"#8b5cf6" },
  { value:"cancellation",      label:"On Cancellation",        icon:"❌", desc:"Sent when user cancels subscription", color:"#64748B" },
  { value:"welcome_reminder",  label:"3 Day Welcome Reminder", icon:"👋", desc:"Sent 3 days after signup", color:"#0369a1" },
  { value:"manual",            label:"Manual / One-time",      icon:"✉️", desc:"Send manually to selected users", color:"#ec4899" },
  { value:"lead_followup_1",   label:"Lead Follow-up 1",        icon:"📬", desc:"Sent to unconverted leads after 30 minutes", color:"#5B4EFF" },
  { value:"lead_followup_2",   label:"Lead Follow-up 2",        icon:"📭", desc:"Sent to unconverted leads after 24 hours", color:"#f97316" },
  { value:"lead_followup_3",   label:"Lead Follow-up 3",        icon:"📮", desc:"Sent to unconverted leads after 3 days", color:"#0f172a" },
];

const DEFAULT_TEMPLATES = [
  {
    id:"welcome",
    name:"Welcome Email",
    subject:"🎉 Welcome to 1Course! Your login details inside",
    trigger:"after_payment",
    active:true,
    description:"Sent after payment with login credentials",
    content:{
      headerText:"Welcome aboard!",
      bodyText:"Your payment was successful! Use the details below to log in:",
      buttonText:"Log In to 1Course →",
      footerText:"© 2026 1Course. All rights reserved.",
      bgColor:"#0a081e",
      headerGradientStart:"#5B4EFF",
      headerGradientEnd:"#8B5CF6",
      cardBg:"#1a1830",
      greetingColor:"#5B4EFF",
      bodyTextColor:"rgba(255,255,255,0.7)",
      buttonColor:"#5B4EFF",
      buttonTextColor:"#ffffff",
      logoText:"✦ 1Course",
    }
  },
  {
    id:"expiry_warning",
    name:"Expiry Warning",
    subject:"⚠️ Your 1Course access expires in 3 days",
    trigger:"expiry_warning_3",
    active:true,
    description:"Reminds users to renew before expiry",
    content:{
      headerText:"Your access is expiring soon!",
      bodyText:"Your 1Course subscription expires in 3 days. Renew now to keep your progress and access.",
      buttonText:"Renew My Access →",
      footerText:"© 2026 1Course. All rights reserved.",
      bgColor:"#0a081e",
      headerGradientStart:"#f59e0b",
      headerGradientEnd:"#ef4444",
      cardBg:"#1a1830",
      greetingColor:"#f59e0b",
      bodyTextColor:"rgba(255,255,255,0.7)",
      buttonColor:"#f59e0b",
      buttonTextColor:"#ffffff",
      logoText:"✦ 1Course",
    }
  },
  {
    id:"expired",
    name:"Subscription Expired",
    subject:"🔒 Your 1Course access has ended",
    trigger:"after_expiry",
    active:true,
    description:"Sent when subscription expires",
    content:{
      headerText:"Your access has expired",
      bodyText:"Your 1Course subscription has ended. Renew today to regain access to all your courses and progress.",
      buttonText:"Renew Access →",
      footerText:"© 2026 1Course. All rights reserved.",
      bgColor:"#0a081e",
      headerGradientStart:"#ef4444",
      headerGradientEnd:"#dc2626",
      cardBg:"#1a1830",
      greetingColor:"#ef4444",
      bodyTextColor:"rgba(255,255,255,0.7)",
      buttonColor:"#ef4444",
      buttonTextColor:"#ffffff",
      logoText:"✦ 1Course",
    }
  },
];


function LeadEmailsTab() {
  const [settings, setSettings] = useState({
    email1_enabled: true, email1_delay: 30, email1_subject: "You're so close to mastering AI 🚀",
    email1_body: "Hi {name}, you started our AI quiz but didn't get your plan yet. Thousands of students are already mastering AI tools — don't get left behind!",
    email2_enabled: true, email2_delay: 1440, email2_subject: "AI is changing everything — are you ready? 💡",
    email2_body: "Hi {name}, yesterday you showed interest in learning AI tools. Companies are actively hiring people with AI skills — and 1Course makes it easy to get certified fast.",
    email3_enabled: true, email3_delay: 4320, email3_subject: "Last chance — your AI course is waiting 🎓",
    email3_body: "Hi {name}, 3 days ago you took our AI quiz. We built a personalized learning plan just for you — and it's still waiting.",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ total:0, email1:0, email2:0, email3:0 });

  useEffect(() => {
    supabase.from("settings").select("value").eq("key","lead_email_settings").single()
      .then(({ data }) => { if (data?.value) setSettings(data.value); });
    supabase.from("leads").select("id,email1_sent,email2_sent,email3_sent,converted")
      .then(({ data }) => {
        if (data) setStats({
          total: data.filter(l => !l.converted).length,
          email1: data.filter(l => l.email1_sent).length,
          email2: data.filter(l => l.email2_sent).length,
          email3: data.filter(l => l.email3_sent).length,
        });
      });
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase.from("settings").upsert({ key:"lead_email_settings", value:settings });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const emails = [
    { num:1, icon:"📬", color:"#5B4EFF", bg:"#EEF2FF", label:"Email 1 — First Touch", delayLabel:"30 minutes after quiz" },
    { num:2, icon:"📭", color:"#f97316", bg:"#FFF7ED", label:"Email 2 — Follow Up", delayLabel:"24 hours after quiz" },
    { num:3, icon:"📮", color:"#0f172a", bg:"#F8FAFC", label:"Email 3 — Last Chance", delayLabel:"3 days after quiz" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:"#EEF2FF", border:"1.5px solid #C7D2FE", borderRadius:14, padding:"14px 18px" }}>
        <p style={{ fontSize:13, fontWeight:600, color:"#4338CA", margin:0 }}>📬 These emails are sent automatically to leads who filled the quiz but didn't purchase. Edit the content and timing here.</p>
      </div>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"Unconverted Leads", value:stats.total, color:"#6366f1" },
          { label:"Email 1 Sent", value:stats.email1, color:"#5B4EFF" },
          { label:"Email 2 Sent", value:stats.email2, color:"#f97316" },
          { label:"Email 3 Sent", value:stats.email3, color:"#0f172a" },
        ].map((s,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:14, padding:"16px", border:"1.5px solid #F1F5F9" }}>
            <p style={{ fontSize:24, fontWeight:900, color:s.color, margin:0 }}>{s.value}</p>
            <p style={{ fontSize:11, color:"#94A3B8", margin:"4px 0 0", fontWeight:600 }}>{s.label}</p>
          </div>
        ))}
      </div>
      {/* Email editors */}
      {emails.map(({ num, icon, color, bg, label, delayLabel }) => (
        <div key={num} style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
          <div style={{ background:bg, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1.5px solid #F1F5F9" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:22 }}>{icon}</span>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color, margin:0 }}>{label}</p>
                <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>⏰ Sent {delayLabel}</p>
              </div>
            </div>
            <button onClick={() => setSettings(s => ({ ...s, [`email${num}_enabled`]: !s[`email${num}_enabled`] }))}
              style={{ width:44, height:24, borderRadius:999, border:"none", background:settings[`email${num}_enabled`]?"#22c55e":"#E2E8F0", cursor:"pointer", position:"relative" }}>
              <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:settings[`email${num}_enabled`]?22:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
            </button>
          </div>
          <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px", textTransform:"uppercase" }}>Subject Line</p>
              <input value={settings[`email${num}_subject`]||""} onChange={e => setSettings(s => ({ ...s, [`email${num}_subject`]: e.target.value }))}
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
            </div>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px", textTransform:"uppercase" }}>Email Body <span style={{ fontWeight:400, textTransform:"none" }}>· use {"{name}"} for personalization</span></p>
              <textarea value={settings[`email${num}_body`]||""} onChange={e => setSettings(s => ({ ...s, [`email${num}_body`]: e.target.value }))}
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", minHeight:80, resize:"vertical" }}/>
            </div>
          </div>
        </div>
      ))}
      <button onClick={save} disabled={saving}
        style={{ padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
        {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Lead Email Settings"}
      </button>
    </div>
  );
}

export default function EmailManager() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [tab, setTab] = useState("templates");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("*").eq("key", "email_templates").single();
    if (data?.value) setTemplates(data.value);
    else {
      setTemplates(DEFAULT_TEMPLATES);
      await supabase.from("settings").upsert({ key:"email_templates", value:DEFAULT_TEMPLATES });
    }
    setLoading(false);
  };

  const save = async (newTemplates) => {
    setTemplates(newTemplates);
    await supabase.from("settings").upsert({ key:"email_templates", value:newTemplates });
  };

  const toggleActive = async (id) => {
    const updated = templates.map(t => t.id === id ? { ...t, active: !t.active } : t);
    await save(updated);
  };

  const duplicate = async (template) => {
    const copy = { ...template, id:`${template.id}_copy_${Date.now()}`, name:`${template.name} (Copy)`, trigger:"manual", active:false };
    await save([...templates, copy]);
  };

  const deleteTemplate = async (id) => {
    if (!confirm("Delete this email template?")) return;
    await save(templates.filter(t => t.id !== id));
  };

  const createNew = async () => {
    const newT = {
      id:`custom_${Date.now()}`,
      name:"New Email Template",
      subject:"Your subject line here",
      trigger:"manual",
      active:false,
      description:"Custom email template",
      content:{
        headerText:"Hello from 1Course!",
        bodyText:"Your message here.",
        buttonText:"Visit 1Course →",
        footerText:"© 2026 1Course. All rights reserved.",
        bgColor:"#0a081e",
        headerGradientStart:"#5B4EFF",
        headerGradientEnd:"#8B5CF6",
        cardBg:"#1a1830",
        greetingColor:"#5B4EFF",
        bodyTextColor:"rgba(255,255,255,0.7)",
        buttonColor:"#5B4EFF",
        buttonTextColor:"#ffffff",
        logoText:"✦ 1Course",
      }
    };
    const updated = [...templates, newT];
    await save(updated);
    router.push(`/admin/emails/${newT.id}`);
  };

  const activeTriggers = templates.filter(t => t.active);
  const inactiveTriggers = templates.filter(t => !t.active);

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Email Manager</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>{templates.length} templates · {activeTriggers.length} active automations</p>
          </div>
          <button onClick={createNew} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
            <Plus size={16}/> New Template
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {[
            { label:"Total Templates", value:templates.length, icon:"📧", color:"#6366f1" },
            { label:"Active Automations", value:activeTriggers.length, icon:"⚡", color:"#22c55e" },
            { label:"Paused", value:inactiveTriggers.length, icon:"⏸", color:"#f59e0b" },
            { label:"Manual Templates", value:templates.filter(t=>t.trigger==="manual").length, icon:"✉️", color:"#8b5cf6" },
          ].map((s,i) => (
            <div key={i} style={{ background:"#fff", borderRadius:16, padding:"20px", border:"1.5px solid #F1F5F9" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <p style={{ fontSize:28, fontWeight:900, color:s.color, margin:"0 0 2px" }}>{s.value}</p>
              <p style={{ fontSize:12, color:"#94A3B8", margin:0, fontWeight:600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", background:"#F1F5F9", borderRadius:12, padding:4 }}>
          {[["templates","📧 Templates"],["automations","⚡ Automation Flow"],["leads","📬 Lead Emails"],["settings","⚙️ Settings"]].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:tab===v?"#fff":"transparent", fontWeight:700, fontSize:13, color:tab===v?"#0f172a":"#94A3B8", cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Templates Tab */}
        {tab === "templates" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {loading ? (
              <div style={{ textAlign:"center", padding:40 }}><Loader size={24} color="#94A3B8" className="bspin"/></div>
            ) : templates.map(template => {
              const trigger = TRIGGER_TYPES.find(t => t.value === template.trigger);
              return (
                <div key={template.id} style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px" }}>
                    {/* Status toggle */}
                    <button onClick={() => toggleActive(template.id)}
                      style={{ width:44, height:24, borderRadius:999, border:"none", background:template.active?"#22c55e":"#E2E8F0", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:template.active?22:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                    </button>

                    {/* Icon */}
                    <div style={{ width:44, height:44, borderRadius:12, background:trigger?.color+"15"||"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                      {trigger?.icon||"✉️"}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                        <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>{template.name}</h3>
                        <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:999, background:template.active?"#F0FDF4":"#F8FAFC", color:template.active?"#16a34a":"#94A3B8" }}>
                          {template.active?"Active":"Paused"}
                        </span>
                      </div>
                      <p style={{ fontSize:12, color:"#64748B", margin:"0 0 4px" }}>{template.description}</p>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:999, background:trigger?.color+"15"||"#F8FAFC", color:trigger?.color||"#64748B" }}>
                          {trigger?.icon} {trigger?.label||"Manual"}
                        </span>
                        <span style={{ fontSize:11, color:"#94A3B8" }}>Subject: {template.subject}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                      <button onClick={() => setPreviewTemplate(template)}
                        style={{ width:34, height:34, borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#6366f1" }}>
                        <Eye size={14}/>
                      </button>
                      <button onClick={() => duplicate(template)}
                        style={{ width:34, height:34, borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748B" }}>
                        <Copy size={14}/>
                      </button>
                      <button onClick={() => router.push(`/admin/emails/${template.id}`)}
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", fontSize:12, fontWeight:700, color:"#374151" }}>
                        <Edit2 size={12}/> Edit
                      </button>
                      <button onClick={() => deleteTemplate(template.id)}
                        style={{ width:34, height:34, borderRadius:9, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#ef4444" }}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Automation Flow Tab */}
        {tab === "automations" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"#EEF2FF", borderRadius:14, padding:"14px 18px", border:"1.5px solid #C7D2FE" }}>
              <p style={{ fontSize:13, fontWeight:600, color:"#4338CA", margin:0 }}>⚡ Automation flow shows the sequence of emails sent to users throughout their journey. Toggle each step on/off.</p>
            </div>
            {/* Flow visualization */}
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {TRIGGER_TYPES.map((trigger, i) => {
                const template = templates.find(t => t.trigger === trigger.value);
                return (
                  <div key={trigger.value}>
                    <div style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px", background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                      <div style={{ width:48, height:48, borderRadius:14, background:trigger.color+"15", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                        {trigger.icon}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:"0 0 2px" }}>{trigger.label}</p>
                        <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{trigger.desc}</p>
                        {template && <p style={{ fontSize:11, fontWeight:600, color:trigger.color, margin:"4px 0 0" }}>Template: {template.name}</p>}
                      </div>
                      {template ? (
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <button onClick={() => toggleActive(template.id)}
                            style={{ width:44, height:24, borderRadius:999, border:"none", background:template.active?"#22c55e":"#E2E8F0", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                            <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:template.active?22:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                          </button>
                          <span style={{ fontSize:12, fontWeight:700, color:template.active?"#22c55e":"#94A3B8" }}>{template.active?"Active":"Paused"}</span>
                          <button onClick={() => router.push(`/admin/emails/${template.id}`)}
                            style={{ padding:"7px 14px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:700, color:"#374151", cursor:"pointer" }}>
                            Edit →
                          </button>
                        </div>
                      ) : (
                        <button onClick={createNew}
                          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:9, border:"1.5px dashed #C7D2FE", background:"#EEF2FF", fontSize:12, fontWeight:700, color:"#6366f1", cursor:"pointer" }}>
                          <Plus size={12}/> Add Template
                        </button>
                      )}
                    </div>
                    {i < TRIGGER_TYPES.length - 1 && (
                      <div style={{ display:"flex", justifyContent:"center", padding:"4px 0" }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                          <div style={{ width:1, height:12, background:"#E2E8F0" }}/>
                          <ArrowRight size={12} color="#CBD5E1" style={{ transform:"rotate(90deg)" }}/>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:600 }}>
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Email Provider</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  ["Provider", "Resend"],
                  ["From Domain", "kingbrandsbro.pro"],
                  ["From Address", "noreply@kingbrandsbro.pro"],
                  ["Domain Status", "✅ Verified"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:"#F8FAFC", borderRadius:10 }}>
                    <span style={{ fontSize:13, color:"#64748B" }}>{k}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Global Settings</h3>
              {[
                { label:"Send Welcome Email", desc:"After successful payment", key:"send_welcome" },
                { label:"Send Expiry Warnings", desc:"3 days and 1 day before expiry", key:"send_expiry" },
                { label:"Send Expired Email", desc:"When subscription ends", key:"send_expired" },
                { label:"Send Renewal Receipts", desc:"For auto-renew payments", key:"send_renewal" },
              ].map(item => (
                <div key={item.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #F8FAFC" }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:"0 0 2px" }}>{item.label}</p>
                    <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{item.desc}</p>
                  </div>
                  <div style={{ width:44, height:24, borderRadius:999, background:"#22c55e", position:"relative", cursor:"pointer" }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:22, boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lead Emails Tab */}
      {tab === "leads" && (
        <LeadEmailsTab />
      )}
      {/* Preview Modal */}
      {previewTemplate && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={() => setPreviewTemplate(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:600, maxHeight:"90vh", overflow:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>Preview: {previewTemplate.name}</h3>
              <button onClick={() => setPreviewTemplate(null)} style={{ width:30, height:30, borderRadius:"50%", border:"none", background:"#F1F5F9", cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ padding:20 }}>
              <div style={{ background:"#F8FAFC", borderRadius:8, padding:"10px 14px", marginBottom:12, border:"1px solid #E2E8F0" }}>
                <p style={{ fontSize:12, color:"#64748B", margin:"0 0 2px" }}>Subject: <strong>{previewTemplate.subject}</strong></p>
                <p style={{ fontSize:12, color:"#64748B", margin:0 }}>Trigger: <strong>{TRIGGER_TYPES.find(t=>t.value===previewTemplate.trigger)?.label}</strong></p>
              </div>
              <div dangerouslySetInnerHTML={{ __html: generatePreviewHtml(previewTemplate.content, "John Smith", "john@example.com", "testPass123!") }}/>
            </div>
            <div style={{ padding:"14px 20px", borderTop:"1px solid #F1F5F9", display:"flex", gap:10 }}>
              <button onClick={() => { setPreviewTemplate(null); router.push(`/admin/emails/${previewTemplate.id}`); }}
                style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                Edit Template →
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}

function generatePreviewHtml(c, name, email, password) {
  return `
    <div style="font-family:sans-serif;background:${c.bgColor};color:#fff;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,${c.headerGradientStart},${c.headerGradientEnd});padding:32px;text-align:center">
        <h1 style="margin:0;font-size:24px;font-weight:900">${c.logoText||"✦ 1Course"}</h1>
        <p style="margin:8px 0 0;opacity:0.85">${c.headerText}</p>
      </div>
      <div style="padding:28px">
        <h2 style="color:${c.greetingColor};margin:0 0 12px">Congratulations, ${name}! 🎉</h2>
        <p style="color:${c.bodyTextColor};line-height:1.7;margin:0 0 20px">${c.bodyText}</p>
        <div style="background:${c.cardBg};border-radius:12px;padding:20px;margin:0 0 20px;border:1px solid rgba(255,255,255,0.1)">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Email</p>
          <p style="margin:0 0 16px;font-weight:700;color:#a78bfa">${email}</p>
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Temporary Password</p>
          <p style="margin:0;font-weight:900;font-size:20px;color:#fff;background:rgba(91,78,255,0.2);padding:10px;border-radius:8px;text-align:center;font-family:monospace">${password}</p>
        </div>
        <div style="text-align:center">
          <a href="#" style="display:inline-block;padding:14px 28px;background:${c.buttonColor};color:${c.buttonTextColor};text-decoration:none;border-radius:12px;font-weight:700">${c.buttonText}</a>
        </div>
      </div>
      <div style="padding:16px 28px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">${c.footerText}</p>
      </div>
    </div>
  `;
}
