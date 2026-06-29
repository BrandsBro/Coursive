"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Send, Check, Loader, Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const TYPES = [
  { value:"info",         label:"Info",         color:"#6366f1", bg:"#EEF2FF", icon:"ℹ️" },
  { value:"success",      label:"Success",      color:"#22c55e", bg:"#F0FDF4", icon:"✅" },
  { value:"warning",      label:"Warning",      color:"#f59e0b", bg:"#FFFBEB", icon:"⚠️" },
  { value:"error",        label:"Error",        color:"#ef4444", bg:"#FEF2F2", icon:"🚨" },
  { value:"announcement", label:"Announcement", color:"#8b5cf6", bg:"#F5F3FF", icon:"📢" },
  { value:"promotion",    label:"Promotion",    color:"#ec4899", bg:"#FDF2F8", icon:"🎁" },
];

const TARGETS = [
  { value:"all",      label:"All Users",          icon:"👥", desc:"Send to everyone on the platform" },
  { value:"active",   label:"Active Subscribers", icon:"✅", desc:"Users with an active subscription" },
  { value:"expired",  label:"Expired Users",      icon:"⏰", desc:"Users whose subscription has expired" },
  { value:"plan",     label:"Specific Plan",      icon:"📋", desc:"Users on a particular plan" },
  { value:"specific", label:"Specific Users",     icon:"🎯", desc:"Handpick individual users" },
];

export default function NotificationBuilder() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [userSearch, setUserSearch] = useState("");

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

  useEffect(() => {
    supabase.from("profiles").select("id, full_name, email").order("full_name").then(({ data }) => setUsers(data || []));
  }, []);

  const typeDef = TYPES.find(t => t.value === type);

  const send = async () => {
    if (!title || !message) return;
    setSending(true);
    const expiresAt = expiresIn === "never" ? null :
      new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("notifications").insert({
      title, message, type, target,
      target_plan: target === "plan" ? targetPlan : null,
      target_user_ids: target === "specific" ? selectedUsers : null,
      icon, link: link || null, link_text: linkText || null,
      expires_at: expiresAt,
    });
    setSent(true);
    setTimeout(() => router.push("/admin/notifications"), 1500);
    setSending(false);
  };

  const toggleUser = (id) => setSelectedUsers(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const filteredUsers = users.filter(u => (u.full_name||"").toLowerCase().includes(userSearch.toLowerCase()) || (u.email||"").toLowerCase().includes(userSearch.toLowerCase()));

  const recipientCount = target === "all" ? `All ${users.length} users` :
    target === "specific" ? `${selectedUsers.length} selected users` :
    TARGETS.find(t=>t.value===target)?.label;

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:0, minHeight:"calc(100vh - 64px)" }}>
        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px", borderBottom:"1px solid #E2E8F0", background:"#fff", position:"sticky", top:0, zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={() => router.back()} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", color:"#374151" }}>
              <ArrowLeft size={14}/> Back
            </button>
            <div>
              <h1 style={{ fontSize:18, fontWeight:900, color:"#0f172a", margin:0 }}>Create Notification</h1>
              <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>To: {recipientCount}</p>
            </div>
          </div>
          <button onClick={send} disabled={sending||!title||!message}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:12, border:"none", background:sent?"#22c55e":"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", opacity:(!title||!message)?0.5:1, boxShadow:"0 4px 14px rgba(91,78,255,0.3)" }}>
            {sending?<><Loader size={15} className="bspin"/> Sending...</>:sent?<><Check size={15}/> Sent!</>:<><Send size={15}/> Send Notification</>}
          </button>
        </div>

        {/* Body */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 380px 340px", gap:0, overflow:"hidden" }}>

          {/* Col 1 - Content */}
          <div style={{ padding:32, borderRight:"1px solid #E2E8F0", overflow:"auto" }}>
            <h2 style={{ fontSize:14, fontWeight:800, color:"#64748B", textTransform:"uppercase", letterSpacing:1, margin:"0 0 20px" }}>Content</h2>

            {/* Type */}
            <div style={{ marginBottom:24 }}>
              <label style={lbl()}>Notification Type</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {TYPES.map(t => (
                  <button key={t.value} onClick={() => { setType(t.value); setIcon(t.icon); }}
                    style={{ padding:"14px 10px", borderRadius:14, border:`2px solid ${type===t.value?t.color:"#E2E8F0"}`, background:type===t.value?t.bg:"#F8FAFC", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"all 0.15s" }}>
                    <span style={{ fontSize:26 }}>{t.icon}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:type===t.value?t.color:"#64748B" }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon */}
            <div style={{ marginBottom:24 }}>
              <label style={lbl()}>Custom Icon (emoji)</label>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <input value={icon} onChange={e=>setIcon(e.target.value)} style={{ ...inp(), width:80, fontSize:28, textAlign:"center", padding:"10px" }}/>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {["🔔","🎉","⚠️","🚀","💡","🎁","📢","❤️","🔥","✨","💰","🏆"].map(e => (
                    <button key={e} onClick={() => setIcon(e)} style={{ width:36, height:36, borderRadius:8, border:`1.5px solid ${icon===e?"#5B4EFF":"#E2E8F0"}`, background:icon===e?"#EEF2FF":"#F8FAFC", fontSize:18, cursor:"pointer" }}>{e}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom:20 }}>
              <label style={lbl()}>Title</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Your subscription is expiring soon!" style={{ ...inp(), fontSize:15, fontWeight:600 }}/>
            </div>

            {/* Message */}
            <div style={{ marginBottom:20 }}>
              <label style={lbl()}>Message</label>
              <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write your notification message here. Be clear and helpful." rows={5} style={{ ...inp(), resize:"vertical", lineHeight:1.6 }}/>
            </div>

            {/* Link */}
            <div style={{ marginBottom:20 }}>
              <label style={lbl()}>Action Button <span style={{ color:"#94A3B8", fontWeight:400, textTransform:"none" }}>· optional</span></label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 6px" }}>Link URL</p>
                  <input value={link} onChange={e=>setLink(e.target.value)} placeholder="/quiz" style={inp()}/>
                </div>
                <div>
                  <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 6px" }}>Button text</p>
                  <input value={linkText} onChange={e=>setLinkText(e.target.value)} placeholder="Renew now →" style={inp()}/>
                </div>
              </div>
            </div>

            {/* Expires */}
            <div>
              <label style={lbl()}>Notification Expires After</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {[["never","Never"],["1","1 Day"],["3","3 Days"],["7","1 Week"],["14","2 Weeks"],["30","1 Month"]].map(([v,l]) => (
                  <button key={v} onClick={() => setExpiresIn(v)}
                    style={{ padding:"10px 8px", borderRadius:10, border:`1.5px solid ${expiresIn===v?"#5B4EFF":"#E2E8F0"}`, background:expiresIn===v?"#EEF2FF":"#F8FAFC", fontSize:12, fontWeight:700, color:expiresIn===v?"#5B4EFF":"#64748B", cursor:"pointer" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2 - Target */}
          <div style={{ padding:32, borderRight:"1px solid #E2E8F0", overflow:"auto" }}>
            <h2 style={{ fontSize:14, fontWeight:800, color:"#64748B", textTransform:"uppercase", letterSpacing:1, margin:"0 0 20px" }}>Who Receives It</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              {TARGETS.map(t => (
                <button key={t.value} onClick={() => setTarget(t.value)}
                  style={{ padding:"16px 18px", borderRadius:14, border:`2px solid ${target===t.value?"#5B4EFF":"#E2E8F0"}`, background:target===t.value?"#EEF2FF":"#F8FAFC", cursor:"pointer", display:"flex", alignItems:"center", gap:14, textAlign:"left", transition:"all 0.15s" }}>
                  <span style={{ fontSize:28 }}>{t.icon}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:800, color:target===t.value?"#5B4EFF":"#0f172a", margin:"0 0 2px" }}>{t.label}</p>
                    <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{t.desc}</p>
                  </div>
                  <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${target===t.value?"#5B4EFF":"#E2E8F0"}`, background:target===t.value?"#5B4EFF":"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {target===t.value && <Check size={12} color="#fff"/>}
                  </div>
                </button>
              ))}
            </div>

            {target === "plan" && (
              <div>
                <label style={lbl()}>Select Plan</label>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {["1-Week Plan","4-Week Plan","12-Week Plan"].map(p => (
                    <button key={p} onClick={() => setTargetPlan(p)}
                      style={{ padding:"12px 16px", borderRadius:12, border:`1.5px solid ${targetPlan===p?"#5B4EFF":"#E2E8F0"}`, background:targetPlan===p?"#EEF2FF":"#F8FAFC", fontSize:13, fontWeight:700, color:targetPlan===p?"#5B4EFF":"#374151", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      {p}
                      {targetPlan===p && <Check size={14} color="#5B4EFF"/>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {target === "specific" && (
              <div>
                <label style={lbl()}>Select Users ({selectedUsers.length} selected)</label>
                <div style={{ position:"relative", marginBottom:10 }}>
                  <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}/>
                  <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search users..." style={{ ...inp(), paddingLeft:34 }}/>
                </div>
                <div style={{ border:"1.5px solid #E2E8F0", borderRadius:12, overflow:"hidden" }}>
                  <div style={{ padding:"8px 12px", background:"#F8FAFC", borderBottom:"1px solid #E2E8F0", display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#64748B" }}>{filteredUsers.length} users</span>
                    <button onClick={() => setSelectedUsers(filteredUsers.map(u=>u.id))} style={{ fontSize:11, fontWeight:700, color:"#5B4EFF", border:"none", background:"none", cursor:"pointer" }}>Select all</button>
                  </div>
                  <div style={{ maxHeight:300, overflow:"auto" }}>
                    {filteredUsers.map(u => (
                      <div key={u.id} onClick={() => toggleUser(u.id)}
                        style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", cursor:"pointer", background:selectedUsers.includes(u.id)?"#EEF2FF":"#fff", borderBottom:"1px solid #F8FAFC", transition:"background 0.1s" }}>
                        <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${selectedUsers.includes(u.id)?"#5B4EFF":"#CBD5E1"}`, background:selectedUsers.includes(u.id)?"#5B4EFF":"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {selectedUsers.includes(u.id) && <Check size={12} color="#fff"/>}
                        </div>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13, flexShrink:0 }}>
                          {(u.full_name||u.email||"?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:0 }}>{u.full_name||"Unknown"}</p>
                          <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{u.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Col 3 - Preview */}
          <div style={{ padding:32, background:"#FAFBFC", overflow:"auto" }}>
            <h2 style={{ fontSize:14, fontWeight:800, color:"#64748B", textTransform:"uppercase", letterSpacing:1, margin:"0 0 20px" }}>Preview</h2>

            {/* Bell preview */}
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 10px", fontWeight:600 }}>In notification bell:</p>
              <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #E2E8F0", overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,0.06)" }}>
                <div style={{ padding:"12px 16px", borderBottom:"1px solid #F1F5F9", display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:13, fontWeight:800, color:"#0f172a" }}>Notifications</span>
                  <span style={{ fontSize:11, color:"#6366f1", fontWeight:600 }}>Mark all read</span>
                </div>
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", gap:10 }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:typeDef?.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                        <p style={{ fontSize:13, fontWeight:800, color:"#0f172a", margin:0 }}>{title||"Notification title"}</p>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:"#6366f1" }}/>
                      </div>
                      <p style={{ fontSize:12, color:"#64748B", margin:"0 0 6px", lineHeight:1.4 }}>{message||"Your notification message..."}</p>
                      {link && <span style={{ fontSize:11, fontWeight:700, color:typeDef?.color }}>{linkText||"Learn more"} →</span>}
                      <p style={{ fontSize:10, color:"#CBD5E1", margin:"4px 0 0" }}>Just now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner preview */}
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 10px", fontWeight:600 }}>As banner notification:</p>
              <div style={{ background:typeDef?.bg, borderRadius:14, padding:"14px 16px", border:`1.5px solid ${typeDef?.color}30` }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ fontSize:22 }}>{icon}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:800, color:"#0f172a", margin:"0 0 3px" }}>{title||"Notification title"}</p>
                    <p style={{ fontSize:12, color:"#374151", margin:"0 0 8px", lineHeight:1.5 }}>{message||"Your message here..."}</p>
                    {link && (
                      <span style={{ fontSize:12, fontWeight:700, color:typeDef?.color }}>{linkText||"Learn more"} →</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Send summary */}
            <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #E2E8F0", padding:"16px" }}>
              <p style={{ fontSize:12, fontWeight:700, color:"#374151", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:0.5 }}>Send Summary</p>
              {[
                ["Type", typeDef?.label],
                ["Recipients", recipientCount],
                ["Expires", expiresIn==="never"?"Never":`In ${expiresIn} days`],
                ["Has link", link?"Yes":"No"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #F8FAFC" }}>
                  <span style={{ fontSize:12, color:"#94A3B8" }}>{k}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{v}</span>
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

const lbl = () => ({ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 });
const inp = () => ({ width:"100%", padding:"10px 13px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
