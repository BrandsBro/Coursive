"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Trash2, Eye, Bell, Loader, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const TYPES = [
  { value:"info",         label:"Info",         color:"#6366f1", bg:"#EEF2FF", icon:"ℹ️" },
  { value:"success",      label:"Success",      color:"#22c55e", bg:"#F0FDF4", icon:"✅" },
  { value:"warning",      label:"Warning",      color:"#f59e0b", bg:"#FFFBEB", icon:"⚠️" },
  { value:"error",        label:"Error",        color:"#ef4444", bg:"#FEF2F2", icon:"🚨" },
  { value:"announcement", label:"Announcement", color:"#8b5cf6", bg:"#F5F3FF", icon:"📢" },
  { value:"promotion",    label:"Promotion",    color:"#ec4899", bg:"#FDF2F8", icon:"🎁" },
];

const TARGETS = [
  { value:"all",      label:"All Users",           icon:"👥", desc:"Send to everyone" },
  { value:"active",   label:"Active Subscribers",  icon:"✅", desc:"Users with active plan" },
  { value:"expired",  label:"Expired Users",        icon:"⏰", desc:"Users whose plan expired" },
  { value:"plan",     label:"Specific Plan",        icon:"📋", desc:"Users on a specific plan" },
  { value:"specific", label:"Specific Users",       icon:"🎯", desc:"Pick individual users" },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [preview, setPreview] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [{ data: notifs }, { data: profiles }] = await Promise.all([
      supabase.from("notifications").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email").order("full_name"),
    ]);
    setNotifications(notifs || []);
    setUsers(profiles || []);
    setLoading(false);
  };

  const sendNotification = async () => {
    if (!title || !message) return;
    setSending(true);
    const typeDef = TYPES.find(t => t.value === type);
    const expiresAt = expiresIn === "never" ? null :
      new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from("notifications").insert({
      title,
      message,
      type,
      target,
      target_plan: target === "plan" ? targetPlan : null,
      target_user_ids: target === "specific" ? selectedUsers : null,
      icon: icon || typeDef?.icon,
      link: link || null,
      link_text: linkText || null,
      expires_at: expiresAt,
    });

    setSent(true);
    setTimeout(() => { setSent(false); setShowBuilder(false); resetForm(); }, 2000);
    setSending(false);
    load();
  };

  const resetForm = () => {
    setTitle(""); setMessage(""); setType("info"); setTarget("all");
    setLink(""); setLinkText(""); setIcon("🔔"); setExpiresIn("never");
    setSelectedUsers([]);
  };

  const deleteNotification = async (id) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleUser = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const typeDef = TYPES.find(t => t.value === type);
  const filteredUsers = users.filter(u =>
    (u.full_name||"").toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email||"").toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Notifications</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>{notifications.length} notifications sent</p>
          </div>
          <button onClick={() => router.push("/admin/notifications/create")}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
            <Plus size={16}/> Create Notification
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {[
            { label:"Total Sent", value:notifications.length, icon:"📨", color:"#6366f1" },
            { label:"To All Users", value:notifications.filter(n=>n.target==="all").length, icon:"👥", color:"#22c55e" },
            { label:"Targeted", value:notifications.filter(n=>n.target!=="all").length, icon:"🎯", color:"#f59e0b" },
            { label:"Active", value:notifications.filter(n=>!n.expires_at||new Date(n.expires_at)>new Date()).length, icon:"✅", color:"#8b5cf6" },
          ].map((s,i) => (
            <div key={i} style={{ background:"#fff", borderRadius:16, padding:"20px", border:"1.5px solid #F1F5F9" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <p style={{ fontSize:28, fontWeight:900, color:s.color, margin:"0 0 2px" }}>{s.value}</p>
              <p style={{ fontSize:12, color:"#94A3B8", margin:0, fontWeight:600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Notifications list */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {loading ? (
            <div style={{ textAlign:"center", padding:40 }}><Loader size={24} color="#94A3B8" className="bspin"/></div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px", background:"#fff", borderRadius:20, border:"2px dashed #E2E8F0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔔</div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>No notifications yet</h3>
              <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Create your first notification to engage your users</p>
            </div>
          ) : notifications.map(n => {
            const t = TYPES.find(x => x.value === n.type) || TYPES[0];
            const isExpired = n.expires_at && new Date(n.expires_at) < new Date();
            return (
              <div key={n.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"16px 20px", display:"flex", alignItems:"flex-start", gap:14, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:t.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                  {n.icon || t.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>{n.title}</h3>
                    <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:999, background:t.bg, color:t.color }}>{t.label}</span>
                    {isExpired && <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:999, background:"#F8FAFC", color:"#94A3B8" }}>Expired</span>}
                  </div>
                  <p style={{ fontSize:13, color:"#64748B", margin:"0 0 8px", lineHeight:1.5 }}>{n.message}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, color:"#94A3B8", display:"flex", alignItems:"center", gap:4 }}>
                      {TARGETS.find(t=>t.value===n.target)?.icon} {TARGETS.find(t=>t.value===n.target)?.label}
                      {n.target==="plan" && ` · ${n.target_plan}`}
                      {n.target==="specific" && ` · ${n.target_user_ids?.length||0} users`}
                    </span>
                    {n.link && <span style={{ fontSize:11, color:"#6366f1" }}>🔗 {n.link_text||n.link}</span>}
                    {n.expires_at && <span style={{ fontSize:11, color:"#94A3B8" }}>⏰ Expires {new Date(n.expires_at).toLocaleDateString()}</span>}
                    <span style={{ fontSize:11, color:"#94A3B8" }}>{new Date(n.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button onClick={() => setPreview(n)} style={{ width:32, height:32, borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#6366f1" }}>
                    <Eye size={14}/>
                  </button>
                  <button onClick={() => deleteNotification(n.id)} style={{ width:32, height:32, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#ef4444" }}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={() => setPreview(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:24, padding:28, width:"100%", maxWidth:420, boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Notification Preview</h3>
            <NotificationPreview icon={preview.icon} title={preview.title} message={preview.message} type={preview.type} link={preview.link} linkText={preview.link_text}/>
            <button onClick={() => setPreview(null)} style={{ width:"100%", marginTop:16, padding:"12px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>Close</button>
          </div>
        </div>
      )}

      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}

function NotificationPreview({ icon, title, message, type, link, linkText }) {
  const t = TYPES.find(x => x.value === type) || TYPES[0];
  return (
    <div style={{ background:t.bg, borderRadius:16, padding:"16px 18px", border:`1.5px solid ${t.color}30` }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0, boxShadow:`0 2px 8px ${t.color}20` }}>
          {icon}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>{title}</p>
          <p style={{ fontSize:13, color:"#374151", margin:"0 0 10px", lineHeight:1.5 }}>{message}</p>
          {link && (
            <span style={{ fontSize:12, fontWeight:700, color:t.color, textDecoration:"underline", cursor:"pointer" }}>
              {linkText || link} →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const lbl = () => ({ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 });
const inp = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
