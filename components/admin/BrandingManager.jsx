"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Check, Loader, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULT_BRANDING = {
  logoMain: "",
  logoApp: "",
  favicon: "",
  siteName: "1Course",
};

export default function BrandingManager() {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("*").eq("key","branding").single();
    if (data?.value) setBranding({ ...DEFAULT_BRANDING, ...data.value });
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    await supabase.from("settings").upsert({ key:"branding", value:branding });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const u = (key, val) => setBranding(prev => ({ ...prev, [key]: val }));

  const handleUpload = async (key, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [key]: true }));
    const ext = file.name.split(".").pop();
    const path = `branding/${key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("lesson-media").upload(path, file, { upsert:true });
    if (error) { alert("Upload failed: " + error.message); setUploading(prev => ({ ...prev, [key]: false })); return; }
    const { data: urlData } = supabase.storage.from("lesson-media").getPublicUrl(path);
    u(key, urlData.publicUrl);
    setUploading(prev => ({ ...prev, [key]: false }));
  };

  if (loading) return <AdminLayout><div style={{ padding:60, textAlign:"center" }}><Loader size={28} color="#94A3B8" className="bspin"/></div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Branding</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>Manage your logos and favicon</p>
          </div>
          <button onClick={save} disabled={saving}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:12, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
            {saving?<><Loader size={14} className="bspin"/> Saving...</>:saved?<><Check size={14}/> Saved!</>:<><Save size={14}/> Save Changes</>}
          </button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Logo - Marketing/Auth */}
          <BrandCard
            title="Marketing Logo"
            subtitle="Shown on homepage, login, quiz pages — use white/light version"
            bgPreview="#1e1b4b"
            value={branding.logoMain}
            onChange={v => u("logoMain", v)}
            onUpload={f => handleUpload("logoMain", f)}
            uploading={uploading.logoMain}
          />

          {/* Logo - App/Dashboard */}
          <BrandCard
            title="App Logo"
            subtitle="Shown in navbar after login — use dark/black version"
            bgPreview="#fff"
            value={branding.logoApp}
            onChange={v => u("logoApp", v)}
            onUpload={f => handleUpload("logoApp", f)}
            uploading={uploading.logoApp}
          />

          {/* Favicon */}
          <BrandCard
            title="Favicon"
            subtitle="Small icon shown in browser tab — use square PNG or ICO (32x32 or 64x64)"
            bgPreview="#F8FAFC"
            value={branding.favicon}
            onChange={v => u("favicon", v)}
            onUpload={f => handleUpload("favicon", f)}
            uploading={uploading.favicon}
            isFavicon
          />

          {/* Site Name */}
          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>Site Name</h3>
            <p style={{ fontSize:13, color:"#64748B", margin:"0 0 16px" }}>Used in page titles and emails</p>
            <input
              value={branding.siteName||""}
              onChange={e => u("siteName", e.target.value)}
              placeholder="1Course"
              style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:15, fontWeight:600, outline:"none", boxSizing:"border-box" }}
            />
          </div>

          {/* Instructions */}
          <div style={{ background:"#EEF2FF", borderRadius:16, border:"1.5px solid #C7D2FE", padding:20 }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:"#4338CA", margin:"0 0 10px" }}>📌 How to apply changes</h3>
            <p style={{ fontSize:13, color:"#4338CA", margin:"0 0 8px", lineHeight:1.6 }}>After saving, update your code to use these URLs:</p>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[
                ["Navbar (after login)", "components/layout/Navbar.jsx"],
                ["Auth pages (login/quiz)", "components/auth/AuthPage.jsx + components/quiz/QuizFlow.jsx"],
                ["Admin sidebar", "components/admin/AdminLayout.jsx"],
                ["Favicon", "app/layout.jsx or app/(marketing)/layout.jsx"],
              ].map(([l,f]) => (
                <div key={l} style={{ display:"flex", gap:8 }}>
                  <span style={{ fontSize:12, color:"#6366f1", fontWeight:700, minWidth:160 }}>{l}</span>
                  <span style={{ fontSize:12, color:"#64748B", fontFamily:"monospace" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}

function BrandCard({ title, subtitle, bgPreview, value, onChange, onUpload, uploading, isFavicon }) {
  return (
    <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
      <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>{title}</h3>
      <p style={{ fontSize:13, color:"#64748B", margin:"0 0 20px" }}>{subtitle}</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Preview */}
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:0.5 }}>Preview</p>
          <div style={{ background:bgPreview, borderRadius:14, border:"1.5px solid #E2E8F0", height:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
            {value ? (
              isFavicon ? (
                <img src={value} alt={title} style={{ width:32, height:32, objectFit:"contain" }}/>
              ) : (
                <img src={value} alt={title} style={{ maxHeight:60, maxWidth:"100%", objectFit:"contain" }}/>
              )
            ) : (
              <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>No image set</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:0.5 }}>Upload File</p>
            <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", borderRadius:12, border:"1.5px dashed #C7D2FE", background:"#EEF2FF", color:"#5B4EFF", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {uploading ? <><Loader size={14} className="bspin"/> Uploading...</> : <><Upload size={14}/> Upload</>}
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => onUpload(e.target.files[0])}/>
            </label>
          </div>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:0.5 }}>Or paste URL</p>
            <input
              value={value||""}
              onChange={e => onChange(e.target.value)}
              placeholder="https://..."
              style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:12, outline:"none", boxSizing:"border-box" }}
            />
          </div>
          {value && (
            <button onClick={() => onChange("")}
              style={{ padding:"8px", borderRadius:10, border:"1.5px solid #FEE2E2", background:"#fff", color:"#ef4444", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
