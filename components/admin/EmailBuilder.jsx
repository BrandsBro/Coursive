"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Check, Loader, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULT = {
  subject: "🎉 Welcome to Coursiv! Your login details inside",
  logoText: "✦ Coursiv",
  logoAlign: "center",
  headerText: "Welcome aboard!",
  headerAlign: "center",
  greetingText: "Congratulations, {name}! 🎉",
  greetingAlign: "left",
  greetingColor: "#5B4EFF",
  bodyText: "Your payment was successful! Use the details below to log in:",
  bodyAlign: "left",
  bodyTextColor: "rgba(255,255,255,0.7)",
  buttonText: "Log In to Coursiv →",
  buttonAlign: "center",
  buttonColor: "#5B4EFF",
  buttonTextColor: "#ffffff",
  footerText: "© 2026 Coursiv. All rights reserved.",
  footerAlign: "center",
  bgColor: "#0a081e",
  headerGradientStart: "#5B4EFF",
  headerGradientEnd: "#8B5CF6",
  cardBg: "#1a1830",
  fromName: "Coursiv",
  fromEmail: "noreply@kingbrandsbro.pro",
};

export default function EmailBuilder() {
  const [t, setT] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);
  const [tab, setTab] = useState("content");

  const u = (k, v) => setT(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    supabase.from("settings").select("*").eq("key","email_template").single().then(({ data }) => {
      if (data?.value) setT({ ...DEFAULT, ...data.value });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase.from("settings").upsert({ key:"email_template", value:t });
    setSaved(true); setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const sendTest = async () => {
    if (!testEmail) return;
    setSending(true);
    await fetch("/api/send-email", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ to:testEmail, subject:t.subject, html:generateHtml(t,"John Smith",testEmail,"testPass123!") }),
    });
    setSentOk(true); setTimeout(() => setSentOk(false), 3000);
    setSending(false);
  };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 64px)" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", borderBottom:"1px solid #E2E8F0", background:"#fff", flexShrink:0 }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:900, color:"#0f172a", margin:0 }}>Email Builder</h1>
            <p style={{ color:"#64748B", fontSize:13, margin:0 }}>Design your welcome email</p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <input value={testEmail} onChange={e=>setTestEmail(e.target.value)} placeholder="test@gmail.com" style={{ padding:"8px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, width:200, outline:"none" }}/>
            <button onClick={sendTest} disabled={sending||!testEmail} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              {sending?<Loader size={14} className="bspin"/>:sentOk?<Check size={14} color="#22c55e"/>:<Send size={14}/>}
              {sentOk?"Sent!":"Send Test"}
            </button>
            <button onClick={save} disabled={saving} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {saving?<Loader size={14} className="bspin"/>:saved?<Check size={14}/>:<Save size={14}/>}
              {saved?"Saved!":"Save"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"360px 1fr", overflow:"hidden" }}>
          {/* Left */}
          <div style={{ overflow:"auto", padding:20, borderRight:"1px solid #E2E8F0", background:"#FAFBFC" }}>
            {/* Tabs */}
            <div style={{ display:"flex", background:"#F1F5F9", borderRadius:10, padding:3, marginBottom:20 }}>
              {["content","design","sender"].map(tab2 => (
                <button key={tab2} onClick={() => setTab(tab2)} style={{ flex:1, padding:"7px", borderRadius:8, border:"none", background:tab===tab2?"#fff":"transparent", fontWeight:700, fontSize:12, color:tab===tab2?"#0f172a":"#94A3B8", cursor:"pointer", textTransform:"capitalize" }}>
                  {tab2}
                </button>
              ))}
            </div>

            {tab === "content" && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <TextBlock label="Logo text" value={t.logoText} onChange={v=>u("logoText",v)} align={t.logoAlign} onAlign={v=>u("logoAlign",v)}/>
                <TextBlock label="Header subtitle" value={t.headerText} onChange={v=>u("headerText",v)} align={t.headerAlign} onAlign={v=>u("headerAlign",v)}/>
                <TextBlock label="Greeting" value={t.greetingText} onChange={v=>u("greetingText",v)} align={t.greetingAlign} onAlign={v=>u("greetingAlign",v)} hint="Use {name} for customer name"/>
                <TextBlock label="Body text" value={t.bodyText} onChange={v=>u("bodyText",v)} align={t.bodyAlign} onAlign={v=>u("bodyAlign",v)} multiline/>
                <TextBlock label="Button text" value={t.buttonText} onChange={v=>u("buttonText",v)} align={t.buttonAlign} onAlign={v=>u("buttonAlign",v)}/>
                <TextBlock label="Footer text" value={t.footerText} onChange={v=>u("footerText",v)} align={t.footerAlign} onAlign={v=>u("footerAlign",v)}/>
                <TextBlock label="Subject line" value={t.subject} onChange={v=>u("subject",v)}/>
              </div>
            )}

            {tab === "design" && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <Section label="Header gradient">
                  <ColorRow label="Start color" value={t.headerGradientStart} onChange={v=>u("headerGradientStart",v)}/>
                  <ColorRow label="End color" value={t.headerGradientEnd} onChange={v=>u("headerGradientEnd",v)}/>
                </Section>
                <Section label="Body">
                  <ColorRow label="Background" value={t.bgColor} onChange={v=>u("bgColor",v)}/>
                  <ColorRow label="Card background" value={t.cardBg} onChange={v=>u("cardBg",v)}/>
                </Section>
                <Section label="Text">
                  <ColorRow label="Greeting color" value={t.greetingColor} onChange={v=>u("greetingColor",v)}/>
                  <ColorRow label="Body text color" value={t.bodyTextColor.startsWith("#")?t.bodyTextColor:"#aaaaaa"} onChange={v=>u("bodyTextColor",v)}/>
                </Section>
                <Section label="Button">
                  <ColorRow label="Button color" value={t.buttonColor} onChange={v=>u("buttonColor",v)}/>
                  <ColorRow label="Button text color" value={t.buttonTextColor} onChange={v=>u("buttonTextColor",v)}/>
                </Section>
              </div>
            )}

            {tab === "sender" && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <Section label="From name">
                  <input value={t.fromName} onChange={e=>u("fromName",e.target.value)} style={inp()}/>
                </Section>
                <Section label="From email">
                  <input value={t.fromEmail} onChange={e=>u("fromEmail",e.target.value)} style={inp()}/>
                  <p style={{ fontSize:11, color:"#94A3B8", margin:"6px 0 0" }}>Must be from verified domain in Resend</p>
                </Section>
              </div>
            )}
          </div>

          {/* Right - preview */}
          <div style={{ overflow:"auto", padding:32, background:"#E2E8F0", display:"flex", justifyContent:"center" }}>
            <div style={{ width:"100%", maxWidth:600 }}>
              <div style={{ background:"#fff", borderRadius:8, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}>
                <div style={{ background:"#F8FAFC", padding:"12px 16px", borderBottom:"1px solid #E2E8F0" }}>
                  <p style={{ fontSize:12, color:"#64748B", margin:"0 0 2px" }}>From: <strong>{t.fromName}</strong> &lt;{t.fromEmail}&gt;</p>
                  <p style={{ fontSize:12, color:"#0f172a", margin:0 }}>Subject: <strong>{t.subject}</strong></p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: generateHtml(t,"John Smith","john@example.com","testPass123!") }}/>
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
      <p style={{ fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:0.5, margin:"0 0 8px" }}>{label}</p>
      {hint && <p style={{ fontSize:10, color:"#94A3B8", margin:"0 0 6px" }}>{hint}</p>}
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} style={{ ...inp(), minHeight:70, resize:"vertical" }}/>
        : <input value={value} onChange={e=>onChange(e.target.value)} style={inp()}/>
      }
      {onAlign && (
        <div style={{ display:"flex", gap:6, marginTop:8 }}>
          {[["left","⬅"],["center","⬆"],["right","➡"]].map(([a,icon]) => (
            <button key={a} onClick={() => onAlign(a)}
              style={{ flex:1, padding:"6px", borderRadius:8, border:`1.5px solid ${align===a?"#5B4EFF":"#E2E8F0"}`, background:align===a?"#EEF2FF":"#F8FAFC", fontSize:11, fontWeight:700, color:align===a?"#5B4EFF":"#94A3B8", cursor:"pointer" }}>
              {icon} {a.charAt(0).toUpperCase()+a.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
      <span style={{ fontSize:13, color:"#374151", fontWeight:500 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type="color" value={value.startsWith("#")?value:"#ffffff"} onChange={e=>onChange(e.target.value)} style={{ width:36, height:36, borderRadius:8, border:"1.5px solid #E2E8F0", cursor:"pointer", padding:2 }}/>
        <input value={value} onChange={e=>onChange(e.target.value)} style={{ ...inp(), width:120, fontSize:12 }}/>
      </div>
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

function generateHtml(t, name, email, password) {
  const greeting = (t.greetingText||"Congratulations, {name}! 🎉").replace("{name}", name);
  return `
    <div style="font-family:sans-serif;background:${t.bgColor};color:#fff;padding:0;margin:0">
      <div style="background:linear-gradient(135deg,${t.headerGradientStart},${t.headerGradientEnd});padding:40px 32px;text-align:${t.logoAlign||'center'}">
        <h1 style="margin:0;font-size:28px;font-weight:900;color:#fff;text-align:${t.logoAlign||'center'}">${t.logoText||'✦ Coursiv'}</h1>
        <p style="margin:8px 0 0;opacity:0.85;color:#fff;font-size:15px;text-align:${t.headerAlign||'center'}">${t.headerText}</p>
      </div>
      <div style="padding:32px">
        <h2 style="font-size:22px;margin:0 0 12px;color:${t.greetingColor};text-align:${t.greetingAlign||'left'}">${greeting}</h2>
        <p style="color:${t.bodyTextColor};line-height:1.7;margin:0 0 20px;font-size:15px;text-align:${t.bodyAlign||'left'}">${t.bodyText}</p>
        <div style="background:${t.cardBg};border-radius:12px;padding:24px;margin:0 0 20px;border:1px solid rgba(255,255,255,0.1)">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px">Email</p>
          <p style="margin:0 0 20px;font-weight:700;font-size:16px;color:#a78bfa">${email}</p>
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px">Temporary Password</p>
          <p style="margin:0;font-weight:900;font-size:22px;color:#fff;letter-spacing:2px;background:rgba(91,78,255,0.2);padding:12px;border-radius:8px;text-align:center;font-family:monospace">${password}</p>
        </div>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 24px">You can change your password anytime from your profile settings.</p>
        <div style="text-align:${t.buttonAlign||'center'}">
          <a href="#" style="display:inline-block;padding:16px 28px;background:${t.buttonColor};color:${t.buttonTextColor};text-decoration:none;border-radius:12px;font-weight:700;font-size:16px">
            ${t.buttonText}
          </a>
        </div>
      </div>
      <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:${t.footerAlign||'center'}">
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">${t.footerText}</p>
      </div>
    </div>
  `;
}

const inp = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
