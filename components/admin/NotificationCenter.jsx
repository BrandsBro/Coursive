"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Trash2, Send, Eye, Bell, Loader, Check, Users, Search } from "lucide-react";
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
  const [showBuilder, setShowBuilder] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [preview, setPreview] = useState(null);

  // Builder state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [target, setTarget] = useState("all");
  const [targetPlan, setTargetPlan] = useState("4-Week Plan");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [link, setLink] = useState("");
  const [linkText, setLinkText] = useState("");
  const [icon, setIcon] = useState("🔔");
  const [expiresIn, setExpiresIn] = useState("never");
  const [userSearch, setUserSearch] = useState("");

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
          <button onClick={() => setShowBuilder(true)}
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

      {/* Builder Modal */}
      {showBuilder && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:700, maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            {/* Modal header */}
            <div style={{ padding:"20px 24px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <h2 style={{ fontSize:18, fontWeight:900, color:"#0f172a", margin:0 }}>Create Notification</h2>
              <button onClick={() => { setShowBuilder(false); resetForm(); }} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:"#F1F5F9", cursor:"pointer", fontSize:16 }}>✕</button>
            </div>

            <div style={{ flex:1, overflow:"auto", padding:24, display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
              {/* Left - form */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Type */}
                <div>
                  <label style={lbl()}>Notification Type</label>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                    {TYPES.map(t => (
                      <button key={t.value} onClick={() => { setType(t.value); setIcon(t.icon); }}
                        style={{ padding:"10px 8px", borderRadius:10, border:`1.5px solid ${type===t.value?t.color:"#E2E8F0"}`, background:type===t.value?t.bg:"#F8FAFC", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                        <span style={{ fontSize:20 }}>{t.icon}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:type===t.value?t.color:"#64748B" }}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon */}
                <div>
                  <label style={lbl()}>Custom Icon (emoji)</label>
                  <input value={icon} onChange={e=>setIcon(e.target.value)} placeholder="🔔" style={{ ...inp(), fontSize:20, textAlign:"center", width:70 }}/>
                </div>

                {/* Title */}
                <div>
                  <label style={lbl()}>Title</label>
                  <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Your subscription is expiring soon!" style={inp()}/>
                </div>

                {/* Message */}
                <div>
                  <label style={lbl()}>Message</label>
                  <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write your notification message here..." rows={4} style={{ ...inp(), resize:"vertical" }}/>
                </div>

                {/* Link */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label style={lbl()}>Link URL <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span></label>
                    <input value={link} onChange={e=>setLink(e.target.value)} placeholder="/quiz" style={inp()}/>
                  </div>
                  <div>
                    <label style={lbl()}>Link Text</label>
                    <input value={linkText} onChange={e=>setLinkText(e.target.value)} placeholder="Renew now →" style={inp()}/>
                  </div>
                </div>

                {/* Expires */}
                <div>
                  <label style={lbl()}>Expires After</label>
                  <select value={expiresIn} onChange={e=>setExpiresIn(e.target.value)} style={inp()}>
                    <option value="never">Never expires</option>
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">1 week</option>
                    <option value="14">2 weeks</option>
                    <option value="30">1 month</option>
                  </select>
                </div>
              </div>

              {/* Right - target + preview */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Target */}
                <div>
                  <label style={lbl()}>Send To</label>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {TARGETS.map(t => (
                      <button key={t.value} onClick={() => setTarget(t.value)}
                        style={{ padding:"12px 14px", borderRadius:12, border:`1.5px solid ${target===t.value?"#5B4EFF":"#E2E8F0"}`, background:target===t.value?"#EEF2FF":"#F8FAFC", cursor:"pointer", display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
                        <span style={{ fontSize:20 }}>{t.icon}</span>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color:target===t.value?"#5B4EFF":"#0f172a", margin:0 }}>{t.label}</p>
                          <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{t.desc}</p>
                        </div>
                        {target===t.value && <Check size={16} color="#5B4EFF" style={{ marginLeft:"auto" }}/>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan picker */}
                {target === "plan" && (
                  <div>
                    <label style={lbl()}>Select Plan</label>
                    <select value={targetPlan} onChange={e=>setTargetPlan(e.target.value)} style={inp()}>
                      <option>1-Week Plan</option>
                      <option>4-Week Plan</option>
                      <option>12-Week Plan</option>
                    </select>
                  </div>
                )}

                {/* User picker */}
                {target === "specific" && (
                  <div>
                    <label style={lbl()}>Select Users ({selectedUsers.length} selected)</label>
                    <div style={{ position:"relative", marginBottom:8 }}>
                      <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}/>
                      <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search users..." style={{ ...inp(), paddingLeft:30 }}/>
                    </div>
                    <div style={{ maxHeight:200, overflow:"auto", border:"1.5px solid #E2E8F0", borderRadius:10 }}>
                      {filteredUsers.map(u => (
                        <div key={u.id} onClick={() => toggleUser(u.id)}
                          style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", cursor:"pointer", background:selectedUsers.includes(u.id)?"#EEF2FF":"#fff", borderBottom:"1px solid #F8FAFC" }}>
                          <div style={{ width:20, height:20, borderRadius:6, border:`1.5px solid ${selectedUsers.includes(u.id)?"#5B4EFF":"#E2E8F0"}`, background:selectedUsers.includes(u.id)?"#5B4EFF":"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            {selectedUsers.includes(u.id) && <Check size={11} color="#fff"/>}
                          </div>
                          <div>
                            <p style={{ fontSize:12, fontWeight:700, color:"#0f172a", margin:0 }}>{u.full_name||"Unknown"}</p>
                            <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{u.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div>
                  <label style={lbl()}>Preview</label>
                  <NotificationPreview icon={icon||typeDef?.icon} title={title||"Notification title"} message={message||"Your notification message will appear here."} type={type} link={link} linkText={linkText}/>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding:"16px 24px", borderTop:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, background:"#FAFBFC" }}>
              <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>
                {target==="all" ? `Sending to all ${users.length} users` :
                 target==="specific" ? `Sending to ${selectedUsers.length} selected users` :
                 `Sending to ${target} users`}
              </p>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => { setShowBuilder(false); resetForm(); }} style={{ padding:"10px 18px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", color:"#374151" }}>Cancel</button>
                <button onClick={sendNotification} disabled={sending||!title||!message}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:10, border:"none", background:sent?"#22c55e":"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", opacity:(!title||!message)?0.6:1 }}>
                  {sending?<><Loader size={14} className="bspin"/> Sending...</>:sent?<><Check size={14}/> Sent!</>:<><Send size={14}/> Send Notification</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
