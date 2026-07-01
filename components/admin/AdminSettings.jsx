"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Check, Loader, Globe, Shield, Bell, CreditCard, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULTS = {
  site_name: "1Course",
  site_url: "https://1course-six.vercel.app",
  support_email: "support@kingbrandsbro.pro",
  maintenance_mode: false,
  allow_signups: true,
  subscription_grace_period_days: 2,
  lock_on_expiry: true,
  notify_new_user: true,
  notify_payment: true,
  notify_expiring: true,
  expiry_warning_days: 3,
};

export default function AdminSettings() {
  const [s, setS] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const u = (k, v) => setS(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    supabase.from("settings").select("*").eq("key", "platform_settings").single().then(({ data }) => {
      if (data?.value) setS({ ...DEFAULTS, ...data.value });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase.from("settings").upsert({ key:"platform_settings", value:s });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  if (loading) return <AdminLayout><div style={{ padding:60, textAlign:"center" }}><Loader size={28} color="#94A3B8" className="bspin"/></div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:720 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Settings</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>Configure your platform</p>
          </div>
          <button onClick={save} disabled={saving} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 22px", borderRadius:12, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            {saving?<><Loader size={14} className="bspin"/> Saving...</>:saved?<><Check size={14}/> Saved!</>:<><Save size={14}/> Save Settings</>}
          </button>
        </div>

        {/* General */}
        <Section icon={<Globe size={16}/>} title="General">
          <Field label="Site Name">
            <input value={s.site_name} onChange={e=>u("site_name",e.target.value)} style={inp()}/>
          </Field>
          <Field label="Site URL">
            <input value={s.site_url} onChange={e=>u("site_url",e.target.value)} style={inp()}/>
          </Field>
          <Field label="Support Email">
            <input value={s.support_email} onChange={e=>u("support_email",e.target.value)} style={inp()}/>
          </Field>
        </Section>

        {/* Access */}
        <Section icon={<Shield size={16}/>} title="Access Control">
          <Toggle label="Maintenance Mode" hint="Blocks all users from accessing the site" value={s.maintenance_mode} onChange={v=>u("maintenance_mode",v)}/>
          <Toggle label="Allow New Signups" hint="Let new users create accounts after payment" value={s.allow_signups} onChange={v=>u("allow_signups",v)}/>
          <Toggle label="Lock on Expiry" hint="Block access immediately when subscription expires" value={s.lock_on_expiry} onChange={v=>u("lock_on_expiry",v)}/>
          <Field label="Grace Period (days)" hint="Extra days after expiry before locking account">
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <input type="number" min={0} max={30} value={s.subscription_grace_period_days} onChange={e=>u("subscription_grace_period_days",parseInt(e.target.value)||0)} style={{ ...inp(), width:100 }}/>
              <span style={{ fontSize:13, color:"#64748B" }}>days after expiry before locking</span>
            </div>
          </Field>
          <Field label="Expiry Warning (days)" hint="Show warning banner X days before expiry">
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <input type="number" min={1} max={30} value={s.expiry_warning_days} onChange={e=>u("expiry_warning_days",parseInt(e.target.value)||3)} style={{ ...inp(), width:100 }}/>
              <span style={{ fontSize:13, color:"#64748B" }}>days before expiry</span>
            </div>
          </Field>
        </Section>

        {/* Notifications */}
        <Section icon={<Bell size={16}/>} title="Admin Notifications">
          <Toggle label="New User Alert" hint="Notify when someone signs up" value={s.notify_new_user} onChange={v=>u("notify_new_user",v)}/>
          <Toggle label="Payment Alert" hint="Notify when a payment is made" value={s.notify_payment} onChange={v=>u("notify_payment",v)}/>
          <Toggle label="Expiring Soon Alert" hint="Notify when a subscription is about to expire" value={s.notify_expiring} onChange={v=>u("notify_expiring",v)}/>
        </Section>

        {/* Payment */}
        <Section icon={<CreditCard size={16}/>} title="Payment">
          <div style={{ background:"#F8FAFC", borderRadius:12, padding:"14px 16px", border:"1.5px solid #E2E8F0" }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#374151", margin:"0 0 4px" }}>Stripe Mode</p>
            <p style={{ fontSize:13, color:"#64748B", margin:0 }}>Currently in <strong>Test Mode</strong>. Switch to live in your Stripe dashboard and update your environment variables.</p>
          </div>
          <div style={{ background:"#F8FAFC", borderRadius:12, padding:"14px 16px", border:"1.5px solid #E2E8F0" }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#374151", margin:"0 0 4px" }}>Webhook URL</p>
            <p style={{ fontSize:12, color:"#6366f1", margin:0, fontFamily:"monospace" }}>{s.site_url}/api/stripe/webhook</p>
          </div>
        </Section>

        {/* Email */}
        <Section icon={<Mail size={16}/>} title="Email">
          <div style={{ background:"#F8FAFC", borderRadius:12, padding:"14px 16px", border:"1.5px solid #E2E8F0" }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#374151", margin:"0 0 4px" }}>Email Provider</p>
            <p style={{ fontSize:13, color:"#64748B", margin:0 }}>Using <strong>Resend</strong> with domain <strong>kingbrandsbro.pro</strong>. Design your emails in the <a href="/admin/emails" style={{ color:"#6366f1", fontWeight:600, textDecoration:"none" }}>Email Builder</a>.</p>
          </div>
        </Section>
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
      <div style={{ padding:"16px 24px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ color:"#6366f1" }}>{icon}</div>
        <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>{title}</h3>
      </div>
      <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
        {label} {hint && <span style={{ color:"#94A3B8", fontWeight:400 }}>· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, hint, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:"0 0 2px" }}>{label}</p>
        {hint && <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{hint}</p>}
      </div>
      <button onClick={() => onChange(!value)} style={{ width:44, height:24, borderRadius:999, border:"none", background:value?"#5B4EFF":"#E2E8F0", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
        <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:value?22:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
      </button>
    </div>
  );
}

const inp = () => ({ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" });
