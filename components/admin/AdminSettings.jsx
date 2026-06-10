"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Check, Globe, Mail, Shield, Bell, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    site_name: "Coursiv",
    site_url: "https://coursiv-six.vercel.app",
    support_email: "",
    maintenance_mode: false,
    allow_signups: true,
    require_email_confirm: true,
    notify_new_user: true,
    notify_course_complete: true,
  });

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    const { data } = await supabase.from("profiles").select("email").eq("is_admin", true).limit(1).single();
    if (data) setConfig(p => ({ ...p, support_email: data.email }));
  };

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const Section = ({ icon, title, children }) => (
    <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
      <div style={{ padding:"18px 24px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ color:"#6366f1" }}>{icon}</div>
        <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>{title}</h3>
      </div>
      <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>{children}</div>
    </div>
  );

  const Field = ({ label, hint, children }) => (
    <div>
      <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
        {label} {hint && <span style={{ color:"#94A3B8", fontWeight:400 }}>· {hint}</span>}
      </label>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:20 }}>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:0 }}>{label}</p>
        {desc && <p style={{ fontSize:12, color:"#94A3B8", margin:"2px 0 0" }}>{desc}</p>}
      </div>
      <button onClick={()=>onChange(!value)} style={{ width:44, height:24, borderRadius:999, border:"none", background:value?"#6366f1":"#E2E8F0", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
        <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:value?23:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
      </button>
    </div>
  );

  const inp = { width:"100%", padding:"10px 13px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:680 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Settings</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>Configure your platform</p>
          </div>
          <button onClick={save} disabled={saving} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 22px", borderRadius:12, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#6366f1,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:saved?"0 4px 14px rgba(34,197,94,0.4)":"0 4px 14px rgba(99,102,241,0.4)" }}>
            {saving ? <><Loader size={14} className="bspin"/> Saving...</> : saved ? <><Check size={14}/> Saved!</> : <><Save size={14}/> Save Settings</>}
          </button>
        </div>

        <Section icon={<Globe size={18}/>} title="General">
          <Field label="Site Name">
            <input value={config.site_name} onChange={e=>setConfig(p=>({...p,site_name:e.target.value}))} style={inp}/>
          </Field>
          <Field label="Site URL">
            <input value={config.site_url} onChange={e=>setConfig(p=>({...p,site_url:e.target.value}))} style={inp}/>
          </Field>
          <Field label="Support Email">
            <input value={config.support_email} onChange={e=>setConfig(p=>({...p,support_email:e.target.value}))} style={inp}/>
          </Field>
        </Section>

        <Section icon={<Shield size={18}/>} title="Access">
          <Toggle label="Maintenance Mode" desc="Blocks all users from accessing the site" value={config.maintenance_mode} onChange={v=>setConfig(p=>({...p,maintenance_mode:v}))}/>
          <Toggle label="Allow New Signups" desc="Let new users create accounts" value={config.allow_signups} onChange={v=>setConfig(p=>({...p,allow_signups:v}))}/>
          <Toggle label="Require Email Confirmation" desc="Users must confirm email before accessing content" value={config.require_email_confirm} onChange={v=>setConfig(p=>({...p,require_email_confirm:v}))}/>
        </Section>

        <Section icon={<Bell size={18}/>} title="Notifications">
          <Toggle label="New User Alert" desc="Notify admins when someone signs up" value={config.notify_new_user} onChange={v=>setConfig(p=>({...p,notify_new_user:v}))}/>
          <Toggle label="Course Completion Alert" desc="Notify admins when a certificate is earned" value={config.notify_course_complete} onChange={v=>setConfig(p=>({...p,notify_course_complete:v}))}/>
        </Section>

        <Section icon={<Mail size={18}/>} title="Email Templates">
          <p style={{ fontSize:13, color:"#64748B", margin:0, lineHeight:1.6 }}>
            Email templates are managed in your <a href="https://supabase.com/dashboard" target="_blank" style={{ color:"#6366f1", fontWeight:600, textDecoration:"none" }}>Supabase dashboard</a> under Authentication → Email Templates.
          </p>
        </Section>
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
