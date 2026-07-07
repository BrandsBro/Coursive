"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Check, Loader, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PaymentSettings() {
  const [settings, setSettings] = useState({
    mode: "test", // test or live
    testPublishableKey: "",
    testSecretKey: "",
    livePublishableKey: "",
    liveSecretKey: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("value").eq("key","payment_settings").single();
    if (data?.value) setSettings({ ...settings, ...data.value });
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    await supabase.from("settings").upsert({ key:"payment_settings", value:settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const u = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  if (loading) return <AdminLayout><div style={{ padding:60, textAlign:"center" }}><Loader size={28} color="#94A3B8"/></div></AdminLayout>;

  const isLive = settings.mode === "live";

  return (
    <AdminLayout>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Payment Settings</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>Manage Stripe keys and payment mode</p>
          </div>
          <button onClick={save} disabled={saving}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:12, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
            {saving?<><Loader size={14}/> Saving...</>:saved?<><Check size={14}/> Saved!</>:<><Save size={14}/> Save Changes</>}
          </button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

          {/* Mode Toggle */}
          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>Payment Mode</h3>
            <p style={{ fontSize:13, color:"#64748B", margin:"0 0 20px" }}>Switch between test and live Stripe environment</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[["test","🧪 Test Mode","Safe for testing — no real charges","#f59e0b","#FFFBEB","#FDE68A"],
                ["live","🚀 Live Mode","Real payments — charges actual cards","#22c55e","#F0FDF4","#BBF7D0"]
              ].map(([val, label, desc, color, bg, border]) => (
                <button key={val} onClick={() => u("mode", val)}
                  style={{ padding:"16px", borderRadius:14, border:`2px solid ${settings.mode===val?color:border}`, background:settings.mode===val?bg:"#fff", cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}>
                  <p style={{ fontSize:15, fontWeight:800, color:settings.mode===val?color:"#374151", margin:"0 0 4px" }}>{label}</p>
                  <p style={{ fontSize:12, color:"#64748B", margin:0 }}>{desc}</p>
                  {settings.mode===val && (
                    <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:8 }}>
                      <CheckCircle size={12} color={color}/>
                      <span style={{ fontSize:11, fontWeight:700, color }}> Active</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {isLive && (
              <div style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"12px 16px", background:"#FEF2F2", borderRadius:12, border:"1.5px solid #FECACA", marginTop:16 }}>
                <AlertTriangle size={16} color="#dc2626" style={{ flexShrink:0, marginTop:2 }}/>
                <p style={{ fontSize:13, color:"#991B1B", margin:0, lineHeight:1.5 }}>
                  <strong>Live mode is active.</strong> Real payments will be processed. Make sure your Stripe account is fully verified.
                </p>
              </div>
            )}
          </div>

          {/* Test Keys */}
          <div style={{ background:"#fff", borderRadius:20, border:`1.5px solid ${!isLive?"#FDE68A":"#F1F5F9"}`, padding:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>🧪 Test Keys</h3>
              {!isLive && <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:999, background:"#FFFBEB", color:"#92400e", border:"1px solid #FDE68A" }}>ACTIVE</span>}
            </div>
            <p style={{ fontSize:13, color:"#64748B", margin:"0 0 16px" }}>Stripe test keys — starts with pk_test_ and sk_test_</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>Publishable Key</label>
                <input value={settings.testPublishableKey||""} onChange={e => u("testPublishableKey", e.target.value)}
                  placeholder="pk_test_..."
                  style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"monospace" }}/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>Secret Key</label>
                <input type="password" value={settings.testSecretKey||""} onChange={e => u("testSecretKey", e.target.value)}
                  placeholder="sk_test_..."
                  style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"monospace" }}/>
              </div>
            </div>
          </div>

          {/* Live Keys */}
          <div style={{ background:"#fff", borderRadius:20, border:`1.5px solid ${isLive?"#BBF7D0":"#F1F5F9"}`, padding:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>🚀 Live Keys</h3>
              {isLive && <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:999, background:"#F0FDF4", color:"#166534", border:"1px solid #BBF7D0" }}>ACTIVE</span>}
            </div>
            <p style={{ fontSize:13, color:"#64748B", margin:"0 0 16px" }}>Stripe live keys — starts with pk_live_ and sk_live_</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>Publishable Key</label>
                <input value={settings.livePublishableKey||""} onChange={e => u("livePublishableKey", e.target.value)}
                  placeholder="pk_live_..."
                  style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"monospace" }}/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>Secret Key</label>
                <input type="password" value={settings.liveSecretKey||""} onChange={e => u("liveSecretKey", e.target.value)}
                  placeholder="sk_live_..."
                  style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"monospace" }}/>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ background:"#EEF2FF", borderRadius:16, border:"1.5px solid #C7D2FE", padding:20 }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:"#4338CA", margin:"0 0 10px" }}>📌 How it works</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[
                "Save your keys here — they are stored securely in Supabase",
                "Switch mode to Live when you're ready to accept real payments",
                "The active mode's keys will be used for all new payments",
                "Get your keys from stripe.com → Developers → API Keys",
              ].map((tip, i) => (
                <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                  <span style={{ fontSize:12, color:"#6366f1", fontWeight:700, flexShrink:0 }}>{i+1}.</span>
                  <span style={{ fontSize:13, color:"#4338CA" }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
