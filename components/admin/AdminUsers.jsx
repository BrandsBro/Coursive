"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Shield, ShieldOff, Trash2, RefreshCw, Loader, ChevronDown, Mail, Calendar, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: subscriptions }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(profiles || []);
    setSubs(subscriptions || []);
    setLoading(false);
  };

  const getUserSub = (userId) => subs.filter(s => s.user_id === userId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];

  const toggleAdmin = async (id, current) => {
    await fetch("/api/admin/users", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id, is_admin:!current }) });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin:!current } : u));
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    await fetch("/api/admin/users", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id }) });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const daysLeft = (expiresAt) => {
    if (!expiresAt) return null;
    return Math.ceil((new Date(expiresAt) - new Date()) / (1000*60*60*24));
  };

  const filtered = users.filter(u => {
    const sub = getUserSub(u.id);
    const matchSearch = (u.full_name||"").toLowerCase().includes(search.toLowerCase()) ||
                        (u.email||"").toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "admin") return u.is_admin;
    if (filter === "active") return sub?.status === "active";
    if (filter === "expired") return sub?.status === "expired";
    if (filter === "no_sub") return !sub;
    if (filter === "recurring") return sub?.type === "recurring";
    return true;
  }).sort((a,b) => {
    if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === "name") return (a.full_name||"").localeCompare(b.full_name||"");
    return 0;
  });

  // Stats
  const stats = [
    { label:"Total Users", value:users.length, color:"#6366f1", icon:"👥" },
    { label:"Active Subs", value:subs.filter(s=>s.status==="active").length, color:"#22c55e", icon:"✅" },
    { label:"Expired", value:subs.filter(s=>s.status==="expired").length, color:"#ef4444", icon:"⏰" },
    { label:"Auto-renew", value:subs.filter(s=>s.type==="recurring"&&s.status==="active").length, color:"#8b5cf6", icon:"🔄" },
    { label:"No Subscription", value:users.filter(u=>!getUserSub(u.id)).length, color:"#f59e0b", icon:"⚠️" },
    { label:"Admins", value:users.filter(u=>u.is_admin).length, color:"#0369a1", icon:"🛡️" },
  ];

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Users</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>{filtered.length} of {users.length} users</p>
          </div>
          <button onClick={load} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            <RefreshCw size={14}/> Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }}>
          {stats.map((s,i) => (
            <div key={i} onClick={() => setFilter(["all","admin","active","expired","no_sub","recurring"][i])}
              style={{ background:"#fff", borderRadius:14, padding:"16px", border:`1.5px solid ${filter===["all","admin","active","expired","no_sub","recurring"][i]?"#5B4EFF":"#F1F5F9"}`, cursor:"pointer", textAlign:"center" }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
              <p style={{ fontSize:22, fontWeight:900, color:s.color, margin:"0 0 2px" }}>{s.value}</p>
              <p style={{ fontSize:11, color:"#94A3B8", margin:0, fontWeight:600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1, maxWidth:320 }}>
            <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email..." style={{ width:"100%", padding:"10px 12px 10px 36px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          </div>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"10px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, fontWeight:600, color:"#374151", background:"#fff", outline:"none" }}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #F1F5F9" }}>
                {["User","Joined","Plan","Status","Type","Expires","Days Left","Role","Actions"].map(h => (
                  <th key={h} style={{ padding:"12px 16px", fontSize:11, fontWeight:700, color:"#64748B", textAlign:"left", textTransform:"uppercase", letterSpacing:0.5, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding:40, textAlign:"center" }}><Loader size={24} color="#94A3B8" className="bspin"/></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding:40, textAlign:"center", color:"#94A3B8" }}>No users found</td></tr>
              ) : filtered.map(u => {
                const sub = getUserSub(u.id);
                const days = sub ? daysLeft(sub.expires_at) : null;
                const statusColor = sub?.status==="active"?"#22c55e":sub?.status==="expired"?"#ef4444":"#94A3B8";
                const statusBg = sub?.status==="active"?"#F0FDF4":sub?.status==="expired"?"#FEF2F2":"#F8FAFC";
                return (
                  <tr key={u.id} style={{ borderBottom:"1px solid #F8FAFC", cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#FAFBFC"}
                    onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                    onClick={() => setSelectedUser(selectedUser?.id===u.id?null:u)}>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, flexShrink:0 }}>
                          {(u.full_name||u.email||"?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:0 }}>{u.full_name||"—"}</p>
                          <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{u.email||u.id.slice(0,12)}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"14px 16px", fontSize:12, color:"#64748B", whiteSpace:"nowrap" }}>
                      {new Date(u.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{sub?.plan||"—"}</span>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      {sub ? (
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999, background:statusBg, color:statusColor }}>
                          {sub.status}
                        </span>
                      ) : <span style={{ fontSize:11, color:"#94A3B8" }}>No sub</span>}
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      {sub && <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999, background:sub.type==="recurring"?"#EEF2FF":"#FFFBEB", color:sub.type==="recurring"?"#6366f1":"#d97706" }}>
                        {sub.type==="recurring"?"🔄 Auto":"1x"}
                      </span>}
                    </td>
                    <td style={{ padding:"14px 16px", fontSize:12, color:"#64748B", whiteSpace:"nowrap" }}>
                      {sub ? new Date(sub.expires_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      {days !== null && (
                        <span style={{ fontSize:13, fontWeight:800, color:days<=0?"#ef4444":days<=3?"#f59e0b":days<=7?"#f97316":"#22c55e" }}>
                          {days<=0?"Expired":`${days}d`}
                        </span>
                      )}
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999, background:u.is_admin?"#EFF6FF":"#F8FAFC", color:u.is_admin?"#1d4ed8":"#64748B" }}>
                        {u.is_admin?"🛡️ Admin":"User"}
                      </span>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", gap:6 }} onClick={e=>e.stopPropagation()}>
                        <button onClick={() => toggleAdmin(u.id, u.is_admin)} title={u.is_admin?"Remove admin":"Make admin"}
                          style={{ width:28, height:28, borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:u.is_admin?"#ef4444":"#6366f1" }}>
                          {u.is_admin ? <ShieldOff size={12}/> : <Shield size={12}/>}
                        </button>
                        <button onClick={() => deleteUser(u.id)} title="Delete user"
                          style={{ width:28, height:28, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#ef4444" }}>
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded user detail */}
        {selectedUser && (() => {
          const sub = getUserSub(selectedUser.id);
          const allSubs = subs.filter(s => s.user_id === selectedUser.id);
          return (
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #E2E8F0", padding:24, boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:18 }}>
                    {(selectedUser.full_name||selectedUser.email||"?")[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize:18, fontWeight:900, color:"#0f172a", margin:0 }}>{selectedUser.full_name||"Unknown"}</h2>
                    <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>{selectedUser.email} · Joined {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:"#F1F5F9", cursor:"pointer", fontSize:16 }}>✕</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <h3 style={{ fontSize:13, fontWeight:700, color:"#64748B", margin:"0 0 12px", textTransform:"uppercase", letterSpacing:0.5 }}>Current Subscription</h3>
                  {sub ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {[
                        ["Plan", sub.plan],
                        ["Status", sub.status],
                        ["Type", sub.type==="recurring"?"Auto-renew":"One-time"],
                        ["Amount", `$${sub.amount_paid}`],
                        ["Started", new Date(sub.started_at).toLocaleDateString()],
                        ["Expires", new Date(sub.expires_at).toLocaleDateString()],
                        ["Days left", `${Math.max(0,Math.ceil((new Date(sub.expires_at)-new Date())/(1000*60*60*24)))} days`],
                      ].map(([k,v]) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", background:"#F8FAFC", borderRadius:8 }}>
                          <span style={{ fontSize:12, color:"#64748B" }}>{k}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p style={{ fontSize:13, color:"#94A3B8" }}>No subscription found</p>}
                </div>
                <div>
                  <h3 style={{ fontSize:13, fontWeight:700, color:"#64748B", margin:"0 0 12px", textTransform:"uppercase", letterSpacing:0.5 }}>Payment History</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {allSubs.length === 0 ? <p style={{ fontSize:13, color:"#94A3B8" }}>No payments yet</p> :
                      allSubs.map((s,i) => (
                        <div key={i} style={{ padding:"10px 12px", background:"#F8FAFC", borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div>
                            <p style={{ fontSize:12, fontWeight:700, color:"#0f172a", margin:0 }}>{s.plan}</p>
                            <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{new Date(s.created_at).toLocaleDateString()}</p>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <p style={{ fontSize:13, fontWeight:800, color:"#5B4EFF", margin:0 }}>${s.amount_paid}</p>
                            <span style={{ fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:999, background:s.status==="active"?"#F0FDF4":"#FEF2F2", color:s.status==="active"?"#16a34a":"#dc2626" }}>{s.status}</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
